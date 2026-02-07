export default function ProcessesPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Süreçler</h1>
        <p className="mt-1 text-sm text-slate-500">İşe alım süreçlerinizi yönetin</p>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-16">
        <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Yakında</h3>
        <p className="mt-2 text-sm text-slate-500">Süreç listesi ve Kanban görünümü burada yer alacak.</p>
      </div>
    </div>
  );
}
