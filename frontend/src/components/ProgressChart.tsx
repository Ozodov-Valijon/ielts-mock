export default function ProgressChart({ tests }: { tests: { test_id: number; overall_band: number; date: string }[] }) {
  const getColor = (score: number) => {
    if (score >= 7) return 'bg-green-500';
    if (score >= 5) return 'bg-blue-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-4 text-gray-800">O&apos;sish dinamikasi</h3>
      <div className="space-y-4">
        {tests.map((test) => (
          <div key={test.test_id}>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{test.date}</span>
              <span className="font-bold text-gray-700">{test.overall_band.toFixed(1)} / 9.0</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full ${getColor(test.overall_band)} rounded-full`}
                style={{ width: `${(test.overall_band / 9) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
