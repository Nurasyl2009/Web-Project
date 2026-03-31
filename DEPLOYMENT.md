# TravelWay Deployment Guide

## 1) Goal

Frontend + Backend + PostgreSQL жобасын тұрақты ортада іске қосу.

Ұсынылатын конфигурация:

- Frontend: Vercel немесе Netlify
- Backend API: Render (Web Service)
- Database: Render PostgreSQL немесе Neon/Supabase PostgreSQL

## 2) Pre-deployment Checklist

- [ ] Барлық endpoint локалды ортада тексерілген
- [ ] `npm run build` (frontend) қате бермейді
- [ ] БД кестелері жасалған (`init-db.js`)
- [ ] JWT secret анықталған
- [ ] CORS production доменіне рұқсат беруге дайын

## 3) Backend Deploy (Render example)

1. Render-де жаңа **Web Service** жасаңыз.
2. Root Directory ретінде `backend` көрсетіңіз.
3. Build command:

```bash
npm install
```

4. Start command:

```bash
npm start
```

5. Environment variables (ұсыныс):

- `PORT=5000` (Render автоматты береді)
- `JWT_SECRET=<your_strong_secret>`
- `DB_HOST=<host>`
- `DB_PORT=<port>`
- `DB_NAME=<database>`
- `DB_USER=<user>`
- `DB_PASSWORD=<password>`

Ескерту: ағымдағы кодта DB конфигурациясы `backend/js/db.js` ішінде жазылған. Production үшін env айнымалыларына көшіру ұсынылады.

## 4) Database

1. PostgreSQL instance жасаңыз.
2. Қосылым деректерін backend env-ке енгізіңіз.
3. Кестелерді инициализациялау үшін бір рет `init-db.js` логикасын орындаңыз.

## 5) Frontend Deploy

### Vercel

1. Жобаны импорттаңыз, Root Directory: `frontend`.
2. Build command:

```bash
npm run build
```

3. Output directory:

```text
dist
```

4. API URL конфигурациясы (қажет болса) backend доменіне бағытталуы керек.

## 6) CORS

Production-да `cors` тек frontend доменін қабылдағаны дұрыс:

- `https://your-frontend-domain.vercel.app`

## 7) Post-deployment Verification

- [ ] Frontend ашылады
- [ ] Login/Register жұмыс істейді
- [ ] API сұраныстар сәтті орындалады
- [ ] Upload және static `/uploads` қолжетімді
- [ ] Admin endpoint рөл бойынша қорғалған
- [ ] 404/500 өңдеуі production-да дұрыс

## 8) Deliverables for defense

- Live frontend URL
- Live backend URL
- README + API + TESTING + DEPLOYMENT құжаттары
- Қысқа демо видео/скриншоттар
