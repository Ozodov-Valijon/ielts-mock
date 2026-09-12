import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] py-8 px-4">
      {/* Hero Sarlavha */}
      <section className="text-center bg-gradient-to-br from-[#002e5b] via-blue-900 to-indigo-950 text-white w-full max-w-6xl rounded-3xl py-16 sm:py-20 px-6 shadow-xl mb-14 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-blue-200 mb-6 border border-white/15">
            <span>IELTS formatidagi mustaqil mashq platformasi</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 tracking-tight leading-tight">
            IELTS Mock Test Platformasi
          </h1>

          <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed font-normal">
            Computer-Delivered IELTS formati bo&apos;yicha tayyorgarlik, to&apos;liq mashq testlari va natijalar tahlili.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              href="/register" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white text-sm sm:text-base font-semibold py-3 px-8 rounded-xl transition shadow-md"
            >
              Ro&apos;yxatdan o&apos;tish &rarr;
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base font-semibold py-3 px-8 rounded-xl transition border border-white/20"
            >
              Tizimga kirish
            </Link>
          </div>
        </div>
      </section>

      {/* 4 ta Asosiy Bo'lim Kartalari */}
      <div className="w-full max-w-6xl mx-auto mb-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">4 ta asosiy IELTS bo&apos;limi</h2>
          <p className="text-gray-500 text-sm mt-1">Har bir ko&apos;nikma bo&apos;yicha real test mezonlari</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-2">Bo&apos;lim</span>
            <h3 className="text-lg font-bold mb-1 text-gray-900">Reading</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Akademik matnlar, matnni belgilash vositasi va qulay savollar palitrasi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-indigo-400 hover:shadow-xs transition">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-2">Bo&apos;lim</span>
            <h3 className="text-lg font-bold mb-1 text-gray-900">Listening</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Audio topshiriqlar va avtomatlashtirilgan javob tekshiruvi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-purple-400 hover:shadow-xs transition">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-2">Bo&apos;lim</span>
            <h3 className="text-lg font-bold mb-1 text-gray-900">Writing</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Task 1 va Task 2 insholarini rasmiy mezonlar (TR, CC, LR, GRA) asosida baholash.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-teal-400 hover:shadow-xs transition">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-2">Bo&apos;lim</span>
            <h3 className="text-lg font-bold mb-1 text-gray-900">Speaking</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Part 1, Part 2 Cue Card va Part 3 savollari bo&apos;yicha ovozli suhbat amaliyoti.
            </p>
          </div>
        </div>
      </div>

      {/* Xususiyatlar */}
      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800">
          <h3 className="text-xl font-bold mb-2 text-white">To&apos;liq ekran imtihon muhiti</h3>
          <p className="text-slate-300 text-xs leading-relaxed mb-4">
            To&apos;liq ekran tartibi va intizom nazorati orqali mashq jarayoni real imtihon sharoitiga yaqinlashtiriladi.
          </p>
          <span className="text-xs text-slate-400 font-medium">To&apos;liq ekran rejimi &bull; Nazorat tizimi</span>
        </div>

        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800">
          <h3 className="text-xl font-bold mb-2 text-white">Natijalar hisoboti va TRF</h3>
          <p className="text-slate-300 text-xs leading-relaxed mb-4">
            Test yakunlangach, barcha bo&apos;limlar bo&apos;yicha hisobot shakllanadi. Hisobotni yuklab olish yoki chop etish mumkin.
          </p>
          <span className="text-xs text-slate-400 font-medium">PDF saqlash &bull; Batafsil tahlil</span>
        </div>
      </section>
    </div>
  );
}
