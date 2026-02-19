"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("login");
  const tc = useTranslations("common");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const isRedirected = searchParams.has("callbackUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("invalidCredentials"));
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="animate-fade-in rounded-2xl bg-white/95 p-10 shadow-2xl backdrop-blur-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
          <span className="text-lg font-bold text-white">T</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Talent<span className="text-indigo-600">Flow</span>
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {t("subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isRedirected && !error && (
          <div className="rounded-lg bg-indigo-50 p-3.5 text-sm text-indigo-700">
            {t("description")}
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-rose-50 p-3.5 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            {tc("email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder={t("emailPlaceholder")}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            {tc("password")}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder={t("passwordPlaceholder")}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? t("signingIn") : t("signIn")}
        </button>

        <div className="text-center">
          <a
            href="/reset-password"
            className="text-sm text-indigo-600 transition-colors hover:text-indigo-700"
          >
            {t("forgotPassword")}
          </a>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  const t = useTranslations("login");

  return (
    <Suspense
      fallback={
        <div className="animate-fade-in rounded-2xl bg-white/95 p-10 shadow-2xl backdrop-blur-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
              <span className="text-lg font-bold text-white">T</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Talent<span className="text-indigo-600">Flow</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {t("subtitle")}
            </p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
