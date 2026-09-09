import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] py-8 px-4">
      {/* Hero Sarlavha */}
      <section className="text-center bg-gradient-to-br from-[#002e5b] via-blue-900 to-indigo-950 text-white w-full max-w-6xl rounded-3xl py-16 sm:py-24 px-6 shadow-2xl mb-16 relative overflow-hidden">
        {/* Orqa fon effektlari */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-blue-200 mb-6 border border-white/15">
            <span>✨</span>
            <span>Rasmiy Cambridge IELTS Standarti &bull; Google Gemini 3.8 Flash AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            IELTS Mock Test <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-200 to-yellow-300">
              Platformasi
            </span>
          </h1>

          <p className="text-base sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
            Haqiqiy <strong>Computer-Delivered IELTS</strong> imtihon muhiti, to&apos;liq fullscreen nazorati, sun&apos;iy intellekt tahlili va rasmiy TRF sertifikati.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-400 text-white text-base sm:text-lg font-black py-4 px-10 rounded-2xl transition shadow-xl transform hover:scale-105"
            >
              Bepul Boshlash &rarr;
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white text-base sm:text-lg font-bold py-4 px-10 rounded-2xl transition border border-white/20 backdrop-blur-md"
            >
              Tizimga Kirish
            </Link>
          </div>
        </div>
      </section>

      {/* 4 ta Asosiy Bo'lim Kartalari */}
      <div className="w-full max-w-6xl mx-auto mb-16">
        <div className="text-center mb-10">
          <span className="text-xs font-black text-blue-600 uppercase tracking-wider block">To&apos;liq Imtihon</span>
          <h2 className="text-3xl font-black text-gray-900 mt-1">4 Ta Asosiy IELTS Ko&apos;nikmasi</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-7 rounded-3xl shadow-xs border border-gray-200 hover:border-blue-400 hover:shadow-lg transition group">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl font-bold mb-4 group-hover:scale-110 transition">
              📖
            </div>
            <h3 className="text-xl font-black mb-2 text-gray-900">Reading</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Matnni sariq bilan belgilash (Highlight), eslatmalar qoldirish va 40 talik savol palitrasi.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl shadow-xs border border-gray-200 hover:border-indigo-400 hover:shadow-lg transition group">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold mb-4 group-hover:scale-110 transition">
              🎧
            </div>
            <h3 className="text-xl font-black mb-2 text-gray-900">Listening</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Original audio treklar, Cambridge IELTS rasmiy shkalasi va sinonimlar qabul qilish filtri.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl shadow-xs border border-gray-200 hover:border-purple-400 hover:shadow-lg transition group">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl font-bold mb-4 group-hover:scale-110 transition">
              ✍️
            </div>
            <h3 className="text-xl font-black mb-2 text-gray-900">Writing</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Task 1 va Task 2 insholarini Google Gemini 3.8 Flash AI orqali 4 ta mezon bo&apos;yicha tahlil qilish.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl shadow-xs border border-gray-200 hover:border-teal-400 hover:shadow-lg transition group">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-3xl font-bold mb-4 group-hover:scale-110 transition">
              🗣️
            </div>
            <h3 className="text-xl font-black mb-2 text-gray-900">Speaking</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Jonli audio to&apos;lqin visualizatori, Part 2 Cue-card 1 daqiqa tayyorgarlik va qoralama bloknot.
            </p>
          </div>
        </div>
      </div>

      {/* Eksklyuziv Xususiyatlar (Anti-Cheat, TRF Sertifikat) */}
      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="text-4xl mb-4">🛡️</div>
          <h3 className="text-2xl font-black mb-3 text-red-400">Murosasiz Anti-Cheat Nazorati</h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Test boshlangan zahoti to&apos;liq ekran (Fullscreen) majburiy qilinadi. Boshqa oynaga o&apos;tilsa, baland sirena va ovozli <strong>&quot;CHITER!&quot;</strong> ogohlantirishi yangraydi va test bayroq bilan belgilanadi.
          </p>
          <div className="inline-flex items-center space-x-2 bg-red-600/20 text-red-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-red-500/30">
            <span>🚨</span>
            <span>Tab Switch &bull; Fullscreen Exit &bull; Copy/Paste Bloklangan</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="text-4xl mb-4">📜</div>
          <h3 className="text-2xl font-black mb-3 text-yellow-400">Rasmiy IELTS TRF Sertifikati</h3>
          <p className="text-blue-100 text-sm leading-relaxed mb-6">
            Imtihon yakunlangach, rasmiy Cambridge va IDP formatidagi A4 sertifikat shakllanadi. Natijalarni QR-kod va muhr bilan bir tugmada PDF formatda yuklab olishingiz mumkin.
          </p>
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-400/30">
            <span>🖨️</span>
            <span>A4 Print &bull; PDF Download &bull; Savolma-savol Tahlil</span>
          </div>
        </div>
      </section>
    </div>
  );
}
