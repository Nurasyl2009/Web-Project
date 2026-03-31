# TravelWay API Documentation

Base URL (dev): `http://localhost:5000`

## Auth

### POST `/api/auth/register`
Пайдаланушыны тіркеу.

Request body:

```json
{
  "name": "Ali",
  "email": "ali@mail.com",
  "password": "123456"
}
```

Responses:

- `201` - тіркелу сәтті
- `400` - өрістер толтырылмаған
- `409` - email бұрын тіркелген

### POST `/api/auth/login`
Жүйеге кіру.

Request body:

```json
{
  "email": "ali@mail.com",
  "password": "123456"
}
```

Responses:

- `200` - `token` және `user` қайтарады
- `400` - email/password бос
- `401` - пайдаланушы табылмады немесе пароль қате

### GET `/api/auth/me`
Авторизацияланған пайдаланушы профилі және статистикасы.

Headers:

```text
Authorization: Bearer <JWT_TOKEN>
```

Responses:

- `200` - `user` және `stats`
- `401` - токен жоқ/жарамсыз
- `404` - пайдаланушы табылмады

### PUT `/api/auth/update`
Пайдаланушы атын жаңарту.

Headers:

```text
Authorization: Bearer <JWT_TOKEN>
```

Request body:

```json
{
  "name": "Ali Updated"
}
```

Responses:

- `200` - жаңарту сәтті
- `400` - name бос

## Tours

### GET `/api/tours`
Барлық турларды алу.

Response:

- `200` - турлар массиві

### GET `/api/tours/:id`
ID бойынша тур деталін алу.

Responses:

- `200` - тур объекті
- `400` - id форматы қате
- `404` - тур табылмады

### POST `/api/tours`
Жаңа тур қосу (auth қажет).

Headers:

```text
Authorization: Bearer <JWT_TOKEN>
```

Responses:

- `201` - тур қосылды
- `400` - міндетті өрістер қате

### PUT `/api/tours/:id`
Турды жаңарту (auth қажет).

Responses:

- `200` - тур жаңартылды
- `404` - тур табылмады

### DELETE `/api/tours/:id`
Турды өшіру (auth қажет).

Responses:

- `200` - өшірілді
- `404` - табылмады

## Favorites

Барлық endpoint auth талап етеді.

### GET `/api/favorites`
Пайдаланушы таңдаулыларын алу.

### POST `/api/favorites/:tourId`
Турды таңдаулыларға қосу.

### DELETE `/api/favorites/:tourId`
Турды таңдаулылардан өшіру.

## Buy (Booking)

### GET `/api/buy/availability?city=Almaty&date=2026-04-15`
Белгілі қала/күн бойынша бос орын санын тексеру.

### GET `/api/buy/history`
Авторизацияланған пайдаланушының бронь тарихы.

Headers:

```text
Authorization: Bearer <JWT_TOKEN>
```

### POST `/api/buy`
Тур брондау.

Request body:

```json
{
  "name": "Ali",
  "number": "4444333322221111",
  "city": "Almaty",
  "cvv": "123",
  "tourDate": "2026-04-15"
}
```

Responses:

- `200` - бронь сәтті
- `400` - валидация қате немесе орын жоқ

## Contact

### POST `/api/contact`
Кері байланыс хабарламасын жіберу.

Request body:

```json
{
  "name": "Ali",
  "email": "ali@mail.com",
  "message": "Сәлем! Тур бағасы туралы сұрақ."
}
```

Responses:

- `200` - хабарлама қабылданды
- `400` - валидация қате

## Upload

### POST `/api/upload/avatar`
Пайдаланушы аватарын жүктеу.

Headers:

```text
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

Form-data field:

- `avatar` (image file, max 5MB)

Responses:

- `200` - `avatar_url` қайтарады
- `400` - файл берілмеген немесе формат қате

## Admin

Барлық endpoint admin рөлін талап етеді.

- `GET /api/admin/users`
- `PUT /api/admin/users/:id/role`
- `GET /api/admin/tours`
- `POST /api/admin/tours`
- `PUT /api/admin/tours/:id`
- `DELETE /api/admin/tours/:id`
- `GET /api/admin/payments`
- `GET /api/admin/stats`

## Static files

- `GET /uploads/<filename>` - жүктелген медиа файлдарды көру.

## Error format (common)

Көпшілік қателер мына форматта қайтады:

```json
{
  "success": false,
  "message": "Серверлік қате"
}
```
