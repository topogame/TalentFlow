"use client";

import { useEffect, useState } from "react";

type DashboardStats = {
  activeCandidates: number;
  openPositions: number;
  weekInterviews: number;
  activeProcesses: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        TalentFlow Aday Veri Tabanı ve Süreç Yönetim Sistemi
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Aktif Adaylar"
          value={loading ? "..." : String(stats?.activeCandidates ?? 0)}
        />
        <DashboardCard
          title="Açık Pozisyonlar"
          value={loading ? "..." : String(stats?.openPositions ?? 0)}
        />
        <DashboardCard
          title="Bu Hafta Mülakatlar"
          value={loading ? "..." : String(stats?.weekInterviews ?? 0)}
        />
        <DashboardCard
          title="Aktif Süreçler"
          value={loading ? "..." : String(stats?.activeProcesses ?? 0)}
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
