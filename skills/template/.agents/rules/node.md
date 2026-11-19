# Regras Node.js

Regras obrigatórias para todo código Node.js (backend e scripts de build). Em caso de dúvida, siga o padrão mais simples e legível.

## Sumário

1. [Async/await em vez de callbacks](#1-asyncawait-em-vez-de-callbacks)
2. [Nunca bloqueie o event loop](#2-nunca-bloqueie-o-event-loop)
3. [Variáveis de ambiente em .env com dotenv](#3-variáveis-de-ambiente-em-env-com-dotenv)
4. [Graceful shutdown do servidor HTTP](#4-graceful-shutdown-do-servidor-http)
5. [Logging com adaptador centralizado](#5-logging-com-adaptador-centralizado)
6. [Versione os lock files](#6-versione-os-lock-files)
7. [Evite referências circulares](#7-evite-referências-circulares)
8. [Use npm para instalar bibliotecas](#8-use-npm-para-instalar-bibliotecas)

---

## 1. Async/await em vez de callbacks

**Regra:** prefira sempre `async/await` em relação a callbacks. Use `Promise` nativas e módulos que expõem APIs baseadas em promessas (ex.: `node:fs/promises`). Callbacks são aceitáveis apenas em APIs que só as oferecem (ex.: `server.listen`, streams) ou em bibliotecas de terceiros.

❌ **Evite (callbacks aninhados):**

```typescript
import { readFile, writeFile } from 'node:fs';

readFile('input.json', 'utf-8', (err, data) => {
  if (err) throw err;
  const parsed = JSON.parse(data);
  writeFile('output.json', JSON.stringify(parsed), 'utf-8', (err) => {
    if (err) throw err;
    console.log('Done');
  });
});
```

✅ **Prefira (async/await):**

```typescript
import { readFile, writeFile } from 'node:fs/promises';

async function convertFile(): Promise<void> {
  const data = await readFile('input.json', 'utf-8');
  const parsed = JSON.parse(data);
  await writeFile('output.json', JSON.stringify(parsed), 'utf-8');
}
```

---

## 2. Nunca bloqueie o event loop

**Regra:** o event loop é single-thread — qualquer trabalho pesado de CPU (cálculos, loops longos, parsing gigante, criptografia, compressão, processamento de imagens/PDF) bloqueia todas as requisições. Execute esse tipo de tarefa em processos separados (`worker_threads` ou `child_process`), não no fluxo principal da requisição.

❌ **Evite (bloqueia o event loop por segundos):**

```typescript
app.post('/reports', async (req: Request, res: Response) => {
  const report = heavyFinancialCalculation(req.body.entries); // ~5s de CPU
  res.json(report);
});
```

✅ **Prefira (worker thread):**

```typescript
import { Worker } from 'node:worker_threads';

function runHeavyCalculation(entries: Entry[]): Promise<Report> {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./src/workers/calculation.worker.js', { workerData: entries });
    worker.once('message', resolve);
    worker.once('error', reject);
  });
}

app.post('/reports', async (req: Request, res: Response) => {
  const report = await runHeavyCalculation(req.body.entries);
  res.json(report);
});
```

Outros cuidados:

- Preferir funções assíncronas de I/O (`fs/promises`, `pipeline` de streams) em vez das versões síncronas (`readFileSync`, `JSON.parse` em payloads enormes).
- Nunca use `while (condição) {}` de espera em código de produção; se precisar aguardar, use `setTimeout` promisificado ou eventos.

---

## 3. Variáveis de ambiente em .env com dotenv

**Regra:** toda configuração sensível ou específica do ambiente (portas, credenciais, URLs, tokens) fica em `.env`, carregada pela biblioteca `dotenv` o mais cedo possível no entry point. O arquivo `.env` nunca vai para o git — versione apenas um `.env.example` com os nomes das variáveis.

❌ **Evite:**

```typescript
// Hardcoded ou lido de qualquer lugar
const port = 3000;
const dbUrl = 'postgres://user:secret@localhost:5432/app';
```

✅ **Prefira:**

```bash
# backend/.env (fora do git)
PORT=3000
DATABASE_URL=postgres://user:secret@localhost:5432/app
```

```bash
# backend/.env.example (versionado)
PORT=3000
DATABASE_URL=
```

```typescript
// src/index.ts — primeira linha do entry point
import 'dotenv/config';
```

```typescript
const port = process.env.PORT ?? 3000;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not configured');
}
```

---

## 4. Graceful shutdown do servidor HTTP

**Regra:** ao desligar o servidor HTTP (SIGINT, SIGTERM), feche-o de forma controlada: pare de aceitar novas conexões, aguarde (com timeout) as requisições em andamento terminarem e libere recursos (conexões de banco, workers) antes de encerrar o processo.

❌ **Evite (morte abrupta, requisições cortadas no meio):**

```typescript
const server = app.listen(port);
// ao receber SIGINT, o processo morre e derruba requisições ativas
```

✅ **Prefira:**

```typescript
import { Server } from 'node:http';

const server = app.listen(port, () => {
  console.info(`Server listening on port ${port}`);
});

async function shutdown(signal: string): Promise<void> {
  console.info(`Received ${signal}, shutting down gracefully...`);
  server.close(async (err) => {
    if (err) {
      logger.error('Error while closing server', err);
      process.exit(1);
    }
    await closeDatabaseConnection();
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
```

---

## 5. Logging com adaptador centralizado

**Regra:** não chame `console.log` / `console.error` espalhados pelo código. Crie um adaptador único (`src/shared/logger`) que centraliza o `console` e exponha métodos (`info`, `warn`, `error`, `debug`). Assim, trocar por uma biblioteca de logging ou enviar para um serviço externo exige mudar apenas um arquivo. Hoje o adaptador usa `console.log` (para `info`/`warn`/`debug`) e `console.error` (para `error`).

❌ **Evite (console espalhado):**

```typescript
function createOrder(data: NewUser): Order {
  console.log('creating order...', data);
  if (!data.items.length) console.error('order without items!');
  // ...
}
```

✅ **Prefira (adaptador único):**

```typescript
// src/shared/logger.ts
type Level = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug(message: string, details?: unknown): void;
  info(message: string, details?: unknown): void;
  warn(message: string, details?: unknown): void;
  error(message: string, details?: unknown): void;
}

function createConsoleLogger(): Logger {
  const write = (level: Level, message: string, details?: unknown): void => {
    const output = `[${level.toUpperCase()}] ${message}`;
    if (level === 'error') {
      console.error(output, details ?? '');
      return;
    }
    console.log(output, details ?? '');
  };
  return {
    debug: (message, details) => write('debug', message, details),
    info: (message, details) => write('info', message, details),
    warn: (message, details) => write('warn', message, details),
    error: (message, details) => write('error', message, details),
  };
}

export const logger = createConsoleLogger();
```

```typescript
// uso em qualquer módulo
import { logger } from '@/shared/logger';

logger.info('Order created', { orderId: order.id });
logger.error('Failed to create order', error);
```

---

## 6. Versione os lock files

**Regra:** o arquivo de lock (`package-lock.json`) deve ser versionado no git e nunca editado manualmente. Instale dependências sempre com `npm install` (não use `--no-package-lock`); o lock garante builds reproduzíveis e idênticos para todo o time.

❌ **Evite:**

```bash
npm install express --no-package-lock
# ou apagar/comitar com conflito ignorado no .gitignore
```

✅ **Prefira:**

```bash
npm install express
# commit do package.json E do package-lock.json
```

---

## 7. Evite referências circulares

**Regra:** módulos não devem importar uns aos outros diretamente (A → B → A). Referências circulares causam inicialização indefinida e bugs difíceis de rastrear. Resolva extraindo os tipos/interfaces compartilhados para um módulo de terceiro, ou reorganizando a dependência.

❌ **Evite (ciclo A → B → A):**

```typescript
// user.service.ts
import { OrderService } from './order.service';

// order.service.ts
import { UserService } from './user.service'; // ciclo!
```

✅ **Prefira (dependência em direção única):**

```typescript
// types/order.ts — módulo compartilhado, sem importar serviços
export interface Order {
  userId: string;
  total: number;
}
```

```typescript
// user.service.ts
import type { Order } from '../types/order';

// order.service.ts
import type { User } from '../types/user';
```

Sintomas de ciclo: `undefined` inesperado em import, erro `Cannot read properties of undefined` no topo do módulo, ou TypeScript reclamando de tipos. Se aparecer, quebre a dependência.

---

## 8. Use npm para instalar bibliotecas

**Regra:** instale todas as bibliotecas com `npm`. Não misture package managers (`yarn add`, `pnpm add`, `bun add`) no mesmo projeto — isso gera lock files divergentes e dependências duplicadas.

❌ **Evite:**

```bash
yarn add zod
pnpm add express
```

✅ **Prefira:**

```bash
npm install zod
npm install -D @types/node
```
