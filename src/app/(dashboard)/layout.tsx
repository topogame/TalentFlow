import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header + drawer — visible only below md */}
        <MobileSidebar />

        {/* Desktop header — hidden on mobile */}
        <Header />

        <main className="flex-1 overflow-y-auto bg-slate-50 px-4 py-6 md:p-8">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
