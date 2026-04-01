import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import { useAppContext } from '../context/AppContext';
import { translations } from '../utils/translations';

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
  const { language } = useAppContext();
  const t = translations[language];
  const navigate = useNavigate();
  const [method, setMethod] = useState('kaspi');

  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [tourDate, setTourDate] = useState('');
  const [cvv, setCvv] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [availableSpots, setAvailableSpots] = useState(null);
  const [guestsCount, setGuestsCount] = useState(1);
  const [tours, setTours] = useState([]);

  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) setName(user.name);

    const fetchTours = async () => {
      try {
        const res = await fetch('/api/tours');
        const data = await res.json();
        setTours(data);
      } catch (err) { console.error("Tours fetch error", err); }
    };
    fetchTours();
  }, []);

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
  const locale = language === 'kk' ? 'kk-KZ' : 'ru-RU';

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
    if (!name.trim()) return t.about.errorMessage;
    const digits = number.replace(/\D/g, '');
    if (digits.length !== 16) return language === 'kk' ? 'Карта нөмірі 16 санды болуы керек' : 'Номер карты должен содержать 16 цифр';
    if (!luhnCheck(digits)) return language === 'kk' ? 'Карта нөмірі жарамсыз' : 'Недействительный номер карты';
    if (!tourDate) return language === 'kk' ? 'Саяхат күнін таңдаңыз' : 'Выберите дату поездки';
    if (cvv.length !== 3 || isNaN(Number(cvv))) return language === 'kk' ? 'CVV 3 санды болуы керек' : 'CVV должен содержать 3 цифры';
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
        setNotification({ message: language === 'kk' ? 'Төлем сәтті өтті!' : 'Оплата прошла успешно!', type: 'success' });
        setReceipt({
          name: payload.name,
          city: payload.city,
          amount: (data.amount || 0).toLocaleString(locale) + ' ₸',
          guests: data.guests || payload.guestsCount,
          date: new Date().toLocaleString(locale),
          tourDate: payload.tourDate,
          method: method === 'kaspi' ? 'Kaspi Gold' : (method === 'halyk' ? 'Halyk Bank' : t.buy.methodOther)
        });
        clearForm();
      } else {
        setNotification({ message: data.message || t.common.error, type: 'error' });
      }
    } catch {
      setNotification({ message: t.common.errorServer, type: 'error' });
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
    submitPayment({
      name,
      number: number.replace(/\D/g, ''),
      city,
      cvv,
      tourDate,
      guestsCount
    });
  };

  const formattedNumber = number.replace(/(.{4})/g, '$1 ').trim();
  const previewNumber = formattedNumber || '0000 0000 0000 0000';
  const displayName = name || (language === 'kk' ? 'Аты-жөніңіз' : 'Ваше имя');

  if (receipt) {
    return (
      <div className="section container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <div className="receipt-card">
          <div className="receipt-header">
            <div className="receipt-icon">✓</div>
            <h2>{t.buy.receiptTitle}</h2>
            <p>{t.buy.receiptSub}</p>
          </div>
          <div className="receipt-body">
            <div className="receipt-row">
              <span>{t.buy.receiptPayer}</span>
              <strong>{receipt.name}</strong>
            </div>
            <div className="receipt-row">
              <span>{t.buy.receiptDest}</span>
              <strong>{receipt.city}</strong>
            </div>
            <div className="receipt-row">
              <span>{t.buy.receiptDate}</span>
              <strong>{receipt.tourDate}</strong>
            </div>
            <div className="receipt-row">
              <span>{t.buy.receiptMethod}</span>
              <strong>{receipt.method}</strong>
            </div>
            <div className="receipt-row">
              <span>{t.buy.receiptGuests}</span>
              <strong>{receipt.guests} {language === 'kk' ? 'адам' : 'чел'}</strong>
            </div>
            <div className="receipt-row">
              <span>{t.buy.receiptTime}</span>
              <strong>{receipt.date}</strong>
            </div>
            <div className="receipt-divider"></div>
            <div className="receipt-row receipt-total">
              <span>{t.buy.receiptTotal}</span>
              <strong>{receipt.amount}</strong>
            </div>
          </div>
          <div className="receipt-footer">
            <button className="btn-primary" onClick={() => navigate('/profile')}>{t.buy.receiptProfileBtn}</button>
            <button className="btn-outline" style={{ marginTop: '1rem', width: '100%' }} onClick={() => {
              setReceipt(null);
              setAvailableSpots(null);
            }}>
              {t.buy.receiptNewBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="method-selector">
            <button type="button" className={`method-btn ${method === 'kaspi' ? 'active kaspi-btn' : ''}`} onClick={() => setMethod('kaspi')}>Kaspi</button>
            <button type="button" className={`method-btn ${method === 'halyk' ? 'active halyk-btn' : ''}`} onClick={() => setMethod('halyk')}>Halyk Bank</button>
            <button type="button" className={`method-btn ${method === 'base' ? 'active' : ''}`} onClick={() => setMethod('base')}>{t.buy.methodOther}</button>
          </div>

          <div className={`payment-card-preview ${cardBgClass}`}>
            <div className="card-preview__logo">{cardLogo}</div>
            <div className="card-preview__number">{previewNumber}</div>
            <div className="card-preview__info">
              <div>
                <div className="card-preview__label">{t.buy.cardPayer}</div>
                <div className="card-preview__name">{displayName}</div>
              </div>
              <div>
                <div className="card-preview__label">{t.buy.cardCity}</div>
                <div className="card-preview__expiry">{city}</div>
              </div>
            </div>
          </div>

          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            {t.buy.securityNote}
          </p>
        </div>

        <div className="pay-form">
          <h2>{t.buy.title}</h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="card-name">{t.buy.labelName}</label>
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
              <label htmlFor="card-number">{t.buy.labelCardNum}</label>
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
                <label htmlFor="city-select">{t.buy.labelCity}</label>
                <select id="city-select" className="form-input" value={city} onChange={(e) => setCity(e.target.value)}>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tour-date">{t.buy.labelDate}</label>
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="guests-count">{t.buy.labelGuests}</label>
                <select
                  id="guests-count"
                  className="form-input"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 10].map(n => <option key={n} value={n}>{n} {language === 'kk' ? 'адам' : 'чел'}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="cvv">{t.buy.labelCvv}</label>
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
            </div>

            <div className="total-price-box" style={{
              background: 'rgba(14, 165, 233, 0.05)',
              padding: '1.25rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: '1px dashed #0ea5e9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#646a80', fontSize: '0.9rem' }}>{t.buy.totalPrice}</span>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>
                  {(() => {
                    const tour = tours.find(t => t.city === city);
                    const priceStr = tour ? tour.price.replace(/[^\d]/g, '') : '450000';
                    const price = parseInt(priceStr, 10);
                    return (price * guestsCount).toLocaleString(locale) + ' ₸';
                  })()}
                </span>
              </div>
            </div>

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
                {availableSpots > 0 
                  ? t.buy.spotsLeft.replace('{n}', availableSpots) 
                  : t.buy.spotsNone}
              </div>
            )}

            <button
              type="submit"
              className={`submit-btn ${method === 'kaspi' ? 'btn-kaspi' : method === 'halyk' ? 'btn-halyk' : ''}`}
              disabled={loading || availableSpots === 0}
            >
              {loading ? t.buy.processingBtn : t.buy.buyBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BuyTourPage;
