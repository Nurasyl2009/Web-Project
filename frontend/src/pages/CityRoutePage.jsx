import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { translations } from '../utils/translations';

function CityRoutePage() {
  const { city } = useParams();
  const { language } = useAppContext();
  const t = translations[language];
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/cities/${city}`, { signal: controller.signal });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'API error');
        if (!ignore) setData(json.city);
      } catch {
        if (!ignore) setData(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [city]);

  if (loading) {
    return (
      <div className="not-found">
        <h2>{t.common.loading}</h2>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="not-found">
        <div className="not-found__code">404</div>
        <h2>{t.notFound.title}</h2>
        <p>{language === 'kk' ? 'Мұндай маршрут жоқ.' : 'Такого маршрута не существует.'}</p>
        <Link to="/cities" className="btn-primary">{t.cityRoute.backBtn}</Link>
      </div>
    );
  }

  return (
    <>
      <div className="route-hero" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)' }}>
        <h1>🗺️ {data.name} {t.cityRoute.title}</h1>
        <p>{data.route_text || t.cityRoute.subtitle}</p>
      </div>
      <div className="map-container">
        {data.map_url && (data.map_url.includes('google.com/maps') || data.map_url.includes('maps.google.com')) ? (
          <iframe
            src={data.map_url.includes('output=embed') || data.map_url.includes('/maps/embed')
              ? data.map_url
              : (data.map_url.includes('?') ? `${data.map_url}&output=embed` : `${data.map_url}?output=embed`)
            }
            title={`${data.name} картасы`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ opacity: 0.85, marginBottom: 12 }}>
              {t.cityRoute.noMap}
            </p>
            {data.map_url ? (
              <a className="btn-primary" href={data.map_url} target="_blank" rel="noreferrer">
                {t.cityRoute.openMap}
              </a>
            ) : (
              <p style={{ opacity: 0.8 }}>{t.cityRoute.noLink}</p>
            )}
          </div>
        )}
      </div>

      {data.route_text && (
        <div className="stops-grid">
          <div className="stop-card" style={{ gridColumn: '1 / -1' }}>
            <h4>{language === 'kk' ? 'Маршрут' : 'Маршрут'}</h4>
            <p>{data.route_text}</p>
          </div>
        </div>
      )}
      <Link to="/cities" className="back-link">{t.cityRoute.backBtn}</Link>
    </>
  );
}

export default CityRoutePage;
