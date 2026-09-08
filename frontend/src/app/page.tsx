import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <section className="text-center bg-gradient-to-br from-blue-900 to-blue-700 text-white w-full rounded-3xl py-20 px-6 shadow-2xl mb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">IELTS Mock Test Platform</h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
          IELTS imtihoniga online tayyorlaning. O'z darajangizni haqiqiy imtihon muhitida sinab ko'ring.
        </p>
        <Link 
          href="/register" 
          className="inline-block bg-white text-blue-900 text-lg font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition shadow-lg transform hover:-translate-y-1"
        >
          Boshlash
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
          <div className="text-5xl mb-4">📖</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Reading</h3>
          <p className="text-gray-600">3 ta qism, 40 ta savol. Haqiqiy IELTS matnlari.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
          <div className="text-5xl mb-4">🎧</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Listening</h3>
          <p className="text-gray-600">4 ta qism, 40 ta savol. Original audio materiallar.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
          <div className="text-5xl mb-4">✍️</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Writing</h3>
          <p className="text-gray-600">Task 1 va Task 2. Sun&apos;iy intellekt orqali tekshirish.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
          <div className="text-5xl mb-4">🗣️</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Speaking</h3>
          <p className="text-gray-600">3 ta qism. Ovoz yozish orqali real imtihon simulyatsiyasi.</p>
        </div>
      </section>
    </div>
  );
}
