import { Link } from 'react-router-dom';

/**
 * Reusable city card that links to the city route page.
 * @param {object} city - City data
 * @param {string} city.key - URL slug (e.g. "paris")
 * @param {string} city.name - Display name
 * @param {string} city.country - Country name
 * @param {string} city.icon - Emoji icon
 * @param {string} city.image - Image URL
 * @param {string} city.route - Route stop summary
 * @param {string} city.stops - Number of stops text
 */
function CityCard({ city }) {
  const { key, name, country, icon, image, route, stops } = city;
  const safeCountry = country || '—';
  const safeIcon = icon || '📍';
  const safeRoute = route || 'Маршрут';
  const safeStops = stops || '';

  return (
    <Link to={`/cities/${key}`} className="city-card">
      <div className="city-card__image-wrap">
        <img src={image} alt={name} className="city-card__image" loading="lazy" />
        <span className="city-card__tag">📍 {safeStops}</span>
      </div>
      <div className="city-card__body">
        <div className="city-card__icon">{safeIcon}</div>
        <h3 className="city-card__name">{name}, {safeCountry}</h3>
        <p className="city-card__route">{safeRoute}</p>
        <span className="city-card__arrow">Маршрутты көру →</span>
      </div>
    </Link>
  );
}

export default CityCard;
