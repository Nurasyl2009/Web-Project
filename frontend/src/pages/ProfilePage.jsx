import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TourCard from '../components/TourCard';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { translations } from '../utils/translations';

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function ProfilePage() {
  const { language } = useAppContext();
  const t = translations[language];
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ bookedTours: 0, visitedCities: 0 });
  const [purchases, setPurchases] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setEditName(data.user.name || '');
          setStats(data.stats || { bookedTours: 0, visitedCities: 0 });
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          navigate('/login');
        }
      })
      .catch(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setEditName(parsed.name || '');
        } else {
          navigate('/login');
        }
      })
      .finally(() => setLoading(false));

    fetch('/api/buy/history', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (data.success) setPurchases(data.purchases || []); })
      .catch(() => { });

    fetch('/api/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (data.success) setFavorites(data.favorites || []); })
      .catch(() => { });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userChanged'));
    navigate('/');
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...user, name: editName };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        window.dispatchEvent(new Event('userChanged'));
        setEditMode(false);
        toast.success(t.profile.successUpdate);
      } else {
        toast.error(data.message || t.common.error);
      }
    } catch {
      toast.error(t.common.errorServer);
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'kk' ? 'Тек суреттерді жүктеуге болады!' : 'Можно загружать только изображения!');
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(language === 'kk' ? 'Файл тым үлкен. Максимум 2MB.' : 'Файл слишком большой. Максимум 2MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    const toastId = toast.loading(t.common.loading);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(language === 'kk' ? 'Аватар жаңартылды!' : 'Аватар обновлен!', { id: toastId });
        const updatedUser = { ...user, avatar_url: data.avatar_url };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userChanged'));
      } else {
        toast.error(data.message || t.common.error, { id: toastId });
      }
    } catch (err) {
      toast.error(t.common.errorServer, { id: toastId });
    } finally {
      setAvatarLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

  const initials = getInitials(user.name);
  const locale = language === 'kk' ? 'kk-KZ' : 'ru-RU';
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(locale, { year: 'numeric', month: 'long' })
    : '2026';

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-hero__bg" />
        <div className="profile-hero__content">
          <div className="profile-avatar">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" />
            ) : (
              <div className="profile-avatar__initials">{initials}</div>
            )}
            {avatarLoading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>⏳</div>
            )}
            <div className="profile-avatar__ring" />
          </div>
          <div className="profile-hero__info">
            <h1 className="profile-hero__name">{user.name}</h1>
            <p className="profile-hero__email">✉️ {user.email}</p>
            <p className="profile-hero__since">📅 {t.profile.joined} {joinDate}</p>
          </div>
          <button className="profile-logout-btn" onClick={handleLogout}>
            {t.profile.logout}
          </button>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stats__grid container">
          <div className="profile-stat">
            <span className="profile-stat__num">{stats.bookedTours}</span>
            <span className="profile-stat__label">{t.profile.bookedTours}</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__num">{stats.visitedCities}</span>
            <span className="profile-stat__label">{t.profile.visitedCities}</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__num">{stats.bookedTours > 0 ? t.profile.vip : t.profile.new}</span>
            <span className="profile-stat__label">{t.profile.status}</span>
          </div>
        </div>
      </div>

      <div className="profile-body container">
        <div className="profile-tabs">
          <button
            className={`profile-tab${activeTab === 'overview' ? ' active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            {t.profile.tabs.overview}
          </button>
          <button
            className={`profile-tab${activeTab === 'purchases' ? ' active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            {t.profile.tabs.purchases} ({purchases.length})
          </button>
          <button
            className={`profile-tab${activeTab === 'favorites' ? ' active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            {t.profile.tabs.favorites} ({favorites.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>{t.profile.personalInfo}</h2>
              {!editMode && (
                <button className="profile-edit-btn" onClick={() => setEditMode(true)}>
                  {t.profile.edit}
                </button>
              )}
            </div>

            <div className="profile-fields" style={{ marginBottom: '1rem' }}>
              <div className="profile-field">
                <label>{t.profile.avatar}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center' }}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontWeight: 800 }}>{initials}</span>
                    )}
                  </div>
                  <label className="btn-outline" style={{ cursor: avatarLoading ? 'not-allowed' : 'pointer', opacity: avatarLoading ? 0.6 : 1 }}>
                    {avatarLoading ? t.common.loading : t.profile.changeAvatar}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={avatarLoading}
                      onChange={handleAvatarChange}
                    />
                  </label>
                  <span style={{ opacity: 0.8, fontSize: 13 }}>{t.profile.avatarHint}</span>
                </div>
              </div>
            </div>

            <div className="profile-fields">
              <div className="profile-field">
                <label>{t.auth.nameLabel}</label>
                {editMode ? (
                  <input
                    className="profile-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={t.auth.namePlaceholder}
                  />
                ) : (
                  <span>{user.name}</span>
                )}
              </div>
              <div className="profile-field">
                <label>{t.auth.emailLabel}</label>
                <span>{user.email}</span>
              </div>
              <div className="profile-field">
                <label>{language === 'kk' ? 'Аккаунт ID' : 'ID Аккаунта'}</label>
                <span className="profile-id">#{user.id}</span>
              </div>
            </div>
            {editMode && (
              <div className="profile-edit-actions">
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? t.profile.save + '...' : t.profile.save}
                </button>
                <button className="btn-outline" onClick={() => { setEditMode(false); setEditName(user.name); }}>
                  {t.profile.cancel}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>{t.profile.historyTitle}</h2>
            </div>
            {purchases.length === 0 ? (
              <div className="profile-empty">
                <div className="profile-empty__icon">🧳</div>
                <p>{t.profile.emptyPurchases}</p>
                <Link to="/buy" className="btn-primary">{t.profile.buyBtn}</Link>
              </div>
            ) : (
              <div className="purchase-list">
                {purchases.map((p, i) => (
                  <div className="purchase-item" key={i}>
                    <div className="purchase-item__icon">✈️</div>
                    <div className="purchase-item__info">
                      <strong className="purchase-item__city">{p.city}</strong>
                      <div className="purchase-item__meta" style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '4px' }}>
                        <span>👤 {p.guests_count || 1} {t.profile.guests}</span> •
                        <span> 💰 {parseInt(p.total_amount || 0).toLocaleString(locale)} ₸</span>
                      </div>
                      <div className="purchase-item__meta" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                        📅 {t.profile.tourDate} <strong>{p.tour_date ? new Date(p.tour_date).toLocaleDateString(locale) : '---'}</strong>
                      </div>
                    </div>
                    <div className="purchase-item__badge" style={{ marginLeft: 'auto' }}>{language === 'kk' ? 'Сәтті ✓' : 'Успешно ✓'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>{t.profile.favoritesTitle}</h2>
            </div>
            {favorites.length === 0 ? (
              <div className="profile-empty">
                <div className="profile-empty__icon">🤍</div>
                <p>{t.profile.emptyFavorites}</p>
                <Link to="/tours" className="btn-primary">{t.profile.viewToursBtn}</Link>
              </div>
            ) : (
              <div className="tours-grid" style={{ marginTop: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {favorites.map((tour) => (
                  <TourCard
                    key={tour.id}
                    tour={tour}
                    isFavoriteInit={true}
                    onToggleFavorite={(id, isFav) => {
                      if (!isFav) {
                        setFavorites(prev => prev.filter(t => t.id !== id));
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
