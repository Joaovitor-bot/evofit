const API = "http://localhost:3000";

async function cadastrarUsuario() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!nome || !email || !senha) {
    alert("Preencha nome, e-mail e senha.");
    return;
  }

  try {
    const resposta = await fetch(`${API}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        email,
        senha,
        tipo: "personal"
      })
    });

    const dados = await resposta.json();

    alert(dados.mensagem || dados.erro);

    if (resposta.ok) {
      window.location.href = "index.html";
    }
  } catch (erro) {
    alert("Erro ao conectar com o servidor. Veja se o backend está ligado.");
    console.error(erro);
  }
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
    alert("Preencha o e-mail e a senha.");
    return;
  }

  try {
    const resposta = await fetch(`${API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro || "Erro ao fazer login.");
      return;
    }

    localStorage.setItem("token", dados.token);
    localStorage.setItem("usuario", JSON.stringify(dados.usuario));

    if (dados.usuario.tipo === "aluno") {
      if (!dados.usuario.aluno_id) {
        alert("Este usuário aluno não está vinculado a nenhum cadastro de aluno.");
        return;
      }

      window.location.href = "painel-aluno.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } catch (erro) {
    alert("Não foi possível conectar ao backend. Veja se o servidor está ligado.");
    console.error("Erro no login:", erro);
  }
}

function protegerPagina() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Você precisa fazer login primeiro.");
    window.location.href = "index.html";
  }
}

function sair() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "index.html";
}

async function carregarDashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (usuario) {
    const textoUsuario = document.getElementById("usuarioLogado");
    if (textoUsuario) {
      textoUsuario.innerText = `Bem-vindo, ${usuario.nome}`;
    }
  }

  try {
    const respostaAlunos = await fetch(`${API}/alunos`);
    const alunos = await respostaAlunos.json();

    const respostaTreinos = await fetch(`${API}/treinos`);
    const treinos = await respostaTreinos.json();

    const respostaAgenda = await fetch(`${API}/agenda`);
    const agenda = await respostaAgenda.json();

    if (document.getElementById("totalAlunos")) {
      document.getElementById("totalAlunos").innerText = alunos.length;
    }

    if (document.getElementById("totalTreinos")) {
      document.getElementById("totalTreinos").innerText = treinos.length;
    }

    if (document.getElementById("totalAgenda")) {
      document.getElementById("totalAgenda").innerText = agenda.length;
    }
  } catch (erro) {
    console.error("Erro ao carregar dashboard:", erro);
  }
}

async function cadastrarAluno() {
  const aluno = {
    nome: document.getElementById("aluno_nome").value.trim(),
    data_nascimento: document.getElementById("aluno_data_nascimento").value,
    whatsapp: document.getElementById("aluno_whatsapp").value.trim(),
    email: document.getElementById("aluno_email").value.trim(),
    genero: document.getElementById("aluno_genero").value,
    contato_emergencia: document.getElementById("aluno_contato_emergencia").value.trim()
  };

  if (!aluno.nome) {
    alert("Digite o nome do aluno.");
    return;
  }

  const resposta = await fetch(`${API}/alunos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(aluno)
  });

  const dados = await resposta.json();
  alert(dados.mensagem || dados.erro);

  if (resposta.ok) {
    document.getElementById("aluno_nome").value = "";
    document.getElementById("aluno_data_nascimento").value = "";
    document.getElementById("aluno_whatsapp").value = "";
    document.getElementById("aluno_email").value = "";
    document.getElementById("aluno_genero").value = "";
    document.getElementById("aluno_contato_emergencia").value = "";

    listarAlunos();
  }
}

async function listarAlunos() {
  const resposta = await fetch(`${API}/alunos`);
  const alunos = await resposta.json();

  const lista = document.getElementById("listaAlunos");

  if (!lista) return;

  lista.innerHTML = "";

  alunos.forEach(aluno => {
    lista.innerHTML += `
      <div class="lista-item">
        <strong>${aluno.nome}</strong><br>
        WhatsApp: ${aluno.whatsapp || "Não informado"}<br>
        E-mail: ${aluno.email || "Não informado"}<br>
        Gênero: ${aluno.genero || "Não informado"}<br>
        Status: ${aluno.status}<br><br>

        <button onclick="abrirEdicaoAluno(${aluno.id}, '${aluno.nome}', '${aluno.data_nascimento || ""}', '${aluno.whatsapp || ""}', '${aluno.email || ""}', '${aluno.genero || ""}', '${aluno.contato_emergencia || ""}', '${aluno.status || "Ativo"}')">
          Editar
        </button>

        <button class="btn-excluir" onclick="excluirAluno(${aluno.id})">
          Excluir
        </button>
      </div>
    `;
  });
}

async function carregarAlunosSelect() {
  const resposta = await fetch(`${API}/alunos`);
  const alunos = await resposta.json();

  const select = document.getElementById("treino_aluno");

  if (!select) return;

  select.innerHTML = "<option value=''>Selecione um aluno</option>";

  alunos.forEach(aluno => {
    select.innerHTML += `<option value="${aluno.id}">${aluno.nome}</option>`;
  });
}

async function carregarAlunosSelectAgenda() {
  const resposta = await fetch(`${API}/alunos`);
  const alunos = await resposta.json();

  const select = document.getElementById("agenda_aluno");

  if (!select) return;

  select.innerHTML = "<option value=''>Selecione um aluno</option>";

  alunos.forEach(aluno => {
    select.innerHTML += `<option value="${aluno.id}">${aluno.nome}</option>`;
  });
}

async function cadastrarTreino() {
  const treino = {
    aluno_id: document.getElementById("treino_aluno").value,
    titulo: document.getElementById("treino_titulo").value.trim(),
    objetivo: document.getElementById("treino_objetivo").value.trim(),
    exercicios: document.getElementById("treino_exercicios").value.trim(),
    observacoes: document.getElementById("treino_observacoes").value.trim()
  };

  if (!treino.aluno_id || !treino.titulo) {
    alert("Selecione um aluno e digite o título do treino.");
    return;
  }

  const resposta = await fetch(`${API}/treinos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(treino)
  });

  const dados = await resposta.json();
  alert(dados.mensagem || dados.erro);

  if (resposta.ok) {
    listarTreinos();
  }
}

async function listarTreinos() {
  const resposta = await fetch(`${API}/treinos`);
  const treinos = await resposta.json();

  const lista = document.getElementById("listaTreinos");

  if (!lista) return;

  lista.innerHTML = "";

  treinos.forEach(treino => {
    lista.innerHTML += `
      <div class="lista-item">
        <strong>${treino.titulo}</strong><br>
        Aluno: ${treino.aluno_nome}<br>
        Objetivo: ${treino.objetivo || "Não informado"}<br>
        Exercícios: ${treino.exercicios || "Não informado"}<br>
        Observações: ${treino.observacoes || "Nenhuma"}
      </div>
    `;
  });
}

async function cadastrarAgenda() {
  const agendamento = {
    aluno_id: document.getElementById("agenda_aluno").value,
    data: document.getElementById("agenda_data").value,
    horario: document.getElementById("agenda_horario").value,
    local: document.getElementById("agenda_local").value.trim(),
    latitude: "",
    longitude: "",
    status: document.getElementById("agenda_status").value
  };

  if (!agendamento.aluno_id || !agendamento.data || !agendamento.horario) {
    alert("Selecione aluno, data e horário.");
    return;
  }

  if (!agendamento.local) {
    alert("Digite o local da aula.");
    return;
  }

  try {
    const resposta = await fetch(`${API}/agenda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(agendamento)
    });

    const dados = await resposta.json();
    alert(dados.mensagem || dados.erro);

    if (resposta.ok) {
      document.getElementById("agenda_data").value = "";
      document.getElementById("agenda_horario").value = "";
      document.getElementById("agenda_local").value = "";
      document.getElementById("agenda_status").value = "Confirmada";

      listarAgenda();
      carregarDashboard();
    }
  } catch (erro) {
    alert("Erro ao conectar com o backend. Veja se o servidor está ligado.");
    console.error(erro);
  }
}

async function listarAgenda() {
  try {
    const resposta = await fetch(`${API}/agenda`);
    const agenda = await resposta.json();

    const lista = document.getElementById("listaAgenda");

    if (!lista) return;

    lista.innerHTML = "";

    if (!agenda || agenda.length === 0) {
      lista.innerHTML = "<p>Nenhuma aula agendada ainda.</p>";
      return;
    }

    agenda.forEach(item => {
      const linkMapa = item.local
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.local)}`
        : "";

      lista.innerHTML += `
        <div class="lista-item">
          <strong>${item.aluno_nome || "Aluno não encontrado"}</strong><br>
          Data: ${formatarData(item.data)}<br>
          Horário: ${item.horario}<br>
          Local: ${item.local || "Não informado"}<br>
          Status: <strong>${item.status || "Confirmada"}</strong><br><br>

          ${
            linkMapa
              ? `<a href="${linkMapa}" target="_blank">Abrir local no Google Maps</a><br><br>`
              : ""
          }

          <select id="status_${item.id}">
            <option value="Confirmada" ${item.status === "Confirmada" ? "selected" : ""}>Confirmada</option>
            <option value="Concluída" ${item.status === "Concluída" ? "selected" : ""}>Concluída</option>
            <option value="Falta do aluno" ${item.status === "Falta do aluno" ? "selected" : ""}>Falta do aluno</option>
            <option value="Cancelada" ${item.status === "Cancelada" ? "selected" : ""}>Cancelada</option>
          </select>

          <button onclick="atualizarStatusAgenda(${item.id})">
            Atualizar status
          </button>

          <button class="btn-excluir" onclick="excluirAgenda(${item.id})">
            Excluir aula
          </button>
        </div>
      `;
    });
  } catch (erro) {
    console.error("Erro ao listar agenda:", erro);

    const lista = document.getElementById("listaAgenda");
    if (lista) {
      lista.innerHTML = "<p>Erro ao carregar agenda.</p>";
    }
  }
}

function abrirEdicaoAluno(id, nome, data_nascimento, whatsapp, email, genero, contato_emergencia, status) {
  document.getElementById("aluno_id_edicao").value = id;
  document.getElementById("aluno_nome").value = nome;
  document.getElementById("aluno_data_nascimento").value = data_nascimento;
  document.getElementById("aluno_whatsapp").value = whatsapp;
  document.getElementById("aluno_email").value = email;
  document.getElementById("aluno_genero").value = genero;
  document.getElementById("aluno_contato_emergencia").value = contato_emergencia;

  const botao = document.getElementById("btnAluno");
  botao.innerText = "Salvar alterações";
  botao.setAttribute("onclick", "editarAluno()");
}

async function editarAluno() {
  const id = document.getElementById("aluno_id_edicao").value;

  const aluno = {
    nome: document.getElementById("aluno_nome").value.trim(),
    data_nascimento: document.getElementById("aluno_data_nascimento").value,
    whatsapp: document.getElementById("aluno_whatsapp").value.trim(),
    email: document.getElementById("aluno_email").value.trim(),
    genero: document.getElementById("aluno_genero").value,
    contato_emergencia: document.getElementById("aluno_contato_emergencia").value.trim(),
    status: "Ativo"
  };

  if (!aluno.nome) {
    alert("Digite o nome do aluno.");
    return;
  }

  const resposta = await fetch(`${API}/alunos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(aluno)
  });

  const dados = await resposta.json();
  alert(dados.mensagem || dados.erro);

  if (resposta.ok) {
    limparFormularioAluno();
    listarAlunos();
  }
}

async function excluirAluno(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este aluno?");

  if (!confirmar) return;

  const resposta = await fetch(`${API}/alunos/${id}`, {
    method: "DELETE"
  });

  const dados = await resposta.json();
  alert(dados.mensagem || dados.erro);

  if (resposta.ok) {
    listarAlunos();
  }
}

function limparFormularioAluno() {
  document.getElementById("aluno_id_edicao").value = "";
  document.getElementById("aluno_nome").value = "";
  document.getElementById("aluno_data_nascimento").value = "";
  document.getElementById("aluno_whatsapp").value = "";
  document.getElementById("aluno_email").value = "";
  document.getElementById("aluno_genero").value = "";
  document.getElementById("aluno_contato_emergencia").value = "";

  const botao = document.getElementById("btnAluno");
  botao.innerText = "Cadastrar aluno";
  botao.setAttribute("onclick", "cadastrarAluno()");
}

async function cadastrarDisponibilidade() {
  const disponibilidade = {
    dia_semana: document.getElementById("dia_semana").value,
    horario_inicio: document.getElementById("horario_inicio").value,
    horario_fim: document.getElementById("horario_fim").value
  };

  if (!disponibilidade.dia_semana || !disponibilidade.horario_inicio || !disponibilidade.horario_fim) {
    alert("Preencha todos os campos.");
    return;
  }

  const resposta = await fetch(`${API}/disponibilidade`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(disponibilidade)
  });

  const dados = await resposta.json();
  alert(dados.mensagem || dados.erro);

  if (resposta.ok) {
    document.getElementById("dia_semana").value = "";
    document.getElementById("horario_inicio").value = "";
    document.getElementById("horario_fim").value = "";

    listarDisponibilidade();
  }
}

async function listarDisponibilidade() {
  const resposta = await fetch(`${API}/disponibilidade`);
  const disponibilidades = await resposta.json();

  const lista = document.getElementById("listaDisponibilidade");

  if (!lista) return;

  lista.innerHTML = "";

  disponibilidades.forEach(item => {
    lista.innerHTML += `
      <div class="lista-item">
        <strong>${item.dia_semana}</strong><br>
        Das ${item.horario_inicio} às ${item.horario_fim}<br><br>

        <button class="btn-excluir" onclick="excluirDisponibilidade(${item.id})">
          Excluir
        </button>
      </div>
    `;
  });
}

async function excluirDisponibilidade(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este horário?");

  if (!confirmar) return;

  const resposta = await fetch(`${API}/disponibilidade/${id}`, {
    method: "DELETE"
  });

  const dados = await resposta.json();
  alert(dados.mensagem || dados.erro);

  if (resposta.ok) {
    listarDisponibilidade();
  }
}

async function cadastrarPerfilPersonal() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const perfil = {
    usuario_id: usuario ? usuario.id : null,
    nome_completo: document.getElementById("perfil_nome").value.trim(),
    foto: document.getElementById("perfil_foto").value.trim(),
    cref: document.getElementById("perfil_cref").value.trim(),
    telefone: document.getElementById("perfil_telefone").value.trim(),
    biografia: document.getElementById("perfil_biografia").value.trim(),
    especialidades: document.getElementById("perfil_especialidades").value.trim()
  };

  if (!perfil.nome_completo) {
    alert("Digite o nome completo.");
    return;
  }

  const resposta = await fetch(`${API}/perfil-personal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(perfil)
  });

  const dados = await resposta.json();
  alert(dados.mensagem || dados.erro);

  if (resposta.ok) {
    listarPerfilPersonal();
  }
}

async function listarPerfilPersonal() {
  const resposta = await fetch(`${API}/perfil-personal`);
  const perfis = await resposta.json();

  const lista = document.getElementById("listaPerfilPersonal");

  if (!lista) return;

  lista.innerHTML = "";

  perfis.forEach(perfil => {
    lista.innerHTML += `
      <div class="lista-item">
        <strong>${perfil.nome_completo}</strong><br>
        CREF: ${perfil.cref || "Não informado"}<br>
        Telefone: ${perfil.telefone || "Não informado"}<br>
        Especialidades: ${perfil.especialidades || "Não informado"}<br>
        Biografia: ${perfil.biografia || "Não informada"}
      </div>
    `;
  });
}

async function cadastrarLocal() {
  const local = {
    nome: document.getElementById("local_nome").value.trim(),
    endereco: document.getElementById("local_endereco").value.trim(),
    latitude: document.getElementById("local_latitude").value.trim(),
    longitude: document.getElementById("local_longitude").value.trim()
  };

  if (!local.nome) {
    alert("Digite o nome do local.");
    return;
  }

  const resposta = await fetch(`${API}/locais`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(local)
  });

  const dados = await resposta.json();
  alert(dados.mensagem || dados.erro);

  if (resposta.ok) {
    document.getElementById("local_nome").value = "";
    document.getElementById("local_endereco").value = "";
    document.getElementById("local_latitude").value = "";
    document.getElementById("local_longitude").value = "";

    listarLocais();
  }
}

async function listarLocais() {
  const resposta = await fetch(`${API}/locais`);
  const locais = await resposta.json();

  const lista = document.getElementById("listaLocais");

  if (!lista) return;

  lista.innerHTML = "";

  locais.forEach(local => {
    const linkMapa = local.latitude && local.longitude
      ? `https://www.google.com/maps?q=${local.latitude},${local.longitude}`
      : "#";

    lista.innerHTML += `
      <div class="lista-item">
        <strong>${local.nome}</strong><br>
        Endereço: ${local.endereco || "Não informado"}<br>
        Latitude: ${local.latitude || "Não informada"}<br>
        Longitude: ${local.longitude || "Não informada"}<br><br>

        ${
          local.latitude && local.longitude
            ? `<a href="${linkMapa}" target="_blank">Abrir no Google Maps</a><br><br>`
            : ""
        }

        <button class="btn-excluir" onclick="excluirLocal(${local.id})">
          Excluir
        </button>
      </div>
    `;
  });
}

async function excluirLocal(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este local?");

  if (!confirmar) return;

  const resposta = await fetch(`${API}/locais/${id}`, {
    method: "DELETE"
  });

  const dados = await resposta.json();
  alert(dados.mensagem || dados.erro);

  if (resposta.ok) {
    listarLocais();
  }
}

function pegarLocalizacaoAgenda() {
  if (!navigator.geolocation) {
    alert("Seu navegador não suporta localização.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (posicao) {
      const latitude = posicao.coords.latitude;
      const longitude = posicao.coords.longitude;

      document.getElementById("agenda_latitude").value = latitude;
      document.getElementById("agenda_longitude").value = longitude;

      alert("Localização capturada com sucesso!");
    },
    function () {
      alert("Não foi possível pegar sua localização. Permita o acesso à localização no navegador.");
    }
  );
}

async function excluirAgenda(id) {
  const confirmar = confirm("Tem certeza que deseja excluir esta aula?");

  if (!confirmar) return;

  try {
    const resposta = await fetch(`${API}/agenda/${id}`, {
      method: "DELETE"
    });

    const dados = await resposta.json();
    alert(dados.mensagem || dados.erro);

    if (resposta.ok) {
      listarAgenda();
      carregarDashboard();
    }
  } catch (erro) {
    alert("Erro ao conectar com o backend.");
    console.error("Erro ao excluir aula:", erro);
  }
}

function formatarData(data) {
  if (!data) return "Não informada";

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

async function atualizarStatusAgenda(id) {
  const status = document.getElementById(`status_${id}`).value;

  try {
    const resposta = await fetch(`${API}/agenda/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    const dados = await resposta.json();
    alert(dados.mensagem || dados.erro);

    if (resposta.ok) {
      listarAgenda();
      carregarDashboard();
    }
  } catch (erro) {
    alert("Erro ao conectar com o backend.");
    console.error("Erro ao atualizar status:", erro);
  }
}

async function carregarAlunosAcompanhamento() {
  try {
    const resposta = await fetch(`${API}/alunos`);
    const alunos = await resposta.json();

    const select = document.getElementById("acompanhamento_aluno");

    if (!select) return;

    select.innerHTML = "<option value=''>Selecione um aluno</option>";

    alunos.forEach(aluno => {
      select.innerHTML += `<option value="${aluno.id}">${aluno.nome}</option>`;
    });
  } catch (erro) {
    console.error("Erro ao carregar alunos:", erro);
  }
}

async function buscarAcompanhamento() {
  const alunoId = document.getElementById("acompanhamento_aluno").value;

  if (!alunoId) {
    alert("Selecione um aluno.");
    return;
  }

  try {
    const resposta = await fetch(`${API}/acompanhamento/${alunoId}`);
    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro || "Erro ao buscar acompanhamento.");
      return;
    }

    mostrarAcompanhamento(dados);
  } catch (erro) {
    alert("Erro ao conectar com o backend.");
    console.error("Erro ao buscar acompanhamento:", erro);
  }
}

function mostrarAcompanhamento(dados) {
  const container = document.getElementById("resultadoAcompanhamento");

  if (!container) return;

  const aluno = dados.aluno;
  const resumo = dados.resumo;
  const treinos = dados.treinos;
  const agenda = dados.agenda;

  container.innerHTML = `
    <div class="card">
      <h2>Dados do aluno</h2>
      <p><strong>Nome:</strong> ${aluno.nome}</p>
      <p><strong>WhatsApp:</strong> ${aluno.whatsapp || "Não informado"}</p>
      <p><strong>E-mail:</strong> ${aluno.email || "Não informado"}</p>
      <p><strong>Status:</strong> ${aluno.status || "Ativo"}</p>
    </div>

    <div class="grid-dashboard">
      <div class="card status-card">
        <h2>${resumo.total_aulas}</h2>
        <p>Total de aulas</p>
      </div>

      <div class="card status-card">
        <h2>${resumo.confirmadas}</h2>
        <p>Confirmadas</p>
      </div>

      <div class="card status-card">
        <h2>${resumo.concluidas}</h2>
        <p>Concluídas</p>
      </div>

      <div class="card status-card">
        <h2>${resumo.faltas}</h2>
        <p>Faltas</p>
      </div>

      <div class="card status-card">
        <h2>${resumo.canceladas}</h2>
        <p>Canceladas</p>
      </div>
    </div>

    <div class="card">
      <h2>Treinos do aluno</h2>
      <div id="treinosAcompanhamento"></div>
    </div>

    <div class="card">
      <h2>Histórico de aulas</h2>
      <div id="agendaAcompanhamento"></div>
    </div>
  `;

  const divTreinos = document.getElementById("treinosAcompanhamento");

  if (treinos.length === 0) {
    divTreinos.innerHTML = "<p>Nenhum treino cadastrado para este aluno.</p>";
  } else {
    treinos.forEach(treino => {
      divTreinos.innerHTML += `
        <div class="lista-item">
          <strong>${treino.titulo}</strong><br>
          Objetivo: ${treino.objetivo || "Não informado"}<br>
          Exercícios: ${treino.exercicios || "Não informado"}<br>
          Observações: ${treino.observacoes || "Nenhuma"}
        </div>
      `;
    });
  }

  const divAgenda = document.getElementById("agendaAcompanhamento");

  if (agenda.length === 0) {
    divAgenda.innerHTML = "<p>Nenhuma aula encontrada para este aluno.</p>";
  } else {
    agenda.forEach(aula => {
      const linkMapa = aula.local
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(aula.local)}`
        : "";

      divAgenda.innerHTML += `
        <div class="lista-item">
          <strong>${formatarData(aula.data)} - ${aula.horario}</strong><br>
          Local: ${aula.local || "Não informado"}<br>
          Status: ${aula.status || "Confirmada"}<br><br>

          ${
            linkMapa
              ? `<a href="${linkMapa}" target="_blank">Abrir local no Google Maps</a>`
              : ""
          }
        </div>
      `;
    });
  }
}

async function carregarAlunosAcesso() {
  try {
    const resposta = await fetch(`${API}/alunos`);
    const alunos = await resposta.json();

    const select = document.getElementById("acesso_aluno");

    if (!select) return;

    select.innerHTML = "<option value=''>Selecione um aluno</option>";

    alunos.forEach(aluno => {
      select.innerHTML += `<option value="${aluno.id}">${aluno.nome}</option>`;
    });
  } catch (erro) {
    console.error("Erro ao carregar alunos:", erro);
  }
}

async function criarAcessoAluno() {
  const aluno_id = document.getElementById("acesso_aluno").value;
  const nome = document.getElementById("acesso_nome").value.trim();
  const email = document.getElementById("acesso_email").value.trim();
  const senha = document.getElementById("acesso_senha").value.trim();

  if (!aluno_id || !nome || !email || !senha) {
    alert("Preencha aluno, nome, e-mail e senha.");
    return;
  }

  try {
    const resposta = await fetch(`${API}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        email,
        senha,
        tipo: "aluno",
        aluno_id: Number(aluno_id)
      })
    });

    const dados = await resposta.json();

    alert(dados.mensagem || dados.erro);

    if (resposta.ok) {
      document.getElementById("acesso_aluno").value = "";
      document.getElementById("acesso_nome").value = "";
      document.getElementById("acesso_email").value = "";
      document.getElementById("acesso_senha").value = "";
    }
  } catch (erro) {
    alert("Erro ao conectar com o backend.");
    console.error("Erro ao criar acesso:", erro);
  }
}

async function carregarPainelAluno() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario || usuario.tipo !== "aluno") {
    alert("Acesso permitido apenas para alunos.");
    window.location.href = "index.html";
    return;
  }

  if (!usuario.aluno_id) {
    alert("Este usuário não está vinculado a um aluno.");
    window.location.href = "index.html";
    return;
  }

  try {
    const resposta = await fetch(`${API}/painel-aluno/${usuario.aluno_id}`);
    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro || "Erro ao carregar painel do aluno.");
      return;
    }

    document.getElementById("nomeAlunoPainel").innerText = `Bem-vindo, ${dados.aluno.nome}`;

    const divTreinos = document.getElementById("meusTreinos");
    const divAulas = document.getElementById("minhasAulas");

    divTreinos.innerHTML = "";
    divAulas.innerHTML = "";

    if (dados.treinos.length === 0) {
      divTreinos.innerHTML = "<p>Nenhum treino disponível ainda.</p>";
    } else {
      dados.treinos.forEach(treino => {
        divTreinos.innerHTML += `
          <div class="lista-item">
            <strong>${treino.titulo}</strong><br>
            Objetivo: ${treino.objetivo || "Não informado"}<br>
            Exercícios: ${treino.exercicios || "Não informado"}<br>
            Observações: ${treino.observacoes || "Nenhuma"}
          </div>
        `;
      });
    }

    if (dados.agenda.length === 0) {
      divAulas.innerHTML = "<p>Nenhuma aula agendada ainda.</p>";
    } else {
      dados.agenda.forEach(aula => {
      const linkMapa = aula.local
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(aula.local)}`
      : "";

      const podeConcluir = aula.status === "Confirmada";

      divAulas.innerHTML += `
    <div class="lista-item">
      <strong>${formatarData(aula.data)} - ${aula.horario}</strong><br>
      Local: ${aula.local || "Não informado"}<br>
      Status: <strong>${aula.status || "Confirmada"}</strong><br><br>

      ${
        linkMapa
          ? `<a href="${linkMapa}" target="_blank">Abrir local no Google Maps</a><br><br>`
          : ""
      }

      ${
        podeConcluir
          ? `<button onclick="alunoConcluirAula(${aula.id})">Marcar como concluída</button>`
          : ""
      }
      </div>
        `;
      });
    }
  } catch (erro) {
    alert("Erro ao conectar com o backend.");
    console.error("Erro ao carregar painel do aluno:", erro);
  }

  async function alunoConcluirAula(id) {
  const confirmar = confirm("Deseja marcar esta aula como concluída?");

  if (!confirmar) return;

  try {
    const resposta = await fetch(`${API}/agenda/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "Concluída"
      })
    });

    const dados = await resposta.json();

    alert(dados.mensagem || dados.erro);

    if (resposta.ok) {
      carregarPainelAluno();
    }
  } catch (erro) {
    alert("Erro ao conectar com o backend.");
    console.error("Erro ao concluir aula:", erro);
  }
 } 
}