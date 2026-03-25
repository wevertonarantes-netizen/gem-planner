"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/lib/components/Header";
import Toast from "@/lib/components/Toast";
import { supabase } from "@/lib/supabase";

type AuthUser = {
  id: number;
  nome: string;
  username: string;
  tipo: "professor";
  professor_id: number | null;
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

type Professor = {
  id: number;
  nome: string;
  telefone: string;
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

type DateFieldProps = {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
};

function DateField({ label, value, onChange }: DateFieldProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 sm:p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
        />

        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}

export default function FichaAlunoPage() {
  const router = useRouter();
  const params = useParams();
  const alunoId = Number(params.id);

  const [carregando, setCarregando] = useState(true);

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [professorLogado, setProfessorLogado] = useState<Professor | null>(null);

  const [tarefasExtras, setTarefasExtras] = useState<TarefaExtra[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todos");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");

  const [tipoNovaTarefa, setTipoNovaTarefa] = useState<"hino" | "metodo">("hino");
  const [tituloNovaTarefa, setTituloNovaTarefa] = useState("");
  const [salvandoNovaTarefa, setSalvandoNovaTarefa] = useState(false);
  const [salvandoCampo, setSalvandoCampo] = useState(false);

  const [editandoTarefaId, setEditandoTarefaId] = useState<number | null>(null);
  const [editTituloTarefa, setEditTituloTarefa] = useState("");
  const [editTipoTarefa, setEditTipoTarefa] = useState<"hino" | "metodo">("hino");
  const [salvandoEdicaoTarefa, setSalvandoEdicaoTarefa] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(
    message: string,
    type: "success" | "error" | "info" = "info"
  ) {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  }

  useEffect(() => {
    async function carregarPagina() {
      const userString = localStorage.getItem("auth_user");

      if (!userString) {
        router.push("/");
        return;
      }

      const user = JSON.parse(userString) as AuthUser;

      if (user.tipo !== "professor" || !user.professor_id) {
        router.push("/");
        return;
      }

      setCarregando(true);

      const { data: professorData, error: erroProfessor } = await supabase
        .from("professores")
        .select("*")
        .eq("id", user.professor_id)
        .single();

      if (erroProfessor || !professorData) {
        console.error(erroProfessor);
        showToast(
          `Erro ao buscar professor logado: ${erroProfessor?.message || "erro"}`,
          "error"
        );
        setCarregando(false);
        return;
      }

      setProfessorLogado(professorData);

      const { data: alunoData, error: erroAluno } = await supabase
        .from("alunos")
        .select("*")
        .eq("id", alunoId)
        .single();

      if (erroAluno || !alunoData) {
        console.error(erroAluno);
        showToast(`Erro ao buscar aluno: ${erroAluno?.message || "erro"}`, "error");
        setCarregando(false);
        return;
      }

      if (
        professorData.comum_id &&
        alunoData.comum_id &&
        professorData.comum_id !== alunoData.comum_id
      ) {
        showToast("Você não tem acesso a esse aluno.", "error");
        router.push("/professor");
        return;
      }

      setAluno(alunoData);

      const { data: extrasData, error: erroExtras } = await supabase
        .from("aluno_tarefas_extras")
        .select("*")
        .eq("aluno_id", alunoId)
        .order("id", { ascending: true });

      if (erroExtras) {
        console.error(erroExtras);
        showToast(`Erro ao buscar tarefas extras: ${erroExtras.message}`, "error");
        setCarregando(false);
        return;
      }

      setTarefasExtras((extrasData || []) as TarefaExtra[]);
      setCarregando(false);
    }

    if (!Number.isNaN(alunoId)) {
      carregarPagina();
    }
  }, [alunoId, router]);

  async function criarTarefaExtra() {
    if (!aluno) return;

    if (!tituloNovaTarefa.trim()) {
      showToast("Digite o nome da tarefa.", "error");
      return;
    }

    setSalvandoNovaTarefa(true);

    const { data, error } = await supabase
      .from("aluno_tarefas_extras")
      .insert([
        {
          aluno_id: aluno.id,
          tipo: tipoNovaTarefa,
          titulo: tituloNovaTarefa.trim(),
          concluido_em: null,
          soprano: null,
          contralto: null,
          tenor: null,
          baixo: null,
        },
      ])
      .select()
      .single();

    setSalvandoNovaTarefa(false);

    if (error) {
      console.error(error);
      showToast(`Erro ao criar tarefa: ${error.message}`, "error");
      return;
    }

    setTituloNovaTarefa("");
    setTipoNovaTarefa("hino");
    setTarefasExtras((prev) => [...prev, data as TarefaExtra]);
    showToast("Tarefa criada com sucesso.", "success");
  }

  async function salvarCampoTarefaExtra(
    tarefaId: number,
    campo: "concluido_em" | "soprano" | "contralto" | "tenor" | "baixo",
    valor: string
  ) {
    const valorFinal = valor || null;

    setSalvandoCampo(true);

    const { error } = await supabase
      .from("aluno_tarefas_extras")
      .update({ [campo]: valorFinal })
      .eq("id", tarefaId);

    setSalvandoCampo(false);

    if (error) {
      console.error(error);
      showToast(`Erro ao salvar tarefa: ${error.message}`, "error");
      return;
    }

    setTarefasExtras((prev) =>
      prev.map((tarefa) =>
        tarefa.id === tarefaId ? { ...tarefa, [campo]: valorFinal } : tarefa
      )
    );

    showToast("Data salva com sucesso.", "success");
  }

  function iniciarEdicaoTarefa(tarefa: TarefaExtra) {
    setEditandoTarefaId(tarefa.id);
    setEditTituloTarefa(tarefa.titulo);
    setEditTipoTarefa(tarefa.tipo);
  }

  function cancelarEdicaoTarefa() {
    setEditandoTarefaId(null);
    setEditTituloTarefa("");
    setEditTipoTarefa("hino");
  }

  async function salvarEdicaoTarefa(id: number) {
    if (!editTituloTarefa.trim()) {
      showToast("Digite o nome da tarefa.", "error");
      return;
    }

    setSalvandoEdicaoTarefa(true);

    const tarefaAtual = tarefasExtras.find((t) => t.id === id);

    if (!tarefaAtual) {
      setSalvandoEdicaoTarefa(false);
      showToast("Tarefa não encontrada.", "error");
      return;
    }

    const vaiVirarMetodo = editTipoTarefa === "metodo";
    const vaiVirarHino = editTipoTarefa === "hino";

    const payload: Partial<TarefaExtra> = {
      titulo: editTituloTarefa.trim(),
      tipo: editTipoTarefa,
    };

    if (vaiVirarMetodo && tarefaAtual.tipo === "hino") {
      payload.soprano = null;
      payload.contralto = null;
      payload.tenor = null;
      payload.baixo = null;
    }

    if (vaiVirarHino && tarefaAtual.tipo === "metodo") {
      payload.concluido_em = null;
    }

    const { error } = await supabase
      .from("aluno_tarefas_extras")
      .update(payload)
      .eq("id", id);

    setSalvandoEdicaoTarefa(false);

    if (error) {
      console.error(error);
      showToast(`Erro ao editar tarefa: ${error.message}`, "error");
      return;
    }

    setTarefasExtras((prev) =>
      prev.map((tarefa) =>
        tarefa.id === id
          ? {
              ...tarefa,
              ...payload,
            }
          : tarefa
      )
    );

    cancelarEdicaoTarefa();
    showToast("Tarefa atualizada com sucesso.", "success");
  }

  async function excluirTarefaExtra(id: number, titulo: string) {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir a tarefa "${titulo}"?`
    );

    if (!confirmou) return;

    const { error } = await supabase
      .from("aluno_tarefas_extras")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      showToast(`Erro ao excluir tarefa: ${error.message}`, "error");
      return;
    }

    setTarefasExtras((prev) => prev.filter((tarefa) => tarefa.id !== id));
    showToast("Tarefa excluída com sucesso.", "success");
  }

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
      <main className="min-h-screen bg-zinc-100 px-4 py-5 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-5xl">
          <Header title="Painel do Professor" />
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
            <p className="text-zinc-600">Carregando ficha do aluno...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!aluno) {
    return (
      <main className="min-h-screen bg-zinc-100 px-4 py-5 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-5xl">
          <Header title="Painel do Professor" />
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
            <p className="text-zinc-600">Aluno não encontrado.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-5 sm:px-6 sm:py-6">
      <Toast message={toastMessage} type={toastType} visible={toastVisible} />

      <div className="mx-auto max-w-5xl">
        <Header title="Painel do Professor" />

        <div className="mb-4">
          <button
            onClick={() => router.push("/professor")}
            className="inline-flex items-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
          >
            ← Voltar
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Ficha do aluno</p>
              <h1 className="mt-1 text-2xl font-bold text-zinc-900">
                {aluno.nome}
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl bg-zinc-50 px-3 py-3 sm:px-4 text-center">
                <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                  Total
                </p>
                <p className="mt-1 text-lg sm:text-xl font-bold text-zinc-900">
                  {totalGeral}
                </p>
              </div>

              <div className="rounded-xl bg-green-50 px-3 py-3 sm:px-4 text-center">
                <p className="text-[11px] uppercase tracking-wide text-green-700">
                  Passados
                </p>
                <p className="mt-1 text-lg sm:text-xl font-bold text-green-700">
                  {totalPassados}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 px-3 py-3 sm:px-4 text-center">
                <p className="text-[11px] uppercase tracking-wide text-amber-700">
                  Faltando
                </p>
                <p className="mt-1 text-lg sm:text-xl font-bold text-amber-700">
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

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-zinc-900">
            Adicionar tarefa extra
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-zinc-700">Tipo</label>
              <select
                value={tipoNovaTarefa}
                onChange={(e) =>
                  setTipoNovaTarefa(e.target.value as "hino" | "metodo")
                }
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
              >
                <option value="hino">Hino</option>
                <option value="metodo">Lição de método</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700">
                Nome da tarefa
              </label>
              <input
                value={tituloNovaTarefa}
                onChange={(e) => setTituloNovaTarefa(e.target.value)}
                placeholder={
                  tipoNovaTarefa === "hino"
                    ? "Ex: Hino extra 101"
                    : "Ex: Lição 3"
                }
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          <button
            onClick={criarTarefaExtra}
            disabled={salvandoNovaTarefa}
            className="mt-5 w-full rounded-xl bg-black p-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
          >
            {salvandoNovaTarefa ? "Salvando..." : "Salvar tarefa extra"}
          </button>
        </div>

        <div className="space-y-4">
          {tarefasFiltradas.map((tarefa) => {
            const passou = tarefaExtraConcluida(tarefa, aluno);
            const estaEditando = editandoTarefaId === tarefa.id;

            return (
              <div
                key={tarefa.id}
                className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition ${
                  passou
                    ? "border-green-200 bg-green-50"
                    : "border-zinc-200 bg-white"
                }`}
              >
                {!estaEditando ? (
                  <>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                          {tarefa.tipo === "hino" ? "Hino extra" : "Lição de método"}
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-zinc-900">
                          {tarefa.titulo}
                        </h2>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                            passou
                              ? "bg-green-600 text-white"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {passou ? "Passado" : "Pendente"}
                        </span>

                        <button
                          onClick={() => iniciarEdicaoTarefa(tarefa)}
                          className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => excluirTarefaExtra(tarefa.id, tarefa.titulo)}
                          className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>

                    {tarefa.tipo === "hino" ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <DateField
                          label="Soprano"
                          value={tarefa.soprano}
                          onChange={(value) =>
                            salvarCampoTarefaExtra(tarefa.id, "soprano", value)
                          }
                        />

                        <DateField
                          label="Contralto"
                          value={tarefa.contralto}
                          onChange={(value) =>
                            salvarCampoTarefaExtra(tarefa.id, "contralto", value)
                          }
                        />

                        <DateField
                          label="Tenor"
                          value={tarefa.tenor}
                          onChange={(value) =>
                            salvarCampoTarefaExtra(tarefa.id, "tenor", value)
                          }
                        />

                        <DateField
                          label="Baixo"
                          value={tarefa.baixo}
                          onChange={(value) =>
                            salvarCampoTarefaExtra(tarefa.id, "baixo", value)
                          }
                        />
                      </div>
                    ) : (
                      <div className="mt-4">
                        <DateField
                          label="Data de conclusão"
                          value={tarefa.concluido_em}
                          onChange={(value) =>
                            salvarCampoTarefaExtra(tarefa.id, "concluido_em", value)
                          }
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="mb-4 text-lg font-semibold text-zinc-900">
                      Editando tarefa
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-zinc-700">
                          Tipo
                        </label>
                        <select
                          value={editTipoTarefa}
                          onChange={(e) =>
                            setEditTipoTarefa(e.target.value as "hino" | "metodo")
                          }
                          className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                        >
                          <option value="hino">Hino</option>
                          <option value="metodo">Lição de método</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-zinc-700">
                          Nome da tarefa
                        </label>
                        <input
                          value={editTituloTarefa}
                          onChange={(e) => setEditTituloTarefa(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        onClick={() => salvarEdicaoTarefa(tarefa.id)}
                        disabled={salvandoEdicaoTarefa}
                        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
                      >
                        {salvandoEdicaoTarefa ? "Salvando..." : "Salvar alterações"}
                      </button>

                      <button
                        onClick={cancelarEdicaoTarefa}
                        className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {tarefasFiltradas.length === 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
              <p className="text-zinc-600">
                Nenhuma tarefa encontrada nesse filtro.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}