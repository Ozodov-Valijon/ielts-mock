# IELTS Mock Test Platformasi (100% Ishlaydigan To'liq Versiya)

IELTS imtihoniga (Reading, Listening, Writing, Speaking) tayyorgarlik ko'rish uchun mo'ljallangan to'liq veb platforma. "AI + Mentor" modeli asosida ishlaydi.

---

## ⚡ 1-Tugma Bilan Ishga Tushirish (Windows)

Loyiha papkasidagi **`start.bat`** faylini ikki marta bosing!
Bu avtomatik ravishda:
1. Backend (FastAPI - `http://localhost:8000`)
2. Frontend (Next.js - `http://localhost:3000`)
3. Boshlang'ich savollar bazasini ishga tushiradi.

---

## 🔑 Tayyor Login Hisoblari

| Rol | Email | Parol | Huquqlari |
|---|---|---|---|
| **Admin (Mentor)** | `admin@ielts.uz` | `admin123` | Barcha talabalarni ko'rish, Writing va Speaking javoblarini baholash, yangi savol qo'shish |
| **Talaba** | `student@ielts.uz` | `student123` | Mock test topshirish, real-time feedback va sertifikat natijalarini ko'rish |

*(Xohlasangiz `/register` sahifasi orqali o'zingiz ham yangi talaba akkaunti ochishingiz mumkin)*

---

## 🛠️ Texnologiyalar

- **Backend:** Python 3.12, FastAPI, SQLAlchemy, SQLite/PostgreSQL (avtomatik fallback bilan), Pydantic v2, JWT (python-jose).
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, MediaRecorder API (ovoz yozish).
- **AI Integratsiya:** OpenAI GPT-4o-mini (Writing & Speaking tahlili), Whisper (ovozni matnga o'girish). OpenAI kaliti bo'lmaganda intellektual baholovchi tizim avtomatik ishlaydi (tizim hech qachon to'xtab qolmaydi).

---

## 🚀 Qo'lda Ishga Tushirish (Manual Setup)

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
python seed_data.py          # Baza va savollarni yaratish
uvicorn app.main:app --port 8000 --reload
```

- Backend API: `http://localhost:8000`
- Swagger Hujjatlari: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

- Veb-sayt: `http://localhost:3000`

---

## 🧪 Testlarni Tekshirish

Backend'dagi barcha 10 ta API endpointini avtomatik test qilish:
```bash
cd backend
.\venv\Scripts\python test_api.py
```

Frontend build tekshiruvi:
```bash
cd frontend
npm run build
```
*(Barcha sahifalar xatosiz kompilyatsiya bo'ladi)*
