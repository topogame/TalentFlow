"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
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
      setError("Geçersiz e-posta veya şifre.");
      return;
    }

    router.push("/dashboard");
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
          Aday Veri Tabanı ve Süreç Yönetim Sistemi
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            E-posta
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="email@firma.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            Şifre
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="********"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>

        <div className="text-center">
          <a
            href="/reset-password"
            className="text-sm text-indigo-600 transition-colors hover:text-indigo-700"
          >
            Şifremi Unuttum
          </a>
        </div>
      </form>
    </div>
  );
}
