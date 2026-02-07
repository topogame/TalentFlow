"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PIPELINE_STAGE_LABELS } from "@/lib/constants";

type Process = {
  id: string;
  stage: string;
  fitnessScore: number | null;
  closedAt: string | null;
  createdAt: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    currentTitle: string | null;
  };
};

type Position = {
  id: string;
  title: string;
  department: string | null;
  status: string;
  priority: string;
  city: string | null;
  country: string | null;
  workModel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  requiredExperienceYears: number | null;
  description: string | null;
  requirements: string | null;
  firm: { id: string; name: string };
  createdBy: { firstName: string; lastName: string };
  processes: Process[];
  createdAt: string;
  updatedAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  open: "Açık",
  on_hold: "Beklemede",
  closed: "Kapalı",
};

const WORK_MODEL_LABELS: Record<string, string> = {
  office: "Ofis",
  remote: "Uzaktan",
  hybrid: "Hibrit",
};

export default function PositionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosition = useCallback(async () => {
    const res = await fetch(`/api/positions/${id}`);
    const data = await res.json();
    if (data.success) setPosition(data.data);
    else router.push("/positions");
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  if (loading) return <div className="text-center text-gray-500">Yükleniyor...</div>;
  if (!position) return null;

  const activeProcesses = position.processes.filter((p) => !p.closedAt);
  const closedProcesses = position.processes.filter((p) => p.closedAt);

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/positions" className="text-sm text-gray-500 hover:text-gray-700">
              Pozisyonlar
            </Link>
            <span className="text-gray-400">/</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{position.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            <Link href={`/firms/${position.firm.id}`} className="text-blue-600 hover:underline">
              {position.firm.name}
            </Link>
            {position.department ? ` · ${position.department}` : ""}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
            position.status === "open"
              ? "bg-green-100 text-green-800"
              : position.status === "on_hold"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {STATUS_LABELS[position.status] || position.status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Pozisyon Detayları</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Konum</dt>
              <dd className="text-gray-900">
                {[position.city, position.country].filter(Boolean).join(", ") || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Çalışma Modeli</dt>
              <dd className="text-gray-900">
                {position.workModel ? WORK_MODEL_LABELS[position.workModel] || position.workModel : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Gerekli Deneyim</dt>
              <dd className="text-gray-900">
                {position.requiredExperienceYears != null
                  ? `${position.requiredExperienceYears} yıl`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Maaş Aralığı</dt>
              <dd className="text-gray-900">
                {position.salaryMin || position.salaryMax
                  ? `${position.salaryMin?.toLocaleString("tr-TR") || "?"} - ${position.salaryMax?.toLocaleString("tr-TR") || "?"} ${position.salaryCurrency || "TRY"}`
                  : "—"}
              </dd>
            </div>
          </dl>

          {position.description && (
            <div className="mt-4 border-t pt-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700">Açıklama</h4>
              <p className="whitespace-pre-line text-sm text-gray-600">{position.description}</p>
            </div>
          )}
          {position.requirements && (
            <div className="mt-4 border-t pt-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700">Gereksinimler</h4>
              <p className="whitespace-pre-line text-sm text-gray-600">{position.requirements}</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">
            Süreçler ({position.processes.length})
          </h3>

          {activeProcesses.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-medium uppercase text-gray-500">Aktif</h4>
              <div className="space-y-2">
                {activeProcesses.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-md border border-gray-100 p-3"
                  >
                    <div>
                      <Link
                        href={`/candidates/${p.candidate.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {p.candidate.firstName} {p.candidate.lastName}
                      </Link>
                      <p className="text-xs text-gray-500">{p.candidate.currentTitle || ""}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      {PIPELINE_STAGE_LABELS[p.stage] || p.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {closedProcesses.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase text-gray-500">Tamamlanan</h4>
              <div className="space-y-2">
                {closedProcesses.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-md border border-gray-100 p-3 opacity-60"
                  >
                    <div>
                      <Link
                        href={`/candidates/${p.candidate.id}`}
                        className="text-sm font-medium text-gray-600 hover:underline"
                      >
                        {p.candidate.firstName} {p.candidate.lastName}
                      </Link>
                    </div>
                    <span className="text-xs text-gray-500">
                      {PIPELINE_STAGE_LABELS[p.stage] || p.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {position.processes.length === 0 && (
            <p className="text-sm text-gray-500">Henüz süreç yok</p>
          )}
        </div>
      </div>
    </div>
  );
}
