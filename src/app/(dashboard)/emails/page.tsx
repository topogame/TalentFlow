export default function EmailsPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">E-postalar</h1>
        <p className="mt-1 text-sm text-slate-500">E-posta iletişiminizi yönetin</p>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-16">
        <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Yakında</h3>
        <p className="mt-2 text-sm text-slate-500">E-posta gönderimi ve geçmiş burada yer alacak.</p>
      </div>
    </div>
  );
}
