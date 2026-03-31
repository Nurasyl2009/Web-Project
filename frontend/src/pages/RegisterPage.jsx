import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const { name, email, password, confirm } = formData;
    if (!name.trim()) return 'Атыңызды енгізіңіз';
    if (!email.trim() || !email.includes('@')) return 'Жарамды email енгізіңіз';
    if (password.length < 6) return 'Құпия сөз кем дегенде 6 символ болуы керек';
    if (password !== confirm) return 'Құпия сөздер сәйкес келмейді';
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
        setNotification({ message: 'Тіркелу сәтті! Аккаунтыңызға кіріп жатырмыз...', type: 'success' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setNotification({ message: data.message || 'Тіркелу мүмкін болмады', type: 'error' });
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
        <h1>Тіркелу 🚀</h1>
        <p className="subtitle">Жаңа аккаунт жасаңыз</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reg-name">Атыңыз</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Аты-жөніңіз"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Құпия сөз</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Кем дегенде 6 символ"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Құпия сөзді растау</label>
            <input
              id="reg-confirm"
              name="confirm"
              type="password"
              className="form-input"
              placeholder="Қайта жазыңыз"
              value={formData.confirm}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Тіркелуде...' : 'Тіркелу'}
          </button>
        </form>

        <p className="auth-footer">
          Аккаунт бар ма? <Link to="/login">Кіру</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
