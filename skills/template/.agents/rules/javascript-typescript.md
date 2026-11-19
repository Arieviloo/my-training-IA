# Regras de JavaScript/TypeScript

Padrões obrigatórios para todo código JavaScript e TypeScript no projeto (frontend e backend).

## Declaração de variáveis

- **Sempre use `const`** por padrão. Use `let` apenas quando a variável realmente precisar ser reatribuída.
- **Nunca use `var`** (escopo de função, sofre hoisting e é fonte de bugs).

```ts
// ✅ Bom
const name = "Alice";
const users: string[] = [];

let counter = 0; // ✅ aceitável: precisa ser reatribuída
counter += 1;

// ❌ Ruim
var old = "legado";
let unused = "nunca reatribuída";
```

## Comparações

- **Sempre use `===` e `!==`** (comparação estrita). **Nunca use `==` ou `!=`** (coerção implícita de tipos).

```ts
// ✅ Bom
if (user.id === expectedId) { ... }
if (status !== "active") { ... }

// ❌ Ruim
if (user.id == expectedId) { ... }   // coerção implícita
if (status != "active") { ... }
```

Exceção: comparar com `null` ou `undefined` ao mesmo tempo pode usar `== null` quando intencional, mas prefira ser explícito:

```ts
if (value === null || value === undefined) { ... }
// ou
if (value == null) { ... } // apenas se a intenção for cobrir ambos
```

## Tipagem

- **Nunca use `any`**. Use tipos concretos, `unknown` (com narrowing) ou genéricos.
- **Sempre tipifique parâmetros e retornos** de funções que envolvem objetos (interfaces, types, classes).
- Deixe o compilador inferir tipos triviais (literais simples), mas seja explícito em APIs públicas e estruturas de dados.

```ts
// ✅ Bom
interface User {
  id: number;
  name: string;
  email: string;
}

function findUser(id: number): User | undefined {
  return users.find((user) => user.id === id);
}

function toDto(user: User): Pick<User, "id" | "name"> {
  return { id: user.id, name: user.name };
}

// ✅ Bom: unknown com narrowing em vez de any
function parse(input: unknown): User {
  if (typeof input !== "object" || input === null) {
    throw new Error("Invalid input");
  }
  return input as User; // idealmente validar com um schema (ex.: zod)
}

// ❌ Ruim
function findUser(id): any { ... }        // sem tipos, any no retorno
function handle(data: any) { ... }        // any
```

## Arrow functions

- **Use arrow functions sempre que possível**: em callbacks (`map`, `filter`, `reduce`, `forEach`, handlers de eventos, etc.).
- **Não use arrow functions nas funções principais** do arquivo (funções de nível superior/exportadas): prefira `function` declarations para melhor legibilidade e stack traces.

```ts
// ✅ Bom: função principal como declaration
function processUsers(users: User[]): string[] {
  return users
    .filter((user) => user.active === true)
    .map((user) => user.name.toUpperCase());
}

// ✅ Bom: callbacks como arrow functions
const total = items.reduce((acc, item) => acc + item.price, 0);
setTimeout(() => notify("done"), 1000);

// ❌ Ruim: arrow function em função principal exportada
export const processUsers = (users: User[]) => { ... };

// ❌ Ruim: function em callback
items.map(function (item) { return item.name; });
```

## Ternários

- **Use ternários sem aninhamento.** Nunca coloque um ternário dentro de outro ternário. Para condições múltiplas, use `if/else`, `switch` ou extraia para uma função.

```ts
// ✅ Bom
const label = isActive ? "Active" : "Inactive";

const sizeLabel = getSizeLabel(value); // lógica complexa extraída
function getSizeLabel(value: number): string {
  if (value > 100) return "large";
  if (value > 10) return "medium";
  return "small";
}

// ❌ Ruim: ternário aninhado
const sizeLabel = value > 100 ? "large" : value > 10 ? "medium" : "small";
```

## Outras boas práticas

- **Template literals** em vez de concatenação com `+`:
  ```ts
  const greeting = `Hello, ${user.name}!`; // ✅
  const greeting = "Hello, " + user.name + "!"; // ❌
  ```
- **Destructuring** para objetos e arrays:
  ```ts
  const { id, name } = user; // ✅
  const id = user.id; const name = user.name; // ❌ verboso
  ```
- **Named exports** em vez de default exports (facilita refatoração e autocomplete).
- **`as const`** para valores constantes e unions literais:
  ```ts
  const STATUSES = ["active", "inactive"] as const;
  type Status = (typeof STATUSES)[number];
  ```
- **Optional chaining e nullish coalescing** para lidar com valores opcionais:
  ```ts
  const city = user.address?.city ?? "Unknown";
  ```
- **Evite mutação de parâmetros**; prefira retornar novos valores (`map`, `spread`) em vez de modificar os originais.
- **Um propósito por função**: funções pequenas, com nome descritivo e retorno explícito.
- **Imports ordenados**: externos (npm) primeiro, depois internos (`@/...`), depois relativos.

## Erros e exceções

- **Lance instâncias de `Error`** (ou subclasses) com mensagens úteis e contextuais. Nunca lance strings ou objetos soltos.
- **Não capture um erro apenas para ignorá-lo** (empty catch). Se capturar, trate, logue com contexto ou re-lance.
- **Não converta automaticamente todo valor capturado em `Error`** sem preservar o contexto original (ex.: `catch (e) { throw new Error(String(e)) }` perde stack e causa).
- **Use `unknown` no parâmetro do `catch`** quando a linguagem/versão permitir (TypeScript ≥ 4.4 suporta `catch (e: unknown)`).
- **Trate o erro na camada que tiver contexto suficiente** para decidir a resposta ou a recuperação — não engula erros em camadas baixas só para "evitar crash".

```ts
// ✅ Bom
class UserNotFoundError extends Error {
  constructor(id: number) {
    super(`User with id ${id} not found`);
    this.name = "UserNotFoundError";
  }
}

function loadUser(id: number): User {
  const user = findUser(id);
  if (user === undefined) {
    throw new UserNotFoundError(id);
  }
  return user;
}

try {
  saveUser(user);
} catch (error: unknown) {
  logger.error("Failed to save user", { userId: user.id, error }); // preserva o original
  throw error; // re-lança para a camada superior decidir
}

// ❌ Ruim
try {
  saveUser(user);
} catch (e) {
  // silenciado: erro ignorado
}

// ❌ Ruim: perde o contexto do erro original
catch (e: unknown) {
  throw new Error(`Error: ${String(e)}`);
}

// ❌ Ruim: lançar string
throw "user not found";
```

## Módulos

- **Use módulos ES** com `import` e `export`. Nunca use `require`/`module.exports` (CommonJS).
- **Remova imports não utilizados** antes de finalizar a tarefa.
- **Evite exportar símbolos que não façam parte do contrato do módulo** — helpers internos devem permanecer privados.

```ts
// ✅ Bom
import { userService } from "@/services/user"; // usado
export function createUser(dto: UserDto): User { ... }
// helper interno sem export (não faz parte do contrato)
function validate(dto: UserDto): boolean { ... }

// ❌ Ruim
const fs = require("fs");
import { unusedHelper } from "@/lib/helper"; // import não utilizado
export function validate(dto: UserDto): boolean { ... } // detalhe interno exposto
```

## Nomenclatura

- **Prefira nomes completos e expressivos.** Evite abreviações que não sejam universalmente compreendidas (`user` ✅, `usr` ❌; `configuration` ✅, `cfg` ⚠️ apenas se convenção do projeto).
- **Use `is`, `has` e `can`** para funções (e variáveis) booleanas.

```ts
// ✅ Bom
function isValidEmail(email: string): boolean { ... }
function hasPermission(user: User, action: string): boolean { ... }
function canPublish(post: Post): boolean { ... }
const isLoading = status === "loading";

// ❌ Ruim
function email_chk(e: string): boolean { ... }
function perm(u: User, a: string): boolean { ... }
```

## Funções e constantes

- **Mantenha funções curtas e com uma única responsabilidade.** Se a função faz mais de uma coisa, extraia outra função.
- **Extraia constantes** para números, strings e expressões regulares que representem regras de negócio — nada de "magic numbers" ou strings soltas no código.
- Respeite também os limites de tamanho definidos em [`code-standards.md`](code-standards.md).

```ts
// ✅ Bom
const MAX_LOGIN_ATTEMPTS = 5;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_PAGE_SIZE = 20;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function isLocked(user: User): boolean {
  return user.loginAttempts >= MAX_LOGIN_ATTEMPTS;
}

// ❌ Ruim
if (user.loginAttempts >= 5) { ... }        // magic number
if (EMAIL_REGEX_TEST.test(email)) { ... }   // regex inline com regra de negócio
```

## Verificação

- **Rode o linter ao final de cada tarefa** para garantir conformidade:
  ```bash
  # frontend/
  npm run lint

  # backend/
  npx eslint src --ext .ts   # quando configurado
  ```
- Rode também o type-check antes de finalizar:
  ```bash
  # frontend/
  npm run typecheck

  # backend/
  npx tsc --noEmit
  ```
