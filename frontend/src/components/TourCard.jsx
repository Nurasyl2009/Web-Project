import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable tour card component.
 * @param {object} tour - Tour data object
 * @param {boolean} isFavoriteInit - Initial favorite state from parent
 * @param {function} onToggleFavorite - Optional callback when toggled
 */
import { useAppContext } from '../context/AppContext';
import { translations } from '../utils/translations';
import ThreeDMap from './ThreeDMap';

/**
 * Reusable tour card component.
 * @param {object} tour - Tour data object
 * @param {boolean} isFavoriteInit - Initial favorite state from parent
 * @param {function} onToggleFavorite - Optional callback when toggled
 */
function TourCard({ tour, isFavoriteInit = false, onToggleFavorite }) {
  const { language } = useAppContext();
  const t = translations[language];
  const { id, title, description, price, image, badge, city } = tour;
  const [isFavorite, setIsFavorite] = useState(isFavoriteInit);
  const [loading, setLoading] = useState(false);
  const [show3D, setShow3D] = useState(false);

  // Sync state if parent changes it
  useEffect(() => {
    setIsFavorite(isFavoriteInit);
  }, [isFavoriteInit]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert(t.tourCard.loginRequired);
      return;
    }

    setLoading(true);
    const method = isFavorite ? 'DELETE' : 'POST';
    try {
      const res = await fetch(`/api/favorites/${id}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIsFavorite(!isFavorite);
        if (onToggleFavorite) onToggleFavorite(id, !isFavorite);
      } else {
        alert(data.message || t.common.error);
      }
    } catch {
      alert(t.common.errorServer);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tour-card" style={{ position: 'relative' }}>
      <button 
        onClick={handleFavoriteClick}
        disabled={loading}
        title={isFavorite ? t.tourCard.favRemove : t.tourCard.favAdd}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          cursor: loading ? 'wait' : 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          zIndex: 10,
          transition: 'transform 0.2s',
          transform: loading ? 'scale(0.9)' : 'scale(1)',
        }}
      >
        {isFavorite ? '❤️' : '🤍'}
      </button>

      <button 
        onClick={(e) => { e.preventDefault(); setShow3D(true); }}
        title={t.cityRoute.view3D}
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          zIndex: 10,
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.background = '#fff';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
        }}
      >
        🚀
      </button>

      {show3D && (
        <ThreeDMap 
          cityName={city || badge || title} 
          onClose={() => setShow3D(false)} 
          t={t}
        />
      )}

      <img
        src={image}
        alt={title}
        className="tour-card__image"
        loading="lazy"
      />
      <div className="tour-card__body">
        {badge && <span className="tour-card__badge">{badge}</span>}
        <h3 className="tour-card__title">{title}</h3>
        <p className="tour-card__desc">{description}</p>
        <div className="tour-card__footer">
          <span className="tour-card__price">{price}</span>
          <Link to="/buy" state={{ defaultCity: badge || title }} className="tour-card__btn">
            {t.tourCard.buy}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TourCard;
