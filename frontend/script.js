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

    window.location.href = "dashboard.html";
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
    status: "Confirmada"
  };

  if (!agendamento.aluno_id || !agendamento.data || !agendamento.horario) {
    alert("Selecione aluno, data e horário.");
    return;
  }

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
    listarAgenda();
  }
}

async function listarAgenda() {
  const resposta = await fetch(`${API}/agenda`);
  const agenda = await resposta.json();

  const lista = document.getElementById("listaAgenda");

  if (!lista) return;

  lista.innerHTML = "";

  agenda.forEach(item => {
    lista.innerHTML += `
      <div class="lista-item">
        <strong>${item.aluno_nome}</strong><br>
        Data: ${item.data}<br>
        Horário: ${item.horario}<br>
        Local: ${item.local || "Não informado"}<br>
        Status: ${item.status}
      </div>
    `;
  });
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

function pegarLocalizacaoAtual() {
  if (!navigator.geolocation) {
    alert("Seu navegador não suporta localização.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (posicao) {
      const latitude = posicao.coords.latitude;
      const longitude = posicao.coords.longitude;

      document.getElementById("local_latitude").value = latitude;
      document.getElementById("local_longitude").value = longitude;

      alert("Localização capturada com sucesso!");
    },
    function () {
      alert("Não foi possível pegar sua localização. Verifique se você permitiu o acesso.");
    }
  );
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