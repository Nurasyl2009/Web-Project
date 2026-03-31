## TravelWay - Fullstack Travel Website

Курстық жоба: веб-сайтты жобалау және үздіксіз жұмыс істеуін қамтамасыз ету.

TravelWay - турларды қарау, брондау, пайдаланушыны тіркеу/кіру, таңдаулылар, админ панель және байланыс формасы бар толыққанды web-қосымша.

### 1) Технологиялар

- **Frontend**: React 18, Vite, React Router, Chart.js, react-hot-toast
- **Backend**: Node.js, Express, JWT, bcryptjs, multer
- **Database**: PostgreSQL
- **Other**: CORS, REST API, файл жүктеу (`uploads`)

### 2) Негізгі функционал

- Пайдаланушыны тіркеу және жүйеге кіру (JWT аутентификация)
- Турлар тізімі, тур деталі, CRUD (`GET/POST/PUT/DELETE`)
- Турды брондау және бос орын санын тексеру
- Таңдаулыларға қосу/өшіру
- Кері байланыс формасы
- Аватар жүктеу (multer арқылы)
- Админ модулі: users, tours, payments, stats
- 404 және серверлік қателерді өңдеу

### 3) Жоба құрылымы

```text
Project/
|- frontend/                 # React + Vite клиент бөлігі
|  |- src/
|  |- index.html
|  |- package.json
|  `- vite.config.js         # /api -> http://localhost:5000 прокси
|- backend/                  # Express REST API
|  |- routes/                # endpoint логикасы
|  |- middleware/            # auth, role, validation helpers
|  |- js/db.js               # PostgreSQL connection
|  |- uploads/               # runtime media files
|  |- init-db.js             # кестелерді инициализациялау
|  |- package.json
|  `- server.js
|- API.md                    # API құжаттамасы
|- TESTING.md                # тестілеу чек-листі
|- DEPLOYMENT.md             # орналастыру нұсқаулығы
`- README.md
```

### 4) Орнату және іске қосу (Development)

#### 4.1 PostgreSQL дайындау

```sql
CREATE DATABASE "Tur";
```

Ағымдағы жобада DB параметрлері `backend/js/db.js` ішінде берілген. Жергілікті ортаңызға сай `user/host/database/password/port` мәндерін жаңартыңыз.

#### 4.2 Backend іске қосу

```bash
cd backend
npm install
node init-db.js
npm run dev
```

API мекенжайы: `http://localhost:5000`

#### 4.3 Frontend іске қосу

```bash
cd frontend
npm install
npm run dev
```

Client мекенжайы: `http://localhost:3000`

Vite proxy арқылы `/api` сұраныстары backend-ке бағытталады.

### 5) Production режимі

```bash
cd frontend
npm run build
cd ../backend
npm start
```

Backend `frontend/dist` ішіндегі статиканы таратады.

### 6) Скрипттер

#### Frontend (`frontend/package.json`)

- `npm run dev` - development server
- `npm run build` - production build
- `npm run preview` - build preview

#### Backend (`backend/package.json`)

- `npm run dev` - API server (development)
- `npm start` - API server (production)

### 7) Бағалау критерийіне сәйкестік (қысқаша карта)

- **Функционалдылық**: Auth, Tours CRUD, Favorites, Buy, Contact, Upload, Admin, 404/error handling
- **Жұмыстың дұрыстығы**: валидация, try/catch, HTTP статус кодтары, қате хабарламалары
- **Өнімділік**: Vite build, статикалық тарату, REST сұраныстарын бөлу
- **Дизайн/UX**: React SPA навигациясы, формалар, хабарламалар, адаптивті беттер
- **Код сапасы**: модульдік құрылым (`routes`, `middleware`, `src/components/pages`)
- **Технологияны қолдану**: React функционалды компоненттері, Router, Node.js + PostgreSQL REST API
- **Тестілеу**: `TESTING.md` бойынша қолмен және API тестілеу
- **Құжаттама**: `README.md`, `API.md`, `TESTING.md`, `DEPLOYMENT.md`

### 8) API және тестілеу құжаттары

- Толық endpoint сипаттамасы: `API.md`
- Тестілеу чек-листі: `TESTING.md`
- Орналастыру нұсқаулығы: `DEPLOYMENT.md`

### 9) Автор

- **Жоба атауы**: TravelWay
- **Формат**: КМ04 пәні бойынша курстық жоба

### 10) Скриншоттар (қорғауға дәлел)

Скриншоттарды `docs/screenshots/` папкасына орналастырыңыз және файл атауларын төмендегі үлгімен сақтаңыз:

- Auth: `01-auth.png`
- Tours list: `02-tours-list.png`
- Tour details: `03-tour-details.png`
- Booking form: `04-booking.png`
- Favorites: `05-favorites.png`
- Admin panel: `06-admin.png`
- Avatar upload: `07-upload-avatar.png`
- 404 page: `08-404.png`

Қосымша нұсқаулық: `SCREENSHOTS.md`

