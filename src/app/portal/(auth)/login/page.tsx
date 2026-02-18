"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "error" | "no-token">(
    token ? "loading" : "no-token"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    async function authenticate() {
      try {
        const result = await signIn("portal-token", {
          token,
          redirect: false,
        });

        if (result?.ok) {
          router.push("/portal");
        } else {
          setStatus("error");
          setErrorMessage("Bağlantı geçersiz veya süresi dolmuş.");
        }
      } catch {
        setStatus("error");
        setErrorMessage("Giriş sırasında bir hata oluştu.");
      }
    }

    authenticate();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">TalentFlow</h1>
            <p className="mt-1 text-sm text-slate-500">Aday Portalı</p>
          </div>

          {status === "loading" && (
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
              <p className="mt-4 text-sm text-slate-600">
                Giriş yapılıyor...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Lütfen danışmanınızdan yeni bir erişim bağlantısı isteyin.
              </p>
            </div>
          )}

          {status === "no-token" && (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Portala erişmek için size gönderilen e-postadaki bağlantıyı kullanın.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
