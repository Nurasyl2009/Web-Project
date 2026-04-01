import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import { useAppContext } from '../context/AppContext';
import { translations } from '../utils/translations';

function LoginPage() {
  const { language } = useAppContext();
  const t = translations[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim()) return t.auth.emailLabel + ' ' + (language === 'kk' ? 'енгізіңіз' : 'введите');
    if (!email.includes('@')) return t.auth.emailPlaceholder + ' ' + (language === 'kk' ? 'дұрыс емес' : 'некорректен');
    if (!password) return t.auth.passwordLabel + ' ' + (language === 'kk' ? 'енгізіңіз' : 'введите');
    if (password.length < 6) return t.auth.passwordPlaceholder;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setNotification({ message: error, type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('userChanged'));
        setNotification({ message: language === 'kk' ? 'Сәтті кірдіңіз!' : 'Успешный вход!', type: 'success' });
        setTimeout(() => navigate('/profile'), 1200);
      } else {
        setNotification({ message: data.message || t.common.error, type: 'error' });
      }
    } catch {
      setNotification({ message: t.common.errorServer, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="auth-box">
        <h1>{t.auth.loginTitle}</h1>
        <p className="subtitle">{t.auth.loginSub}</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">{t.auth.emailLabel}</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder={t.auth.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">{t.auth.passwordLabel}</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? t.auth.checkBtn : t.auth.loginBtn}
          </button>
        </form>
        <p className="auth-footer">
          {t.auth.noAccount} <Link to="/register">{t.auth.registerBtn}</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
