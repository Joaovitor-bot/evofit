const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./evofit.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err.message);
  } else {
    console.log("Banco de dados conectado com sucesso.");
  }
});

db.serialize(() => {
  db.run(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'personal',
    aluno_id INTEGER
  )
   `);

  db.run(`ALTER TABLE usuarios ADD COLUMN aluno_id INTEGER`, (err) => {
  if (err && !err.message.includes("duplicate column name")) {
    console.error("Erro ao adicionar aluno_id em usuarios:", err.message);
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data_nascimento TEXT,
      whatsapp TEXT,
      email TEXT,
      genero TEXT,
      contato_emergencia TEXT,
      status TEXT DEFAULT 'Ativo'
    )
  `);

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

  db.run(`
  CREATE TABLE IF NOT EXISTS agenda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    local TEXT,
    latitude TEXT,
    longitude TEXT,
    status TEXT DEFAULT 'Confirmada',
    FOREIGN KEY (aluno_id) REFERENCES alunos(id)
  )
`);

  db.run(`ALTER TABLE agenda ADD COLUMN latitude TEXT`, () => {});
  db.run(`ALTER TABLE agenda ADD COLUMN longitude TEXT`, () => {}); 
  
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

  db.run(`
  CREATE TABLE IF NOT EXISTS disponibilidade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dia_semana TEXT NOT NULL,
    horario_inicio TEXT NOT NULL,
    horario_fim TEXT NOT NULL
    )
  `);

});

module.exports = db;