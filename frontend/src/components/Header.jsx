import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

function Header() {
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
          <NavLink to="/" end className="nav-link" onClick={closeMenu}>Басты бет</NavLink>
          <NavLink to="/tours" className="nav-link" onClick={closeMenu}>Турлар</NavLink>
          <NavLink to="/cities" className="nav-link" onClick={closeMenu}>Қалалар</NavLink>
          <NavLink to="/about" className="nav-link" onClick={closeMenu}>Біз туралы</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="nav-link" style={{ color: 'var(--primary-color)' }} onClick={closeMenu}>Админ панель</NavLink>
          )}
        </nav>
        <div className={`header__actions${menuOpen ? ' open' : ''}`}>
          {user ? (
            <div className="header__user">
              <Link to="/profile" className="header__avatar" onClick={closeMenu} title="Жеке кабинет">
                {initials}
              </Link>
              <span className="header__username">{user.name.split(' ')[0]}</span>
              <button className="btn-outline header__logout-btn" onClick={handleLogout}>Шығу</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline" onClick={closeMenu}>Кіру</Link>
              <Link to="/register" className="btn-primary" onClick={closeMenu}>Тіркелу</Link>
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
