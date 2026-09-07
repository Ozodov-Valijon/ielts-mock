# IELTS Mock Test Platformasi — Texnik Qoralama

**Loyiha egasi:** Siz (mentor/admin)
**Maqsad:** IELTS'ga tayyorlanayotgan talabalarga to'liq mock test (Reading, Listening, Writing, Speaking) o'tkazish va ularga sifatli feedback berish.
**Sana:** 2026-yil

> Bu hujjat dasturchilarga vazifani tushuntirish va loyihani bosqichma-bosqich kuzatib borish uchun tayyorlangan. Har bir bosqich oxirida checklist bor — dasturchidan "nima tayyor, nima tayyor emas" deb so'rashda shundan foydalaning.

---

## 1. Loyiha haqida umumiy ma'lumot

Platforma orqali talaba brauzerda (kompyuter yoki telefon orqali, lekin mobil ilovasiz) to'liq IELTS mock testini topshiradi:

- **Reading** va **Listening** — javoblar aniq (to'g'ri/xato), shuning uchun **avtomatik** baholanadi.
- **Writing** va **Speaking** — javoblar erkin matn/nutq bo'lgani uchun, avval **AI dastlabki tahlil** qiladi, so'ng **siz** ko'rib chiqib yakuniy bahoni tasdiqlaysiz va shaxsiy fikringizni qo'shasiz.

Bu "AI + inson" modeli ikki narsani beradi: talabaga tez javob (AI darrov tahlil qiladi) va sifatli, ishonchli baho (siz tasdiqlaysiz).

> ⚠️ **Muhim eslatma:** Siz 1-2 oyda ishga tushirishni maqsad qilgansiz va savollarni tayyor kitoblardan olishni rejalashtiryapsiz. Bu real bo'lishi uchun, MVP'ni **CHEKLANGAN test banki** bilan (masalan, har bo'lim uchun 1-2 ta to'liq test) boshlash tavsiya etiladi — to'liq test banki ishga tushgandan keyin asta-sekin qo'shiladi. 6-bo'limda buning aniq rejasi bor.

---

## 2. Foydalanuvchi rollari

| Rol | Nima qila oladi |
|---|---|
| **Talaba** | Ro'yxatdan o'tadi, mock test topshiradi, natija va feedbackni ko'radi, o'z progressini kuzatadi |
| **Admin (siz)** | Barcha talabalarni ko'radi, AI bergan Writing/Speaking tahlilini ko'rib chiqadi, tahrirlaydi, tasdiqlaydi, statistikani kuzatadi |

Kelajakda "boshqa mentorlar" rolini qo'shish mumkin, lekin hozircha faqat shu ikkitasi yetarli.

---

## 3. Asosiy funksiyalar (modul bo'yicha)

### 3.1 Ro'yxatdan o'tish va profil
- Email/telefon orqali ro'yxatdan o'tish va kirish
- Talabaning shaxsiy kabineti: o'tgan testlar tarixi, umumiy progress grafigi

### 3.2 Reading moduli
- Matn + savollar (turli xil format: multiple choice, true/false, bo'sh joy to'ldirish)
- Taymer (masalan, 60 daqiqa)
- Javob yuborilgach — **darhol avtomatik ball** chiqadi

### 3.3 Listening moduli
- Audio pleer + savollar
- Taymer va audio faqat bir marta eshitiladigan rejim (haqiqiy IELTS'ga o'xshash)
- Javob yuborilgach — **darhol avtomatik ball**

### 3.4 Writing moduli
- Task 1 va Task 2 uchun alohida matn maydoni + taymer
- Yuborilgach, AI matnni tahlil qiladi: grammatika, so'z boyligi, mavzuga mos kelishi, matn tuzilishi bo'yicha dastlabki baho va izoh beradi
- Natija **"tekshiruv kutilmoqda"** holatida turadi, siz admin panelda ko'rib, kerak bo'lsa tahrirlab, tasdiqlaysiz — shundan keyingina talabaga ko'rinadi

### 3.5 Speaking moduli
- Talaba brauzer orqali mikrofon bilan javobini yozib yuboradi (Part 1, 2, 3 — haqiqiy IELTS speaking tuzilishiga mos)
- AI ovozni matnga o'giradi (speech-to-text) va talaffuz, ravonlik, lug'at, grammatika bo'yicha dastlabki tahlil beradi
- Siz yozuvni tinglab, AI tahlilini tekshirib, yakuniy bahoni belgilaysiz

### 3.6 Natijalar va feedback tizimi
- Har bir talaba uchun umumiy "band score" va har bo'lim bo'yicha alohida ball
- Kuchli va kuchsiz tomonlar bo'yicha qisqa izoh
- Oldingi testlar bilan solishtirish (progress grafigi)

### 3.7 Admin panel
- Barcha talabalar va ularning testlari ro'yxati
- "Tekshiruv kutilmoqda" bo'lgan Writing/Speaking javoblari uchun alohida navbat (queue)
- Umumiy statistika: nechta talaba, o'rtacha ball va h.k.

### 3.8 Test bank / kontent kiritish
- Siz tayyor kitoblardan (masalan, Cambridge IELTS to'plamlari) savollarni tanlab, admin panel orqali tizimga kiritasiz — shuning uchun dasturchilardan **oddiy "savol qo'shish" formasi** so'rang (matn, audio yuklash, to'g'ri javoblarni belgilash)
- ⚠️ **Eslatma (mualliflik huquqi):** Kitoblardagi savollarni to'g'ridan-to'g'ri commercial platformada, ayniqsa pullik xizmat sifatida ishlatish mualliflik huquqi masalasini keltirib chiqarishi mumkin. Xavfsizroq yo'l — savollarni ilhom sifatida olib, o'zingiz moslashtirib/qayta yozib chiqish, yoki litsenziyalash imkoniyatini oldindan tekshirish. Bu huquqiy maslahat emas, faqat e'tiborga olish kerak bo'lgan jihat.

---

## 4. Texnik arxitektura (dasturchilar uchun tavsiya)

| Qism | Tavsiya | Izoh |
|---|---|---|
| Backend | **Python** (Django REST Framework yoki FastAPI) | Siz Python bilasiz — bu kodni tushunish va dasturchilar bilan muloqot qilish sizga osonroq bo'ladi |
| Frontend | React (yoki Next.js) | Interaktiv interfeys (taymer, audio yozish va h.k.) uchun qulay |
| Ma'lumotlar bazasi | PostgreSQL | Ishonchli va keng qo'llaniladigan baza |
| Fayl saqlash | Cloud storage (masalan, AWS S3) | Speaking audio yozuvlari uchun |
| AI xizmati (Writing) | OpenAI API yoki shunga o'xshash til modeli | Matnni tahlil qilib, dastlabki baho va izoh beradi |
| AI xizmati (Speaking) | Whisper (speech-to-text) + til modeli | Ovozni matnga o'giradi, keyin tahlil qiladi |
| Audio yozish | Brauzerning MediaRecorder API'si | Qo'shimcha ilova o'rnatish shart emas |

Bu — boshlang'ich tavsiya. Dasturchilar bilan birinchi uchrashuvda ular boshqa variant taklif qilishlari mumkin, lekin ushbu jadval sizga "nega bu texnologiya tanlandi" deb so'rashga asos beradi.

**AI xarajatlari haqida:** OpenAI/Whisper kabi xizmatlar "qancha ishlatilsa — shuncha to'lanadi" tizimida ishlaydi, katta oldindan to'lov shart emas. MVP bosqichida talabalar soni kam bo'lgani uchun xarajat ham kichik bo'ladi (bir necha o'nlab test uchun oyiga bir necha dollar atrofida). Kutilmagan katta hisobdan saqlanish uchun dasturchidan API hisobingizda **xarajat chegarasi (spending limit)** qo'yishni so'rang — shunda xarajat qanchalik oshib borayotganini kuzatib borasiz va real foydalanishga qarab keyinroq qaror qabul qilasiz.

---

## 5. Ma'lumotlar bazasi — asosiy jadvallar (soddalashtirilgan)

| Jadval | Nima saqlaydi |
|---|---|
| `users` | Talaba va admin ma'lumotlari |
| `tests` | Mock test sessiyalari (qaysi talaba, qachon) |
| `reading_answers`, `listening_answers` | Avtomatik baholanadigan javoblar va ballar |
| `writing_answers` | Yozilgan matn, AI tahlili, admin tasdig'i |
| `speaking_answers` | Audio fayl havolasi, matnga o'girilgan versiya, AI tahlili, admin tasdig'i |
| `feedback` | Har bir bo'lim va umumiy band score |

Bu jadval dasturchiga to'liq texnik dizayn chizib berish uchun emas, balki "qanday ma'lumotlar saqlanishi kerak" degan umumiy tasavvur berish uchun.

---

## 6. Rivojlantirish bosqichlari — Tezlashtirilgan MVP rejasi (1-2 oy)

> Har bir bosqich tugagach, dasturchidan qisqa demo so'rang va checklistni belgilab boring. Bu reja **CHEKLANGAN test banki** (har bo'lim uchun 1-2 ta to'liq test) bilan ishga tushirishga mo'ljallangan — shu sababli 1-2 oyga sig'adi.

### Bosqich 0 — Loyihalash va tayyorgarlik (3-5 kun)
- [ ] Interfeys dizayni (UI/UX) — sodda versiya, keyin chiroylashtiriladi
- [ ] Ma'lumotlar bazasi sxemasi aniqlangan
- [ ] Kamida 1 ta to'liq test uchun savollar (Reading, Listening, Writing, Speaking) tayyor manbadan tanlab, raqamlashtirib qo'yilgan

### Bosqich 1 — Asos: ro'yxatdan o'tish + Reading + Listening (1-1.5 hafta)
- [ ] Ro'yxatdan o'tish/kirish tizimi ishlayapti
- [ ] Admin uchun "savol qo'shish" formasi (3.8-bandga qarang) ishlayapti
- [ ] Reading moduli va avtomatik baholash tayyor
- [ ] Listening moduli va avtomatik baholash tayyor

### Bosqich 2 — Writing moduli + AI tahlili (1-1.5 hafta, Bosqich 1 bilan parallel boshlash mumkin)
- [ ] Writing yozish interfeysi (taymer bilan) tayyor
- [ ] AI orqali dastlabki tahlil ishlayapti
- [ ] Admin uchun "tekshirish va tasdiqlash" oynasi tayyor

### Bosqich 3 — Speaking moduli + AI tahlili (1.5-2 hafta — eng murakkab qism, vaqt zaxirasi qoldiring)
- [ ] Audio yozib olish funksiyasi ishlayapti
- [ ] Speech-to-text integratsiyasi tayyor
- [ ] AI tahlili + admin tasdiqlash oynasi tayyor

### Bosqich 4 — Natijalar sahifasi (3-5 kun)
- [ ] Umumiy natija (band score) sahifasi tayyor
- [ ] Har bo'lim bo'yicha alohida ball va izoh ko'rinadi

### Bosqich 5 — Tezkor test va ishga tushirish (3-5 kun)
- [ ] Asosiy xatoliklar tuzatilgan
- [ ] Turli brauzer/qurilmalarda tekshirilgan (ayniqsa mikrofon va audio)
- [ ] Parollar va fayllarga ruxsat bo'yicha asosiy xavfsizlik tekshiruvi
- [ ] Server/hostingga joylashtirilgan, domen ulangan
- [ ] Birinchi talabalar qabul qilinmoqda

**Jami: taxminan 5-7 hafta** — 1-2 oylik maqsadga mos, lekin faqat cheklangan test banki bilan boshlasangiz.

### MVP'dan keyin qo'shiladi (v1.1)
- [ ] To'liq test banki — kitoblardan ko'proq test qo'shib borish
- [ ] Talaba progress tarixi va batafsil statistika grafiklari
- [ ] Admin uchun umumiy statistika sahifasi
- [ ] Kerak bo'lsa, AI xarajatlarini optimallashtirish (foydalanuvchi ko'payib, xarajat sezilarli oshsa)

---

## 7. Xavfsizlik va maxfiylik — asosiy talablar
- Parollar shifrlangan holda saqlanishi kerak (oddiy matn holida emas)
- Speaking audio yozuvlari faqat o'sha talaba va admin (siz)ga ko'rinishi kerak
- Ma'lumotlar muntazam zaxiralanishi (backup) kerak

---

## 8. Loyihani kuzatib borish bo'yicha tavsiya
- Yuqoridagi bosqichlarni Trello, Notion yoki GitHub Projects'ga checklist sifatida joylashtiring
- Dasturchilar bilan haftalik qisqa uchrashuv o'tkazing (masalan, har dushanba 15 daqiqa): "bu hafta nima qilindi, keyingi hafta nima qilinadi"
- Har bosqich oxirida ishlayotgan versiyani (demo) ko'rsatishni so'rang — faqat "tayyor bo'ldi" degan so'zga ishonmang, o'zingiz sinab ko'ring

---

## 9. Kelajakda qo'shish mumkin bo'lgan funksiyalar
- Mobil ilova (hozircha kerak emas, lekin keyinchalik qo'shish mumkin)
- To'lov tizimi (pullik mock testlar)
- Guruh darslari yoki jonli (live) speaking sessiyalari
- Boshqa mentorlar/o'qituvchilarni platformaga qo'shish
