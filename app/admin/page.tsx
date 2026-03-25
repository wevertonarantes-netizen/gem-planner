"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/lib/components/Header";
import { supabase } from "@/lib/supabase";

type Comum = {
  id: number;
  nome: string;
};

type Professor = {
  id: number;
  nome: string;
  telefone: string;
  comum_id: number | null;
  created_at?: string;
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

type UserRow = {
  id: number;
  nome: string;
  username: string;
  senha: string;
  tipo: "admin" | "professor" | "aluno";
  professor_id: number | null;
  aluno_id: number | null;
};

const vozes = ["soprano", "contralto", "tenor", "baixo"];

export default function AdminPage() {
  const router = useRouter();

  const [authOk, setAuthOk] = useState(false);
  const [verificandoAuth, setVerificandoAuth] = useState(true);

  const [abaAtiva, setAbaAtiva] = useState<"comuns" | "professores" | "alunos">(
    "comuns"
  );

  const [comuns, setComuns] = useState<Comum[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);

  const [carregandoComuns, setCarregandoComuns] = useState(false);
  const [carregandoProfessores, setCarregandoProfessores] = useState(false);
  const [carregandoAlunos, setCarregandoAlunos] = useState(false);

  const [nomeComum, setNomeComum] = useState("");
  const [salvandoComum, setSalvandoComum] = useState(false);

  const [nomeProfessor, setNomeProfessor] = useState("");
  const [telefoneProfessor, setTelefoneProfessor] = useState("");
  const [comumIdProfessor, setComumIdProfessor] = useState("");
  const [usernameProfessor, setUsernameProfessor] = useState("");
  const [senhaProfessor, setSenhaProfessor] = useState("");
  const [salvandoProfessor, setSalvandoProfessor] = useState(false);

  const [nomeAluno, setNomeAluno] = useState("");
  const [instrumentoAluno, setInstrumentoAluno] = useState("");
  const [vozPrincipalAluno, setVozPrincipalAluno] = useState("");
  const [vozAlternativaAluno, setVozAlternativaAluno] = useState("");
  const [responsavelAluno, setResponsavelAluno] = useState("");
  const [telefoneAluno, setTelefoneAluno] = useState("");
  const [professorIdAluno, setProfessorIdAluno] = useState("");
  const [comumIdAluno, setComumIdAluno] = useState("");
  const [usernameAluno, setUsernameAluno] = useState("");
  const [senhaAluno, setSenhaAluno] = useState("");
  const [salvandoAluno, setSalvandoAluno] = useState(false);

  const [editandoComumId, setEditandoComumId] = useState<number | null>(null);
  const [editNomeComum, setEditNomeComum] = useState("");
  const [salvandoEdicaoComum, setSalvandoEdicaoComum] = useState(false);

  const [editandoProfessorId, setEditandoProfessorId] = useState<number | null>(
    null
  );
  const [editNomeProfessor, setEditNomeProfessor] = useState("");
  const [editTelefoneProfessor, setEditTelefoneProfessor] = useState("");
  const [editComumIdProfessor, setEditComumIdProfessor] = useState("");
  const [editUsernameProfessor, setEditUsernameProfessor] = useState("");
  const [editSenhaProfessor, setEditSenhaProfessor] = useState("");
  const [salvandoEdicaoProfessor, setSalvandoEdicaoProfessor] = useState(false);

  const [editandoAlunoId, setEditandoAlunoId] = useState<number | null>(null);
  const [editNomeAluno, setEditNomeAluno] = useState("");
  const [editInstrumentoAluno, setEditInstrumentoAluno] = useState("");
  const [editVozPrincipalAluno, setEditVozPrincipalAluno] = useState("");
  const [editVozAlternativaAluno, setEditVozAlternativaAluno] = useState("");
  const [editResponsavelAluno, setEditResponsavelAluno] = useState("");
  const [editTelefoneAluno, setEditTelefoneAluno] = useState("");
  const [editProfessorIdAluno, setEditProfessorIdAluno] = useState("");
  const [editComumIdAluno, setEditComumIdAluno] = useState("");
  const [editUsernameAluno, setEditUsernameAluno] = useState("");
  const [editSenhaAluno, setEditSenhaAluno] = useState("");
  const [salvandoEdicaoAluno, setSalvandoEdicaoAluno] = useState(false);

  useEffect(() => {
    try {
      const userString = localStorage.getItem("auth_user");

      if (!userString) {
        router.replace("/");
        return;
      }

      const parsed = JSON.parse(userString);

      if (parsed?.tipo !== "admin") {
        router.replace("/");
        return;
      }

      setAuthOk(true);
      carregarTudo();
    } catch (error) {
      console.error("Erro ao validar auth:", error);
      localStorage.removeItem("auth_user");
      router.replace("/");
      return;
    } finally {
      setVerificandoAuth(false);
    }
  }, [router]);

  async function carregarTudo() {
    await Promise.all([
      carregarComuns(),
      carregarProfessores(),
      carregarAlunos(),
      carregarUsers(),
    ]);
  }

  async function carregarComuns() {
    setCarregandoComuns(true);

    const { data, error } = await supabase
      .from("comuns")
      .select("*")
      .order("id", { ascending: true });

    setCarregandoComuns(false);

    if (error) {
      console.error(error);
      alert(`Erro ao buscar comuns: ${error.message}`);
      return;
    }

    setComuns(data || []);
  }

  async function carregarProfessores() {
    setCarregandoProfessores(true);

    const { data, error } = await supabase
      .from("professores")
      .select("*")
      .order("id", { ascending: true });

    setCarregandoProfessores(false);

    if (error) {
      console.error(error);
      alert(`Erro ao buscar professores: ${error.message}`);
      return;
    }

    setProfessores(data || []);
  }

  async function carregarAlunos() {
    setCarregandoAlunos(true);

    const { data, error } = await supabase
      .from("alunos")
      .select("*")
      .order("id", { ascending: true });

    setCarregandoAlunos(false);

    if (error) {
      console.error(error);
      alert(`Erro ao buscar alunos: ${error.message}`);
      return;
    }

    setAlunos(data || []);
  }

  async function carregarUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      alert(`Erro ao buscar usuários: ${error.message}`);
      return;
    }

    setUsers(data || []);
  }

  function limparFormularioComum() {
    setNomeComum("");
  }

  function limparFormularioProfessor() {
    setNomeProfessor("");
    setTelefoneProfessor("");
    setComumIdProfessor("");
    setUsernameProfessor("");
    setSenhaProfessor("");
  }

  function limparFormularioAluno() {
    setNomeAluno("");
    setInstrumentoAluno("");
    setVozPrincipalAluno("");
    setVozAlternativaAluno("");
    setResponsavelAluno("");
    setTelefoneAluno("");
    setProfessorIdAluno("");
    setComumIdAluno("");
    setUsernameAluno("");
    setSenhaAluno("");
  }

  function nomeComumPorId(id: number | null) {
    if (!id) return "—";
    const comum = comuns.find((c) => c.id === id);
    return comum ? comum.nome : "Comum não encontrada";
  }

  function nomeProfessorPorId(id: number | null) {
    if (!id) return "—";
    const professor = professores.find((p) => p.id === id);
    return professor ? professor.nome : "Professor não encontrado";
  }

  function userDoProfessor(professorId: number) {
    return users.find(
      (u) => u.tipo === "professor" && u.professor_id === professorId
    );
  }

  function userDoAluno(alunoId: number) {
    return users.find((u) => u.tipo === "aluno" && u.aluno_id === alunoId);
  }

  async function criarComum() {
    if (!nomeComum.trim()) {
      alert("Digite o nome da comum.");
      return;
    }

    setSalvandoComum(true);

    const { error } = await supabase.from("comuns").insert([
      {
        nome: nomeComum.trim(),
      },
    ]);

    setSalvandoComum(false);

    if (error) {
      console.error(error);
      alert(`Erro ao criar comum: ${error.message}`);
      return;
    }

    limparFormularioComum();
    await carregarComuns();
    alert("Comum criada com sucesso.");
  }

  async function criarProfessor() {
    if (
      !nomeProfessor.trim() ||
      !telefoneProfessor.trim() ||
      !comumIdProfessor ||
      !usernameProfessor.trim() ||
      !senhaProfessor.trim()
    ) {
      alert("Preencha todos os campos do professor.");
      return;
    }

    setSalvandoProfessor(true);

    const { data: professorCriado, error: erroProfessor } = await supabase
      .from("professores")
      .insert([
        {
          nome: nomeProfessor.trim(),
          telefone: telefoneProfessor.trim(),
          comum_id: Number(comumIdProfessor),
        },
      ])
      .select()
      .single();

    if (erroProfessor || !professorCriado) {
      setSalvandoProfessor(false);
      console.error(erroProfessor);
      alert(`Erro ao criar professor: ${erroProfessor?.message}`);
      return;
    }

    const { error: erroUser } = await supabase.from("users").insert([
      {
        nome: nomeProfessor.trim(),
        username: usernameProfessor.trim(),
        senha: senhaProfessor.trim(),
        tipo: "professor",
        professor_id: professorCriado.id,
        aluno_id: null,
      },
    ]);

    setSalvandoProfessor(false);

    if (erroUser) {
      console.error(erroUser);
      alert(
        `Professor criado, mas houve erro ao criar o login: ${erroUser.message}`
      );
      return;
    }

    limparFormularioProfessor();
    await Promise.all([carregarProfessores(), carregarUsers()]);
    alert("Professor e login criados com sucesso.");
  }

  async function criarAluno() {
    if (
      !nomeAluno.trim() ||
      !instrumentoAluno.trim() ||
      !vozPrincipalAluno ||
      !vozAlternativaAluno ||
      !responsavelAluno.trim() ||
      !telefoneAluno.trim() ||
      !comumIdAluno ||
      !usernameAluno.trim() ||
      !senhaAluno.trim()
    ) {
      alert("Preencha os campos obrigatórios do aluno.");
      return;
    }

    setSalvandoAluno(true);

    const { data: alunoCriado, error: erroAluno } = await supabase
      .from("alunos")
      .insert([
        {
          nome: nomeAluno.trim(),
          instrumento: instrumentoAluno.trim(),
          voz_principal: vozPrincipalAluno,
          voz_alternativa: vozAlternativaAluno,
          responsavel: responsavelAluno.trim(),
          telefone: telefoneAluno.trim(),
          professor_id: professorIdAluno ? Number(professorIdAluno) : null,
          comum_id: Number(comumIdAluno),
        },
      ])
      .select()
      .single();

    if (erroAluno || !alunoCriado) {
      setSalvandoAluno(false);
      console.error(erroAluno);
      alert(`Erro ao criar aluno: ${erroAluno?.message}`);
      return;
    }

    const { error: erroUser } = await supabase.from("users").insert([
      {
        nome: nomeAluno.trim(),
        username: usernameAluno.trim(),
        senha: senhaAluno.trim(),
        tipo: "aluno",
        aluno_id: alunoCriado.id,
        professor_id: null,
      },
    ]);

    setSalvandoAluno(false);

    if (erroUser) {
      console.error(erroUser);
      alert(
        `Aluno criado, mas houve erro ao criar o login: ${erroUser.message}`
      );
      return;
    }

    limparFormularioAluno();
    await Promise.all([carregarAlunos(), carregarUsers()]);
    alert("Aluno e login criados com sucesso.");
  }

  function iniciarEdicaoComum(comum: Comum) {
    setEditandoComumId(comum.id);
    setEditNomeComum(comum.nome || "");
  }

  function cancelarEdicaoComum() {
    setEditandoComumId(null);
    setEditNomeComum("");
  }

  async function salvarEdicaoComum(id: number) {
    if (!editNomeComum.trim()) {
      alert("Digite o nome da comum.");
      return;
    }

    setSalvandoEdicaoComum(true);

    const { error } = await supabase
      .from("comuns")
      .update({ nome: editNomeComum.trim() })
      .eq("id", id);

    setSalvandoEdicaoComum(false);

    if (error) {
      console.error(error);
      alert(`Erro ao editar comum: ${error.message}`);
      return;
    }

    cancelarEdicaoComum();
    await carregarComuns();
    alert("Comum atualizada com sucesso.");
  }

  async function excluirComum(id: number, nome: string) {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir a comum "${nome}"?\n\nProfessores e alunos ficarão sem comum.`
    );

    if (!confirmou) return;

    const { error: erroProfessores } = await supabase
      .from("professores")
      .update({ comum_id: null })
      .eq("comum_id", id);

    if (erroProfessores) {
      console.error(erroProfessores);
      alert(
        `Erro ao remover a comum dos professores: ${erroProfessores.message}`
      );
      return;
    }

    const { error: erroAlunos } = await supabase
      .from("alunos")
      .update({ comum_id: null })
      .eq("comum_id", id);

    if (erroAlunos) {
      console.error(erroAlunos);
      alert(`Erro ao remover a comum dos alunos: ${erroAlunos.message}`);
      return;
    }

    const { error: erroComum } = await supabase
      .from("comuns")
      .delete()
      .eq("id", id);

    if (erroComum) {
      console.error(erroComum);
      alert(`Erro ao excluir comum: ${erroComum.message}`);
      return;
    }

    await Promise.all([carregarComuns(), carregarProfessores(), carregarAlunos()]);
    alert("Comum excluída com sucesso.");
  }

  function iniciarEdicaoProfessor(professor: Professor) {
    const user = userDoProfessor(professor.id);

    setEditandoProfessorId(professor.id);
    setEditNomeProfessor(professor.nome || "");
    setEditTelefoneProfessor(professor.telefone || "");
    setEditComumIdProfessor(
      professor.comum_id ? String(professor.comum_id) : ""
    );
    setEditUsernameProfessor(user?.username || "");
    setEditSenhaProfessor(user?.senha || "");
  }

  function cancelarEdicaoProfessor() {
    setEditandoProfessorId(null);
    setEditNomeProfessor("");
    setEditTelefoneProfessor("");
    setEditComumIdProfessor("");
    setEditUsernameProfessor("");
    setEditSenhaProfessor("");
  }

  async function salvarEdicaoProfessor(id: number) {
    if (
      !editNomeProfessor.trim() ||
      !editTelefoneProfessor.trim() ||
      !editUsernameProfessor.trim() ||
      !editSenhaProfessor.trim()
    ) {
      alert("Preencha os campos obrigatórios do professor.");
      return;
    }

    setSalvandoEdicaoProfessor(true);

    const { error: erroProfessor } = await supabase
      .from("professores")
      .update({
        nome: editNomeProfessor.trim(),
        telefone: editTelefoneProfessor.trim(),
        comum_id: editComumIdProfessor ? Number(editComumIdProfessor) : null,
      })
      .eq("id", id);

    if (erroProfessor) {
      setSalvandoEdicaoProfessor(false);
      console.error(erroProfessor);
      alert(`Erro ao editar professor: ${erroProfessor.message}`);
      return;
    }

    const user = userDoProfessor(id);

    if (!user) {
      setSalvandoEdicaoProfessor(false);
      alert("Usuário do professor não encontrado.");
      return;
    }

    const { error: erroUser } = await supabase
      .from("users")
      .update({
        nome: editNomeProfessor.trim(),
        username: editUsernameProfessor.trim(),
        senha: editSenhaProfessor.trim(),
      })
      .eq("id", user.id);

    setSalvandoEdicaoProfessor(false);

    if (erroUser) {
      console.error(erroUser);
      alert(`Erro ao editar login do professor: ${erroUser.message}`);
      return;
    }

    cancelarEdicaoProfessor();
    await Promise.all([carregarProfessores(), carregarUsers(), carregarAlunos()]);
    alert("Professor atualizado com sucesso.");
  }

  async function excluirProfessor(id: number, nome: string) {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir o professor "${nome}"?\n\nOs alunos dele ficarão sem professor responsável.`
    );

    if (!confirmou) return;

    const { error: erroAlunos } = await supabase
      .from("alunos")
      .update({ professor_id: null })
      .eq("professor_id", id);

    if (erroAlunos) {
      console.error(erroAlunos);
      alert(
        `Erro ao remover o professor dos alunos: ${erroAlunos.message}`
      );
      return;
    }

    const { error: erroUser } = await supabase
      .from("users")
      .delete()
      .eq("professor_id", id)
      .eq("tipo", "professor");

    if (erroUser) {
      console.error(erroUser);
      alert(`Erro ao excluir login do professor: ${erroUser.message}`);
      return;
    }

    const { error: erroProfessor } = await supabase
      .from("professores")
      .delete()
      .eq("id", id);

    if (erroProfessor) {
      console.error(erroProfessor);
      alert(`Erro ao excluir professor: ${erroProfessor.message}`);
      return;
    }

    await Promise.all([carregarProfessores(), carregarUsers(), carregarAlunos()]);
    alert("Professor excluído com sucesso.");
  }

  function iniciarEdicaoAluno(aluno: Aluno) {
    const user = userDoAluno(aluno.id);

    setEditandoAlunoId(aluno.id);
    setEditNomeAluno(aluno.nome || "");
    setEditInstrumentoAluno(aluno.instrumento || "");
    setEditVozPrincipalAluno(aluno.voz_principal || "");
    setEditVozAlternativaAluno(aluno.voz_alternativa || "");
    setEditResponsavelAluno(aluno.responsavel || "");
    setEditTelefoneAluno(aluno.telefone || "");
    setEditProfessorIdAluno(aluno.professor_id ? String(aluno.professor_id) : "");
    setEditComumIdAluno(aluno.comum_id ? String(aluno.comum_id) : "");
    setEditUsernameAluno(user?.username || "");
    setEditSenhaAluno(user?.senha || "");
  }

  function cancelarEdicaoAluno() {
    setEditandoAlunoId(null);
    setEditNomeAluno("");
    setEditInstrumentoAluno("");
    setEditVozPrincipalAluno("");
    setEditVozAlternativaAluno("");
    setEditResponsavelAluno("");
    setEditTelefoneAluno("");
    setEditProfessorIdAluno("");
    setEditComumIdAluno("");
    setEditUsernameAluno("");
    setEditSenhaAluno("");
  }

  async function salvarEdicaoAluno(id: number) {
    if (
      !editNomeAluno.trim() ||
      !editInstrumentoAluno.trim() ||
      !editVozPrincipalAluno ||
      !editVozAlternativaAluno ||
      !editResponsavelAluno.trim() ||
      !editTelefoneAluno.trim() ||
      !editComumIdAluno ||
      !editUsernameAluno.trim() ||
      !editSenhaAluno.trim()
    ) {
      alert("Preencha os campos obrigatórios do aluno.");
      return;
    }

    setSalvandoEdicaoAluno(true);

    const { error: erroAluno } = await supabase
      .from("alunos")
      .update({
        nome: editNomeAluno.trim(),
        instrumento: editInstrumentoAluno.trim(),
        voz_principal: editVozPrincipalAluno,
        voz_alternativa: editVozAlternativaAluno,
        responsavel: editResponsavelAluno.trim(),
        telefone: editTelefoneAluno.trim(),
        professor_id: editProfessorIdAluno ? Number(editProfessorIdAluno) : null,
        comum_id: Number(editComumIdAluno),
      })
      .eq("id", id);

    if (erroAluno) {
      setSalvandoEdicaoAluno(false);
      console.error(erroAluno);
      alert(`Erro ao editar aluno: ${erroAluno.message}`);
      return;
    }

    const user = userDoAluno(id);

    if (!user) {
      setSalvandoEdicaoAluno(false);
      alert("Usuário do aluno não encontrado.");
      return;
    }

    const { error: erroUser } = await supabase
      .from("users")
      .update({
        nome: editNomeAluno.trim(),
        username: editUsernameAluno.trim(),
        senha: editSenhaAluno.trim(),
      })
      .eq("id", user.id);

    setSalvandoEdicaoAluno(false);

    if (erroUser) {
      console.error(erroUser);
      alert(`Erro ao editar login do aluno: ${erroUser.message}`);
      return;
    }

    cancelarEdicaoAluno();
    await Promise.all([carregarAlunos(), carregarUsers()]);
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

    const { error: erroUser } = await supabase
      .from("users")
      .delete()
      .eq("aluno_id", id)
      .eq("tipo", "aluno");

    if (erroUser) {
      console.error(erroUser);
      alert(`Erro ao excluir login do aluno: ${erroUser.message}`);
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

    await Promise.all([carregarAlunos(), carregarUsers()]);
    alert("Aluno excluído com sucesso.");
  }

  if (verificandoAuth) {
    return (
      <main className="min-h-screen bg-zinc-100 p-6">
        <div className="mx-auto max-w-6xl">
          <Header title="Painel Admin" />
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-zinc-600">Verificando acesso...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!authOk) {
    return null;
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-6">
      <div className="mx-auto max-w-6xl">
        <Header title="Painel Admin" />

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setAbaAtiva("comuns")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              abaAtiva === "comuns"
                ? "bg-zinc-900 text-white"
                : "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
            }`}
          >
            Comuns
          </button>

          <button
            onClick={() => setAbaAtiva("professores")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              abaAtiva === "professores"
                ? "bg-zinc-900 text-white"
                : "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
            }`}
          >
            Professores
          </button>

          <button
            onClick={() => setAbaAtiva("alunos")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              abaAtiva === "alunos"
                ? "bg-zinc-900 text-white"
                : "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
            }`}
          >
            Alunos
          </button>
        </div>

        {abaAtiva === "comuns" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-zinc-900">
                Cadastrar comum
              </h2>

              <div>
                <label className="text-sm font-medium text-zinc-700">Nome</label>
                <input
                  value={nomeComum}
                  onChange={(e) => setNomeComum(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                />
              </div>

              <button
                onClick={criarComum}
                disabled={salvandoComum}
                className="mt-5 w-full rounded-xl bg-black p-3 font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {salvandoComum ? "Salvando..." : "Salvar comum"}
              </button>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-zinc-900">
                Comuns cadastradas
              </h2>

              {carregandoComuns && (
                <p className="text-zinc-600">Carregando comuns...</p>
              )}

              {!carregandoComuns && comuns.length === 0 && (
                <p className="text-zinc-600">Nenhuma comum cadastrada ainda.</p>
              )}

              <div className="space-y-4">
                {comuns.map((comum) => {
                  const estaEditando = editandoComumId === comum.id;

                  return (
                    <div
                      key={comum.id}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                    >
                      {!estaEditando ? (
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-zinc-900">
                              {comum.nome}
                            </h3>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => iniciarEdicaoComum(comum)}
                              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                            >
                              Editar
                            </button>

                            <button
                              onClick={() => excluirComum(comum.id, comum.nome)}
                              className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="mb-4 text-lg font-semibold text-zinc-900">
                            Editando comum
                          </h3>

                          <div>
                            <label className="text-sm font-medium text-zinc-700">
                              Nome
                            </label>
                            <input
                              value={editNomeComum}
                              onChange={(e) => setEditNomeComum(e.target.value)}
                              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                            />
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            <button
                              onClick={() => salvarEdicaoComum(comum.id)}
                              disabled={salvandoEdicaoComum}
                              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
                            >
                              {salvandoEdicaoComum
                                ? "Salvando..."
                                : "Salvar alterações"}
                            </button>

                            <button
                              onClick={cancelarEdicaoComum}
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
            </div>
          </div>
        )}

        {abaAtiva === "professores" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-zinc-900">
                Cadastrar professor
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-700">Nome</label>
                  <input
                    value={nomeProfessor}
                    onChange={(e) => setNomeProfessor(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-700">
                    Telefone
                  </label>
                  <input
                    value={telefoneProfessor}
                    onChange={(e) => setTelefoneProfessor(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-700">Comum</label>
                  <select
                    value={comumIdProfessor}
                    onChange={(e) => setComumIdProfessor(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                  >
                    <option value="">Selecione uma comum</option>
                    {comuns.map((comum) => (
                      <option key={comum.id} value={comum.id}>
                        {comum.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-700">
                    Username
                  </label>
                  <input
                    value={usernameProfessor}
                    onChange={(e) => setUsernameProfessor(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-zinc-700">Senha</label>
                  <input
                    value={senhaProfessor}
                    onChange={(e) => setSenhaProfessor(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <button
                onClick={criarProfessor}
                disabled={salvandoProfessor}
                className="mt-5 w-full rounded-xl bg-black p-3 font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {salvandoProfessor ? "Salvando..." : "Salvar professor"}
              </button>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-zinc-900">
                Professores cadastrados
              </h2>

              {carregandoProfessores && (
                <p className="text-zinc-600">Carregando professores...</p>
              )}

              {!carregandoProfessores && professores.length === 0 && (
                <p className="text-zinc-600">Nenhum professor cadastrado ainda.</p>
              )}

              <div className="space-y-4">
                {professores.map((professor) => {
                  const estaEditando = editandoProfessorId === professor.id;
                  const user = userDoProfessor(professor.id);

                  return (
                    <div
                      key={professor.id}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                    >
                      {!estaEditando ? (
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-zinc-900">
                              {professor.nome}
                            </h3>

                            <div className="mt-2 space-y-1 text-sm text-zinc-600">
                              <p>Telefone: {professor.telefone || "—"}</p>
                              <p>Comum: {nomeComumPorId(professor.comum_id)}</p>
                              <p>Username: {user?.username || "—"}</p>
                              <p>Senha: {user?.senha || "—"}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => iniciarEdicaoProfessor(professor)}
                              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                            >
                              Editar
                            </button>

                            <button
                              onClick={() =>
                                excluirProfessor(professor.id, professor.nome)
                              }
                              className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="mb-4 text-lg font-semibold text-zinc-900">
                            Editando professor
                          </h3>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium text-zinc-700">
                                Nome
                              </label>
                              <input
                                value={editNomeProfessor}
                                onChange={(e) =>
                                  setEditNomeProfessor(e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-zinc-700">
                                Telefone
                              </label>
                              <input
                                value={editTelefoneProfessor}
                                onChange={(e) =>
                                  setEditTelefoneProfessor(e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-zinc-700">
                                Comum
                              </label>
                              <select
                                value={editComumIdProfessor}
                                onChange={(e) =>
                                  setEditComumIdProfessor(e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                              >
                                <option value="">Sem comum</option>
                                {comuns.map((comum) => (
                                  <option key={comum.id} value={comum.id}>
                                    {comum.nome}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-zinc-700">
                                Username
                              </label>
                              <input
                                value={editUsernameProfessor}
                                onChange={(e) =>
                                  setEditUsernameProfessor(e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-zinc-700">
                                Senha
                              </label>
                              <input
                                value={editSenhaProfessor}
                                onChange={(e) =>
                                  setEditSenhaProfessor(e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                              />
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            <button
                              onClick={() => salvarEdicaoProfessor(professor.id)}
                              disabled={salvandoEdicaoProfessor}
                              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
                            >
                              {salvandoEdicaoProfessor
                                ? "Salvando..."
                                : "Salvar alterações"}
                            </button>

                            <button
                              onClick={cancelarEdicaoProfessor}
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
            </div>
          </div>
        )}

        {abaAtiva === "alunos" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
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

                <div>
                  <label className="text-sm font-medium text-zinc-700">Comum</label>
                  <select
                    value={comumIdAluno}
                    onChange={(e) => setComumIdAluno(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                  >
                    <option value="">Selecione uma comum</option>
                    {comuns.map((comum) => (
                      <option key={comum.id} value={comum.id}>
                        {comum.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-700">
                    Professor responsável
                  </label>
                  <select
                    value={professorIdAluno}
                    onChange={(e) => setProfessorIdAluno(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                  >
                    <option value="">Sem professor responsável</option>
                    {professores.map((professor) => (
                      <option key={professor.id} value={professor.id}>
                        {professor.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-700">
                    Username
                  </label>
                  <input
                    value={usernameAluno}
                    onChange={(e) => setUsernameAluno(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-zinc-700">Senha</label>
                  <input
                    value={senhaAluno}
                    onChange={(e) => setSenhaAluno(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                  />
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

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-zinc-900">
                Alunos cadastrados
              </h2>

              {carregandoAlunos && (
                <p className="text-zinc-600">Carregando alunos...</p>
              )}

              {!carregandoAlunos && alunos.length === 0 && (
                <p className="text-zinc-600">Nenhum aluno cadastrado ainda.</p>
              )}

              <div className="space-y-4">
                {alunos.map((aluno) => {
                  const estaEditando = editandoAlunoId === aluno.id;
                  const user = userDoAluno(aluno.id);

                  return (
                    <div
                      key={aluno.id}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                    >
                      {!estaEditando ? (
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-zinc-900">
                              {aluno.nome}
                            </h3>

                            <div className="mt-2 space-y-1 text-sm text-zinc-600">
                              <p>Instrumento: {aluno.instrumento || "—"}</p>
                              <p>Voz principal: {aluno.voz_principal || "—"}</p>
                              <p>
                                Voz alternativa: {aluno.voz_alternativa || "—"}
                              </p>
                              <p>Responsável: {aluno.responsavel || "—"}</p>
                              <p>Telefone: {aluno.telefone || "—"}</p>
                              <p>Comum: {nomeComumPorId(aluno.comum_id)}</p>
                              <p>
                                Professor: {nomeProfessorPorId(aluno.professor_id)}
                              </p>
                              <p>Username: {user?.username || "—"}</p>
                              <p>Senha: {user?.senha || "—"}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => iniciarEdicaoAluno(aluno)}
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
                          <h3 className="mb-4 text-lg font-semibold text-zinc-900">
                            Editando aluno
                          </h3>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium text-zinc-700">
                                Nome
                              </label>
                              <input
                                value={editNomeAluno}
                                onChange={(e) => setEditNomeAluno(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-zinc-700">
                                Instrumento
                              </label>
                              <input
                                value={editInstrumentoAluno}
                                onChange={(e) =>
                                  setEditInstrumentoAluno(e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-zinc-700">
                                Voz principal
                              </label>
                              <select
                                value={editVozPrincipalAluno}
                                onChange={(e) =>
                                  setEditVozPrincipalAluno(e.target.value)
                                }
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
                                value={editVozAlternativaAluno}
                                onChange={(e) =>
                                  setEditVozAlternativaAluno(e.target.value)
                                }
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
                                value={editResponsavelAluno}
                                onChange={(e) =>
                                  setEditResponsavelAluno(e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-zinc-700">
                                Telefone
                              </label>
                              <input
                                value={editTelefoneAluno}
                                onChange={(e) =>
                                  setEditTelefoneAluno(e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-zinc-700">
                                Comum
                              </label>
                              <select
                                value={editComumIdAluno}
                                onChange={(e) =>
                                  setEditComumIdAluno(e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                              >
                                <option value="">Selecione uma comum</option>
                                {comuns.map((comum) => (
                                  <option key={comum.id} value={comum.id}>
                                    {comum.nome}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-zinc-700">
                                Professor responsável
                              </label>
                              <select
                                value={editProfessorIdAluno}
                                onChange={(e) =>
                                  setEditProfessorIdAluno(e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                              >
                                <option value="">Sem professor responsável</option>
                                {professores.map((professor) => (
                                  <option key={professor.id} value={professor.id}>
                                    {professor.nome}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-zinc-700">
                                Username
                              </label>
                              <input
                                value={editUsernameAluno}
                                onChange={(e) =>
                                  setEditUsernameAluno(e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-zinc-700">
                                Senha
                              </label>
                              <input
                                value={editSenhaAluno}
                                onChange={(e) =>
                                  setEditSenhaAluno(e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-zinc-900"
                              />
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            <button
                              onClick={() => salvarEdicaoAluno(aluno.id)}
                              disabled={salvandoEdicaoAluno}
                              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
                            >
                              {salvandoEdicaoAluno
                                ? "Salvando..."
                                : "Salvar alterações"}
                            </button>

                            <button
                              onClick={cancelarEdicaoAluno}
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
            </div>
          </div>
        )}
      </div>
    </main>
  );
}