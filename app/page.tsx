"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserRow = {
  id: number;
  nome: string;
  username: string;
  senha: string;
  tipo: "admin" | "professor" | "aluno";
  aluno_id: number | null;
  professor_id: number | null;
};

export default function Home() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [verificando, setVerificando] = useState(true);

  // 🔥 AUTO LOGIN
  useEffect(() => {
    const userString = localStorage.getItem("auth_user");

    if (userString) {
      const user = JSON.parse(userString);

      if (user.tipo === "admin") {
        router.push("/admin");
        return;
      }

      if (user.tipo === "professor") {
        router.push("/professor");
        return;
      }

      if (user.tipo === "aluno") {
        router.push("/aluno");
        return;
      }
    }

    setVerificando(false);
  }, [router]);

  async function handleLogin() {
    const usuarioLimpo = usuario.trim();
    const senhaLimpa = senha.trim();

    if (!usuarioLimpo || !senhaLimpa) {
      alert("Digite usuário e senha.");
      return;
    }

    setEntrando(true);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .ilike("username", usuarioLimpo);

    setEntrando(false);

    if (error) {
      console.error(error);
      alert(`Erro no login: ${error.message}`);
      return;
    }

    const user = (data || []).find(
      (item) =>
        item.username?.toLowerCase() === usuarioLimpo.toLowerCase() &&
        item.senha === senhaLimpa
    ) as UserRow | undefined;

    if (!user) {
      alert("Usuário ou senha inválidos.");
      return;
    }

    localStorage.setItem(
      "auth_user",
      JSON.stringify({
        id: user.id,
        nome: user.nome,
        username: user.username,
        tipo: user.tipo,
        aluno_id: user.aluno_id,
        professor_id: user.professor_id,
      })
    );

    if (user.tipo === "admin") {
      router.push("/admin");
      return;
    }

    if (user.tipo === "professor") {
      router.push("/professor");
      return;
    }

    if (user.tipo === "aluno") {
      router.push("/aluno");
      return;
    }

    alert("Tipo de usuário inválido.");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleLogin();
    }
  }

  // 🔥 enquanto verifica login salvo
  if (verificando) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl border border-zinc-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            Acompanhamento de Alunos
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Entre com seu usuário e senha
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Usuário
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Senha
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={entrando}
            className="w-full rounded-xl bg-zinc-900 py-3 text-white font-semibold"
          >
            {entrando ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    </main>
  );
}