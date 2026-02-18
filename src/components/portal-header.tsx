"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/portal", label: "Başvurularım" },
  { href: "/portal/profile", label: "Profilim" },
  { href: "/portal/emails", label: "E-postalarım" },
];

export function PortalHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/portal" className="text-lg font-bold text-slate-900">
            TalentFlow
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/portal"
                  ? pathname === "/portal"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {session?.user?.name && (
            <span className="hidden text-sm text-slate-600 sm:block">
              {session.user.name}
            </span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/portal/login" })}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Çıkış
          </button>
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="flex border-t sm:hidden">
        {navItems.map((item) => {
          const isActive =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 py-2 text-center text-xs font-medium transition-colors ${
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
