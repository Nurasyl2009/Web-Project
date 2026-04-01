import { useState } from 'react';
import Notification from '../components/Notification';
import { useAppContext } from '../context/AppContext';
import { translations } from '../utils/translations';

function AboutPage() {
  const { language } = useAppContext();
  const t = translations[language];
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
      setNotification({ message: t.about.errorMessage, type: 'error' });
      return;
    }
    if (!email.includes('@')) {
      setNotification({ message: t.auth.emailPlaceholder + ' ' + (language === 'kk' ? 'дұрыс емес' : 'некорректен'), type: 'error' });
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
        setNotification({ message: t.about.successMessage, type: 'success' });
        setContactForm({ name: '', email: '', message: '' });
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
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="about-hero">
        <h1>{t.about.title}</h1>
        <p>{t.about.subtitle}</p>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 720, textAlign: 'center' }}>
          <h2 className="section__title">{t.about.missionTitle}</h2>
          <p className="section__subtitle">
            {t.about.missionDesc}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface-2)' }}>
        <div className="container">
          <div className="section__header" style={{ textAlign: 'center' }}>
            <h2 className="section__title">{t.about.teamTitle}</h2>
            <p className="section__subtitle">{t.about.teamSub}</p>
          </div>
          <div className="team-grid">
            {t.team.map((member) => (
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
            <h2>{t.about.contactTitle}</h2>

            <div className="form-group">
              <label htmlFor="contact-name">{t.auth.nameLabel}</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                className="form-input"
                placeholder={t.auth.namePlaceholder}
                value={contactForm.name}
                onChange={handleContactChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-email">{t.auth.emailLabel}</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                className="form-input"
                placeholder={t.auth.emailPlaceholder}
                value={contactForm.email}
                onChange={handleContactChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-message">{language === 'kk' ? 'Хабарлама' : 'Сообщение'}</label>
              <textarea
                id="contact-message"
                name="message"
                className="form-input"
                rows={4}
                placeholder={language === 'kk' ? 'Сіздің сұрағыңыз...' : 'Ваш вопрос...'}
                value={contactForm.message}
                onChange={handleContactChange}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? t.about.sendingBtn : t.about.sendBtn}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default AboutPage;
