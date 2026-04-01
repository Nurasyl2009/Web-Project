import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import { useAppContext } from '../context/AppContext';
import { translations } from '../utils/translations';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './AdminPage.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
);

function getInitials(name = '') {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function AdminPage() {
  const { language } = useAppContext();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [tours, setTours] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ popularCities: [], revenueByCity: [], revenueTrend: [] });
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', city: '', image_url: '', route_text: '', map_url: '' });

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    if (!currentUser.role || currentUser.role !== 'admin') {
      navigate('/');
    } else {
      fetchUsers();
      fetchTours();
      fetchPayments();
      fetchStats();
    }
  }, [navigate]);

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const getAuthHeaders = () => ({
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  });

  const showMsg = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch { showMsg(t.common.errorServer, 'error'); }
  };

  const fetchTours = async () => {
    try {
      const res = await fetch('/api/admin/tours', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setTours(data.tours);
    } catch { showMsg(t.common.errorServer, 'error'); }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        const sorted = data.payments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPayments(sorted);
      }
    } catch { showMsg(t.common.errorServer, 'error'); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setStats({
          popularCities: data.popularCities || [],
          revenueByCity: data.revenueByCity || [],
          revenueTrend: data.revenueTrend || []
        });
      }
    } catch { console.error("Stats қатесі"); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        showMsg(language === 'kk' ? 'Рөл жаңартылды' : 'Роль обновлена', 'success');
        fetchUsers();
      } else {
        showMsg(data.message || (language === 'kk' ? 'Рөл жаңартылмады' : 'Роль не обновлена'), 'error');
      }
    } catch { showMsg(t.common.error, 'error'); }
  };

  const handleDeleteTour = async (id) => {
    const confirmMsg = language === 'kk' 
      ? "Бұл турды өшіргіңіз келетініне сенімдісіз бе?" 
      : "Вы уверены, что хотите удалить этот тур?";
    if (!window.confirm(confirmMsg)) return;
    try {
      const res = await fetch(`/api/admin/tours/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        showMsg(language === 'kk' ? 'Тур сәтті өшірілді' : 'Тур успешно удален', 'success');
        fetchTours();
        fetchStats();
      } else {
        showMsg(data.message || t.common.error, 'error');
      }
    } catch { showMsg(t.common.error, 'error'); }
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser.id) return showMsg(language === 'kk' ? 'Өзіңізді өшіре алмайсыз' : 'Вы не можете удалить себя', 'error');
    const confirmMsg = language === 'kk' 
      ? "Бұл пайдаланушыны өшіргіңіз келетініне сенімдісіз бе?" 
      : "Вы уверены, что хотите удалить этого пользователя?";
    if (!window.confirm(confirmMsg)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        showMsg(language === 'kk' ? 'Пайдаланушы өшірілді' : 'Пользователь удален', 'success');
        fetchUsers();
      } else {
        showMsg(data.message || t.common.error, 'error');
      }
    } catch { showMsg(t.common.error, 'error'); }
  };

  const handleExportCSV = () => {
    if (payments.length === 0) return showMsg(language === 'kk' ? 'Экспорттайтын деректер жоқ' : 'Нет данных для экспорта', 'error');
    const headers = ['ID', 'Client', 'City', 'Guests', 'Amount', 'Tour Date', 'Card', 'Created At'];
    const rows = payments.map(p => [
      p.id,
      p.name,
      p.city,
      p.guests_count || 1,
      p.total_amount || 450000,
      p.tour_date ? new Date(p.tour_date).toLocaleDateString() : '---',
      `****${p.number.slice(-4)}`,
      new Date(p.created_at).toLocaleString()
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `payments_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const openCreateModal = () => {
    setEditingTour(null);
    setFormData({ title: '', description: '', price: '', city: '', image_url: '', route_text: '', map_url: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (tour) => {
    setEditingTour(tour);
    setFormData({
      title: tour.title,
      description: tour.description,
      price: tour.price,
      city: tour.city,
      image_url: tour.image_url,
      route_text: tour.route_text || '',
      map_url: tour.map_url || '',
    });
    setIsModalOpen(true);
  };

  const fixMapUrl = (url = '') => {
    if (!url) return '';
    let processed = url.trim();
    if (processed.includes('<iframe')) {
      const match = processed.match(/src="([^"]+)"/);
      if (match) processed = match[1];
    }
    if (processed.includes('google.com/maps') && !processed.includes('output=embed') && !processed.includes('/maps/embed')) {
      processed = processed.includes('?') ? `${processed}&output=embed` : `${processed}?output=embed`;
    }
    return processed;
  };

  const handleTourSubmit = async (e) => {
    e.preventDefault();
    const fixedData = { ...formData, map_url: fixMapUrl(formData.map_url) };
    const url = editingTour ? `/api/admin/tours/${editingTour.id}` : '/api/admin/tours';
    const method = editingTour ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(fixedData),
      });
      const data = await res.json();
      if (data.success) {
        const msg = editingTour 
          ? (language === 'kk' ? 'Тур жаңартылды!' : 'Тур обновлен!') 
          : (language === 'kk' ? 'Жаңа тур қосылды!' : 'Новый тур добавлен!');
        showMsg(msg, 'success');
        setIsModalOpen(false);
        fetchTours();
        fetchStats();
      } else {
        showMsg(data.message || t.common.error, 'error');
      }
    } catch { showMsg(t.common.error, 'error'); }
  };

  const totalUsers = users?.length || 0;
  const totalRevenue = (stats.revenueByCity || []).reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const totalBookings = (stats.popularCities || []).reduce((acc, curr) => acc + (curr.bookings || 0), 0);

  const filteredUsers = (users || []).filter(u =>
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTours = (tours || []).filter(t =>
    (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPayments = (payments || []).filter(p =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const locale = language === 'kk' ? 'kk-KZ' : 'ru-RU';

  if (!currentUser.role || currentUser.role !== 'admin') {
    return <div style={{ background: '#0f1015', height: '100vh' }}></div>;
  }

  if (!t) return null;

  return (
    <div className="admin-layout-wrapper">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-logo">
          <span style={{ fontSize: '1.8rem', marginRight: '-5px' }}>A</span>
          <span>ADMIN PANEL</span>
        </div>

        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}>
            {t.admin.sidebar.dashboard}
          </button>
          <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}>
            {t.admin.sidebar.users}
          </button>
          <button className={`admin-nav-item ${activeTab === 'tours' ? 'active' : ''}`} onClick={() => { setActiveTab('tours'); setIsSidebarOpen(false); }}>
            {t.admin.sidebar.tours}
          </button>
          <button className={`admin-nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }}>
            {t.admin.sidebar.payments}
          </button>
        </nav>

        <div className="admin-nav-bottom">
          <button className="admin-nav-item" onClick={() => navigate('/')} style={{ color: '#ef4444' }}>
            {t.admin.sidebar.logout}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-search-wrap">
            <button className="admin-hamburger" onClick={() => setIsSidebarOpen(true)}>
              ☰
            </button>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="admin-search"
              placeholder={activeTab === 'dashboard' ? (language === 'kk' ? "Іздеу..." : "Поиск...") : `${language === 'kk' ? 'Іздеу' : 'Поиск'} : ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-topbar-right">
            <span style={{ fontSize: '1.2rem', cursor: 'pointer', opacity: 0.7 }}>🔔</span>
            <div className="admin-profile">
              <div className="admin-avatar">{getInitials(currentUser.name)}</div>
              <span className="admin-profile-name">{currentUser.name} ▾</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <div key={activeTab} className="animate-fade-in">

            {activeTab === 'dashboard' && (
              <>
                <h1 className="admin-page-title">{t.admin.dashboard.title} {currentUser.name}</h1>
                <p className="admin-page-subtitle">{t.admin.dashboard.subtitle}</p>

                <div className="admin-metrics-grid">
                  <div className="admin-metric-card">
                    <div className="admin-metric-header">{t.admin.dashboard.metrics.totalUsers}</div>
                    <div className="admin-metric-value">{totalUsers}</div>
                    <div className="admin-metric-trend trend-up">↑ +12% {language === 'kk' ? 'осы айда' : 'в этом месяце'}</div>
                  </div>
                  <div className="admin-metric-card">
                    <div className="admin-metric-header">{t.admin.dashboard.metrics.revenue}</div>
                    <div className="admin-metric-value">{totalRevenue.toLocaleString(locale)} ₸</div>
                    <div className="admin-metric-trend trend-up">↑ +5% {language === 'kk' ? 'осы айда' : 'в этом месяце'}</div>
                  </div>
                  <div className="admin-metric-card">
                    <div className="admin-metric-header">{t.admin.dashboard.metrics.activeBookings}</div>
                    <div className="admin-metric-value">{totalBookings}</div>
                    <div className="admin-metric-trend trend-down">↓ -2 {language === 'kk' ? 'осы аптада' : 'на этой неделе'}</div>
                  </div>
                  <div className="admin-metric-card">
                    <div className="admin-metric-header">{t.admin.dashboard.metrics.totalTours}</div>
                    <div className="admin-metric-value">{tours.length}</div>
                    <div className="admin-metric-trend trend-up">↑ +2 {language === 'kk' ? 'жаңа' : 'новых'}</div>
                  </div>
                </div>

                <div className="admin-charts-grid">
                  <div className="admin-chart-card">
                    <h3 className="admin-chart-title">{t.admin.dashboard.charts.revenueTrend}</h3>
                    {(stats.revenueTrend || []).length > 0 ? (
                      <Line
                        data={{
                          labels: (stats.revenueTrend || []).map(r => r.label),
                          datasets: [{
                            label: t.admin.dashboard.metrics.revenue + ' (₸)',
                            data: (stats.revenueTrend || []).map(r => r.value),
                            borderColor: '#0ea5e9',
                            backgroundColor: 'rgba(14, 165, 233, 0.1)',
                            fill: true,
                            tension: 0.4
                          }]
                        }}
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { ticks: { color: '#646a80' }, grid: { color: '#282a36' } },
                            x: { ticks: { color: '#646a80' }, grid: { display: false } }
                          }
                        }}
                      />
                    ) : (
                      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: '#646a80' }}>{language === 'kk' ? 'Деректер жоқ' : 'Нет данных'}</p>
                      </div>
                    )}
                  </div>

                  <div className="admin-chart-card">
                    <h3 className="admin-chart-title">{t.admin.dashboard.charts.popularDestinations}</h3>
                    {(stats.popularCities || []).length > 0 ? (
                      <Bar
                        data={{
                          labels: (stats.popularCities || []).map(c => c.city || '---'),
                          datasets: [{
                            label: language === 'kk' ? 'Бронь саны' : 'Кол-во броней',
                            data: (stats.popularCities || []).map(c => c.bookings),
                            backgroundColor: 'rgba(14, 165, 233, 0.8)',
                            borderRadius: 6,
                          }]
                        }}
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { ticks: { color: '#646a80' }, grid: { color: '#282a36' } },
                            x: { ticks: { color: '#646a80' }, grid: { display: false } }
                          }
                        }}
                      />
                    ) : <p style={{ color: '#646a80' }}>{language === 'kk' ? 'Деректер жоқ' : 'Нет данных'}</p>}
                  </div>

                  <div className="admin-chart-card">
                    <h3 className="admin-chart-title">{t.admin.dashboard.charts.recentActivity}</h3>
                    <div className="activity-list">
                      {payments.slice(0, 5).map(p => (
                        <div className="activity-item" key={`act-${p.id}`}>
                          <div className="activity-icon">💳</div>
                          <div className="activity-content">
                            <div className="activity-title">{p.name} {language === 'kk' ? 'турды броньдады' : 'забронировал тур'}</div>
                            <div className="activity-meta">{language === 'kk' ? 'Бағыт' : 'Напр'}: {p.city}</div>
                          </div>
                          <div className="activity-time">
                            {new Date(p.created_at).toLocaleDateString(locale)}
                          </div>
                        </div>
                      ))}
                      {payments.length === 0 && <p style={{ color: '#646a80' }}>{language === 'kk' ? 'Белсенділік жоқ.' : 'Нет активности.'}</p>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <>
                <h1 className="admin-page-title">{t.admin.sidebar.users}</h1>
                <p className="admin-page-subtitle">{language === 'kk' ? 'Пайдаланушыларды басқару' : 'Управление пользователями'}</p>

                <div className="admin-table-wrapper">
                  <div className="admin-table-header">
                    <h3>{language === 'kk' ? 'Барлығы' : 'Все'} ({filteredUsers.length})</h3>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{language === 'kk' ? 'Пайдаланушы' : 'Пользователь'}</th>
                        <th>Email</th>
                        <th>{language === 'kk' ? 'Рөлі' : 'Роль'}</th>
                        <th>{language === 'kk' ? 'Статус' : 'Статус'}</th>
                        <th>{language === 'kk' ? 'Тіркелді' : 'Регистрация'}</th>
                        <th>{language === 'kk' ? 'Әрекет' : 'Действия'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>{language === 'kk' ? 'Табылмады' : 'Не найдено'}</td></tr>
                      ) : (
                        filteredUsers.map(userItem => (
                          <tr key={userItem.id}>
                            <td>
                              <div className="user-info">
                                <div className="user-avatar">{getInitials(userItem.name)}</div>
                                <span style={{ color: '#fff', fontWeight: 500 }}>{userItem.name}</span>
                              </div>
                            </td>
                            <td>{userItem.email}</td>
                            <td>
                              <select 
                                className="admin-select"
                                value={userItem.role || 'user'} 
                                onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                                disabled={userItem.id === currentUser.id}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td>
                              <span className={`status-badge ${userItem.role === 'admin' ? 'status-active' : 'status-inactive'}`}>
                                {userItem.role === 'admin' ? 'Premium' : 'Standard'}
                              </span>
                            </td>
                            <td>{new Date(userItem.created_at).toLocaleDateString(locale)}</td>
                            <td>
                              {userItem.id !== currentUser.id && (
                                <button className="btn-action delete" onClick={() => handleDeleteUser(userItem.id)} title={t.admin.buttons.delete}>🗑️</button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'tours' && (
              <>
                <h1 className="admin-page-title">{t.admin.sidebar.tours}</h1>
                <p className="admin-page-subtitle">{language === 'kk' ? 'Турларды басқару' : 'Управление турами'}</p>

                <div className="admin-table-wrapper" style={{ marginBottom: '2rem' }}>
                  <div className="admin-table-header">
                    <h3>{language === 'kk' ? 'Барлығы' : 'Все'} ({filteredTours.length})</h3>
                    <button className="admin-btn" onClick={openCreateModal}>{t.admin.buttons.addNewTour}</button>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{language === 'kk' ? 'Сурет' : 'Фото'}</th>
                        <th>{language === 'kk' ? 'Атауы' : 'Название'}</th>
                        <th>{language === 'kk' ? 'Бағасы' : 'Цена'}</th>
                        <th>{language === 'kk' ? 'Қала' : 'Город'}</th>
                        <th>{language === 'kk' ? 'Әрекет' : 'Действия'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTours.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>{language === 'kk' ? 'Табылмады' : 'Не найдено'}</td></tr>
                      ) : (
                        filteredTours.map(tourItem => (
                          <tr key={tourItem.id}>
                            <td>#{tourItem.id}</td>
                            <td>
                              <img src={tourItem.image_url} alt={tourItem.title} className="tour-thumb" />
                            </td>
                            <td style={{ color: '#fff' }}>{tourItem.title}</td>
                            <td style={{ color: '#10b981', fontWeight: 'bold' }}>{(parseInt(tourItem.price) || 0).toLocaleString(locale)} ₸</td>
                            <td>{tourItem.city}</td>
                            <td>
                              <div className="admin-actions">
                                <button className="btn-action edit" onClick={() => openEditModal(tourItem)} title={t.admin.buttons.edit}>✏️</button>
                                <button className="btn-action delete" onClick={() => handleDeleteTour(tourItem.id)} title={t.admin.buttons.delete}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'payments' && (
              <>
                <h1 className="admin-page-title">{t.admin.sidebar.payments}</h1>
                <p className="admin-page-subtitle">{language === 'kk' ? 'Тапсырыстар тарихы' : 'История заказов'}</p>

                <div className="admin-table-wrapper">
                  <div className="admin-table-header">
                    <h3>{language === 'kk' ? 'Барлығы' : 'Все'} ({filteredPayments.length})</h3>
                    <button className="admin-btn btn-export" onClick={handleExportCSV}>{t.admin.buttons.exportCSV}</button>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{language === 'kk' ? 'Клиент' : 'Клиент'}</th>
                        <th>{language === 'kk' ? 'Адам' : 'Люди'}</th>
                        <th>{language === 'kk' ? 'Қала' : 'Город'}</th>
                        <th>{language === 'kk' ? 'Күні' : 'Дата тура'}</th>
                        <th>{language === 'kk' ? 'Сомасы' : 'Сумма'}</th>
                        <th>{language === 'kk' ? 'Төленді' : 'Создан'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.length === 0 ? (
                        <tr><td colSpan="7" style={{ textAlign: 'center' }}>{language === 'kk' ? 'Табылмады' : 'Не найдено'}</td></tr>
                      ) : (
                        filteredPayments.map(payItem => (
                          <tr key={payItem.id}>
                            <td>#{payItem.id}</td>
                            <td style={{ color: '#fff' }}>{payItem.name}</td>
                            <td>{payItem.guests_count || 1}</td>
                            <td>{payItem.city}</td>
                            <td>{payItem.tour_date ? new Date(payItem.tour_date).toLocaleDateString(locale) : '---'}</td>
                            <td style={{ color: '#10b981', fontWeight: '800' }}>
                              {(payItem.total_amount || 0).toLocaleString(locale)} ₸
                            </td>
                            <td>{new Date(payItem.created_at).toLocaleDateString(locale)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingTour 
                  ? `${language === 'kk' ? 'Турды өңдеу' : 'Редактировать тур'} #${editingTour.id}` 
                  : (language === 'kk' ? 'Жаңа тур жасау' : 'Создать новый тур')}
              </h2>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleTourSubmit}>
              <div className="admin-form-inner">
                <input required type="text" placeholder={language === 'kk' ? 'Атауы' : 'Название'} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="admin-form-input" />
                <input required type="number" placeholder={language === 'kk' ? 'Бағасы (₸)' : 'Цена (₸)'} value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="admin-form-input" />
                <input type="text" placeholder={language === 'kk' ? 'Қала' : 'Город'} value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="admin-form-input" />
                <input type="text" placeholder={language === 'kk' ? 'Сурет URL' : 'URL фото'} value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="admin-form-input" />
                <input type="text" placeholder={language === 'kk' ? 'Карта URL' : 'URL карты'} value={formData.map_url} onChange={e => setFormData({ ...formData, map_url: e.target.value })} className="admin-form-input" />
              </div>
              <div className="admin-form-inner full">
                <textarea placeholder={language === 'kk' ? 'Сипаттама' : 'Описание'} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="admin-form-input" rows="3" style={{ height: 'auto', fontFamily: 'inherit' }}></textarea>
                <textarea placeholder={language === 'kk' ? 'Маршрут мәтіні (A → B)' : 'Текст маршрута (A → B)'} value={formData.route_text} onChange={e => setFormData({ ...formData, route_text: e.target.value })} className="admin-form-input" rows="2" style={{ height: 'auto', fontFamily: 'inherit', marginTop: '12px' }}></textarea>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>{t.admin.buttons.cancel}</button>
                <button type="submit" className="admin-btn">{t.admin.buttons.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
