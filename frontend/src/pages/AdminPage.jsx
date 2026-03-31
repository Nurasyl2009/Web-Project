import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './AdminPage.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
);

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [tours, setTours] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ popularCities: [], revenueByCity: [] });
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
    } catch { showMsg('Сыртқы серверге қосылу қатесі', 'error'); }
  };

  const fetchTours = async () => {
    try {
      const res = await fetch('/api/admin/tours', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setTours(data.tours);
    } catch { showMsg('Сыртқы серверге қосылу қатесі', 'error'); }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        const sorted = data.payments.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        setPayments(sorted);
      }
    } catch { showMsg('Сыртқы серверге қосылу қатесі', 'error'); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setStats({ popularCities: data.popularCities, revenueByCity: data.revenueByCity });
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
        showMsg('Рөл жаңартылды', 'success');
        fetchUsers();
      } else {
        showMsg(data.message || 'Рөл жаңартылмады', 'error');
      }
    } catch { showMsg('Қате кетті', 'error'); }
  };

  const handleDeleteTour = async (id) => {
    if (!window.confirm("Бұл турды өшіргіңіз келетініне сенімдісіз бе?")) return;
    try {
      const res = await fetch(`/api/admin/tours/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        showMsg('Тур сәтті өшірілді', 'success');
        fetchTours();
        fetchStats();
      } else {
        showMsg(data.message || 'Қате', 'error');
      }
    } catch { showMsg('Өшіру кезінде қате кетті', 'error'); }
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

  const handleTourSubmit = async (e) => {
    e.preventDefault();
    const url = editingTour ? `/api/admin/tours/${editingTour.id}` : '/api/admin/tours';
    const method = editingTour ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        showMsg(editingTour ? 'Тур жаңартылды!' : 'Жаңа тур қосылды!', 'success');
        setIsModalOpen(false);
        fetchTours();
        fetchStats();
      } else {
        showMsg(data.message || 'Қате кетті', 'error');
      }
    } catch { showMsg('Қате кетті', 'error'); }
  };

  const totalUsers = users.length;
  const totalRevenue = stats.revenueByCity.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalBookings = stats.popularCities.reduce((acc, curr) => acc + curr.bookings, 0);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredTours = tours.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.city.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPayments = payments.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <span style={{ fontSize: '1.8rem', marginRight: '-5px'}}>A</span>
          <span>ADMIN PANEL</span>
        </div>
        
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}>
            📊 Dashboard
          </button>
          <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}>
            👥 Users
          </button>
          <button className={`admin-nav-item ${activeTab === 'tours' ? 'active' : ''}`} onClick={() => { setActiveTab('tours'); setIsSidebarOpen(false); }}>
            🌍 Tours
          </button>
          <button className={`admin-nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }}>
            💳 Payments
          </button>
        </nav>
        
        <div className="admin-nav-bottom">
          <button className="admin-nav-item" onClick={() => navigate('/')} style={{ color: '#ef4444' }}>
            🚪 Logout (Exit)
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
               placeholder={activeTab === 'dashboard' ? "Search..." : `Search in ${activeTab}...`}
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
                <h1 className="admin-page-title">Welcome back, {currentUser.name}</h1>
                <p className="admin-page-subtitle">Here is what's happening today.</p>
                
                <div className="admin-metrics-grid">
                  <div className="admin-metric-card">
                    <div className="admin-metric-header">Total Users</div>
                    <div className="admin-metric-value">{totalUsers}</div>
                    <div className="admin-metric-trend trend-up">↑ +12% this month</div>
                  </div>
                  <div className="admin-metric-card">
                    <div className="admin-metric-header">Revenue</div>
                    <div className="admin-metric-value">{totalRevenue.toLocaleString('kk-KZ')} ₸</div>
                    <div className="admin-metric-trend trend-up">↑ +5% this month</div>
                  </div>
                  <div className="admin-metric-card">
                    <div className="admin-metric-header">Active Bookings</div>
                    <div className="admin-metric-value">{totalBookings}</div>
                    <div className="admin-metric-trend trend-down">↓ -2 this week</div>
                  </div>
                </div>
                
                <div className="admin-charts-grid">
                  <div className="admin-chart-card">
                     <h3 className="admin-chart-title">User Bookings Growth</h3>
                     {stats.popularCities.length > 0 ? (
                       <Bar 
                          data={{
                            labels: stats.popularCities.map(c => c.city || 'Белгісіз'),
                            datasets: [{
                              label: 'Бронь саны',
                              data: stats.popularCities.map(c => c.bookings),
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
                     ) : <p style={{ color: '#646a80'}}>No data available</p>}
                  </div>
                  
                  <div className="admin-chart-card">
                     <h3 className="admin-chart-title">Recent Activity Log</h3>
                     <div className="activity-list">
                        {payments.slice(0, 5).map(p => (
                          <div className="activity-item" key={`act-${p.id}`}>
                            <div className="activity-icon">💳</div>
                            <div className="activity-content">
                              <div className="activity-title">{p.name} booked a tour</div>
                              <div className="activity-meta">Dest: {p.city}</div>
                            </div>
                            <div className="activity-time">
                              {new Date(p.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                        {payments.length === 0 && <p style={{color: '#646a80'}}>No recent activity.</p>}
                     </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <>
                <h1 className="admin-page-title">Users</h1>
                <p className="admin-page-subtitle">Manage system users and access roles.</p>
                
                <div className="admin-table-wrapper">
                  <div className="admin-table-header">
                    <h3>All Users ({filteredUsers.length})</h3>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan="5" style={{textAlign: 'center'}}>No users found matching "{searchQuery}"</td></tr>
                      ) : (
                        filteredUsers.map(u => (
                          <tr key={u.id}>
                            <td>
                              <div className="user-info">
                                <div className="user-avatar">{getInitials(u.name)}</div>
                                <span style={{color: '#fff', fontWeight: 500}}>{u.name}</span>
                              </div>
                            </td>
                            <td>{u.email}</td>
                            <td>
                              <select 
                                className="admin-select"
                                value={u.role || 'user'} 
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td>
                              <span className={`status-badge ${u.role === 'admin' ? 'status-active' : 'status-inactive'}`}>
                                {u.role === 'admin' ? 'Active' : 'Offline'}
                              </span>
                            </td>
                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
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
                <h1 className="admin-page-title">Tours</h1>
                <p className="admin-page-subtitle">Manage travel destinations and pricing.</p>
                
                <div className="admin-table-wrapper" style={{ marginBottom: '2rem' }}>
                  <div className="admin-table-header">
                     <h3>All Tours ({filteredTours.length})</h3>
                     <button className="admin-btn" onClick={openCreateModal}>+ Add New Tour</button>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr><th>ID</th><th>Title</th><th>Price</th><th>City</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {filteredTours.length === 0 ? (
                        <tr><td colSpan="5" style={{textAlign: 'center'}}>No tours found matching "{searchQuery}"</td></tr>
                      ) : (
                        filteredTours.map(t => (
                          <tr key={t.id}>
                            <td>#{t.id}</td>
                            <td style={{ color: '#fff' }}>{t.title}</td>
                            <td style={{ color: '#10b981', fontWeight: 'bold' }}>{t.price} ₸</td>
                            <td>{t.city}</td>
                            <td>
                              <div className="admin-actions">
                                <button className="btn-action edit" onClick={() => openEditModal(t)} title="Edit">✏️</button>
                                <button className="btn-action delete" onClick={() => handleDeleteTour(t.id)} title="Delete">🗑️</button>
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
                <h1 className="admin-page-title">Payments (Orders)</h1>
                <p className="admin-page-subtitle">Recent payment transactions.</p>
                
                <div className="admin-table-wrapper">
                  <div className="admin-table-header">
                    <h3>Recent Bookings ({filteredPayments.length})</h3>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr><th>ID</th><th>Client</th><th>Card</th><th>City</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {filteredPayments.length === 0 ? (
                        <tr><td colSpan="5" style={{textAlign: 'center'}}>No payments found matching "{searchQuery}"</td></tr>
                      ) : (
                        filteredPayments.map(p => (
                          <tr key={p.id}>
                            <td>#{p.id}</td>
                            <td style={{ color: '#fff' }}>{p.name}</td>
                            <td>{p.number.slice(0, 4)} •••• •••• {p.number.slice(-4)}</td>
                            <td>{p.city}</td>
                            <td>{new Date(p.created_at).toLocaleString()}</td>
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
                 {editingTour ? `Edit Tour #${editingTour.id}` : 'Create New Tour'}
               </h2>
               <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>×</button>
             </div>

             <form onSubmit={handleTourSubmit}>
               <div className="admin-form-inner">
                 <input required type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="admin-form-input" />
                 <input required type="number" placeholder="Price (KZT)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="admin-form-input" />
                 <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="admin-form-input" />
                 <input type="text" placeholder="Image URL" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="admin-form-input" />
                 <input type="text" placeholder="Google Maps URL (route)" value={formData.map_url} onChange={e => setFormData({...formData, map_url: e.target.value})} className="admin-form-input" />
               </div>
               <div className="admin-form-inner full">
                 <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="admin-form-input" rows="3" style={{ height: 'auto', fontFamily: 'inherit' }}></textarea>
                 <textarea placeholder="Route text (e.g. A → B → C)" value={formData.route_text} onChange={e => setFormData({...formData, route_text: e.target.value})} className="admin-form-input" rows="2" style={{ height: 'auto', fontFamily: 'inherit', marginTop: '12px' }}></textarea>
               </div>
               <div className="admin-form-actions">
                 <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                 <button type="submit" className="admin-btn">Save Tour</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
