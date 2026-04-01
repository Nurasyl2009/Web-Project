import { useState, useEffect, useMemo } from 'react';
import TourCard from '../components/TourCard';
import LoadingSpinner from '../components/LoadingSpinner';

const STATIC_TOURS = [
  {
    id: 1,
    title: 'Парижге саяхат',
    description: 'Махаббат қаласының сиқырын сезініңіз. Эйфель мұнарасы мен Лувр сізді күтуде.',
    price: '450,000 ₸',
    badge: 'Париж',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Рим демалысы',
    description: 'Ежелгі тарих пен дәмді итальян асханасы. Колизейге ұмытылмас саяхат.',
    price: '380,000 ₸',
    badge: 'Рим',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Берлин рухы',
    description: 'Заманауи мәдениет пен еркіндік қаласы. Креативті Берлинді ашыңыз.',
    price: '320,000 ₸',
    badge: 'Берлин',
    image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Мадрид саяхаты',
    description: 'Испанияның астанасы. Мәдениет, тарих және түнгі өмірдің орталығы.',
    price: '620,000 ₸',
    badge: 'Мадрид',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=500&auto=format&fit=crop',
  },
];

function ToursPage() {
  const [tours, setTours] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Фильтр state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [maxPrice, setMaxPrice] = useState(1500000);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetch('/api/tours');
        if (!res.ok) throw new Error('API жауап бермеді');
        const data = await res.json();
        setTours(data.length ? data : STATIC_TOURS);
      } catch (err) {
        console.warn('API қолжетімді емес, статикалық деректер қолданылады:', err.message);
        setTours(STATIC_TOURS);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('/api/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.favorites) {
          setFavoriteIds(data.favorites.map(f => f.id));
        }
      } catch (err) {
        console.warn('Favorites fetch қатесі', err);
      }
    };

    fetchTours();
    fetchFavorites();
  }, []);

  const parsePrice = (priceVal) => {
    if (typeof priceVal === 'number') return priceVal;
    if (typeof priceVal === 'string') return parseInt(priceVal.replace(/[^\d]/g, ''), 10) || 0;
    return 0;
  };

  const uniqueCities = useMemo(() => {
    const cities = new Set();
    tours.forEach(t => {
      if (t.city) cities.add(t.city);
      else if (t.badge) cities.add(t.badge);
    });
    return Array.from(cities);
  }, [tours]);

  // Фильтрлеу логикасы
  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      const priceNum = parsePrice(tour.price);

      const cityOrBadge = (tour.city || tour.badge || '').toLowerCase();
      const title = (tour.title || '').toLowerCase();
      const st = searchTerm.toLowerCase();

      const matchesSearch = title.includes(st) || cityOrBadge.includes(st);

      const matchesCity = selectedCity ? (tour.city === selectedCity || tour.badge === selectedCity) : true;

      const matchesPrice = priceNum <= maxPrice;

      return matchesSearch && matchesCity && matchesPrice;
    });
  }, [tours, searchTerm, selectedCity, maxPrice]);

  return (
    <>
      <div className="about-hero" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)' }}>
        <h1>🌍 Барлық турлар</h1>
        <p>Өзіңізге арналған тамаша саяхатты табыңыз!</p>
      </div>

      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">

          <div className="filter-bar">
            <div className="filter-group">
              <label>🔍 Іздеу:</label>
              <input
                type="text"
                placeholder="Тур немесе қала..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="filter-group">
              <label>📍 Бағыт (Қала):</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="form-input"
              >
                <option value="">Барлығы</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="filter-group range-group">
              <label>💰 Ең жоғарғы баға: <b>{maxPrice.toLocaleString('kk-KZ')} ₸</b></label>
              <input
                type="range"
                min="50000"
                max="1500000"
                step="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="range-slider"
              />
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <p style={{ textAlign: 'center', color: 'var(--error)' }}>{error}</p>
          ) : (
            <>
              {filteredTours.length > 0 ? (
                <div className="tours-grid">
                  {filteredTours.map((tour) => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      isFavoriteInit={favoriteIds.includes(tour.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-tours-found">
                  <h3>😕 Өкінішке орай, мұндай тур табылмады.</h3>
                  <p>Басқа параметрлерді байқап көріңіз немесе бағаны көтеріңіз.</p>
                  <button className="btn-primary" onClick={() => {
                    setSearchTerm(''); setSelectedCity(''); setMaxPrice(1500000);
                  }}>
                    Сүзгіні тазалау
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default ToursPage;
