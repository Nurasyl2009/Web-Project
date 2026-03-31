import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">TravelWay ✈️</div>
          <p>Еуропаның ең тамаша қалаларына арналған саяхат турлары. Ең жақсы бағалар мен сервис.</p>
        </div>
        <div className="footer__links">
          <h4>Навигация</h4>
          <ul>
            <li><Link to="/">Басты бет</Link></li>
            <li><Link to="/tours">Турлар</Link></li>
            <li><Link to="/cities">Қалалар</Link></li>
            <li><Link to="/about">Біз туралы</Link></li>
          </ul>
        </div>
        <div className="footer__contact">
          <h4>Байланыс</h4>
          <p>📧 kabdykadirov03gmail.com</p>
          <p>📞 +7 (727) 123-45-67</p>
          <p>📍 Алматы, Қазақстан</p>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© 2026 TravelWay саяхат агенттігі. Барлық құқықтар қорғалған.</p>
      </div>
    </footer>
  );
}

export default Footer;
