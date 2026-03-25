"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/lib/components/Header";
import { supabase } from "@/lib/supabase";

type AuthUser = {
  id: number;
  nome: string;
  username: string;
  tipo: "professor";
  professor_id: number | null;
  aluno_id: number | null;
};

type Professor = {
  id: number;
  nome: string;
  telefone: string;
  comum_id: number | null;
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

type Comum = {
  id: number;
  nome: string;
};

const vozes = ["soprano", "contralto", "tenor", "baixo"];

export default function ProfessorPage() {
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);

  const [professorLogadoId, setProfessorLogadoId] = useState<number | null>(null);
  const [nomeProfessor, setNomeProfessor] = useState("");
  const [comumId, setComumId] = useState<number | null>(null);
  const [nomeComum, setNomeComum] = useState("");

  const [professoresDaComum, setProfessoresDaComum] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  const [nomeAluno, setNomeAluno] = useState("");
  const [instrumentoAluno, setInstrumentoAluno] = useState("");
  const [vozPrincipalAluno, setVozPrincipalAluno] = useState("");
  const [vozAlternativaAluno, setVozAlternativaAluno] = useState("");
  const [responsavelAluno, setResponsavelAluno] = useState("");
  const [telefoneAluno, setTelefoneAluno] = useState("");
  const [professorIdAluno, setProfessorIdAluno] = useState("");
  const [salvandoAluno, setSalvandoAluno] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editInstrumento, setEditInstrumento] = useState("");
  const [editVozPrincipal, setEditVozPrincipal] = useState("");
  const [editVozAlternativa, setEditVozAlternativa] = useState("");
  const [editResponsavel, setEditResponsavel] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editProfessorId, setEditProfessorId] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  useEffect(() => {
    async function carregarTelaProfessor() {
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
      setProfessorLogadoId(user.professor_id);

      const { data: professor, error: erroProfessor } = await supabase
        .from("professores")
        .select("*")
        .eq("id", user.professor_id)
        .single();

      if (erroProfessor || !professor) {
        console.error(erroProfessor);
        alert(`Erro ao buscar professor: ${erroProfessor?.message}`);
        setCarregando(false);
        return;
      }

      setNomeProfessor(professor.nome || "");

      if (!professor.comum_id) {
        setNomeComum("Sem comum definida");
        setComumId(null);
        setProfessoresDaComum([]);
        setAlunos([]);
        setCarregando(false);
        return;
      }

      setComumId(professor.comum_id);

      const { data: comum, error: erroComum } = await supabase
        .from("comuns")
        .select("*")
        .eq("id", professor.comum_id)
        .single();

      if (erroComum) {
        console.error(erroComum);
      }

      setNomeComum(comum?.nome || "Comum não encontrada");

      const { data: professores, error: erroProfessoresDaComum } = await supabase
        .from("professores")
        .select("*")
        .eq("comum_id", professor.comum_id)
        .order("nome", { ascending: true });

      if (erroProfessoresDaComum) {
        console.error(erroProfessoresDaComum);
        alert(`Erro ao buscar professores da comum: ${erroProfessoresDaComum.message}`);
        setCarregando(false);
        return;
      }

      setProfessoresDaComum(professores || []);

      const { data: alunosDaComum, error: erroAlunos } = await supabase
        .from("alunos")
        .select("*")
        .eq("comum_id", professor.comum_id)
        .order("nome", { ascending: true });

      if (erroAlunos) {
        console.error(erroAlunos);
        alert(`Erro ao buscar alunos: ${erroAlunos.message}`);
        setCarregando(false);
        return;
      }

      setAlunos(alunosDaComum || []);
      setCarregando(false);
    }

    carregarTelaProfessor();
  }, [router]);

  function limparFormularioAluno() {
    setNomeAluno("");
    setInstrumentoAluno("");
    setVozPrincipalAluno("");
    setVozAlternativaAluno("");
    setResponsavelAluno("");
    setTelefoneAluno("");
    setProfessorIdAluno("");
  }

  async function recarregarAlunosDaComum() {
    if (!comumId) return;

    const { data, error } = await supabase
      .from("alunos")
      .select("*")
      .eq("comum_id", comumId)
      .order("nome", { ascending: true });

    if (error) {
      console.error(error);
      alert(`Erro ao atualizar alunos: ${error.message}`);
      return;
    }

    setAlunos(data || []);
  }

  async function criarAluno() {
    if (
      !nomeAluno.trim() ||
      !instrumentoAluno.trim() ||
      !vozPrincipalAluno ||
      !vozAlternativaAluno ||
      !responsavelAluno.trim() ||
      !telefoneAluno.trim() ||
      !professorIdAluno ||
      !comumId
    ) {
      alert("Preencha todos os campos do aluno.");
      return;
    }

    setSalvandoAluno(true);

    const { error } = await supabase.from("alunos").insert([
      {
        nome: nomeAluno.trim(),
        instrumento: instrumentoAluno.trim(),
        voz_principal: vozPrincipalAluno,
        voz_alternativa: vozAlternativaAluno,
        responsavel: responsavelAluno.trim(),
        telefone: telefoneAluno.trim(),
        professor_id: Number(professorIdAluno),
        comum_id: comumId,
      },
    ]);

    setSalvandoAluno(false);

    if (error) {
      console.error(error);
      alert(`Erro ao criar aluno: ${error.message}`);
      return;
    }

    limparFormularioAluno();
    await recarregarAlunosDaComum();
    alert("Aluno criado com sucesso.");
  }

  function iniciarEdicao(aluno: Aluno) {
    setEditandoId(aluno.id);
    setEditNome(aluno.nome || "");
    setEditInstrumento(aluno.instrumento || "");
    setEditVozPrincipal(aluno.voz_principal || "");
    setEditVozAlternativa(aluno.voz_alternativa || "");
    setEditResponsavel(aluno.responsavel || "");
    setEditTelefone(aluno.telefone || "");
    setEditProfessorId(aluno.professor_id ? String(aluno.professor_id) : "");
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setEditNome("");
    setEditInstrumento("");
    setEditVozPrincipal("");
    setEditVozAlternativa("");
    setEditResponsavel("");
    setEditTelefone("");
    setEditProfessorId("");
  }

  async function salvarEdicao(id: number) {
    if (
      !editNome.trim() ||
      !editInstrumento.trim() ||
      !editVozPrincipal ||
      !editVozAlternativa ||
      !editResponsavel.trim() ||
      !editTelefone.trim() ||
      !editProfessorId ||
      !comumId
    ) {
      alert("Preencha todos os campos da edição.");
      return;
    }

    setSalvandoEdicao(true);

    const { error } = await supabase
      .from("alunos")
      .update({
        nome: editNome.trim(),
        instrumento: editInstrumento.trim(),
        voz_principal: editVozPrincipal,
        voz_alternativa: editVozAlternativa,
        responsavel: editResponsavel.trim(),
        telefone: editTelefone.trim(),
        professor_id: Number(editProfessorId),
        comum_id: comumId,
      })
      .eq("id", id);

    setSalvandoEdicao(false);

    if (error) {
      console.error(error);
      alert(`Erro ao editar aluno: ${error.message}`);
      return;
    }

    cancelarEdicao();
    await recarregarAlunosDaComum();
    alert("Aluno atualizado com sucesso.");
  }

  async function excluirAluno(id: number, nome: string) {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir o aluno "${nome}"?\n\nIsso também vai apagar os hinos dele.`
    );

    if (!confirmou) return;

    const { error: erroHinos } = await supabase
      .from("aluno_hinos")
      .delete()
      .eq("aluno_id", id);

    if (erroHinos) {
      console.error(erroHinos);
      alert(`Erro ao apagar hinos do aluno: ${erroHinos.message}`);
      return;
    }

    const { error: erroTarefasExtras } = await supabase
      .from("aluno_tarefas_extras")
      .delete()
      .eq("aluno_id", id);

    if (erroTarefasExtras) {
      console.error(erroTarefasExtras);
      alert(`Erro ao apagar tarefas do aluno: ${erroTarefasExtras.message}`);
      return;
    }

    const { error: erroAluno } = await supabase
      .from("alunos")
      .delete()
      .eq("id", id);

    if (erroAluno) {
      console.error(erroAluno);
      alert(`Erro ao excluir aluno: ${erroAluno.message}`);
      return;
    }

    await recarregarAlunosDaComum();
    alert("Aluno excluído com sucesso.");
  }

  function nomeProfessorResponsavel(id: number | null) {
    if (!id) return "—";
    const professor = professoresDaComum.find((p) => p.id === id);
    return professor ? professor.nome : "Professor não encontrado";
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-zinc-100 p-6">
        <div className="mx-auto max-w-5xl">
          <Header title="Painel do Professor" />

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-zinc-600">Carregando alunos da comum...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-6">
      <div className="mx-auto max-w-5xl">
        <Header title="Painel do Professor" />

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900">Meus Dados</h1>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Professor
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {nomeProfessor || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Comum
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {nomeComum || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Total de alunos
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {alunos.length}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-zinc-900">
            Cadastrar aluno
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-zinc-700">Nome</label>
              <input
                value={nomeAluno}
                onChange={(e) => setNomeAluno(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700">
                Instrumento
              </label>
              <input
                value={instrumentoAluno}
                onChange={(e) => setInstrumentoAluno(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700">
                Voz principal
              </label>
              <select
                value={vozPrincipalAluno}
                onChange={(e) => setVozPrincipalAluno(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
              >
                <option value="">Selecione a voz principal</option>
                {vozes.map((voz) => (
                  <option key={voz} value={voz}>
                    {voz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700">
                Voz alternativa
              </label>
              <select
                value={vozAlternativaAluno}
                onChange={(e) => setVozAlternativaAluno(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
              >
                <option value="">Selecione a voz alternativa</option>
                {vozes.map((voz) => (
                  <option key={voz} value={voz}>
                    {voz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700">
                Responsável
              </label>
              <input
                value={responsavelAluno}
                onChange={(e) => setResponsavelAluno(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700">
                Telefone
              </label>
              <input
                value={telefoneAluno}
                onChange={(e) => setTelefoneAluno(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-zinc-700">
                Professor responsável
              </label>
              <select
                value={professorIdAluno}
                onChange={(e) => setProfessorIdAluno(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
              >
                <option value="">Selecione um professor</option>
                {professoresDaComum.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={criarAluno}
            disabled={salvandoAluno}
            className="mt-5 w-full rounded-xl bg-black p-3 font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
          >
            {salvandoAluno ? "Salvando..." : "Salvar aluno"}
          </button>
        </div>

        {alunos.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-zinc-600">
              Nenhum aluno encontrado para a sua comum.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alunos.map((aluno) => {
              const estaEditando = editandoId === aluno.id;

              return (
                <div
                  key={aluno.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  {!estaEditando ? (
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
                          {aluno.nome}
                        </h2>

                        <div className="mt-3 space-y-1 text-sm text-zinc-600">
                          <p>Instrumento: {aluno.instrumento || "—"}</p>
                          <p>Voz principal: {aluno.voz_principal || "—"}</p>
                          <p>Voz alternativa: {aluno.voz_alternativa || "—"}</p>
                          <p>Responsável: {aluno.responsavel || "—"}</p>
                          <p>Telefone: {aluno.telefone || "—"}</p>
                          <p>
                            Professor responsável:{" "}
                            {nomeProfessorResponsavel(aluno.professor_id)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/professor/aluno/${aluno.id}`}
                          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                        >
                          Ver ficha
                        </Link>

                        <button
                          onClick={() => iniciarEdicao(aluno)}
                          className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => excluirAluno(aluno.id, aluno.nome)}
                          className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="mb-4 text-xl font-semibold text-zinc-900">
                        Editando aluno
                      </h2>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-zinc-700">
                            Nome
                          </label>
                          <input
                            value={editNome}
                            onChange={(e) => setEditNome(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-zinc-700">
                            Instrumento
                          </label>
                          <input
                            value={editInstrumento}
                            onChange={(e) => setEditInstrumento(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-zinc-700">
                            Voz principal
                          </label>
                          <select
                            value={editVozPrincipal}
                            onChange={(e) => setEditVozPrincipal(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                          >
                            <option value="">Selecione a voz principal</option>
                            {vozes.map((voz) => (
                              <option key={voz} value={voz}>
                                {voz}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-zinc-700">
                            Voz alternativa
                          </label>
                          <select
                            value={editVozAlternativa}
                            onChange={(e) => setEditVozAlternativa(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                          >
                            <option value="">Selecione a voz alternativa</option>
                            {vozes.map((voz) => (
                              <option key={voz} value={voz}>
                                {voz}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-zinc-700">
                            Responsável
                          </label>
                          <input
                            value={editResponsavel}
                            onChange={(e) => setEditResponsavel(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-zinc-700">
                            Telefone
                          </label>
                          <input
                            value={editTelefone}
                            onChange={(e) => setEditTelefone(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-zinc-700">
                            Professor responsável
                          </label>
                          <select
                            value={editProfessorId}
                            onChange={(e) => setEditProfessorId(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                          >
                            <option value="">Selecione um professor</option>
                            {professoresDaComum.map((professor) => (
                              <option key={professor.id} value={professor.id}>
                                {professor.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <button
                          onClick={() => salvarEdicao(aluno.id)}
                          disabled={salvandoEdicao}
                          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
                        >
                          {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
                        </button>

                        <button
                          onClick={cancelarEdicao}
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
          </div>
        )}
      </div>
    </main>
  );
}