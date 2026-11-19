# Padrões de Codificação

Regras obrigatórias para todo código do projeto (frontend e backend). Em caso de dúvida, siga o padrão mais simples e legível.

## Sumário

1. [Idioma do código](#1-idioma-do-código)
2. [Comentários](#2-comentários)
3. [Tamanho máximo de classes e arquivos](#3-tamanho-máximo-de-classes-e-arquivos)
4. [Tamanho máximo de métodos e funções](#4-tamanho-máximo-de-métodos-e-funções)
5. [Aninhamento de condicionais e cláusulas guarda](#5-aninhamento-de-condicionais-e-cláusulas-guarda)
6. [Número de parâmetros](#6-número-de-parâmetros)
7. [Linhas em branco dentro de métodos e funções](#7-linhas-em-branco-dentro-de-métodos-e-funções)
8. [Números e strings mágicos](#8-números-e-strings-mágicos)
9. [Declaração de variáveis](#9-declaração-de-variáveis)
10. [Dados sensíveis](#10-dados-sensíveis)

---

## 1. Idioma do código

**Regra:** todo o código deve ser escrito em inglês — nomes de variáveis, funções, métodos, classes, interfaces, tipos, arquivos, pastas e commits. Apenas textos exibidos ao usuário (mensagens de UI) podem estar em português.

❌ **Evite:**

```typescript
function calcularTotal(itens: Item[]): number { /* ... */ }
interface NovoUsuario { /* ... */ }
const repositorioDeUsuarios = new RepositorioUsuarios();
```

✅ **Prefira:**

```typescript
function calculateTotal(items: Item[]): number { /* ... */ }
interface NewUser { /* ... */ }
const userRepository = new UserRepository();
```

Exceção: strings destinadas à interface do usuário (mensagens, rótulos) seguem o idioma do produto; dados sensíveis de domínio do negócio (ex.: nomes de endpoints reais de terceiros) permanecem como são.

---

## 2. Comentários

**Regra:** não insira comentários. Somente caso seja absolutamente necessário, por exemplo, para explicar uma expressão regular complexa. O código deve se explicar sozinho por meio de nomes claros.

❌ **Evite:**

```typescript
const user = await userRepository.findById(id);

// Verifica se o usuário é maior de idade
const isAdult = user.age >= 18;
```

✅ **Prefira (código autoexplicativo):**

```typescript
const user = await userRepository.findById(id);
const isAdult = user.age >= MINIMUM_ADULT_AGE;
```

✅ **Único caso aceitável — expressão regular complexa:**

```typescript
// Captura nomes de arquivos: 1º grupo = prefixo, 2º grupo = ano (4 dígitos), 3º grupo = extensão
const padraoNomeArquivo = /^report_([a-z]+)_(\d{4})\.(csv|json)$/i;
```

Se sentir vontade de comentar, primeiro tente: renomear a variável/método, extrair uma função ou simplificar a lógica.

---

## 3. Tamanho máximo de classes e arquivos

**Regra:** nunca crie classes ou arquivos `.ts` com mais de 100 linhas. Arquivo grande é sinal de mais de uma responsabilidade — separe.

❌ **Evite:** um `user.service.ts` com 300 linhas acumulando validação, formatação, persistência e envio de e-mail.

✅ **Prefira:** dividir por responsabilidade:

```
src/services/user/
├── user.service.ts          (~80 linhas — orquestração)
├── user.validation.ts       (regras de validação)
├── user.mapper.ts           (conversão DTO ↔ entidade)
└── user.repository.ts       (acesso a dados)
```

---

## 4. Tamanho máximo de métodos e funções

**Regra:** métodos e funções devem ter no máximo 30 linhas. Caso o comportamento implementado seja maior, divida em mais métodos.

❌ **Evite:**

```typescript
function processOrder(order: Order): Result {
  const line1 = ...; // 40 lines in the same function:
  const line2 = ...; // validation, tax calculation,
  const line3 = ...; // discount, persistence and email
  // ...tudo junto
}
```

✅ **Prefira:**

```typescript
function processOrder(order: Order): Result {
  const validOrder = validateOrder(order);
  const totals = calculateTotals(validOrder);
  const saved = saveOrder(validOrder, totals);
  return notifyCustomer(saved);
}
```

---

## 5. Aninhamento de condicionais e cláusulas guarda

**Regra:** não aninhe mais de 3 níveis de `if/else`. Dê preferência pelo uso de cláusulas guarda (early return) para evitar o acúmulo de lógica condicional.

❌ **Evite (aninhamento profundo):**

```typescript
function createOrder(req: Request): Response {
  if (req.authenticated) {
    if (req.profile === 'admin') {
      if (req.body) {
        // lógica aqui, 3 níveis abaixo
      }
    }
  }
}
```

✅ **Prefira (cláusulas guarda / early return):**

```typescript
function handle(req: Request): Response {
  if (!req.authenticated) return new UnauthorizedResponse();
  if (req.profile !== 'admin') return new ForbiddenResponse();
  if (!req.body) return new BadRequestResponse();

  return handleRequest(req);
}
```

Cada guarda elimina um caso inválido logo no início, e a lógica principal fica no nível mais raso possível.

---

## 6. Número de parâmetros

**Regra:** evite utilizar mais de 3 parâmetros em métodos e funções. Caso seja necessário, crie objetos parâmetro.

❌ **Evite:**

```typescript
function createUser(
  name: string,
  email: string,
  password: string,
  role: string,
  active: boolean,
) { /* ... */ }

createUser('Ana', 'ana@x.com', 'secreta', 'admin', true);
```

✅ **Prefira:**

```typescript
interface NewUser {
  name: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
}

function createUser(data: NewUser): User { /* ... */ }

createUser({
  name: 'Ana',
  email: 'ana@x.com',
  password: 'secreta',
  role: 'admin',
  active: true,
});
```

Objetos parâmetro são auto-documentados e não dependem da ordem dos argumentos.

---

## 7. Linhas em branco dentro de métodos e funções

**Regra:** evite linhas em branco dentro de métodos e funções. Entre membros de classe ou entre funções em um arquivo, tudo bem.

❌ **Evite:**

```typescript
function calculateTotal(items: Item[]): number {
  const subtotal = items.reduce((s, i) => s + i.price, 0);

  const discount = getDiscount(subtotal);

  return subtotal - discount;
}
```

✅ **Prefira (coeso, sem linhas em branco internas):**

```typescript
function calculateTotal(items: Item[]): number {
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const discount = getDiscount(subtotal);
  return subtotal - discount;
}
```

Se o corpo "precisa" de linhas em branco para ficar legível, é um sinal de que ele deveria ser dividido em mais métodos (regra 3).

---

## 8. Números e strings mágicos

**Regra:** extraia números/strings mágicos para constantes, tornando os conceitos mais claros.

❌ **Evite:**

```typescript
if (user.age >= 18 && attempts > 5) {
  block(user, 'limit reached');
}
```

✅ **Prefira:**

```typescript
const MINIMUM_ADULT_AGE = 18;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LIMIT_MESSAGE = 'limit reached';

if (user.age >= MINIMUM_ADULT_AGE && attempts > MAX_LOGIN_ATTEMPTS) {
  block(user, LOGIN_LIMIT_MESSAGE);
}
```

Exceção: valores triviais e universalmente óbvios (ex.: `0` como índice inicial, `''` como string vazia) podem permanecer inline.

---

## 9. Declaração de variáveis

**Regra:** declare variáveis perto do local onde de fato são utilizadas.

❌ **Evite (declaração longe do uso):**

```typescript
function generateReport(sales: Sale[]) {
  const total = calculateTotal(sales);
  const header = buildHeader(sales);
  // ...50 linhas depois...
  return format(header, total);
}
```

✅ **Prefira (declaração junto ao uso):**

```typescript
function generateReport(sales: Sale[]) {
  const header = buildHeader(sales);
  // ...lógica do cabeçalho...
  const total = calculateTotal(sales);
  return format(header, total);
}
```

---

## 10. Dados sensíveis

**Regra:** nunca coloque dados sensíveis (como chave de API, senhas, tokens, secrets) dentro do código. Sempre em um arquivo `.env` externo.

❌ **Evite (hardcoded):**

```typescript
const response = await fetch('https://api.exemplo.com/v1/dados', {
  headers: {
    Authorization: 'Bearer sk_live_51H8xYzAbCdEf123456',
  },
});
```

✅ **Prefira (variável de ambiente):**

```bash
# backend/.env (fora do git — garantir no .gitignore)
API_EXEMPLO_TOKEN=sk_live_51H8xYzAbCdEf123456
```

```typescript
const token = process.env.API_EXEMPLO_TOKEN;
if (!token) {
  throw new Error('API_EXEMPLO_TOKEN não configurado');
}
const response = await fetch('https://api.exemplo.com/v1/dados', {
  headers: { Authorization: `Bearer ${token}` },
});
```

No frontend, use apenas variáveis com prefixo `VITE_` e nunca exponha secrets de servidor — variáveis do Vite são embutidas no bundle e ficam públicas.
