const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./database");

const app = express();
const PORT = 3000;
const SECRET = "evofit_secreto";

app.use(cors());
app.use(express.json());

function normalizarCpf(cpf = "") {
  return String(cpf).replace(/\D/g, "");
}

function normalizarEmail(email = "") {
  return String(email).trim().toLowerCase();
}

app.get("/", (req, res) => {
  res.json({ mensagem: "API Evofit funcionando!" });
});

// CADASTRAR USUÁRIO
app.post("/usuarios", async (req, res) => {
  const {
    nome,
    email,
    cpf,
    senha,
    tipo,
    aluno_id,
    primeiro_acesso
  } = req.body;

  const emailNormalizado = normalizarEmail(email);
  const cpfNormalizado = normalizarCpf(cpf);

  if (!nome || !emailNormalizado || !senha) {
    return res.status(400).json({
      erro: "Preencha nome, e-mail e senha."
    });
  }

  if (cpfNormalizado && cpfNormalizado.length !== 11) {
    return res.status(400).json({
      erro: "O CPF deve possuir 11 números."
    });
  }

  const tipoUsuario = tipo || "personal";

  const primeiroAcessoValor =
    primeiro_acesso !== undefined
      ? Number(primeiro_acesso) === 1
        ? 1
        : 0
      : tipoUsuario === "aluno"
        ? 1
        : 0;

  db.get(
    `SELECT id
     FROM usuarios
     WHERE email = ?
        OR (? != '' AND cpf = ?)`,
    [
      emailNormalizado,
      cpfNormalizado,
      cpfNormalizado
    ],
    async (err, usuarioExistente) => {
      if (err) {
        console.error(
          "Erro ao verificar usuário:",
          err.message
        );

        return res.status(500).json({
          erro: "Erro ao verificar usuário."
        });
      }

      if (usuarioExistente) {
        return res.status(400).json({
          erro: "E-mail ou CPF já cadastrado."
        });
      }

      try {
        const senhaCriptografada = await bcrypt.hash(
          senha,
          10
        );

        db.run(
          `INSERT INTO usuarios
          (
            nome,
            cpf,
            email,
            senha,
            tipo,
            aluno_id,
            primeiro_acesso
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            nome.trim(),
            cpfNormalizado || null,
            emailNormalizado,
            senhaCriptografada,
            tipoUsuario,
            aluno_id ? Number(aluno_id) : null,
            primeiroAcessoValor
          ],
          function (err) {
            if (err) {
              console.error(
                "Erro ao cadastrar usuário:",
                err.message
              );

              return res.status(500).json({
                erro: "Erro ao cadastrar usuário."
              });
            }

            res.status(201).json({
              mensagem: "Usuário cadastrado com sucesso!",
              id: this.lastID
            });
          }
        );
      } catch (erro) {
        console.error(
          "Erro ao criptografar senha:",
          erro
        );

        res.status(500).json({
          erro: "Erro ao cadastrar usuário."
        });
      }
    }
  );
});

// LOGIN COM CPF OU E-MAIL
app.post("/login", (req, res) => {
  const {
    identificador,
    email,
    senha
  } = req.body;

  // Mantém compatibilidade com o app atual,
  // que ainda envia o campo "email".
  const loginInformado = String(
    identificador || email || ""
  ).trim();

  if (!loginInformado || !senha) {
    return res.status(400).json({
      erro: "Informe CPF ou e-mail e senha."
    });
  }

  const cpfNormalizado = normalizarCpf(loginInformado);
  const pareceCpf =
    cpfNormalizado.length === 11 &&
    !loginInformado.includes("@");

  const sql = pareceCpf
    ? `SELECT * FROM usuarios WHERE cpf = ?`
    : `SELECT * FROM usuarios WHERE email = ?`;

  const valorBusca = pareceCpf
    ? cpfNormalizado
    : normalizarEmail(loginInformado);

  db.get(sql, [valorBusca], async (err, usuario) => {
    if (err) {
      console.error("Erro no login:", err.message);

      return res.status(500).json({
        erro: "Erro no servidor."
      });
    }

    if (!usuario) {
      return res.status(401).json({
        erro: "Usuário não encontrado."
      });
    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaValida) {
      return res.status(401).json({
        erro: "Senha incorreta."
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        aluno_id: usuario.aluno_id
      },
      SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        cpf: usuario.cpf,
        email: usuario.email,
        tipo: usuario.tipo,
        aluno_id: usuario.aluno_id,
        primeiro_acesso:
          Boolean(usuario.primeiro_acesso)
      }
    });
  });
});

// CADASTRAR ALUNO
app.post("/alunos", (req, res) => {
  const {
    nome,
    cpf,
    data_nascimento,
    whatsapp,
    email,
    genero,
    contato_emergencia,
    status
  } = req.body;

  if (!nome) {
    return res.status(400).json({
      erro: "O nome do aluno é obrigatório."
    });
  }

  db.run(
    `INSERT INTO alunos
     (nome, cpf, data_nascimento, whatsapp, email, genero, contato_emergencia, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nome,
      cpf || null,
      data_nascimento || null,
      whatsapp || null,
      email || null,
      genero || null,
      contato_emergencia || null,
      status || "Ativo"
    ],
    function (err) {
      if (err) {
        console.error("Erro ao cadastrar aluno:", err.message);

        return res.status(500).json({
          erro: "Erro ao cadastrar aluno."
        });
      }

      res.json({
        mensagem: "Aluno cadastrado com sucesso!",
        id: this.lastID
      });
    }
  );
});

// LISTAR ALUNOS
app.get("/alunos", (req, res) => {
  db.all(`SELECT * FROM alunos ORDER BY nome ASC`, [], (err, alunos) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao listar alunos." });
    }

    res.json(alunos);
  });
});

// EDITAR ALUNO
app.put("/alunos/:id", (req, res) => {
  const { id } = req.params;

  const {
    nome,
    cpf,
    data_nascimento,
    whatsapp,
    email,
    genero,
    contato_emergencia,
    status
  } = req.body;

  if (!nome) {
    return res.status(400).json({
      erro: "O nome do aluno é obrigatório."
    });
  }

  db.run(
    `UPDATE alunos
     SET nome = ?,
         cpf = ?,
         data_nascimento = ?,
         whatsapp = ?,
         email = ?,
         genero = ?,
         contato_emergencia = ?,
         status = ?
     WHERE id = ?`,
    [
      nome,
      cpf || null,
      data_nascimento || null,
      whatsapp || null,
      email || null,
      genero || null,
      contato_emergencia || null,
      status || "Ativo",
      id
    ],
    function (err) {
      if (err) {
        console.error("Erro ao editar aluno:", err.message);

        return res.status(500).json({
          erro: "Erro ao editar aluno."
        });
      }

      res.json({
        mensagem: "Aluno atualizado com sucesso!"
      });
    }
  );
});

// MARCAR TREINO COMO CONCLUÍDO PELO ALUNO
app.post("/treinos/:id/concluir", (req, res) => {
  const treinoId = Number(req.params.id);
  const { aluno_id } = req.body;

  if (!treinoId || !aluno_id) {
    return res.status(400).json({
      erro: "Treino e aluno são obrigatórios."
    });
  }

  db.get(
    `SELECT * FROM treinos WHERE id = ? AND aluno_id = ?`,
    [treinoId, Number(aluno_id)],
    (err, treino) => {
      if (err) {
        console.error("Erro ao buscar treino:", err.message);

        return res.status(500).json({
          erro: "Erro ao buscar treino."
        });
      }

      if (!treino) {
        return res.status(404).json({
          erro: "Treino não encontrado para este aluno."
        });
      }

      db.get(
        `SELECT id FROM treino_conclusoes
         WHERE treino_id = ? AND aluno_id = ?`,
        [treinoId, Number(aluno_id)],
        (err, conclusaoExistente) => {
          if (err) {
            console.error("Erro ao verificar conclusão:", err.message);

            return res.status(500).json({
              erro: "Erro ao verificar conclusão do treino."
            });
          }

          if (conclusaoExistente) {
            return res.status(400).json({
              erro: "Este treino já foi marcado como concluído."
            });
          }

          db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            db.run(
              `INSERT INTO treino_conclusoes
               (aluno_id, treino_id, data_conclusao)
               VALUES (?, ?, CURRENT_TIMESTAMP)`,
              [Number(aluno_id), treinoId],
              function (err) {
                if (err) {
                  db.run("ROLLBACK");

                  console.error("Erro ao registrar conclusão:", err.message);

                  return res.status(500).json({
                    erro: "Erro ao registrar conclusão do treino."
                  });
                }

                db.run(
                  `UPDATE treinos
                   SET status = 'Concluído'
                   WHERE id = ?`,
                  [treinoId],
                  function (err) {
                    if (err) {
                      db.run("ROLLBACK");

                      console.error("Erro ao atualizar treino:", err.message);

                      return res.status(500).json({
                        erro: "Erro ao atualizar status do treino."
                      });
                    }

                    db.run("COMMIT", (err) => {
                      if (err) {
                        db.run("ROLLBACK");

                        return res.status(500).json({
                          erro: "Erro ao finalizar operação."
                        });
                      }

                      res.json({
                        mensagem: "Treino marcado como concluído!",
                        treino_id: treinoId,
                        aluno_id: Number(aluno_id),
                        status: "Concluído"
                      });
                    });
                  }
                );
              }
            );
          });
        }
      );
    }
  );
});

// EXCLUIR ALUNO
app.delete("/alunos/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM alunos WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ erro: "Erro ao excluir aluno." });
    }

    res.json({ mensagem: "Aluno excluído com sucesso!" });
  });
});

// CADASTRAR TREINO
app.post("/treinos", (req, res) => {
  const { aluno_id, titulo, objetivo, exercicios, observacoes } = req.body;

  db.run(
    `INSERT INTO treinos (aluno_id, titulo, objetivo, exercicios, observacoes)
     VALUES (?, ?, ?, ?, ?)`,
    [aluno_id, titulo, objetivo, exercicios, observacoes],
    function (err) {
      if (err) {
        return res.status(500).json({ erro: "Erro ao cadastrar treino." });
      }

      res.json({
        mensagem: "Treino cadastrado com sucesso!",
        id: this.lastID
      });
    }
  );
});

// LISTAR TREINOS
app.get("/treinos", (req, res) => {
  const { aluno_id } = req.query;

  let sql = `
  SELECT 
    treinos.*,
    alunos.nome AS aluno_nome,
    treino_conclusoes.data_conclusao,
    CASE
      WHEN treino_conclusoes.id IS NOT NULL THEN 1
      ELSE 0
    END AS concluido
  FROM treinos
  LEFT JOIN alunos ON alunos.id = treinos.aluno_id
  LEFT JOIN treino_conclusoes
    ON treino_conclusoes.treino_id = treinos.id
`;

  const params = [];

  if (aluno_id) {
    sql += ` WHERE treinos.aluno_id = ?`;
    params.push(aluno_id);
  }

  sql += ` ORDER BY treinos.id DESC`;

  db.all(sql, params, (err, treinos) => {
    if (err) {
      console.error("Erro ao listar treinos:", err.message);
      return res.status(500).json({ erro: "Erro ao listar treinos." });
    }

    res.json(treinos);
  });
});

// EDITAR TREINO
app.put("/treinos/:id", (req, res) => {
  const { id } = req.params;
  const { aluno_id, titulo, objetivo, exercicios, observacoes } = req.body;

  if (!aluno_id || !titulo) {
    return res.status(400).json({
      erro: "Aluno e título do treino são obrigatórios."
    });
  }

  db.run(
    `UPDATE treinos
     SET aluno_id = ?, titulo = ?, objetivo = ?, exercicios = ?, observacoes = ?
     WHERE id = ?`,
    [aluno_id, titulo, objetivo, exercicios, observacoes, id],
    function (err) {
      if (err) {
        console.error("Erro ao editar treino:", err.message);
        return res.status(500).json({ erro: "Erro ao editar treino." });
      }

      if (this.changes === 0) {
        return res.status(404).json({ erro: "Treino não encontrado." });
      }

      res.json({ mensagem: "Treino atualizado com sucesso!" });
    }
  );
});

// EXCLUIR TREINO
app.delete("/treinos/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM treinos WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error("Erro ao excluir treino:", err.message);
      return res.status(500).json({ erro: "Erro ao excluir treino." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ erro: "Treino não encontrado." });
    }

    res.json({ mensagem: "Treino excluído com sucesso!" });
  });
});

// CADASTRAR AGENDAMENTO
app.post("/agenda", (req, res) => {
  const {
    aluno_id,
    data,
    horario,
    local,
    latitude,
    longitude,
    
  } = req.body;

  if (!aluno_id || !data || !horario) {
    return res.status(400).json({
      erro: "Aluno, data e horário são obrigatórios."
    });
  }

  db.get(
    `SELECT id FROM agenda WHERE data = ? AND horario = ?`,
    [data, horario],
    (err, conflito) => {
      if (err) {
        console.error("Erro ao verificar agenda:", err.message);

        return res.status(500).json({
          erro: "Erro ao verificar disponibilidade da agenda."
        });
      }

      if (conflito) {
        return res.status(400).json({
          erro: "Já existe uma aula cadastrada nesse dia e horário."
        });
      }

      db.run(
        `INSERT INTO agenda
        (aluno_id, data, horario, local, latitude, longitude, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          Number(aluno_id),
          data,
          horario,
          local || "",
          latitude || "",
          longitude || "",
          "Pendente"
        ],
        function (err) {
          if (err) {
            console.error("Erro ao cadastrar aula:", err.message);

            return res.status(500).json({
              erro: "Erro ao cadastrar aula."
            });
          }

          res.status(201).json({
            mensagem: "Aula cadastrada com sucesso!",
            id: this.lastID
          });
        }
      );
    }
  );
});

// LISTAR AGENDA
app.get("/agenda", (req, res) => {
  db.all(
    `SELECT 
      agenda.id,
      agenda.aluno_id,
      agenda.data,
      agenda.horario,
      agenda.local,
      agenda.latitude,
      agenda.longitude,
      agenda.status,
      alunos.nome AS aluno_nome
     FROM agenda
     LEFT JOIN alunos ON alunos.id = agenda.aluno_id
     ORDER BY agenda.data ASC, agenda.horario ASC`,
    [],
    (err, agenda) => {
      if (err) {
        console.error("Erro ao listar agenda:", err);
        return res.status(500).json({
          erro: "Erro ao listar agenda."
        });
      }

      res.json(agenda);
    }
  );
});

// CADASTRAR PERFIL DO PERSONAL
app.post("/perfil-personal", (req, res) => {
  const {
    usuario_id,
    nome_completo,
    foto,
    cref,
    biografia,
    telefone,
    especialidades
  } = req.body;

  if (!nome_completo) {
    return res.status(400).json({ erro: "O nome completo é obrigatório." });
  }

  db.run(
    `INSERT INTO perfil_personal 
    (usuario_id, nome_completo, foto, cref, biografia, telefone, especialidades)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [usuario_id, nome_completo, foto, cref, biografia, telefone, especialidades],
    function (err) {
      if (err) {
        return res.status(500).json({ erro: "Erro ao cadastrar perfil." });
      }

      res.json({
        mensagem: "Perfil cadastrado com sucesso!",
        id: this.lastID
      });
    }
  );
});

// LISTAR PERFIS DO PERSONAL
app.get("/perfil-personal", (req, res) => {
  db.all(`SELECT * FROM perfil_personal ORDER BY id DESC`, [], (err, perfis) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao listar perfis." });
    }

    res.json(perfis);
  });
});

// LISTAR DISPONIBILIDADES
app.get("/disponibilidade", (req, res) => {
  db.all(
    `SELECT * FROM disponibilidade ORDER BY id DESC`,
    [],
    (err, disponibilidades) => {
      if (err) {
        return res.status(500).json({
          erro: "Erro ao listar disponibilidades."
        });
      }

      res.json(disponibilidades);
    }
  );
});
// CADASTRAR PERFIL DO PERSONAL
app.post("/perfil-personal", (req, res) => {
  const {
    usuario_id,
    nome_completo,
    foto,
    cref,
    biografia,
    telefone,
    especialidades
  } = req.body;

  if (!nome_completo) {
    return res.status(400).json({ erro: "O nome completo é obrigatório." });
  }

  db.run(
    `INSERT INTO perfil_personal 
    (usuario_id, nome_completo, foto, cref, biografia, telefone, especialidades)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [usuario_id, nome_completo, foto, cref, biografia, telefone, especialidades],
    function (err) {
      if (err) {
        return res.status(500).json({ erro: "Erro ao cadastrar perfil." });
      }

      res.json({
        mensagem: "Perfil cadastrado com sucesso!",
        id: this.lastID
      });
    }
  );
});

// LISTAR PERFIS DO PERSONAL
app.get("/perfil-personal", (req, res) => {
  db.all(`SELECT * FROM perfil_personal ORDER BY id DESC`, [], (err, perfis) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao listar perfis." });
    }

    res.json(perfis);
  });
});

// EXCLUIR DISPONIBILIDADE
app.delete("/disponibilidade/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM disponibilidade WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({
        erro: "Erro ao excluir disponibilidade."
      });
    }

    res.json({
      mensagem: "Disponibilidade excluída com sucesso!"
    });
  });
});

// CADASTRAR LOCAL DE ATENDIMENTO
app.post("/locais", (req, res) => {
  const { nome, endereco, latitude, longitude } = req.body;

  if (!nome) {
    return res.status(400).json({
      erro: "O nome do local é obrigatório."
    });
  }

  db.run(
    `INSERT INTO locais (nome, endereco, latitude, longitude)
     VALUES (?, ?, ?, ?)`,
    [nome, endereco, latitude, longitude],
    function (err) {
      if (err) {
        return res.status(500).json({
          erro: "Erro ao cadastrar local."
        });
      }

      res.json({
        mensagem: "Local cadastrado com sucesso!",
        id: this.lastID
      });
    }
  );
});

// LISTAR LOCAIS
app.get("/locais", (req, res) => {
  db.all(`SELECT * FROM locais ORDER BY nome ASC`, [], (err, locais) => {
    if (err) {
      return res.status(500).json({
        erro: "Erro ao listar locais."
      });
    }

    res.json(locais);
  });
});

// EXCLUIR LOCAL
app.delete("/locais/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM locais WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({
        erro: "Erro ao excluir local."
      });
    }

    res.json({
      mensagem: "Local excluído com sucesso!"
    });
  });
});

// EXCLUIR AGENDAMENTO
app.delete("/agenda/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM agenda WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error("Erro ao excluir agendamento:", err);
      return res.status(500).json({
        erro: "Erro ao excluir agendamento."
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        erro: "Agendamento não encontrado."
      });
    }

    res.json({
      mensagem: "Agendamento excluído com sucesso!"
    });
  });
});

// ATUALIZAR STATUS DO AGENDAMENTO
app.patch("/agenda/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      erro: "Informe o status da aula."
    });
  }

  db.run(
    `UPDATE agenda SET status = ? WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar status:", err);
        return res.status(500).json({
          erro: "Erro ao atualizar status da aula."
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          erro: "Agendamento não encontrado."
        });
      }

      res.json({
        mensagem: "Status atualizado com sucesso!"
      });
    }
  );
});

// ACOMPANHAMENTO DO ALUNO
app.get("/acompanhamento/:aluno_id", (req, res) => {
  const { aluno_id } = req.params;

  db.get(
    `SELECT * FROM alunos WHERE id = ?`,
    [aluno_id],
    (err, aluno) => {
      if (err) {
        console.error("Erro ao buscar aluno:", err);
        return res.status(500).json({
          erro: "Erro ao buscar aluno."
        });
      }

      if (!aluno) {
        return res.status(404).json({
          erro: "Aluno não encontrado."
        });
      }

      db.all(
        `SELECT * FROM treinos WHERE aluno_id = ? ORDER BY id DESC`,
        [aluno_id],
        (err, treinos) => {
          if (err) {
            console.error("Erro ao buscar treinos:", err);
            return res.status(500).json({
              erro: "Erro ao buscar treinos."
            });
          }

          db.all(
            `SELECT * FROM agenda WHERE aluno_id = ? ORDER BY data DESC, horario DESC`,
            [aluno_id],
            (err, agenda) => {
              if (err) {
                console.error("Erro ao buscar agenda:", err);
                return res.status(500).json({
                  erro: "Erro ao buscar agenda."
                });
              }

              const resumo = {
                total_aulas: agenda.length,
                concluidas: agenda.filter(aula => aula.status === "Concluída").length,
                faltas: agenda.filter(aula => aula.status === "Falta do aluno").length,
                canceladas: agenda.filter(aula => aula.status === "Cancelada").length,
                confirmadas: agenda.filter(aula => aula.status === "Confirmada").length
              };

              res.json({
                aluno,
                treinos,
                agenda,
                resumo
              });
            }
          );
        }
      );
    }
  );
});

// PAINEL DO ALUNO
app.get("/painel-aluno/:aluno_id", (req, res) => {
  const { aluno_id } = req.params;

  db.get(
    `SELECT * FROM alunos WHERE id = ?`,
    [aluno_id],
    (err, aluno) => {
      if (err) {
        console.error("Erro ao buscar aluno:", err);
        return res.status(500).json({ erro: "Erro ao buscar aluno." });
      }

      if (!aluno) {
        return res.status(404).json({ erro: "Aluno não encontrado." });
      }

      db.all(
        `SELECT * FROM treinos WHERE aluno_id = ? ORDER BY id DESC`,
        [aluno_id],
        (err, treinos) => {
          if (err) {
            console.error("Erro ao buscar treinos:", err);
            return res.status(500).json({ erro: "Erro ao buscar treinos." });
          }

          db.all(
            `SELECT * FROM agenda WHERE aluno_id = ? ORDER BY data ASC, horario ASC`,
            [aluno_id],
            (err, agenda) => {
              if (err) {
                console.error("Erro ao buscar agenda:", err);
                return res.status(500).json({ erro: "Erro ao buscar agenda." });
              }

              res.json({
                aluno,
                treinos,
                agenda
              });
            }
          );
        }
      );
    }
  );
});

app.get("/debug/usuarios", (req, res) => {
  db.all(
    `SELECT id, nome, email, tipo, aluno_id FROM usuarios`,
    [],
    (err, usuarios) => {
      if (err) {
        return res.status(500).json({
          erro: "Erro ao listar usuários."
        });
      }

      res.json(usuarios);
    }
  );
});

// CRIAR ACESSO PARA UM ALUNO JÁ CADASTRADO
app.post("/alunos/:id/acesso", (req, res) => {
  const alunoId = Number(req.params.id);
  const { cpf, email, senha } = req.body;

  const cpfNormalizado = normalizarCpf(cpf);
  const emailNormalizado = normalizarEmail(email);

  if (!alunoId) {
    return res.status(400).json({
      erro: "Aluno inválido."
    });
  }

  if (!cpfNormalizado || cpfNormalizado.length !== 11) {
    return res.status(400).json({
      erro: "Informe um CPF com 11 números."
    });
  }

  if (!emailNormalizado) {
    return res.status(400).json({
      erro: "Informe o e-mail do aluno."
    });
  }

  if (!senha || senha.length < 6) {
    return res.status(400).json({
      erro: "A senha deve possuir pelo menos 6 caracteres."
    });
  }

  // Primeiro verifica se o aluno realmente existe
  db.get(
    `SELECT * FROM alunos WHERE id = ?`,
    [alunoId],
    (err, aluno) => {
      if (err) {
        console.error("Erro ao buscar aluno:", err.message);

        return res.status(500).json({
          erro: "Erro ao buscar aluno."
        });
      }

      if (!aluno) {
        return res.status(404).json({
          erro: "Aluno não encontrado."
        });
      }

      // Verifica se já existe conta vinculada, CPF ou e-mail repetido
      db.get(
        `SELECT id, aluno_id, email, cpf
         FROM usuarios
         WHERE aluno_id = ?
            OR email = ?
            OR cpf = ?`,
        [
          alunoId,
          emailNormalizado,
          cpfNormalizado
        ],
        async (err, usuarioExistente) => {
          if (err) {
            console.error(
              "Erro ao verificar acesso:",
              err.message
            );

            return res.status(500).json({
              erro: "Erro ao verificar acesso do aluno."
            });
          }

          if (usuarioExistente) {
            if (usuarioExistente.aluno_id === alunoId) {
              return res.status(400).json({
                erro: "Este aluno já possui acesso ao sistema."
              });
            }

            return res.status(400).json({
              erro: "CPF ou e-mail já utilizado por outro usuário."
            });
          }

          try {
            const senhaCriptografada = await bcrypt.hash(
              senha,
              10
            );

            db.serialize(() => {
              db.run("BEGIN TRANSACTION");

              // Atualiza CPF e e-mail no cadastro do aluno
              db.run(
                `UPDATE alunos
                 SET cpf = ?, email = ?
                 WHERE id = ?`,
                [
                  cpfNormalizado,
                  emailNormalizado,
                  alunoId
                ],
                function (err) {
                  if (err) {
                    db.run("ROLLBACK");

                    console.error(
                      "Erro ao atualizar aluno:",
                      err.message
                    );

                    return res.status(500).json({
                      erro: "Erro ao atualizar os dados do aluno."
                    });
                  }

                  // Cria o usuário vinculado ao aluno
                  db.run(
                    `INSERT INTO usuarios
                    (
                      nome,
                      cpf,
                      email,
                      senha,
                      tipo,
                      aluno_id,
                      primeiro_acesso
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                      aluno.nome,
                      cpfNormalizado,
                      emailNormalizado,
                      senhaCriptografada,
                      "aluno",
                      alunoId,
                      1
                    ],
                    function (err) {
                      if (err) {
                        db.run("ROLLBACK");

                        console.error(
                          "Erro ao criar acesso:",
                          err.message
                        );

                        return res.status(500).json({
                          erro: "Erro ao criar acesso do aluno."
                        });
                      }

                      const usuarioId = this.lastID;

                      db.run("COMMIT", (err) => {
                        if (err) {
                          db.run("ROLLBACK");

                          return res.status(500).json({
                            erro: "Erro ao finalizar o cadastro."
                          });
                        }

                        res.status(201).json({
                          mensagem:
                            "Acesso do aluno criado com sucesso!",
                          usuario_id: usuarioId,
                          aluno_id: alunoId,
                          primeiro_acesso: true
                        });
                      });
                    }
                  );
                }
              );
            });
          } catch (erro) {
            console.error(
              "Erro ao criptografar senha:",
              erro
            );

            res.status(500).json({
              erro: "Erro ao criar acesso do aluno."
            });
          }
        }
      );
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor Evofit rodando em http://localhost:${PORT}`);
});