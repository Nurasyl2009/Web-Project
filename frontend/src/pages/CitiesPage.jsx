import CityCard from '../components/CityCard';
import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../utils/translations';

function CitiesPage() {
  const { language } = useAppContext();
  const t = translations[language];
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
        if (!res.ok || !data.success) throw new Error(data.message || t.common.error);
        if (!ignore) setCities(data.cities || []);
      } catch (e) {
        if (!ignore) setError(e.message || t.common.error);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [t.common.error]);

  return (
    <>
      <div className="about-hero" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #3498db 100%)' }}>
        <h1>{t.cities.title}</h1>
        <p>{t.cities.subtitle}</p>
      </div>

      <section className="section">
        <div className="container">
          <div className="cities-grid">
            {loading ? (
              <p style={{ opacity: 0.8 }}>{t.common.loading}</p>
            ) : error ? (
              <p style={{ color: 'var(--error)' }}>{t.common.error}: {error}</p>
            ) : cities.length === 0 ? (
              <p style={{ opacity: 0.8 }}>{t.cities.notFound}</p>
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
