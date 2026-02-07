export default function CandidatesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Adaylar</h1>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Yeni Aday
        </button>
      </div>
      <p className="mt-4 text-gray-500">
        Aday listesi burada görüntülenecek.
      </p>
    </div>
  );
}
