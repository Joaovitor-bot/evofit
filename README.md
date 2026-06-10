
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

### Frontend (Ionic/Angular)
- Tela de **Login/Cadastro** para personal e aluno
- Tela **Dashboard** para visão geral de alunos e atividades
- Tela **Alunos**: listar, cadastrar, editar, excluir
- Tela **Treinos**: gestão de treinos individuais
- Tela **Agenda**: agendamento e atualização de status das aulas
- Tela **Acompanhamento**: histórico de aulas e treinos por aluno

### Backend (Node.js/Express)
- API REST consumida pelo app Ionic
- Rotas principais:
  - `/login` → autenticação
  - `/usuarios` → cadastro de personal/aluno
  - `/alunos` → CRUD de alunos
  - `/treinos` → CRUD de treinos
  - `/agenda` → CRUD de aulas
  - `/perfil-personal` → gestão do perfil do personal
  - `/disponibilidade` → controle de horários disponíveis
  - `/locais` → cadastro e listagem de locais de atendimento
- Banco de dados **SQLite** para persistência de dados

## Tecnologias
- **Frontend:** Ionic, Angular, NgModules, FormsModule
- **Backend:** Node.js, Express
- **Banco de dados:** SQLite
- **Gerenciamento de pacotes:** npm
- **Comunicação:** API REST JSON
- **Controle de estado:** HttpClient do Angular

## Instalação

### Backend:
```bash
cd backend
npm install
node server.js
```
Servidor rodando em `http://localhost:3000`.

### Frontend:
```bash
cd app-evofit
npm install
ionic serve
```
App rodando em `http://localhost:8100`.

## Funcionalidades Disponíveis

### Autenticação
- Login de personal trainer e alunos
- Cadastro de personal trainer

### Gestão de Alunos
- Listar todos os alunos cadastrados
- Cadastrar novos alunos
- Editar dados de alunos existentes
- Excluir alunos
- Seleção de gênero via dropdown

### Treinos
- Cadastro de treinos vinculados a cada aluno
- Listagem de treinos por aluno
- Observações e objetivo de treino

### Agenda de Aulas
- Agendamento de aulas
- Alteração de status de aula (`Confirmada`, `Cancelada`, etc.)
- Exclusão de aulas

### Perfil do Personal
- Cadastro e edição do perfil
- Upload de foto, biografia e especialidades
- Controle de disponibilidade semanal

## Observações Técnicas
- O backend é responsável por **todas as validações e persistência de dados**
- O frontend Ionic consome a API via **HttpClient** e atualiza dinamicamente as telas
- O app suporta **CRUD completo** de alunos, treinos e agenda
- Mensagens de CSP no console do navegador (`.well-known/appspecific/...`) podem aparecer, mas **não afetam o funcionamento do app**
