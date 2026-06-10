
# Evofit - Plataforma de Gestão para Personal Trainers

## Descrição Técnica
**Evofit** é uma aplicação híbrida desenvolvida com **Ionic/Angular** no frontend e **Node.js/Express** no backend, utilizando **SQLite** como banco de dados.

O sistema permite que **personal trainers gerenciem sua base de alunos**, com controle completo de:
- Cadastro de alunos e seus dados pessoais
- Agendamento de aulas e histórico de treinamentos
- Controle de treinos e acompanhamento individual
- Gestão de informações do personal, incluindo perfil e disponibilidade

O app é um **cliente móvel/híbrido**, que se comunica com o backend via **API REST**.

## Arquitetura

```
App Ionic/Angular  <--HTTP-->  Node.js/Express API  <--SQLite-->  Banco de dados
```

## Status
- em desenvolvimento...
## Observações Técnicas
- O backend é responsável por **todas as validações e persistência de dados**
- O frontend Ionic consome a API via **HttpClient** e atualiza dinamicamente as telas
- O app suporta **CRUD completo** de alunos, treinos e agenda
- Mensagens de CSP no console do navegador (`.well-known/appspecific/...`) podem aparecer, mas **não afetam o funcionamento do app**
