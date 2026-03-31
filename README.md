# TravelWay ✈️ — Саяхат агенттігі веб-сайты

Еуропалық турларға арналған толыққанды веб-қосымша. React + Vite (frontend) және Node.js + Express + PostgreSQL (backend).

## 📸 Мүмкіндіктер

- 🌍 Еуропалық турларды көру (Париж, Рим, Берлин, Мадрид)
- 🗺️ Интерактивті қала маршруттары Google Maps-пен
- 💳 Тур сатып алу (Luhn карта валидациясы)
- 🔐 Пайдаланушыны тіркеу және жүйеге кіру (JWT)
- 📬 Байланыс формасы
- 📱 Барлық құрылғыларда жұмыс істейді (responsive)

## 🛠️ Технологиялар

| Layer    | Технология                          |
|----------|--------------------------------------|
| Frontend | React 18, Vite, React Router v6      |
| Backend  | Node.js, Express 4                   |
| Database | PostgreSQL (pg driver)               |
| Auth     | JWT (jsonwebtoken), bcryptjs         |
| Style    | Vanilla CSS (design system)          |

## 📁 Файл құрылымы

```
Project AI/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Header, Footer, TourCard, CityCard, etc.
│   │   ├── pages/           # HomePage, ToursPage, BuyTourPage, etc.
│   │   ├── App.jsx          # React Router routes
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles / design system
│   ├── index.html
│   └── package.json
├── routes/                  # Express API route handlers
│   ├── authRoutes.js        # POST /api/auth/register, /login
│   ├── tourRoutes.js        # GET/POST/PUT/DELETE /api/tours
│   ├── purchaseRoute.js     # POST /api/buy
│   └── contactRoute.js      # POST /api/contact
├── middleware/
│   ├── auth.js              # JWT verification middleware
│   └── luhn.js              # Luhn card validation
├── js/
│   └── db.js                # PostgreSQL pool connection
├── server.js                # Express app entry point
├── init-db.js               # Database table creation script
└── package.json
```

## 🚀 Орнату және іске қосу

### 1. PostgreSQL базасын дайындаңыз

```sql
CREATE DATABASE "Tur";
```

Содан кейін `js/db.js` файлындағы мәліметтерді өз реквизиттеріңізге сай өзгертіңіз.

### 2. Backend орнату

```bash
# Жоба қалтасында:
npm install

# Кестелерді жасаңыз:
node init-db.js

# Серверді іске қосыңыз:
node server.js
```

Сервер `http://localhost:3000` мекен-жайында іске қосылады.

### 3. Frontend орнату (даму режимі)

```bash
cd client
npm install
npm run dev
```

React қосымшасы `http://localhost:5173` мекен-жайында іске қосылады (backend proxy арқылы).

### 4. Production build

```bash
cd client
npm run build
# Содан кейін:
cd ..
node server.js
```

## 🔌 API эндпоинттері

| Метод  | Маршрут                | Сипаттама                         |
|--------|------------------------|-----------------------------------|
| POST   | /api/auth/register     | Пайдаланушы тіркеу                |
| POST   | /api/auth/login        | Жүйеге кіру → JWT қайтарады       |
| GET    | /api/tours             | Барлық турлар тізімі              |
| GET    | /api/tours/:id         | Бір тур мәліметтері               |
| POST   | /api/tours             | Жаңа тур қосу (авторизация керек) |
| PUT    | /api/tours/:id         | Турды жаңарту (авторизация керек) |
| DELETE | /api/tours/:id         | Турды жою (авторизация керек)     |
| POST   | /api/buy               | Тур сатып алу (Luhn тексерілді)   |
| POST   | /api/contact           | Байланыс формасы                  |

## 🔐 Аутентификация

JWT Bearer токен арқылы авторизацияланған эндпоинттерге қол жеткізіңіз:

```
Authorization: Bearer <your_jwt_token>
```

## ✅ Тестілеу нәтижелері

- ✅ Chrome — мінсіз жұмыс істейді
- ✅ Firefox — мінсіз жұмыс істейді
- ✅ Мобильді (375px) — responsive
- ✅ Планшет (768px) — responsive
- ✅ 4K (2560px) — responsive
- ✅ Консольде JavaScript қателері жоқ
- ✅ API Postman арқылы тексерілді

## 👤 Қабдыкәдіров Нұрасыл

