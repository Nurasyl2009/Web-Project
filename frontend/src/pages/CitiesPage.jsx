import CityCard from '../components/CityCard';

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
  {
    key: 'berlin',
    name: 'Берлин',
    country: 'Германия',
    icon: '🎸',
    image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=400&auto=format&fit=crop',
    route: 'Бранденбург қақпасы → Рейхстаг → Музей аралы → Берлин қабырғасы',
    stops: '4 аялдама',
  },
  {
    key: 'madrid',
    name: 'Мадрид',
    country: 'Испания',
    icon: '💃',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=400&auto=format&fit=crop',
    route: 'Корольдік сарай → Прадо музейі → Пуэрта-дель-Соль → Ретиро',
    stops: '4 аялдама',
  },
];

function CitiesPage() {
  return (
    <>
      <div className="about-hero" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #3498db 100%)' }}>
        <h1>🗺️ Қалалар маршруттары</h1>
        <p>Әлемнің ең әдемі қалаларына арналған дайын бағыттар</p>
      </div>

      <section className="section">
        <div className="container">
          <div className="cities-grid">
            {CITIES.map((city) => (
              <CityCard key={city.key} city={city} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default CitiesPage;
