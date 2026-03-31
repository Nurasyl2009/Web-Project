## TravelWay — fullstack web app

Монорепозиторий с:

- **frontend**: React + Vite (dev-сервер на `http://localhost:3000`, проксирует `/api` на backend)
- **backend**: Node.js + Express + PostgreSQL (API на `http://localhost:5000`)

### Стек

- **Frontend**: React 18, Vite, React Router, Chart.js
- **Backend**: Express, pg, JWT (jsonwebtoken), bcryptjs, multer
- **DB**: PostgreSQL

### Структура проекта

```
Project/
├─ frontend/                 # React + Vite
│  ├─ src/
│  ├─ index.html
│  └─ vite.config.js         # proxy /api -> http://localhost:5000
├─ backend/                  # Express API + DB + миграции
│  ├─ routes/
│  ├─ middleware/
│  ├─ js/                    # db connection (pg Pool)
│  ├─ uploads/               # загружаемые файлы (runtime, не коммитится)
│  ├─ init-db.js
│  └─ server.js
└─ README.md
```

### Запуск (dev)

#### 1) База данных

Создай БД (пример):

```sql
CREATE DATABASE "Tur";
```

Настройки подключения сейчас захардкожены в `backend/js/db.js` — при необходимости измени `user/host/database/password/port` под свою среду.

#### 2) Backend

```bash
cd backend
npm install
node init-db.js
npm run dev
```

Backend стартует на `http://localhost:5000`.

#### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend стартует на `http://localhost:3000` и обращается к API через прокси (`/api` -> `http://localhost:5000`).

### Сборка (production)

```bash
cd frontend
npm run build
cd ../backend
npm start
```

Backend будет раздавать статическую сборку из `frontend/dist`.

### API (основное)

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Tours**: `GET /api/tours` (+ остальные CRUD внутри `backend/routes/tourRoutes.js`)
- **Other**: `POST /api/buy`, `POST /api/contact`, `POST /api/upload`, `GET/POST /api/favorites`, `GET/POST /api/admin` (если включено)

Статика загрузок: `GET /uploads/<filename>`.

