import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim()) return 'Email енгізіңіз';
    if (!email.includes('@')) return 'Email форматы дұрыс емес';
    if (!password) return 'Құпия сөзді енгізіңіз';
    if (password.length < 6) return 'Құпия сөз кем дегенде 6 символ болуы керек';
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
        setNotification({ message: 'Сәтті кірдіңіз!', type: 'success' });
        setTimeout(() => navigate('/profile'), 1200);
      } else {
        setNotification({ message: data.message || 'Кіру мүмкін болмады', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Серверге қосылу мүмкін болмады', type: 'error' });
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
        <h1>Кіру 👋</h1>
        <p className="subtitle">Аккаунтыңызға кіріңіз</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Құпия сөз</label>
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
            {loading ? 'Тексерілуде...' : 'Кіру'}
          </button>
        </form>
        <p className="auth-footer">
          Аккаунт жоқ па? <Link to="/register">Тіркелу</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
