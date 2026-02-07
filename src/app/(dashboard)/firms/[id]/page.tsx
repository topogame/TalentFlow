"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Position = {
  id: string;
  title: string;
  status: string;
  priority: string;
  city: string | null;
  workModel: string | null;
  createdAt: string;
};

type Firm = {
  id: string;
  name: string;
  sector: string | null;
  companySize: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  notes: string | null;
  status: string;
  positions: Position[];
  createdBy: { firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  open: "Açık",
  on_hold: "Beklemede",
  closed: "Kapalı",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  urgent: "Acil",
};

export default function FirmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [firm, setFirm] = useState<Firm | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFirm = useCallback(async () => {
    const res = await fetch(`/api/firms/${id}`);
    const data = await res.json();
    if (data.success) setFirm(data.data);
    else router.push("/firms");
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchFirm();
  }, [fetchFirm]);

  if (loading) return <div className="text-center text-gray-500">Yükleniyor...</div>;
  if (!firm) return null;

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/firms" className="text-sm text-gray-500 hover:text-gray-700">
              Firmalar
            </Link>
            <span className="text-gray-400">/</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{firm.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {[firm.sector, firm.city].filter(Boolean).join(" · ") || "Bilgi yok"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Firma Bilgileri</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Sektör</dt>
              <dd className="text-gray-900">{firm.sector || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Büyüklük</dt>
              <dd className="text-gray-900">{firm.companySize || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Konum</dt>
              <dd className="text-gray-900">
                {[firm.city, firm.country].filter(Boolean).join(", ") || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Website</dt>
              <dd>
                {firm.website ? (
                  <a href={firm.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {firm.website}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
          {firm.notes && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-gray-600">{firm.notes}</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Pozisyonlar ({firm.positions.length})</h3>
            <Link
              href={`/positions/new?firmId=${firm.id}`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Yeni Pozisyon
            </Link>
          </div>
          {firm.positions.length === 0 ? (
            <p className="text-sm text-gray-500">Henüz pozisyon yok</p>
          ) : (
            <div className="space-y-2">
              {firm.positions.map((p) => (
                <Link
                  key={p.id}
                  href={`/positions/${p.id}`}
                  className="block rounded-md border border-gray-100 p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{p.title}</span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.status === "open"
                          ? "bg-green-100 text-green-800"
                          : p.status === "on_hold"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {[p.city, PRIORITY_LABELS[p.priority]].filter(Boolean).join(" · ")}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
