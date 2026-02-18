import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TalentFlow - Aday Portalı",
  description: "Başvuru durumunuzu takip edin",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
