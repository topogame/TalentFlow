"use client";

import { useEffect, useState } from "react";

const LANGUAGE_LEVEL_LABELS: Record<string, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
  native: "Ana Dil",
};

type Profile = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  totalExperienceYears: number | null;
  educationLevel: string | null;
  universityName: string | null;
  universityDepartment: string | null;
  currentTitle: string | null;
  currentSector: string | null;
  linkedinUrl: string | null;
  languages: { language: string; level: string }[];
};

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b border-slate-100 py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

export default function PortalProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/candidate-portal/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProfile(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <p className="text-sm text-slate-500">Profil bilgisi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-900">Profilim</h1>

      <div className="space-y-6">
        {/* Personal Info */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Kişisel Bilgiler
          </h2>
          <InfoRow label="Ad Soyad" value={`${profile.firstName} ${profile.lastName}`} />
          <InfoRow label="E-posta" value={profile.email} />
          <InfoRow label="Telefon" value={profile.phone} />
          <InfoRow
            label="Konum"
            value={
              profile.city && profile.country
                ? `${profile.city}, ${profile.country}`
                : profile.city || profile.country
            }
          />
        </div>

        {/* Professional Info */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Profesyonel Bilgiler
          </h2>
          <InfoRow label="Mevcut Pozisyon" value={profile.currentTitle} />
          <InfoRow label="Sektör" value={profile.currentSector} />
          <InfoRow
            label="Toplam Deneyim"
            value={
              profile.totalExperienceYears != null
                ? `${profile.totalExperienceYears} yıl`
                : null
            }
          />
        </div>

        {/* Education */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Eğitim</h2>
          <InfoRow label="Eğitim Seviyesi" value={profile.educationLevel} />
          <InfoRow label="Üniversite" value={profile.universityName} />
          <InfoRow label="Bölüm" value={profile.universityDepartment} />
        </div>

        {/* Languages */}
        {profile.languages.length > 0 && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">
              Diller
            </h2>
            <div className="space-y-2">
              {profile.languages.map((lang, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-slate-100 py-2.5 last:border-b-0"
                >
                  <span className="text-sm text-slate-900">{lang.language}</span>
                  <span className="text-sm text-slate-500">
                    {LANGUAGE_LEVEL_LABELS[lang.level] || lang.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
