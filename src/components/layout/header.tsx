"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />

      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <span className="font-medium">
            {session?.user?.firstName} {session?.user?.lastName}
          </span>
          <span className="text-xs text-gray-500">
            {session?.user?.role === "admin" ? "Admin" : "Danışman"}
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-10 mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
            <a
              href="/settings/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Profil
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
