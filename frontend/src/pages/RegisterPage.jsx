import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import { useAppContext } from '../context/AppContext';
import { translations } from '../utils/translations';

function RegisterPage() {
  const { language } = useAppContext();
  const t = translations[language];
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const { name, email, password, confirm } = formData;
    if (!name.trim()) return t.auth.nameLabel + ' ' + (language === 'kk' ? 'енгізіңіз' : 'введите');
    if (!email.trim() || !email.includes('@')) return t.auth.emailPlaceholder + ' ' + (language === 'kk' ? 'дұрыс емес' : 'некорректен');
    if (password.length < 6) return t.auth.passwordPlaceholder;
    if (password !== confirm) return language === 'kk' ? 'Құпия сөздер сәйкес келмейді' : 'Пароли не совпадают';
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setNotification({ message: language === 'kk' ? 'Тіркелу сәтті! Аккаунтыңызға кіріп жатырмыз...' : 'Регистрация успешна! Входим в аккаунт...', type: 'success' });
        setTimeout(() => navigate('/login'), 1500);
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
        <h1>{t.auth.registerTitle}</h1>
        <p className="subtitle">{t.auth.registerSub}</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reg-name">{t.auth.nameLabel}</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              className="form-input"
              placeholder={t.auth.namePlaceholder}
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">{t.auth.emailLabel}</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-input"
              placeholder={t.auth.emailPlaceholder}
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">{t.auth.passwordLabel}</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className="form-input"
              placeholder={t.auth.passwordPlaceholder}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">{t.auth.confirmPasswordLabel}</label>
            <input
              id="reg-confirm"
              name="confirm"
              type="password"
              className="form-input"
              placeholder={t.auth.confirmPlaceholder}
              value={formData.confirm}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? t.auth.registerBtn + '...' : t.auth.registerBtn}
          </button>
        </form>

        <p className="auth-footer">
          {t.auth.haveAccount} <Link to="/login">{t.auth.loginBtn}</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
