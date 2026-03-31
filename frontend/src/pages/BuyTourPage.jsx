import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

function luhnCheck(num) {
  const digits = String(num).replace(/\D/g, '');
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (isEven) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

const CITIES = ['Париж', 'Рим', 'Берлин', 'Мадрид'];

function BuyTourPage() {
  const navigate = useNavigate();
  // Payment Method: 'base' | 'kaspi' | 'halyk'
  const [method, setMethod] = useState('kaspi');
  
  // Form State
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [tourDate, setTourDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [availableSpots, setAvailableSpots] = useState(null);

  const [receipt, setReceipt] = useState(null); // { name, city, createdAt }

  // Autofill user name if logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) setName(user.name);
  }, []);

  // Check Availability dynamically
  useEffect(() => {
    if (!city || !tourDate) {
      setAvailableSpots(null);
      return;
    }
    const fetchAvail = async () => {
      try {
        const res = await fetch(`/api/buy/availability?city=${city}&date=${tourDate}`);
        const data = await res.json();
        setAvailableSpots(data.available);
      } catch {
        setAvailableSpots(null);
      }
    };
    fetchAvail();
  }, [city, tourDate]);

  const minDate = new Date().toISOString().split('T')[0];

  const clearForm = () => {
    setNumber('');
    setCvv('');
    setTourDate('');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    } : { 'Content-Type': 'application/json' };
  };

  const validate = () => {
    if (!name.trim()) return 'Аты-жөніңізді енгізіңіз';
    const digits = number.replace(/\D/g, '');
    if (digits.length !== 16) return 'Карта нөмірі 16 санды болуы керек';
    if (!luhnCheck(digits)) return 'Карта нөмірі жарамсыз';
    if (!tourDate) return 'Саяхат күнін таңдаңыз';
    if (cvv.length !== 3 || isNaN(Number(cvv))) return 'CVV 3 санды болуы керек';
    return null;
  };

  const submitPayment = async (payload) => {
    setLoading(true);
    try {
      const res = await fetch('/api/buy', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ message: 'Төлем сәтті өтті!', type: 'success' });
        setReceipt({
          name: payload.name,
          city: payload.city,
          amount: data.amount || '450,000 ₸', // Default fallback
          date: new Date().toLocaleString(),
          tourDate: payload.tourDate,
          method: method === 'kaspi' ? 'Kaspi Gold' : (method === 'halyk' ? 'Halyk Bank' : 'Банк картасы')
        });
        clearForm();
      } else {
        setNotification({ message: data.message || 'Төлем өтпеді', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Серверге қосылу қатесі', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setNotification({ message: err, type: 'error' });
      return;
    }
    submitPayment({ name, number: number.replace(/\D/g, ''), city, cvv, tourDate });
  };


  const formattedNumber = number.replace(/(.{4})/g, '$1 ').trim();
  const previewNumber = formattedNumber || '0000 0000 0000 0000';
  const displayName = name || 'Аты-жөніңіз';

  // --- RECEIPT RENDER ---
  if (receipt) {
    return (
      <div className="section container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <div className="receipt-card">
          <div className="receipt-header">
            <div className="receipt-icon">✓</div>
            <h2>Төлем сәтті қабылданды</h2>
            <p>Саяхатқа дайын болыңыз!</p>
          </div>
          <div className="receipt-body">
            <div className="receipt-row">
              <span>Төлеуші:</span>
              <strong>{receipt.name}</strong>
            </div>
            <div className="receipt-row">
              <span>Бағыт (Қала):</span>
              <strong>{receipt.city}</strong>
            </div>
            <div className="receipt-row">
              <span>Саяхат күні:</span>
              <strong>{receipt.tourDate}</strong>
            </div>
            <div className="receipt-row">
              <span>Төлем әдісі:</span>
              <strong>{receipt.method}</strong>
            </div>
            <div className="receipt-row">
              <span>Уақыты:</span>
              <strong>{receipt.date}</strong>
            </div>
            <div className="receipt-divider"></div>
            <div className="receipt-row receipt-total">
              <span>Жалпы сома:</span>
              <strong>{receipt.amount}</strong>
            </div>
          </div>
          <div className="receipt-footer">
            <button className="btn-primary" onClick={() => navigate('/profile')}>Жеке кабинетке өту</button>
            <button className="btn-outline" style={{marginTop: '1rem', width: '100%'}} onClick={() => {
               setReceipt(null); 
               setAvailableSpots(null);
            }}>
              Жаңа тур алу
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- FORM VARIABLES ---
  
  let cardBgClass = 'card-preview-base';
  let cardLogo = 'VISA / MC';
  if (method === 'kaspi') {
    cardBgClass = 'card-preview-kaspi';
    cardLogo = 'Kaspi Gold';
  } else if (method === 'halyk') {
    cardBgClass = 'card-preview-halyk';
    cardLogo = 'Halyk Bank';
  }

  return (
    <div className="buy-page">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
      


      <div className="buy-page__inner">
        <div>
          {/* METHOD SELECTOR */}
          <div className="method-selector">
            <button type="button" className={`method-btn ${method === 'kaspi' ? 'active kaspi-btn' : ''}`} onClick={() => setMethod('kaspi')}>Kaspi</button>
            <button type="button" className={`method-btn ${method === 'halyk' ? 'active halyk-btn' : ''}`} onClick={() => setMethod('halyk')}>Halyk Bank</button>
            <button type="button" className={`method-btn ${method === 'base' ? 'active' : ''}`} onClick={() => setMethod('base')}>Басқа карта</button>
          </div>

          {/* CARD PREVIEW */}
          <div className={`payment-card-preview ${cardBgClass}`}>
            <div className="card-preview__logo">{cardLogo}</div>
            <div className="card-preview__number">{previewNumber}</div>
            <div className="card-preview__info">
              <div>
                <div className="card-preview__label">Төлеуші</div>
                <div className="card-preview__name">{displayName}</div>
              </div>
              <div>
                <div className="card-preview__label">Қала</div>
                <div className="card-preview__expiry">{city}</div>
              </div>
            </div>
          </div>
          
          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            🔒 Барлық төлемдер қауіпсіз және банк шифрлауымен қорғалған.
          </p>
        </div>

        <div className="pay-form">
          <h2>Төлем мәліметтері</h2>
          


          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="card-name">Аты-жөні (Картадағы ат)</label>
              <input
                id="card-name"
                type="text"
                className="form-input"
                placeholder="NURBEK KALIBAY"
                maxLength={24}
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
              />
            </div>

            <div className="form-group">
              <label htmlFor="card-number">Карта нөмірі</label>
              <input
                id="card-number"
                type="text"
                className="form-input"
                placeholder="4400 4300 0000 0000"
                maxLength={19}
                value={formattedNumber}
                onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                inputMode="numeric"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city-select">Тур қаласы</label>
                <select id="city-select" className="form-input" value={city} onChange={(e) => setCity(e.target.value)}>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tour-date">Саяхат күні</label>
                <input 
                  id="tour-date"
                  type="date"
                  min={minDate}
                  className="form-input"
                  value={tourDate}
                  onChange={(e) => setTourDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group" style={{ width: '50%' }}>
              <label htmlFor="cvv">CVV</label>
              <input
                id="cvv"
                type="password"
                className="form-input"
                placeholder="000"
                maxLength={3}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                inputMode="numeric"
              />
            </div>

            {/* Бос орындар индикаторы */}
            {availableSpots !== null && (
              <div style={{ 
                marginBottom: '1.5rem', 
                padding: '0.8rem', 
                borderRadius: '8px', 
                textAlign: 'center', 
                fontWeight: '600', 
                backgroundColor: availableSpots > 0 ? '#dcfce7' : '#fee2e2',
                color: availableSpots > 0 ? '#166534' : '#991b1b' 
              }}>
                {availableSpots > 0 ? `✅ Осы жақсы күнге ${availableSpots} бос орын қалды!` : `❌ Өкінішке орай, бұл күнге орын таусылды.`}
              </div>
            )}

            <button 
              type="submit" 
              className={`submit-btn ${method === 'kaspi' ? 'btn-kaspi' : method === 'halyk' ? 'btn-halyk' : ''}`} 
              disabled={loading || availableSpots === 0}
            >
              {loading ? 'Өңделуде...' : '💳 Сатып алу'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BuyTourPage;
