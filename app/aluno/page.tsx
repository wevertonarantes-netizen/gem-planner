"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/lib/components/Header";
import { supabase } from "@/lib/supabase";

type AuthUser = {
  id: number;
  nome: string;
  username: string;
  tipo: "aluno";
  professor_id: number | null;
  aluno_id: number | null;
};

type Aluno = {
  id: number;
  nome: string;
  instrumento: string;
  voz_principal: string;
  voz_alternativa: string;
  responsavel: string;
  telefone: string;
  professor_id: number | null;
  comum_id: number | null;
};

type TarefaExtra = {
  id: number;
  aluno_id: number;
  tipo: "hino" | "metodo";
  titulo: string;
  concluido_em: string | null;
  soprano: string | null;
  contralto: string | null;
  tenor: string | null;
  baixo: string | null;
  created_at?: string;
};

type FiltroStatus = "todos" | "pendentes" | "concluidos";
type FiltroTipo = "todos" | "hino" | "metodo";

function normalizarVoz(valor: string | null | undefined) {
  return (valor || "").trim().toLowerCase();
}

function dataDaVozExtra(tarefa: TarefaExtra, voz: string) {
  const vozNormalizada = normalizarVoz(voz);

  if (vozNormalizada === "soprano") return tarefa.soprano;
  if (vozNormalizada === "contralto") return tarefa.contralto;
  if (vozNormalizada === "tenor") return tarefa.tenor;
  if (vozNormalizada === "baixo") return tarefa.baixo;

  return null;
}

function tarefaExtraConcluida(tarefa: TarefaExtra, aluno: Aluno | null) {
  if (tarefa.tipo === "metodo") {
    return Boolean(tarefa.concluido_em);
  }

  if (!aluno) return false;

  const dataPrincipal = dataDaVozExtra(tarefa, aluno.voz_principal);
  const dataAlternativa = dataDaVozExtra(tarefa, aluno.voz_alternativa);

  return Boolean(dataPrincipal && dataAlternativa);
}

function formatarData(data: string | null) {
  if (!data) return "dd/mm/aaaa";

  const partes = data.split("-");
  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export default function AlunoPage() {
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [tarefasExtras, setTarefasExtras] = useState<TarefaExtra[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todos");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");

  useEffect(() => {
    async function carregarTelaAluno() {
      const userString = localStorage.getItem("auth_user");

      if (!userString) {
        router.push("/");
        return;
      }

      const user = JSON.parse(userString) as AuthUser;

      if (user.tipo !== "aluno" || !user.aluno_id) {
        router.push("/");
        return;
      }

      setCarregando(true);

      const { data: alunoData, error: erroAluno } = await supabase
        .from("alunos")
        .select("*")
        .eq("id", user.aluno_id)
        .single();

      if (erroAluno || !alunoData) {
        console.error(erroAluno);
        setCarregando(false);
        return;
      }

      setAluno(alunoData);

      const { data: extrasData, error: erroExtras } = await supabase
        .from("aluno_tarefas_extras")
        .select("*")
        .eq("aluno_id", user.aluno_id)
        .order("id", { ascending: true });

      if (erroExtras) {
        console.error(erroExtras);
        setCarregando(false);
        return;
      }

      setTarefasExtras((extrasData || []) as TarefaExtra[]);
      setCarregando(false);
    }

    carregarTelaAluno();
  }, [router]);

  const totalGeral = tarefasExtras.length;
  const totalHinos = tarefasExtras.filter((tarefa) => tarefa.tipo === "hino").length;
  const totalMetodos = tarefasExtras.filter((tarefa) => tarefa.tipo === "metodo").length;
  const totalPassados = tarefasExtras.filter((tarefa) =>
    tarefaExtraConcluida(tarefa, aluno)
  ).length;
  const totalPendentes = totalGeral - totalPassados;

  const tarefasFiltradas = useMemo(() => {
    return tarefasExtras.filter((tarefa) => {
      const concluida = tarefaExtraConcluida(tarefa, aluno);

      if (filtroStatus === "pendentes" && concluida) return false;
      if (filtroStatus === "concluidos" && !concluida) return false;

      if (filtroTipo === "hino" && tarefa.tipo !== "hino") return false;
      if (filtroTipo === "metodo" && tarefa.tipo !== "metodo") return false;

      return true;
    });
  }, [filtroStatus, filtroTipo, tarefasExtras, aluno]);

  if (carregando) {
    return (
      <main className="min-h-screen bg-zinc-100 p-6">
        <div className="mx-auto max-w-4xl">
          <Header title="Painel do Aluno" />

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-zinc-600">Carregando sua ficha...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!aluno) {
    return (
      <main className="min-h-screen bg-zinc-100 p-6">
        <div className="mx-auto max-w-4xl">
          <Header title="Painel do Aluno" />

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-zinc-600">Aluno não encontrado.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-6">
      <div className="mx-auto max-w-4xl">
        <Header title="Painel do Aluno" />

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Minha ficha</p>
              <h1 className="mt-1 text-2xl font-bold text-zinc-900">
                {aluno.nome}
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-zinc-50 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Total
                </p>
                <p className="mt-1 text-xl font-bold text-zinc-900">
                  {totalGeral}
                </p>
              </div>

              <div className="rounded-xl bg-green-50 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-green-700">
                  Passados
                </p>
                <p className="mt-1 text-xl font-bold text-green-700">
                  {totalPassados}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-amber-700">
                  Faltando
                </p>
                <p className="mt-1 text-xl font-bold text-amber-700">
                  {totalPendentes}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Instrumento
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {aluno.instrumento || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Voz principal
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {aluno.voz_principal || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Voz alternativa
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {aluno.voz_alternativa || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Responsável
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {aluno.responsavel || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            Passado = voz principal + voz alternativa preenchidas
          </div>
          <div className="rounded-full bg-zinc-200 px-3 py-1 text-sm font-medium text-zinc-700">
            Método usa apenas uma data de conclusão
          </div>
        </div>

        <div className="mb-3">
          <p className="mb-2 text-sm font-semibold text-zinc-700">Filtrar por status</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroStatus("todos")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filtroStatus === "todos"
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              Todos ({totalGeral})
            </button>

            <button
              onClick={() => setFiltroStatus("pendentes")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filtroStatus === "pendentes"
                  ? "bg-amber-500 text-white"
                  : "bg-white text-amber-700 border border-amber-300 hover:bg-amber-50"
              }`}
            >
              Pendentes ({totalPendentes})
            </button>

            <button
              onClick={() => setFiltroStatus("concluidos")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filtroStatus === "concluidos"
                  ? "bg-green-600 text-white"
                  : "bg-white text-green-700 border border-green-300 hover:bg-green-50"
              }`}
            >
              Concluídos ({totalPassados})
            </button>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-zinc-700">Filtrar por tipo</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroTipo("todos")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filtroTipo === "todos"
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              Todos ({totalGeral})
            </button>

            <button
              onClick={() => setFiltroTipo("hino")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filtroTipo === "hino"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
              }`}
            >
              Hinos ({totalHinos})
            </button>

            <button
              onClick={() => setFiltroTipo("metodo")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filtroTipo === "metodo"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-purple-700 border border-purple-300 hover:bg-purple-50"
              }`}
            >
              Lição de método ({totalMetodos})
            </button>
          </div>
        </div>

        {tarefasFiltradas.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-zinc-600">
              Nenhuma tarefa encontrada nesse filtro.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tarefasFiltradas.map((tarefa) => {
              const passou = tarefaExtraConcluida(tarefa, aluno);

              return (
                <div
                  key={tarefa.id}
                  className={`rounded-2xl border p-5 shadow-sm transition ${
                    passou
                      ? "border-green-200 bg-green-50"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        {tarefa.tipo === "hino" ? "Hino" : "Lição de método"}
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-zinc-900">
                        {tarefa.titulo}
                      </h2>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                        passou
                          ? "bg-green-600 text-white"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {passou ? "Passado" : "Pendente"}
                    </span>
                  </div>

                  {tarefa.tipo === "hino" ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Soprano
                        </p>
                        <div className="mt-2 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900">
                          {formatarData(tarefa.soprano)}
                        </div>
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Contralto
                        </p>
                        <div className="mt-2 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900">
                          {formatarData(tarefa.contralto)}
                        </div>
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Tenor
                        </p>
                        <div className="mt-2 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900">
                          {formatarData(tarefa.tenor)}
                        </div>
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Baixo
                        </p>
                        <div className="mt-2 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900">
                          {formatarData(tarefa.baixo)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Data de conclusão
                      </p>
                      <div className="mt-2 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900">
                        {formatarData(tarefa.concluido_em)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}