import { useState } from 'react';
import Notification from '../components/Notification';

const TEAM = [
  { name: 'Айбек Сейітов', role: 'Бас директор', avatar: '👨‍💼' },
  { name: 'Дина Ахметова', role: 'Тур менеджері', avatar: '👩‍💼' },
  { name: 'Нұрлан Қасымов', role: 'Маркетинг', avatar: '👨‍🎨' },
  { name: 'Сауле Байжанова', role: 'Тур гиді', avatar: '👩‍🏫' },
];

function AboutPage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleContactChange = (e) => {
    setContactForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message } = contactForm;

    if (!name.trim() || !email.trim() || !message.trim()) {
      setNotification({ message: 'Барлық өрістерді толтырыңыз', type: 'error' });
      return;
    }
    if (!email.includes('@')) {
      setNotification({ message: 'Email дұрыс форматта еместігіңізді тексеріңіз', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ message: 'Хабарламаңыз жіберілді! Жақын арада хабарласамыз.', type: 'success' });
        setContactForm({ name: '', email: '', message: '' });
      } else {
        setNotification({ message: data.message || 'Қате орын алды', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Серверге қосылу мүмкін болмады', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="about-hero">
        <h1>✈️ Біз туралы</h1>
        <p>TravelWay — 2020 жылдан бері еуропалық турлар ұсынатын сенімді саяхат агенттігі</p>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 720, textAlign: 'center' }}>
          <h2 className="section__title">Біздің миссиямыз</h2>
          <p className="section__subtitle">
            Әр адамға армандаған саяхатын қолжетімді және ұмытылмас ету. Жоғары сапалы сервис,
            үздік бағалар және жылы қарым-қатынас — бұл TravelWay.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface-2)' }}>
        <div className="container">
          <div className="section__header" style={{ textAlign: 'center' }}>
            <h2 className="section__title">👥 Біздің команда</h2>
            <p className="section__subtitle">Сіздің саяхатыңызды мінсіз жасайтын мамандар</p>
          </div>
          <div className="team-grid">
            {TEAM.map((member) => (
              <div key={member.name} className="team-card">
                <div className="team-card__avatar">{member.avatar}</div>
                <div className="team-card__name">{member.name}</div>
                <div className="team-card__role">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <form className="contact-form" onSubmit={handleContactSubmit} noValidate>
            <h2>📬 Бізге хабарлас</h2>

            <div className="form-group">
              <label htmlFor="contact-name">Аты-жөніңіз</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={contactForm.name}
                onChange={handleContactChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={contactForm.email}
                onChange={handleContactChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-message">Хабарлама</label>
              <textarea
                id="contact-message"
                name="message"
                className="form-input"
                rows={4}
                placeholder="Сіздің сұрағыңыз..."
                value={contactForm.message}
                onChange={handleContactChange}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Жіберілуде...' : 'Жіберу'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default AboutPage;
