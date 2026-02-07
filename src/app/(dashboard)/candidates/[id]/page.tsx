"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PIPELINE_STAGE_LABELS } from "@/lib/constants";

type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  educationLevel: string | null;
  totalExperienceYears: number | null;
  currentSector: string | null;
  currentTitle: string | null;
  salaryExpectation: number | null;
  salaryCurrency: string | null;
  salaryType: string | null;
  country: string | null;
  city: string | null;
  isRemoteEligible: boolean;
  isHybridEligible: boolean;
  status: string;
  activeProcessCount: number;
  languages: { id: string; language: string; level: string }[];
  documents: { id: string; fileName: string; fileUrl: string; createdAt: string }[];
  createdBy: { firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
};

type Note = {
  id: string;
  content: string;
  createdBy: { firstName: string; lastName: string };
  createdAt: string;
};

const LANGUAGE_LABELS: Record<string, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
  native: "Ana Dil",
};

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const fetchCandidate = useCallback(async () => {
    const res = await fetch(`/api/candidates/${id}`);
    const data = await res.json();
    if (data.success) setCandidate(data.data);
    else router.push("/candidates");
    setLoading(false);
  }, [id, router]);

  const fetchNotes = useCallback(async () => {
    const res = await fetch(`/api/candidates/${id}/notes`);
    const data = await res.json();
    if (data.success) setNotes(data.data);
  }, [id]);

  useEffect(() => {
    fetchCandidate();
    fetchNotes();
  }, [fetchCandidate, fetchNotes]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSavingNote(true);
    await fetch(`/api/candidates/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNote }),
    });
    setNewNote("");
    setSavingNote(false);
    fetchNotes();
  }

  if (loading) return <div className="text-center text-gray-500">Yükleniyor...</div>;
  if (!candidate) return null;

  const tabs = [
    { key: "summary", label: "Özet" },
    { key: "notes", label: `Notlar (${notes.length})` },
    { key: "documents", label: `Belgeler (${candidate.documents.length})` },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/candidates" className="text-sm text-gray-500 hover:text-gray-700">
              Adaylar
            </Link>
            <span className="text-gray-400">/</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {candidate.firstName} {candidate.lastName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {candidate.currentTitle || "Pozisyon belirtilmemiş"}
            {candidate.currentSector ? ` · ${candidate.currentSector}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/candidates/${id}/edit`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Düzenle
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-gray-900">İletişim</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">E-posta</dt>
                  <dd className="text-gray-900">{candidate.email || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Telefon</dt>
                  <dd className="text-gray-900">{candidate.phone || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">LinkedIn</dt>
                  <dd>
                    {candidate.linkedinUrl ? (
                      <a
                        href={candidate.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Profil
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Konum</dt>
                  <dd className="text-gray-900">
                    {[candidate.city, candidate.country].filter(Boolean).join(", ") || "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Çalışma Modeli</dt>
                  <dd className="text-gray-900">
                    {[
                      candidate.isRemoteEligible && "Uzaktan",
                      candidate.isHybridEligible && "Hibrit",
                    ]
                      .filter(Boolean)
                      .join(", ") || "Ofis"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Profesyonel</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Deneyim</dt>
                  <dd className="text-gray-900">
                    {candidate.totalExperienceYears != null
                      ? `${candidate.totalExperienceYears} yıl`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Eğitim</dt>
                  <dd className="text-gray-900">{candidate.educationLevel || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Maaş Beklentisi</dt>
                  <dd className="text-gray-900">
                    {candidate.salaryExpectation
                      ? `${candidate.salaryExpectation.toLocaleString("tr-TR")} ${candidate.salaryCurrency || "TRY"}${candidate.salaryType ? ` (${candidate.salaryType === "net" ? "Net" : "Brüt"})` : ""}`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Aktif Süreçler</dt>
                  <dd className="text-gray-900">{candidate.activeProcessCount}</dd>
                </div>
              </dl>
            </div>

            {candidate.languages.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-semibold text-gray-900">Yabancı Diller</h3>
                <div className="space-y-2">
                  {candidate.languages.map((l) => (
                    <div key={l.id} className="flex justify-between text-sm">
                      <span className="text-gray-900">{l.language}</span>
                      <span className="text-gray-500">{LANGUAGE_LABELS[l.level] || l.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Kayıt Bilgileri</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Oluşturan</dt>
                  <dd className="text-gray-900">
                    {candidate.createdBy.firstName} {candidate.createdBy.lastName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Oluşturma</dt>
                  <dd className="text-gray-900">
                    {new Date(candidate.createdAt).toLocaleDateString("tr-TR")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Son Güncelleme</dt>
                  <dd className="text-gray-900">
                    {new Date(candidate.updatedAt).toLocaleDateString("tr-TR")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div>
            <form onSubmit={handleAddNote} className="mb-6 flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Not ekleyin..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={savingNote || !newNote.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Ekle
              </button>
            </form>

            {notes.length === 0 ? (
              <p className="text-sm text-gray-500">Henüz not yok</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <p className="text-sm text-gray-900">{note.content}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      {note.createdBy.firstName} {note.createdBy.lastName} ·{" "}
                      {new Date(note.createdAt).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div>
            {candidate.documents.length === 0 ? (
              <p className="text-sm text-gray-500">Henüz belge yüklenmedi</p>
            ) : (
              <div className="space-y-2">
                {candidate.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      İndir
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
