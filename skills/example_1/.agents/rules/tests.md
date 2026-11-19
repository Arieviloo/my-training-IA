# Regras de Testes

Regras obrigatórias para testes automatizados em todo o projeto (frontend e backend). Em caso de dúvida, priorize o comportamento mais crítico do sistema.

## Sumário

1. [Cobertura obrigatória](#1-cobertura-obrigatória)
2. [Prioridade: o que testar primeiro](#2-prioridade-o-que-testar-primeiro)
3. [Princípios FIRST](#3-princípios-first)
4. [Estrutura dos testes (Given/When/Then ou AAA)](#4-estrutura-dos-testes-givenwhenthen-ou-aaa)
5. [Um conceito por teste](#5-um-conceito-por-teste)
6. [Pirâmide de testes](#6-pirâmide-de-testes)
7. [Ferramentas](#7-ferramentas)
8. [Abrangência: backend e frontend](#8-abrangência-backend-e-frontend)
9. [Organização dos testes E2E](#9-organização-dos-testes-e2e)

---

## 1. Cobertura obrigatória

**Regra (crítica — não deve ser ignorada):** todo código deve ser coberto por testes automatizados. A cobertura mínima exigida é de **80%**.

❌ **Evite:** enviar código novo ou modificado sem testes, ou permitir que a cobertura fique abaixo de 80%.

✅ **Prefira:** escrever o teste junto com o código (ou antes dele) e verificar a cobertura antes de finalizar a tarefa:

```bash
npx vitest run --coverage
```

---

## 2. Prioridade: o que testar primeiro

**Regra:** foque os testes naquilo que é mais crítico para o negócio.

❌ **Evite:** gastar esforço de testes em funcionalidades de baixo impacto enquanto fluxos essenciais ficam descobertos.

✅ **Prefira:** hierarquizar por criticidade — por exemplo, **um checkout é mais crítico que um cadastro de categoria de produto**. O checkout recebe cobertura densa primeiro; o cadastro de categoria recebe testes adequados, mas depois dos fluxos essenciais.

---

## 3. Princípios FIRST

Os testes devem seguir os princípios **FIRST**:

### F — FAST (rápidos)

Priorize testes que rodam rápido. Use **test patterns como stub** para evitar dependências externas lentas ou que causem degradação de performance (banco de dados real, APIs externas, filesystem lento).

❌ **Evite (dependência externa lenta):**

```typescript
test('returns order total', async () => {
  const order = await api.getExternalOrder('order-123');
  expect(order.total).toBe(150);
});
```

✅ **Prefira (stub para dependência externa):**

```typescript
test('returns order total', () => {
  const orderRepository = stub<OrderRepository>({ findById: async () => ORDER });
  const getOrderTotal = createGetOrderTotal(orderRepository);
  expect(await getOrderTotal('order-123')).toBe(150);
});
```

### I — INDEPENDENT (independentes)

Testes não podem depender uns dos outros. Caso um teste quebre e ele seja base para a execução de outro, o outro também quebrará. Cada teste deve configurar seu próprio estado e poder rodar em qualquer ordem, isolado.

❌ **Evite (estado compartilhado entre testes):**

```typescript
let createdUserId: string;

test('creates user', async () => {
  createdUserId = (await createUser(USER)).id;
  expect(createdUserId).toBeDefined();
});

test('finds user created above', async () => {
  const user = await findUser(createdUserId);
  expect(user.name).toBe(USER.name);
});
```

✅ **Prefira (cada teste é autossuficiente):**

```typescript
test('finds user by id', async () => {
  const repository = stub<UserRepository>({ findById: async () => USER });
  const user = await findUser('user-1', repository);
  expect(user.name).toBe(USER.name);
});
```

### R — REPEATABLE (repetíveis)

Ao serem repetidos diversas vezes, os testes devem produzir sempre os mesmos resultados. Por conta disso, use **test patterns como mock** para eliminar fontes de não-determinismo: data/hora atual, valores aleatórios, chamadas de API externas que voltam valores diferentes a cada chamada.

❌ **Evite (não-determinismo):**

```typescript
test('creates order with correct timestamp', () => {
  const order = createOrder(ITEMS);
  expect(order.createdAt).toBe(new Date());
});
```

✅ **Prefira (mock de data/hora):**

```typescript
test('creates order with correct timestamp', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-19T10:00:00Z'));
  const order = createOrder(ITEMS);
  expect(order.createdAt).toEqual(new Date('2026-11-19T10:00:00Z'));
  vi.useRealTimers();
});
```

### S — SELF VALIDATED (autovalidados)

Os testes devem eles mesmos garantir que quebram frente a falhas de comportamento. Não é somente cobertura que conta: os **retornos e o comportamento devem ser devidamente validados**, com boas assertions/expects.

❌ **Evite (teste que apenas executa o código):**

```typescript
test('processes payment', () => {
  processPayment(ORDER, PAYMENT_METHOD);
});
```

✅ **Prefira (comportamento validado):**

```typescript
test('rejects payment when card is expired', () => {
  const result = processPayment(ORDER, EXPIRED_CARD);
  expect(result.status).toBe('rejected');
  expect(result.reason).toBe('card expired');
});
```

### T — TIMELY (oportunamente)

A parte do **TIMELY pode ser ignorada**. Crie os testes na ordem que fizer mais sentido para a eficiência da LLM.

---

## 4. Estrutura dos testes (Given/When/Then ou AAA)

**Regra:** todo teste deve seguir a estrutura **Given/When/Then** ou **AAA (Arrange/Act/Assert)** para ficar bem estruturado: contexto → ação → verificação.

❌ **Evite (teste desestruturado):**

```typescript
test('applies discount', () => {
  expect(applyDiscount(CART, TEN_PERCENT).total).toBe(90);
});
```

✅ **Prefira (AAA):**

```typescript
test('applies ten percent discount', () => {
  const cart = createCart(TEN_PERCENT);
  const discounted = applyDiscount(cart);
  expect(discounted.total).toBe(90);
});
```

---

## 5. Um conceito por teste

**Regra:** foque em um conceito específico por teste — não misture comportamentos diferentes. Cada teste valida um requisito.

❌ **Evite (vários requisitos em um teste):**

```typescript
test('checkout works', () => {
  expect(validateItems(CART)).toBe(true);
  expect(calculateTotal(CART)).toBe(150);
  expect(processPayment(CART, CARD).status).toBe('approved');
});
```

✅ **Prefira (um requisito por teste):**

```typescript
test('rejects cart with invalid items', () => {
  expect(validateItems(CART_WITH_INVALID_ITEM)).toBe(false);
});

test('calculates total from item prices', () => {
  expect(calculateTotal(CART)).toBe(150);
});

test('approves valid payment', () => {
  expect(processPayment(CART, VALID_CARD).status).toBe('approved');
});
```

---

## 6. Pirâmide de testes

**Regra:** siga o conceito de pirâmide de testes:

```
        /  E2E  \        (menos, mais lentos)
      / Integração \
    /    Unidade     \   (muitos, rápidos)
```

- **Base larga: testes de unidade** — a maioria dos testes; rápidos, isolados, validam lógica pura com stubs/mocks.
- **Camada do meio: testes de integração** — validam a colaboração entre módulos (ex.: rota + service + repository com dependências simuladas).
- **Topo: testes E2E** — poucos; validam fluxos críticos de ponta a ponta (ex.: fluxo completo de checkout).

---

## 7. Ferramentas

| Tipo | Biblioteca |
|---|---|
| Testes (unidade e integração) | **Vitest** |
| Testes E2E | **Playwright** |

```bash
# Backend e frontend
npx vitest run --coverage

# E2E
npx playwright test
```

---

## 8. Abrangência: backend e frontend

**Regra:** tanto o **backend** quanto o **frontend** devem ter testes abrangentes.

- **Backend:** serviços, regras de negócio, validações e rotas (integração).
- **Frontend:** componentes, hooks, utilitários e fluxos de interação do usuário.

---

## 9. Organização dos testes E2E

**Regra:** os testes E2E devem ficar em uma pasta **fora do frontend e do backend**, chamada `E2E`:

```
.
├── frontend/
├── backend/
└── E2E/
    └── checkout.spec.ts
```

✅ **Prefira (exemplo de teste E2E):**

```typescript
import { test, expect } from '@playwright/test';

test('completes checkout successfully', async ({ page }) => {
  await page.goto('/cart');
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByText('Order confirmed')).toBeVisible();
});
```
