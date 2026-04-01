import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { translations } from '../utils/translations';

function Header() {
  const { theme, toggleTheme, language, changeLanguage } = useAppContext();
  const t = translations[language];
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const syncUser = useCallback(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch { setUser(null); }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    syncUser();
    window.addEventListener('userChanged', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('userChanged', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, [syncUser]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    closeMenu();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo" onClick={closeMenu}>
          Travel<span>Way</span>
        </Link>
        
        <nav className={`header__nav${menuOpen ? ' open' : ''}`}>
          <NavLink to="/" end className="nav-link" onClick={closeMenu}>{t.nav.home}</NavLink>
          <NavLink to="/tours" className="nav-link" onClick={closeMenu}>{t.nav.tours}</NavLink>
          <NavLink to="/cities" className="nav-link" onClick={closeMenu}>{t.nav.cities}</NavLink>
          <NavLink to="/about" className="nav-link" onClick={closeMenu}>{t.nav.about}</NavLink>
        </nav>

        <div className="header__controls">
          <button onClick={toggleTheme} className="control-btn" title="Ауыстыру">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button 
            onClick={() => changeLanguage(language === 'kk' ? 'ru' : 'kk')} 
            className="control-btn lang-btn"
          >
            {language === 'kk' ? 'RU' : 'KZ'}
          </button>
        </div>

        <div className={`header__actions${menuOpen ? ' open' : ''}`}>
          {user ? (
            <div className="header__user">
              {user.role === 'admin' && (
                <NavLink to="/admin" className="nav-link" onClick={closeMenu}>
                  {t.nav.admin}
                </NavLink>
              )}
              <Link to="/profile" className="header__avatar" onClick={closeMenu} title={t.nav.profile}>
                {initials}
              </Link>
              <button className="btn-outline header__logout-btn" onClick={handleLogout}>{t.nav.logout}</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline" onClick={closeMenu}>{t.nav.login}</Link>
              <Link to="/register" className="btn-primary" onClick={closeMenu}>{t.nav.register}</Link>
            </>
          )}
        </div>
        
        <button
          className="hamburger"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export default Header;
