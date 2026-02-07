export default function CalendarPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Takvim</h1>
        <p className="mt-1 text-sm text-slate-500">Mülakat ve toplantılarınızı takip edin</p>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-16">
        <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Yakında</h3>
        <p className="mt-2 text-sm text-slate-500">Mülakat takvimi burada görüntülenecek.</p>
      </div>
    </div>
  );
}
