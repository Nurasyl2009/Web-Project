import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TourCard from '../components/TourCard';
import toast from 'react-hot-toast';

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function ProfilePage() {
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
        toast.success('Деректер сәтті жаңартылды!');
      } else {
        toast.error(data.message || 'Қате орын алды');
      }
    } catch {
      toast.error('Серверге қосылу мүмкін болмады');
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Тек суреттерді жүктеуге болады!');
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error('Файл тым үлкен. Максимум 2MB.');
      return;
    }

    if (file.name.length > 80) {
      toast.error('Файл атауы тым ұзын. 80 символдан аспасын.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    const toastId = toast.loading('Сурет жүктелуде...');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Аватар жаңартылды!', { id: toastId });
        const updatedUser = { ...user, avatar_url: data.avatar_url };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userChanged'));
      } else {
        toast.error(data.message || 'Қате шықты', { id: toastId });
      }
    } catch (err) {
      toast.error('Серверге қосылу мүмкін болмады', { id: toastId });
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
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('kk-KZ', { year: 'numeric', month: 'long' })
    : '2026 жыл';

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
            <p className="profile-hero__since">📅 Тіркелген: {joinDate}</p>
          </div>
          <button className="profile-logout-btn" onClick={handleLogout}>
            🚪 Шығу
          </button>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stats__grid container">
          <div className="profile-stat">
            <span className="profile-stat__num">{stats.bookedTours}</span>
            <span className="profile-stat__label">Сатып алынған турлар</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__num">{stats.visitedCities}</span>
            <span className="profile-stat__label">Барылған қалалар</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__num">{stats.bookedTours > 0 ? '⭐ VIP' : 'Жаңа'}</span>
            <span className="profile-stat__label">Мәртебе</span>
          </div>
        </div>
      </div>

      <div className="profile-body container">
        <div className="profile-tabs">
          <button
            className={`profile-tab${activeTab === 'overview' ? ' active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            👤 Профиль
          </button>
          <button
            className={`profile-tab${activeTab === 'purchases' ? ' active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            🧳 Тарих ({purchases.length})
          </button>
          <button
            className={`profile-tab${activeTab === 'favorites' ? ' active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            ❤️ Таңдаулы ({favorites.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>Жеке ақпарат</h2>
              {!editMode && (
                <button className="profile-edit-btn" onClick={() => setEditMode(true)}>
                  ✏️ Өзгерту
                </button>
              )}
            </div>

            <div className="profile-fields" style={{ marginBottom: '1rem' }}>
              <div className="profile-field">
                <label>Аватар</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center' }}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontWeight: 800 }}>{initials}</span>
                    )}
                  </div>
                  <label className="btn-outline" style={{ cursor: avatarLoading ? 'not-allowed' : 'pointer', opacity: avatarLoading ? 0.6 : 1 }}>
                    {avatarLoading ? 'Жүктелуде...' : '🖼️ Аватарды өзгерту'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={avatarLoading}
                      onChange={handleAvatarChange}
                    />
                  </label>
                  <span style={{ opacity: 0.8, fontSize: 13 }}>PNG/JPG, 2MB дейін, атауы 80 символға дейін</span>
                </div>
              </div>
            </div>

            <div className="profile-fields">
              <div className="profile-field">
                <label>Аты-жөні</label>
                {editMode ? (
                  <input
                    className="profile-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Атыңызды енгізіңіз"
                  />
                ) : (
                  <span>{user.name}</span>
                )}
              </div>
              <div className="profile-field">
                <label>Email</label>
                <span>{user.email}</span>
              </div>
              <div className="profile-field">
                <label>Аккаунт ID</label>
                <span className="profile-id">#{user.id}</span>
              </div>
            </div>
            {editMode && (
              <div className="profile-edit-actions">
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Сақталуда...' : '💾 Сақтау'}
                </button>
                <button className="btn-outline" onClick={() => { setEditMode(false); setEditName(user.name); }}>
                  Бас тарту
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>Сатып алу тарихы</h2>
            </div>
            {purchases.length === 0 ? (
              <div className="profile-empty">
                <div className="profile-empty__icon">🧳</div>
                <p>Сіз әлі тур сатып алмадыңыз</p>
                <Link to="/buy" className="btn-primary">Тур сатып алу</Link>
              </div>
            ) : (
              <div className="purchase-list">
                {purchases.map((p, i) => (
                  <div className="purchase-item" key={i}>
                    <div className="purchase-item__icon">✈️</div>
                    <div className="purchase-item__info">
                      <strong className="purchase-item__city">{p.city}</strong>
                      <div className="purchase-item__meta" style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '4px' }}>
                        <span>👤 {p.guests_count || 1} адам</span> •
                        <span> 💰 {parseInt(p.total_amount || 0).toLocaleString('kk-KZ')} ₸</span>
                      </div>
                      <div className="purchase-item__meta" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                        📅 Саяхат күні: <strong>{p.tour_date ? new Date(p.tour_date).toLocaleDateString('kk-KZ') : '---'}</strong>
                      </div>
                    </div>
                    <div className="purchase-item__badge" style={{ marginLeft: 'auto' }}>Сәтті ✓</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>❤️ Таңдаулы турлар</h2>
            </div>
            {favorites.length === 0 ? (
              <div className="profile-empty">
                <div className="profile-empty__icon">🤍</div>
                <p>Сізде әлі таңдаулы турлар жоқ.</p>
                <Link to="/tours" className="btn-primary">Турларды көру</Link>
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
