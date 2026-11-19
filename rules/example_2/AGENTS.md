# AGENTS.md — Contexto do Projeto

Guia de referência rápida para LLMs e desenvolvedores. Leia antes de qualquer trabalho no código.

## Regras do projeto

- Padrões de codificação: [`.agents/rules/code-standards.md`](.agents/rules/code-standards.md) — **leitura obrigatória antes de escrever qualquer código.**
- Regras de testes: [`.agents/rules/tests.md`](.agents/rules/tests.md) — **leitura obrigatória antes de escrever qualquer teste.**
- Regras de React: [`.agents/rules/react.md`](.agents/rules/react.md) — **leitura obrigatória antes de escrever qualquer componente frontend.**
- Estrutura de pastas: [`.agents/rules/folder-structure.md`](.agents/rules/folder-structure.md) — **leitura obrigatória antes de criar qualquer arquivo ou pasta.**
- Regras de Node.js: [`.agents/rules/node.md`](.agents/rules/node.md) — **leitura obrigatória antes de escrever qualquer código backend/Node.**
- Regras de JavaScript/TypeScript: [`.agents/rules/javascript-typescript.md`](.agents/rules/javascript-typescript.md) — **leitura obrigatória antes de escrever qualquer código JS/TS.**

## Visão geral

Projeto full-stack JavaScript/TypeScript com duas aplicações independentes (monorepo simples, sem workspaces): `frontend/` (SPA em React + Vite, porta 5173) e `backend/` (API REST em Express + TypeScript, porta 3000). A estrutura completa de pastas está documentada em [`.agents/rules/folder-structure.md`](.agents/rules/folder-structure.md).

## Papel de cada tecnologia

### Frontend (`frontend/`)
| Tecnologia | Papel |
|---|---|
| **React 19** | Biblioteca de UI — componentes e páginas da aplicação |
| **Vite 7** | Dev server + bundler/build de produção |
| **TypeScript 5** | Tipagem estática do código frontend |
| **Tailwind CSS 3** | Estilização utility-first (com PostCSS + Autoprefixer) |
| **shadcn/ui** (`components.json`) | Componentes de UI pré-construídos |
| **lucide-react** | Ícones |
| **clsx + tailwind-merge + class-variance-authority** | Utilitários de composição de classes CSS (padrão shadcn) |
| **ESLint 9** | Lint do código |

Estrutura: `src/components` (componentes), `src/lib` (utilitários, incl. `cn`), `src/assets`. Alias de import: `@` → `./src`.

### Backend (`backend/`)
| Tecnologia | Papel |
|---|---|
| **Express 5** | Framework HTTP — API REST |
| **TypeScript 5** | Tipagem estática do código backend |
| **cors** | Habilita CORS (permite chamadas do frontend) |
| **dotenv** | Carrega variáveis de ambiente de `.env` |
| **tsx + nodemon** | Hot-reload em desenvolvimento (`npm run dev`) |
| **tsc** | Compilação para produção (saída em `dist/`) |

Estrutura: `src/index.ts` (entry point). Rotas existentes: `GET /health` (health check).

## Onde cada coisa roda (portas)

| Serviço | Porta | URL |
|---|---|---|
| Frontend (Vite dev server) | **5173** (padrão Vite) | http://localhost:5173 |
| Backend (Express) | **3000** | http://localhost:3000 |

- A porta do backend vem de `process.env.PORT || 3000` — configurável via `.env` em `backend/`.
- O backend já habilita CORS globalmente, então o frontend pode chamá-lo direto em dev.
- O Vite ainda **não** tem proxy configurado (`vite.config.ts`); chamadas à API precisam da URL completa (ex.: `http://localhost:3000`) ou da variável `VITE_API_URL`.

## Como rodar o projeto

Cada pasta é um projeto npm independente — instale e rode separadamente.

```bash
# Backend (terminal 1)
cd backend
npm install
npm run dev          # servidor em http://localhost:3000 (hot-reload via nodemon+tsx)

# Frontend (terminal 2)
cd frontend
npm install
npm run dev          # app em http://localhost:5173
```

Sanity check do backend: `curl http://localhost:3000/health` → `{"status":"healthy",...}`.

## Comandos por pasta

### `frontend/`
| Comando | O que faz |
|---|---|
| `npm run dev` | Dev server com HMR |
| `npm run build` | Type-check (`tsc -b`) + build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | ESLint |
| `npm run typecheck` | Só o type-check, sem build |

### `backend/`
| Comando | O que faz |
|---|---|
| `npm run dev` | Dev server com hot-reload |
| `npm run build` | Compila TS → `dist/` |
| `npm start` | Roda o build compilado (`node dist/index.js`) — requer `npm run build` antes |
| `npm test` | **Ainda não implementado** (`no test specified` → exit 1) |

## Testes

- **Backend:** não há testes configurados. `npm test` falha propositalmente até um framework (ex.: Vitest ou Jest) ser adicionado.
- **Frontend:** não há testes configurados. Verificação disponível hoje: `npm run typecheck` e `npm run lint`.

## Convenções e notas

- Package managers: npm (existem `package-lock.json` nas duas pastas).
- Frontend usa ESM (`"type": "module"`) com extensão `.tsx`; backend usa TS compilado pelo `tsc`.
- Alias `@/` disponível apenas no frontend.
- Variáveis de ambiente: backend via `dotenv` (`backend/.env`, ex.: `PORT`); frontend via `VITE_*` quando necessário.
- Ao criar componentes shadcn/ui no frontend, usar o alias `@/components` e o utilitário `cn` de `@/lib/utils`.
