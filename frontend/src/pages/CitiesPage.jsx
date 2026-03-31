import CityCard from '../components/CityCard';
import { useEffect, useState } from 'react';

function CitiesPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/cities', { signal: controller.signal });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'API error');
        if (!ignore) setCities(data.cities || []);
      } catch (e) {
        if (!ignore) setError(e.message || 'Қате');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return (
    <>
      <div className="about-hero" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #3498db 100%)' }}>
        <h1>🗺️ Қалалар маршруттары</h1>
        <p>Дерекқордағы турлар бойынша автоматты маршруттар</p>
      </div>

      <section className="section">
        <div className="container">
          <div className="cities-grid">
            {loading ? (
              <p style={{ opacity: 0.8 }}>Жүктелуде...</p>
            ) : error ? (
              <p style={{ color: 'var(--error)' }}>Қате: {error}</p>
            ) : cities.length === 0 ? (
              <p style={{ opacity: 0.8 }}>Қалалар табылмады</p>
            ) : (
              cities.map((city) => <CityCard key={city.key} city={city} />)
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default CitiesPage;
