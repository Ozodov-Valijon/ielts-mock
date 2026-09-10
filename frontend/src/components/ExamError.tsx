import Link from 'next/link';
export default function ExamError({message}: {message: string}) {
  return <div role="alert" className="max-w-xl mx-auto my-12 p-6 rounded-2xl bg-red-50 border border-red-200 text-red-900"><h1 className="font-bold mb-2">Testni ochib bo‘lmadi</h1><p>{message}</p><Link className="inline-block underline mt-4" href="/dashboard">Kabinetga qaytish</Link></div>;
}
