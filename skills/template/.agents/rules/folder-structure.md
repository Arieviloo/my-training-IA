# folder-structure.md — Estrutura de Pastas

Guia de referência para organização de arquivos e pastas no projeto. Siga esta estrutura ao criar qualquer arquivo novo.

## Visão geral

```
.
├── frontend/   # SPA em React + Vite (porta 5173)
└── backend/    # API REST em Express + TypeScript (porta 3000)
```

---

## Backend (`backend/`)

Responsabilidades bem separadas: **routes** (HTTP), **services** (regras de negócio), **data** (dados e acesso externo), **types** (tipagem).

```
backend/
├── src/
│   ├── index.ts            # Entry point: sobe o servidor Express
│   ├── routes/             # Definição de rotas HTTP (protocolo HTTP puro)
│   │   └── user.routes.ts  #   ex.: GET /users, POST /users
│   ├── services/           # Regras de negócio e comportamento da aplicação
│   │   └── user.service.ts #   ex.: validações, cálculos, orquestração
│   ├── data/               # Dados, queries e acesso a APIs externas
│   │   ├── user.repository.ts   #   queries no banco
│   │   └── cep.api.ts           #   chamadas a APIs externas
│   ├── types/              # Um arquivo por tipo
│   │   ├── User.ts         #   ex.: interface User { ... }
│   │   └── CreateUserDto.ts
│   └── app.ts              # Configuração do Express (middlwares, cors)
├── tests/                  # Testes automatizados
│   └── user.service.test.ts
├── .env                    # Variáveis de ambiente (PORT)
└── dist/                   # Saída do build de produção (gerado)
```

### Regras por pasta

| Pasta | Papel | Não deve conter |
|---|---|---|
| `routes/` | Definir endpoints HTTP, validar entrada, chamar services | Regras de negócio, queries SQL |
| `services/` | Regras de negócio, fluxos, comportamento da aplicação | Detalhes de HTTP (`req`/`res`), queries |
| `data/` | Queries, acesso a banco de dados e APIs externas | Regras de negócio |
| `types/` | Tipos e interfaces (um arquivo por tipo, nome = nome do tipo) | Lógica executável |
| `tests/` | Testes automatizados (espelhando a estrutura de `src/`) | Código de produção |

Exemplo de fluxo (em inglês): `routes/user.routes.ts` recebe `POST /users` → valida o body → chama `user.service.ts` (`createUser`) → o service aplica regras → chama `user.repository.ts` em `data/` para persistir.

---

## Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── main.tsx            # Entry point (monta o React)
│   ├── App.tsx             # Componente raiz / rotas principais
│   ├── components/         # Componentes reutilizáveis
│   │   └── ui/
│   │       └── button.tsx  #   componentes shadcn/ui
│   ├── views/              # Telas da aplicação (uma por página/rota)
│   │   └── HomeView.tsx
│   ├── services/           # Acesso ao backend (chamadas HTTP)
│   │   └── user.service.ts #   ex.: fetch para http://localhost:3000
│   ├── hooks/              # Hooks customizados
│   │   └── useUsers.ts
│   ├── assets/             # Imagens, fontes e arquivos estáticos
│   ├── types/              # Tipos e interfaces compartilhados
│   │   └── User.ts
│   ├── lib/                # Utilitários (incl. `cn` do shadcn)
│   │   └── utils.ts
│   └── components.json     # Configuração do shadcn/ui
├── tests/                  # Testes automatizados
│   └── HomeView.test.tsx
└── dist/                   # Build de produção (gerado)
```

### Regras por pasta

| Pasta | Papel | Não deve conter |
|---|---|---|
| `components/` | Componentes reutilizáveis, apresentação pura | Chamadas HTTP, regras de negócio |
| `views/` | Telas completas (composição de componentes) | Lógica reutilizável genérica |
| `services/` | Chamadas HTTP ao backend, tipagem das respostas | Componentes, estado de UI |
| `hooks/` | Lógica e estado compartilhados entre componentes | Chamadas diretas fora de services |
| `assets/` | Arquivos estáticos (imagens, fontes, css global) | Código |
| `types/` | Tipos e interfaces compartilhados | Lógica |
| `lib/` | Utilitários puros (`cn`, helpers) | Dependência de React/UI |
| `tests/` | Testes automatizados (espelhando a estrutura de `src/`) | Código de produção |

Exemplo de fluxo (em inglês): `views/HomeView.tsx` usa o hook `hooks/useUsers.ts` → o hook chama `services/user.service.ts` (`getUsers`) → o service faz o `fetch` no backend → os dados são renderizados por `components/`.

---

## Convenções gerais

- **Nomes de arquivos:** kebab-case para arquivos simples; componentes React em PascalCase (`HomeView.tsx`).
- **Um arquivo por tipo** em `types/` — o nome do arquivo é o nome do tipo.
- **Testes espelham `src/`:** `src/services/user.service.ts` → `tests/user.service.test.ts`.
- **Pasta `data` no backend** é a única que fala com banco de dados e APIs externas; **`services` no frontend** é a única que fala com o backend.
- **Pasta `dist/`** (backend) e **build de produção** nunca são versionados no git.
