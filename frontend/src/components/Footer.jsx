import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { translations } from '../utils/translations';

function Footer() {
  const { language } = useAppContext();
  const t = translations[language];

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">TravelWay ✈️</div>
          <p>{t.footer.brandDesc}</p>
        </div>
        <div className="footer__links">
          <h4>{t.footer.navigation}</h4>
          <ul>
            <li><Link to="/">{t.nav.home}</Link></li>
            <li><Link to="/tours">{t.nav.tours}</Link></li>
            <li><Link to="/cities">{t.nav.cities}</Link></li>
            <li><Link to="/about">{t.nav.about}</Link></li>
          </ul>
        </div>
        <div className="footer__contact">
          <h4>{t.footer.contact}</h4>
          <p>📧 n.nurbolatovich09@gmail.com</p>
          <p>📞 +7 (705) 555-55-55</p>
          <p>{t.footer.location}</p>
        </div>
      </div>

      <div className="footer__bottom">
        <p>{t.footer.rights}</p>
      </div>
    </footer>
  );
}

export default Footer;
