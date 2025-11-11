# ValidaCRM - Backend

Backend do sistema ValidaCRM construído com NestJS 10, Prisma ORM e PostgreSQL.

## 🚀 Tecnologias

- **NestJS 10** - Framework Node.js progressivo
- **TypeScript** - Linguagem tipada
- **Prisma** - ORM moderno para Node.js
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação stateless
- **bcrypt** - Hash de senhas

## 📋 Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 15 ou superior
- npm ou yarn

## 🔧 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Ajuste o arquivo `.env` com suas credenciais do PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/valida_crm?schema=public"
JWT_SECRET="valida_secret"
PORT=3333
```

4. Gere o cliente Prisma:
```bash
npx prisma generate
```

5. Execute as migrations:
```bash
npx prisma migrate dev --name init
```

## 🏃 Executando o projeto

### Desenvolvimento
```bash
npm run start:dev
```

### Produção
```bash
npm run build
npm run start:prod
```

## 📊 Prisma Studio

Para visualizar e gerenciar os dados do banco:
```bash
npx prisma studio
```

Acesse: http://localhost:5555

## 🗄️ Estrutura do Banco de Dados

O schema inclui as seguintes entidades:

- **Users** - Usuários do sistema (admin, operador, consultor)
- **Clients** - Clientes do CRM
- **Banks** - Instituições banceiras parceiras
- **Products** - Produtos financeiros (crédito, consórcio, financiamento)
- **Proposals** - Propostas comerciais vinculadas a clientes
- **Documents** - Documentos anexados às propostas
- **Activities** - Linha do tempo de atividades das propostas

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. As rotas protegidas requerem o header:
```
Authorization: Bearer <token>
```

## 📝 Scripts Disponíveis

- `npm run start` - Inicia o servidor
- `npm run start:dev` - Inicia em modo desenvolvimento (watch)
- `npm run start:prod` - Inicia em modo produção
- `npm run build` - Compila o projeto
- `npm run prisma:generate` - Gera o cliente Prisma
- `npm run prisma:migrate` - Executa migrations
- `npm run prisma:studio` - Abre Prisma Studio

## 🌐 Endpoints

Base URL: `http://localhost:3333/api`

### Status
- `GET /` - Health check

### Auth (a implementar)
- `POST /auth/login` - Login
- `GET /auth/me` - Dados do usuário logado

### Clientes (a implementar)
- `GET /clientes` - Listar todos
- `POST /clientes` - Criar novo
- `GET /clientes/:id` - Buscar por ID
- `PUT /clientes/:id` - Atualizar
- `DELETE /clientes/:id` - Deletar

### Propostas (a implementar)
- `GET /propostas` - Listar todas
- `POST /propostas` - Criar nova
- `GET /propostas/:id` - Buscar por ID
- `PUT /propostas/:id` - Atualizar
- `DELETE /propostas/:id` - Deletar

### Bancos (a implementar)
- `GET /bancos` - Listar todos
- `POST /bancos` - Criar novo
- `GET /bancos/:id` - Buscar por ID
- `PUT /bancos/:id` - Atualizar
- `DELETE /bancos/:id` - Deletar

### Produtos (a implementar)
- `GET /produtos` - Listar todos
- `POST /produtos` - Criar novo
- `GET /produtos/:id` - Buscar por ID
- `PUT /produtos/:id` - Atualizar
- `DELETE /produtos/:id` - Deletar

## 📚 Próximos Passos

1. Implementar módulo de autenticação (Auth)
2. Implementar CRUD de usuários
3. Implementar CRUD de clientes
4. Implementar CRUD de propostas
5. Implementar CRUD de bancos
6. Implementar CRUD de produtos
7. Implementar sistema de documentos
8. Implementar dashboard com estatísticas
9. Adicionar testes unitários e e2e
10. Configurar Docker e Docker Compose

## 📄 Licença

Este projeto é privado e proprietário.
