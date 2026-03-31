import { Link } from 'react-router-dom';
import TourCard from '../components/TourCard';
import CityCard from '../components/CityCard';

const TOURS = [
  {
    id: 1,
    title: 'Парижге саяхат',
    description: 'Махаббат қаласының сиқырын сезініңіз. Эйфель мұнарасы мен Лувр сізді күтуде.',
    price: '450,000 ₸',
    badge: 'Париж',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Рим демалысы',
    description: 'Ежелгі тарих пен дәмді итальян асханасы. Колизейге ұмытылмас саяхат.',
    price: '380,000 ₸',
    badge: 'Рим',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Берлин рухы',
    description: 'Заманауи мәдениет пен еркіндік қаласы. Креативті Берлинді ашыңыз.',
    price: '320,000 ₸',
    badge: 'Берлин',
    image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=500&auto=format&fit=crop',
  },
];

const CITIES = [
  {
    key: 'paris',
    name: 'Париж',
    country: 'Франция',
    icon: '🗼',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&auto=format&fit=crop',
    route: 'Эйфель мұнарасы → Триумф қақпасы → Лувр → Нотр-Дам',
    stops: '4 аялдама',
  },
  {
    key: 'rome',
    name: 'Рим',
    country: 'Италия',
    icon: '🏛️',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=400&auto=format&fit=crop',
    route: 'Колизей → Пантеон → Треви фонтаны → Ватикан',
    stops: '4 аялдама',
  },
];

const STATS = [
  { number: '4+', label: 'Еуропа қалалары' },
  { number: '500+', label: 'Бақытты туристер' },
  { number: '5 жыл', label: 'Тәжірибе' },
  { number: '24/7', label: 'Қолдау қызметі' },
];

function HomePage() {
  return (
    <>
      <section className="hero" id="hero">
        <div className="hero__content">
          <div className="hero__badge">✈️ Еуропаның ең жақсы турлары</div>
          <h1>Армандаған<br />саяхатыңызды жасаңыз</h1>
          <p>Париж, Рим, Берлин, Мадрид — ең танымал еуропалық қалаларға дайын маршруттар мен турлар</p>
          <div className="hero__cta">
            <Link to="/tours" className="btn-hero btn-hero--white">Турларды көру</Link>
            <Link to="/cities" className="btn-hero btn-hero--ghost">Маршруттар</Link>
          </div>
        </div>
      </section>

      <div className="stats-bar">
        <div className="stats-bar__grid">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat-item">
              <div className="stat-item__number">{stat.number}</div>
              <div className="stat-item__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="section" id="popular-tours">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">🌍 Танымал турлар</h2>
            <p className="section__subtitle">Ең сұранысқа ие бағыттар</p>
          </div>
          <div className="tours-grid">
            {TOURS.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/tours" className="btn-primary">Барлық турларды көру →</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface-2)' }} id="city-routes">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">🗺️ Қала маршруттары</h2>
            <p className="section__subtitle">Дайын бағыттар мен картамен</p>
          </div>
          <div className="cities-grid">
            {CITIES.map((city) => (
              <CityCard key={city.key} city={city} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/cities" className="btn-primary">Барлық қалаларды көру →</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
