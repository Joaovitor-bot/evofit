const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./evofit.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err.message);
  } else {
    console.log("Banco de dados conectado com sucesso.");
  }
});

db.serialize(() => {
  // Função usada para atualizar bancos que já existem
  function adicionarColuna(tabela, coluna, definicao) {
    db.run(
      `ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao}`,
      (err) => {
        if (
          err &&
          !err.message.includes("duplicate column name")
        ) {
          console.error(
            `Erro ao adicionar ${coluna} em ${tabela}:`,
            err.message
          );
        }
      }
    );
  }

  // TABELA DE USUÁRIOS
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

  // TABELA DE ALUNOS
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

  // TABELA DE TREINOS
  db.run(`
    CREATE TABLE IF NOT EXISTS treinos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      objetivo TEXT,
      exercicios TEXT,
      observacoes TEXT,
      FOREIGN KEY (aluno_id) REFERENCES alunos(id)
    )
  `);

  // TABELA DE AGENDA
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

  // TABELA DO PERFIL DO PERSONAL
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

  // TABELA DE DISPONIBILIDADE
  db.run(`
    CREATE TABLE IF NOT EXISTS disponibilidade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dia_semana TEXT NOT NULL,
      horario_inicio TEXT NOT NULL,
      horario_fim TEXT NOT NULL
    )
  `);

  /*
   * MIGRAÇÕES
   * Adicionam colunas aos bancos que já foram criados anteriormente.
   */
  adicionarColuna("usuarios", "aluno_id", "INTEGER");
  adicionarColuna("usuarios", "cpf", "TEXT");

  adicionarColuna(
    "usuarios",
    "primeiro_acesso",
    "INTEGER NOT NULL DEFAULT 1"
  );

  adicionarColuna("alunos", "cpf", "TEXT");
  adicionarColuna("agenda", "latitude", "TEXT");
  adicionarColuna("agenda", "longitude", "TEXT");

  // Impede CPFs repetidos
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