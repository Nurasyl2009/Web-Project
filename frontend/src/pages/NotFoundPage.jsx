import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="not-found" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: '10rem', fontWeight: 800, color: 'transparent', WebkitTextStroke: '2px var(--primary-color)', opacity: 0.2, lineHeight: 1 }}>
          404
        </div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-color)' }}>Бет табылмады</h2>
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
        Кешіріңіз, сіз іздеген бет жойылған немесе мүлдем болмаған. Сіз адасып кеткен сияқтысыз.
      </p>

      <Link to="/" className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Басты бетке оралу
      </Link>
    </div>
  );
}

export default NotFoundPage;
