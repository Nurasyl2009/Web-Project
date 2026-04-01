import { useState, useEffect, useMemo } from 'react';
import TourCard from '../components/TourCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAppContext } from '../context/AppContext';
import { translations } from '../utils/translations';

function ToursPage() {
  const { language } = useAppContext();
  const t = translations[language];
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
        if (!res.ok) throw new Error(t.common.error);
        const data = await res.json();
        setTours(data.length ? data : t.tours.staticTours);
      } catch (err) {
        console.warn('API қолжетімді емес, статикалық деректер қолданылады:', err.message);
        setTours(t.tours.staticTours);
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
  }, [language, t.common.error, t.tours.staticTours]);

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
        <h1>{t.tours.title}</h1>
        <p>{t.tours.subtitle}</p>
      </div>

      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">

          <div className="filter-bar">
            <div className="filter-group">
              <label>🔍 {t.tours.searchPlaceholder.split('...')[0]}:</label>
              <input
                type="text"
                placeholder={t.tours.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="filter-group">
              <label>{t.tours.destinationLabel}</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="form-input"
              >
                <option value="">{t.tours.allCities}</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="filter-group range-group">
              <label>{t.tours.maxPriceLabel} <b>{maxPrice.toLocaleString(language === 'kk' ? 'kk-KZ' : 'ru-RU')} ₸</b></label>
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
                  <h3>{t.tours.noToursTitle}</h3>
                  <p>{t.tours.noToursDesc}</p>
                  <button className="btn-primary" onClick={() => {
                    setSearchTerm(''); setSelectedCity(''); setMaxPrice(1500000);
                  }}>
                    {t.tours.clearFilters}
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
