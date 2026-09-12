# IELTS Practice Platform

Reading, Listening, Writing va Speaking mashqlari uchun platforma. Reading/Listening avtomatik tekshiriladi; Writing/Speaking bahosi va mentor izohi tasdiqdan keyin chiqariladi. Natija rasmiy IELTS sertifikati emas.

## Windowsda ishga tushirish

Python 3.12+ va Node.js 22+ kerak. Loyiha papkasida `start.bat` faylini oching. U paketlarni o‘rnatadi, bazani yangilaydi, original Set 3 savollarini qo‘shadi va serverlarni ishga tushiradi. Mavjud savollar va hisoblar o‘chirilmaydi.

Keyingi safar paketlarni qayta o‘rnatmasdan:

```powershell
powershell -File scripts/start.ps1 -SkipInstall
```

Manzil: http://localhost:3000. Loglar: `.runtime/`. To‘xtatish: `powershell -File scripts/stop.ps1`.

Birinchi adminni xavfsiz yaratish:

```powershell
backend/venv/Scripts/python.exe backend/bootstrap.py --admin-email siz@example.com
```

Parol terminalda yashirin so‘raladi. Mavjud hisobning paroli yoki roli almashtirilmaydi. Talabalar email yoki telefon va parol bilan ro‘yxatdan o‘tishlari mumkin; SMS/email orqali egalikni tasdiqlash xizmati ulanmagan.

## Testlar va ishlash tartibi

- Set 3: original 40 Reading, 40 Listening, 2 Writing, 3 Speaking topshirig‘i.
- Listening uchun 26 daqiqadan uzun sintetik inglizcha ovozli mashq yozuvi mavjud. Bu rasmiy yoki kalibrlangan IELTS testi emas; kontentni mentor ko‘rib chiqishi kerak.
- Eski qisqa Set 1/2 demo deb ko‘rsatiladi. To‘liq test rejimi faqat 40/40/2/3 savol va mavjud audio bo‘lsa ochiladi.
- Tanlangan set, bo‘lim, boshlanish va tugash vaqti serverda saqlanadi. Sahifani yangilash vaqtni qayta boshlamaydi.
- Deadline’dan keyin tarmoq uzatishi uchun 60 soniya beriladi. Keyin kechikkan javoblar qabul qilinmaydi.
- Writing ikki topshiriq bilan atomar yuboriladi. Saqlangan javoblar qayta yozilmaydi.
- Speaking yozuvlari faqat javob egasi va adminga autentifikatsiya bilan beriladi.
- Bo‘limlar to‘liq topshirilib, zarur mentor tasdiqlari olinguncha yakuniy band e’lon qilinmaydi.
- Brauzerdagi fullscreen/audio cheklovlari mutlaq proktoring kafolati emas. Fullscreen talab qilinadigan rejim uchun uni qo‘llaydigan desktop brauzer kerak.

## AI

`backend/.env.example` sozlamalarini `backend/.env`ga moslang. Mavjud `.env`ni ustidan yozmang. Haqiqiy AI uchun `AI_ENABLED=true` va tegishli API kaliti kerak. Writing’da haqiqiy savol matni AI’ga uzatiladi. OpenAI yoki Gemini matn tahlili ishlatilishi mumkin; ovozni matnga aylantirish OpenAI orqali.

Kalit yo‘q, limit tugagan yoki xizmat xato qaytargan bo‘lsa, sun’iy band qo‘yilmaydi: javob mentor tekshiruvida qoladi. Speaking transkriptidan talaffuz va umumiy Speaking bali chiqarilmaydi; mentor audioni tinglaydi.

`AI_DAILY_REQUEST_LIMIT` barcha ilova AI chaqiruvlarini bazada kunlik cheklaydi; `AI_MAX_OUTPUT_TOKENS` javob hajmini cheklaydi. Bu pul bo‘yicha provayder hisob limiti emas. Provayder hisobidagi xarajat bildirishnomalarini alohida sozlang.

Integratsiya manbalari: [OpenAI Chat API](https://developers.openai.com/api/reference/resources/chat), [audio transkripsiyasi](https://developers.openai.com/api/docs/guides/speech-to-text), [Gemini JSON javoblari](https://ai.google.dev/gemini-api/docs/structured-output).

## Tekshirish

```powershell
backend/venv/Scripts/python.exe backend/run_tests.py
cd frontend
npm run lint
npm run build
```

Backend testlari vaqtinchalik bazada ishlaydi, haqiqiy hisoblarni o‘zgartirmaydi va pullik AI so‘rovlarini yubormaydi. `test_api.py` va `test_full_system.py` ham shu xavfsiz to‘plamni ishga tushiradi.

## Backup

Server ishlab turganda har 24 soatda SQLite/PostgreSQL nusxasi va audio fayllari `backend/backups/`ga saqlanadi. Arxivda SHA-256 manifest bor; maxfiy `.env` kiritilmaydi. Qo‘lda:

```powershell
cd backend
venv/Scripts/python.exe -m app.services.backup
```

PostgreSQL nusxasi uchun mos versiyadagi `pg_dump` kerak (Docker obrazida mavjud). Zaxirani serverdan tashqaridagi yopiq saqlash joyiga ham ko‘chiring. Arxivlar avtomatik o‘chirilmaydi; saqlash hajmini nazorat qiling. SQLite tiklashda serverni to‘xtatib, arxivdagi `database.sqlite3` va `uploads/`ni avval alohida joyda tekshiring.

## Serverga joylashtirish

`compose.yaml` PostgreSQL, backend, frontend va HTTPS uchun Caddy’ni tayyorlaydi. Docker o‘rnatilgan serverda:

1. `.env.production.example`dan serverning root `.env` faylini tayyorlang.
2. `DOMAIN`ni o‘zingizning domeningizga, maxfiy qiymatlarni alohida tasodifiy qiymatlarga almashtiring. `POSTGRES_PASSWORD` uchun URL’ga xavfsiz hex qiymat ishlating.
3. DNS’ni serverga yo‘naltiring, 80/443 portlarini oching.
4. `docker compose up -d --build` bilan ishga tushiring.
5. `docker compose exec backend python bootstrap.py --admin-email siz@example.com` bilan admin yarating.

Ma’lumotlar named volume’larda saqlanadi. `docker compose down -v` bazani o‘chiradi — oddiy to‘xtatishda `-v` ishlatmang. API internetda alohida ochilmaydi; Caddy orqali bir xil domenda xizmat qiladi.

Bu repozitoriydagi deploy konfiguratsiyasi domenni sotib olmaydi, DNS’ni yoki provayder hisobini o‘zgartirmaydi. Haqiqiy hosting va AI provayderi bilan tekshiruv ularning sozlamalari mavjud bo‘lganda bajariladi.
