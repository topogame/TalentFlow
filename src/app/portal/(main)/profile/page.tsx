"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("portal");
  const tc = useTranslations("common");
  const tl = useTranslations("constants.languageLevels");
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
        <p className="text-sm text-slate-500">{t("profileNotFound")}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-900">{t("myProfile")}</h1>

      <div className="space-y-6">
        {/* Personal Info */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            {t("personalInfo")}
          </h2>
          <InfoRow label={t("fullName")} value={`${profile.firstName} ${profile.lastName}`} />
          <InfoRow label={tc("email")} value={profile.email} />
          <InfoRow label={tc("phone")} value={profile.phone} />
          <InfoRow
            label={tc("location")}
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
            {t("professionalInfo")}
          </h2>
          <InfoRow label={t("currentPosition")} value={profile.currentTitle} />
          <InfoRow label={t("industry")} value={profile.currentSector} />
          <InfoRow
            label={t("totalExperience")}
            value={
              profile.totalExperienceYears != null
                ? `${profile.totalExperienceYears} ${tc("year")}`
                : null
            }
          />
        </div>

        {/* Education */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">{t("education")}</h2>
          <InfoRow label={t("educationLevel")} value={profile.educationLevel} />
          <InfoRow label={t("university")} value={profile.universityName} />
          <InfoRow label={t("department")} value={profile.universityDepartment} />
        </div>

        {/* Languages */}
        {profile.languages.length > 0 && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">
              {t("languages")}
            </h2>
            <div className="space-y-2">
              {profile.languages.map((lang, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-slate-100 py-2.5 last:border-b-0"
                >
                  <span className="text-sm text-slate-900">{lang.language}</span>
                  <span className="text-sm text-slate-500">
                    {tl.has(lang.level) ? tl(lang.level) : lang.level}
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
