"use client";

import { useRouter } from "next/navigation";

export default function Header({ title }: { title: string }) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("auth_user");
    router.push("/");
  }

  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>

      <button
        onClick={handleLogout}
        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Sair
      </button>
    </div>
  );
}