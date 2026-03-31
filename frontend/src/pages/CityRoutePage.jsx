import { useParams, Link } from 'react-router-dom';

const CITY_ROUTES = {
  paris: {
    name: 'Париж',
    flag: '🇫🇷',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Тöмендегі картадан турдың бағытын көре аласыз. Парижде 4 негізгі аялдама!',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m40!1m12!1m3!1d53408.10272461923!2d2.3015864154734906!3d48.8719268523312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m25!3e2!4m5!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2z0K3QudGE0LXQu9C10LLQsCDQsdCw0YjQvdGPLCBBdi4gR3VzdGF2ZSBFaWZmZWwsIDc1MDA3IFBhcmlzLCDQpNGA0LDQvdGG0LjRjw!3m2!1d48.858370099999995!2d2.2944812999999997!4m5!1s0x47e66fec70fb1d8f%3A0xd9b5676e112e643d!2z0KLRgNC40YPQvNGE0LDQu9GM0L3QsNGPINCw0YDQutCwLCBQbC4gQ2hhcmxlcyBkZSBHYXVsbGUsIDc1MDA4IFBhcmlzLCDQpNGA0LDQvdGG0LjRjw!3m2!1d48.8737917!2d2.2950274999999998!4m5!1s0x47e671d877937b0f%3A0xb975fcfa192f84d4!2z0JvRg9Cy0YAsIDc1MDAxIFBhcmlzLCDQpNGA0LDQvdGG0LjRjw!3m2!1d48.8606111!2d2.337644!4m5!1s0x47e671e19ff53a01%3A0x36401da7abfa068d!2z0J3QvtGC0YIt0JTQsNC8LdC00LUt0J_QsNGA0LgsIDYgUGFydmlzIE5vdHJlLURhbWUgLSBQbC4gSmVhbi1QYXVsIElJLCA3NTAwNCBQYXJpcywg0KTRgNCw0L3RhtC40Y8!3m2!1d48.8529682!2d2.3499021!5e0!3m2!1sru!2skz!4v1773896452580!5m2!1sru!2skz',
    stops: [
      { name: 'Эйфель мұнарасы', desc: 'Парижді символдайтын ең танымал ғимарат' },
      { name: 'Триумф қақпасы', desc: 'Елисей даласының басындағы тарихи ескерткіш' },
      { name: 'Лувр музейі', desc: 'Әлемдегі ең үлкен өнер музейі' },
      { name: 'Нотр-Дам', desc: 'Париждің жүрегіндегі готикалық собор' },
    ],
  },
  rome: {
    name: 'Рим',
    flag: '🇮🇹',
    color: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    description: 'Мәңгілік қалада 4 негізгі аялдама!',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m34!1m12!1m3!1d11892.659375668097!2d12.484272!3d41.889485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m19!3e2!4m5!1s0x132f61b383af2fd7%3A0xda37e0b8161b3d02!2sColosseum!3m2!1d41.8902102!2d12.4922309!4m5!1s0x132f604ba0bbb5f9%3A0x5e7e3d2f36429a8!2sPantheon!3m2!1d41.8986108!2d12.4769938!4m5!1s0x132f60566ff1e059%3A0xfcd3d66aea5a2ba2!2sTrevi+Fountain!3m2!1d41.9009284!2d12.4833132!5e0!3m2!1sen!2skz!4v1648000000001',
    stops: [
      { name: 'Колизей', desc: 'Рим империясының ұлы амфитеатры' },
      { name: 'Пантеон', desc: 'Ежелгі Рим архитектурасының шедеврі' },
      { name: 'Треви фонтаны', desc: 'Тілек тілеп тиын лақтыратын атақты фонтан' },
      { name: 'Ватикан музейлері', desc: 'Сикстина капелласы мен өнер қазыналары' },
    ],
  },
  berlin: {
    name: 'Берлин',
    flag: '🇩🇪',
    color: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
    description: 'Еркіндік пен креатив қаласы — 4 аялдама!',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m34!1m12!1m3!1d9733.13!2d13.3777!3d52.5163!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m19!3e2!4m5!1s0x47a851c655f20989%3A0x26bbfb4e84674c63!2sBrandenburg+Gate!3m2!1d52.5162746!2d13.3777025!4m5!1s0x47a8512de07f888d%3A0x8d0e98d2748fcf2a!2sReichstag!3m2!1d52.5186202!2d13.3761872!4m5!1s0x47a84e20b24f4c09%3A0xa23d8fb11d0e967!2sMuseumsinsel!3m2!1d52.5169!2d13.4019!5e0!3m2!1sen!2skz!4v1648000000002',
    stops: [
      { name: 'Бранденбург қақпасы', desc: 'Берлиннің ең атақты тарихи нышаны' },
      { name: 'Рейхстаг', desc: 'Германия парламентінің ғимараты' },
      { name: 'Музей аралы', desc: 'Бес атақты музей орналасқан арал' },
      { name: 'Берлин қабырғасы', desc: 'Тарихи мемориал мен граффити галереясы' },
    ],
  },
  madrid: {
    name: 'Мадрид',
    flag: '🇪🇸',
    color: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)',
    description: 'Испанияның энергиялы астанасы — 4 аялдама!',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m34!1m12!1m3!1d12146.0!2d-3.7038!3d40.4168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m19!3e2!4m5!1s0xd4228e0c6bf7c4f%3A0xff74a8e7b50ae6f6!2sRoyal+Palace+of+Madrid!3m2!1d40.4179!2d-3.7143!4m5!1s0xd4228f1aae5c9d5%3A0x40952a0ffaed4f7!2sPrado+Museum!3m2!1d40.4138!2d-3.6921!4m5!1s0xd4228f2d3eb5c8b%3A0xc58888b97e29c6d8!2sPuerta+del+Sol!3m2!1d40.4168!2d-3.7038!5e0!3m2!1sen!2skz!4v1648000000003',
    stops: [
      { name: 'Корольдік сарай', desc: 'Испания корольдарының атақты резиденциясы' },
      { name: 'Прадо музейі', desc: 'Испан өнерінің ең жетілдірілген коллекциясы' },
      { name: 'Пуэрта-дель-Соль', desc: 'Мадридтің жүрегі — басты алаңы' },
      { name: 'Ретиро паркі', desc: 'Қалалық сарай паркінің рахатты демалысы' },
    ],
  },
};

function CityRoutePage() {
  const { city } = useParams();
  const data = CITY_ROUTES[city];

  // 404 fallback for unknown city
  if (!data) {
    return (
      <div className="not-found">
        <div className="not-found__code">404</div>
        <h2>Қала табылмады</h2>
        <p>Мұндай маршрут жоқ.</p>
        <Link to="/cities" className="btn-primary">← Қалаларға қайту</Link>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <div className="route-hero" style={{ background: data.color }}>
        <h1>{data.flag} {data.name} маршруты</h1>
        <p>{data.description}</p>
      </div>

      {/* Map */}
      <div className="map-container">
        <iframe
          src={data.mapSrc}
          title={`${data.name} картасы`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Stops */}
      <div className="stops-grid">
        {data.stops.map((stop, index) => (
          <div key={index} className="stop-card">
            <span className="stop-number">{index + 1}</span>
            <h4>{stop.name}</h4>
            <p>{stop.desc}</p>
          </div>
        ))}
      </div>

      {/* Back Link */}
      <Link to="/cities" className="back-link">← Барлық қалаларға оралу</Link>
    </>
  );
}

export default CityRoutePage;
