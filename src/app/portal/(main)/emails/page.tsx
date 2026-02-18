"use client";

import { useEffect, useState } from "react";

type Email = {
  id: string;
  subject: string;
  sentAt: string;
  status: string;
  toEmail: string;
};

export default function PortalEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/candidate-portal/emails")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setEmails(data.data);
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

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-900">E-postalarım</h1>

      {emails.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <p className="text-sm text-slate-500">
            Henüz gönderilmiş e-posta bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Konu</th>
                <th className="hidden px-4 py-3 sm:table-cell">Tarih</th>
                <th className="px-4 py-3 text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {emails.map((email) => (
                <tr key={email.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">
                      {email.subject}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400 sm:hidden">
                      {new Date(email.sentAt).toLocaleDateString("tr-TR")}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-slate-500 sm:table-cell">
                    {new Date(email.sentAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        email.status === "sent"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {email.status === "sent" ? "Gönderildi" : "Başarısız"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
