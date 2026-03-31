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

  return (
    <Link to={`/cities/${key}`} className="city-card">
      <div className="city-card__image-wrap">
        <img src={image} alt={name} className="city-card__image" loading="lazy" />
        <span className="city-card__tag">📍 {stops}</span>
      </div>
      <div className="city-card__body">
        <div className="city-card__icon">{icon}</div>
        <h3 className="city-card__name">{name}, {country}</h3>
        <p className="city-card__route">{route}</p>
        <span className="city-card__arrow">Маршрутты көру →</span>
      </div>
    </Link>
  );
}

export default CityCard;
