export default function FirmsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Firmalar</h1>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Yeni Firma
        </button>
      </div>
      <p className="mt-4 text-gray-500">
        Firma listesi burada görüntülenecek.
      </p>
    </div>
  );
}
