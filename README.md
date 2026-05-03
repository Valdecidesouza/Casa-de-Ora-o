# Relatório Semanal — Casas de Oração

Sistema em `Vite + React + Tailwind`, com API em `Node/Vercel Functions` e banco compatível com Turso.

## O que mudou

- O frontend agora fala com `/api/*`.
- Em desenvolvimento local, se você **não** configurar variáveis do Turso, a API usa um banco SQLite local em `/home/user/app/.data/relatorio-semanal.db`.
- Em produção na Vercel, configure `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` para usar o Turso.
- Os líderes digitados manualmente ficam gravados no banco e passam a aparecer nas próximas sugestões.
- Existe uma migração automática dos dados antigos que estavam no `localStorage` do navegador.

## Rodando localmente

### Terminal 1

```bash
npm install
npm run api
```

### Terminal 2

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Estrutura importante

- `api/relatorios.js` — listar, criar e excluir relatórios
- `api/lideres.js` — listar líderes
- `api/migrate.js` — importar dados antigos do navegador
- `api/_lib/database.js` — conexão com banco, schema e persistência
- `server/dev-api.js` — API local para desenvolvimento
- `src/store/api.js` — cliente HTTP do frontend
- `vercel.json` — rewrite da SPA sem capturar `/api/*`

## Passo a passo “como se eu nunca tivesse feito isso”

### Parte 1 — colocar o código no GitHub

1. Crie uma conta no GitHub, se ainda não tiver.
2. Crie um repositório novo, por exemplo: `relatorio-casas-oracao`.
3. No seu computador, dentro desta pasta, rode:

```bash
git init
git add .
git commit -m "Sistema pronto para Vercel + Turso"
git branch -M main
git remote add origin COLE_AQUI_A_URL_DO_REPOSITORIO
git push -u origin main
```

### Parte 2 — criar a conta e o banco no Turso

1. Crie sua conta no Turso.
2. Instale o CLI do Turso.
3. Faça login.
4. Crie um banco.
5. Pegue a URL do banco.
6. Gere o token.

Comandos:

```bash
# instalar CLI (Linux/macOS)
curl -sSfL https://get.tur.so/install.sh | bash

# fechar e abrir o terminal, depois:
turso auth signup

# criar o banco
turso db create relatorio-casas-oracao

# pegar a URL
turso db show --url relatorio-casas-oracao

# gerar o token
turso db tokens create relatorio-casas-oracao
```

Guarde estes 2 valores:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

### Parte 3 — subir na Vercel

1. Crie sua conta na Vercel.
2. Clique em `Add New` > `Project`.
3. Conecte sua conta do GitHub.
4. Escolha o repositório `relatorio-casas-oracao`.
5. Na tela de importação, a Vercel deve detectar Vite automaticamente.
6. Antes de clicar em deploy, abra a área de variáveis de ambiente.
7. Cadastre:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
8. Clique em `Deploy`.

### Parte 4 — link personalizado

1. Com o projeto aberto na Vercel, vá em `Settings`.
2. Clique em `Domains`.
3. Clique em `Add Domain`.
4. Digite seu domínio, por exemplo `relatorios.suaigreja.com.br`.
5. A Vercel vai mostrar quais registros DNS você precisa criar.
6. Vá no painel onde você comprou o domínio e copie exatamente esses registros.
7. Volte na Vercel e espere validar.

### Parte 5 — depois que estiver no ar

Sempre que você mudar algo:

```bash
git add .
git commit -m "Minha alteração"
git push
```

A Vercel publica sozinha a nova versão.

## Dica importante

Se você abrir a app local antiga no mesmo navegador, ela tenta migrar automaticamente os dados antigos do `localStorage` para o banco novo.
