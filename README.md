# IELTS Mock Test Platform

IELTS imtihoniga tayyorlanish uchun to'liq mock test platformasi.

## 🚀 Texnologiyalar

| Qism | Texnologiya |
|------|-------------|
| Backend | Python, FastAPI, SQLAlchemy, PostgreSQL |
| Frontend | Next.js, TypeScript, Tailwind CSS |
| AI (Writing) | OpenAI GPT-4o-mini |
| AI (Speaking) | OpenAI Whisper + GPT-4o-mini |
| Autentifikatsiya | JWT (JSON Web Token) |

## 📦 O'rnatish

### 1. Backend

```bash
cd backend

# Virtual environment yaratish
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Kutubxonalarni o'rnatish
pip install -r requirements.txt

# .env faylni yaratish
copy .env.example .env
# .env faylni o'zgartiring: DATABASE_URL, SECRET_KEY, OPENAI_API_KEY

# PostgreSQL bazani yaratish
# createdb ielts_mock

# Serverni ishga tushirish
uvicorn app.main:app --reload
```

Backend: http://localhost:8000
API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend

# Kutubxonalarni o'rnatish
npm install

# Dev serverni ishga tushirish
npm run dev
```

Frontend: http://localhost:3000

## 📁 Loyiha tuzilmasi

```
IELTS MOCK/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Konfiguratsiya
│   │   ├── database.py          # DB ulanish
│   │   ├── models/              # 8 ta SQLAlchemy model
│   │   ├── schemas/             # Pydantic schemalar
│   │   ├── routers/             # 8 ta API router
│   │   └── services/            # Auth, AI, Scoring
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # 15 ta sahifa
│   │   ├── components/          # 10 ta komponent
│   │   └── lib/                 # API client, Auth, Types
│   └── package.json
│
└── README.md
```

## 🔑 Foydalanuvchi rollari

- **Talaba:** Test topshiradi, natijalarni ko'radi
- **Admin:** Writing/Speaking tekshiradi, savol qo'shadi, statistikani ko'radi

## 📋 API Endpointlar

| Metod | Endpoint | Tavsif |
|-------|----------|--------|
| POST | /api/v1/register | Ro'yxatdan o'tish |
| POST | /api/v1/login | Kirish |
| GET | /api/v1/me | Joriy foydalanuvchi |
| POST | /api/v1/tests | Yangi test boshlash |
| GET | /api/v1/tests | Testlar ro'yxati |
| GET | /api/v1/tests/{id}/reading/questions | Reading savollari |
| POST | /api/v1/tests/{id}/reading/submit | Reading javob yuborish |
| GET | /api/v1/tests/{id}/listening/questions | Listening savollari |
| POST | /api/v1/tests/{id}/listening/submit | Listening javob yuborish |
| POST | /api/v1/tests/{id}/writing/submit | Writing yuborish |
| POST | /api/v1/tests/{id}/speaking/upload | Speaking audio yuklash |
| GET | /api/v1/tests/{id}/feedback | Natijalar |
| GET | /api/v1/admin/students | Talabalar (admin) |
| GET | /api/v1/admin/pending-reviews | Tekshiruvlar (admin) |
| PUT | /api/v1/admin/writing/{id}/review | Writing tekshirish |
| PUT | /api/v1/admin/speaking/{id}/review | Speaking tekshirish |
| POST | /api/v1/admin/questions | Savol qo'shish |
| GET | /api/v1/admin/stats | Statistika |
