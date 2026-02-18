import { PortalHeader } from "@/components/portal-header";

export default function PortalMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PortalHeader />
      <main className="mx-auto max-w-5xl px-4 py-6">
        {children}
      </main>
    </>
  );
}
