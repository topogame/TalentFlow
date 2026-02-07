export default function PositionsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pozisyonlar</h1>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Yeni Pozisyon
        </button>
      </div>
      <p className="mt-4 text-gray-500">
        Pozisyon listesi burada görüntülenecek.
      </p>
    </div>
  );
}
