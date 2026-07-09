const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./evofit.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err.message);
  } else {
    console.log("Banco de dados conectado com sucesso.");
  }
});

db.serialize(() => {
  function adicionarColuna(tabela, coluna, definicao) {
    db.run(
      `ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao}`,
      (err) => {
        if (err && !err.message.includes("duplicate column name")) {
          console.error(
            `Erro ao adicionar coluna ${coluna} na tabela ${tabela}:`,
            err.message
          );
        }
      }
    );
  }

  // USUÁRIOS: Personal e Aluno
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'personal',
      aluno_id INTEGER,
      primeiro_acesso INTEGER NOT NULL DEFAULT 1
    )
  `);

  // PERFIL DO PERSONAL TRAINER
  db.run(`
    CREATE TABLE IF NOT EXISTS perfil_personal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      nome_completo TEXT NOT NULL,
      foto TEXT,
      cref TEXT,
      biografia TEXT,
      telefone TEXT,
      especialidades TEXT,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  // ALUNOS
  db.run(`
    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT,
      data_nascimento TEXT,
      whatsapp TEXT,
      email TEXT,
      genero TEXT,
      contato_emergencia TEXT,
      status TEXT DEFAULT 'Ativo'
    )
  `);

  // TREINOS
  db.run(`
    CREATE TABLE IF NOT EXISTS treinos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER,
      titulo TEXT NOT NULL,
      objetivo TEXT,
      exercicios TEXT,
      observacoes TEXT,
      status TEXT DEFAULT 'Ativo',
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (aluno_id) REFERENCES alunos(id)
    )
  `);

  // CONCLUSÃO DE TREINOS PELO ALUNO
  db.run(`
    CREATE TABLE IF NOT EXISTS treino_conclusoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      treino_id INTEGER NOT NULL,
      data_conclusao TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (aluno_id) REFERENCES alunos(id),
      FOREIGN KEY (treino_id) REFERENCES treinos(id)
    )
  `);

  // DISPONIBILIDADE DA AGENDA
  db.run(`
    CREATE TABLE IF NOT EXISTS disponibilidade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dia_semana TEXT NOT NULL,
      horario_inicio TEXT NOT NULL,
      horario_fim TEXT NOT NULL
    )
  `);

  // LOCAIS DE ATENDIMENTO
  db.run(`
    CREATE TABLE IF NOT EXISTS locais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      endereco TEXT,
      latitude TEXT,
      longitude TEXT
    )
  `);

  // AGENDA / SESSÕES DE TREINO
  db.run(`
    CREATE TABLE IF NOT EXISTS agenda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      horario TEXT NOT NULL,
      local TEXT,
      latitude TEXT,
      longitude TEXT,
      status TEXT DEFAULT 'Pendente',
      FOREIGN KEY (aluno_id) REFERENCES alunos(id)
    )
  `);

  // MIGRAÇÕES PARA QUEM JÁ TINHA BANCO ANTIGO
  adicionarColuna("usuarios", "cpf", "TEXT");
  adicionarColuna("usuarios", "aluno_id", "INTEGER");
  adicionarColuna("usuarios", "primeiro_acesso", "INTEGER NOT NULL DEFAULT 1");

  adicionarColuna("alunos", "cpf", "TEXT");
  adicionarColuna("alunos", "data_nascimento", "TEXT");
  adicionarColuna("alunos", "genero", "TEXT");
  adicionarColuna("alunos", "contato_emergencia", "TEXT");
  adicionarColuna("alunos", "status", "TEXT DEFAULT 'Ativo'");

  adicionarColuna("treinos", "status", "TEXT DEFAULT 'Ativo'");
  adicionarColuna("treinos", "criado_em", "TEXT");

  db.run(`
    UPDATE treinos
    SET criado_em = CURRENT_TIMESTAMP
    WHERE criado_em IS NULL
  `);

  adicionarColuna("agenda", "latitude", "TEXT");
  adicionarColuna("agenda", "longitude", "TEXT");
  adicionarColuna("agenda", "status", "TEXT DEFAULT 'Pendente'");

  // EVITA CPF REPETIDO
  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_cpf
    ON usuarios(cpf)
    WHERE cpf IS NOT NULL AND cpf != ''
  `);

  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_alunos_cpf
    ON alunos(cpf)
    WHERE cpf IS NOT NULL AND cpf != ''
  `);
});

module.exports = db;