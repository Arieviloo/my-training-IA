# Regras de React (frontend)

Diretrizes obrigatórias para todo código React do projeto (`frontend/`).

## Componentes

- Crie componentes pequenos e reusáveis. **Não crie componentes com mais de 30 linhas.** Extraia partes para subcomponentes ou hooks quando necessário.
- Prefira componentes funcionais (com hooks). Não escreva class components.

```tsx
// ❌ Evite: componente grande, com múltiplas responsabilidades
function ProductPage() {
  // 60+ linhas misturando fetch, layout, lista, formulário...
}

// ✅ Prefira: componentes pequenos e compostos
function ProductPage() {
  return (
    <section>
      <ProductHeader />
      <ProductList />
    </section>
  );
}

function ProductHeader() {
  return <h1 className="text-2xl font-bold text-gray-900">Products</h1>;
}
```

## Props

- Evite passar props usando spread operator (`<Elemento {...props} />`). Declare explicitamente cada prop que o componente recebe — isso melhora legibilidade, type-check e previsibilidade.

```tsx
// ❌ Evite
function Card(props: CardProps) {
  return <div {...props}>...</div>;
}

// ✅ Prefira
interface CardProps {
  title: string;
  description: string;
}

function Card({ title, description }: CardProps) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
```

## Hooks

- Evite `useEffect` desnecessário (ex.: para derivar estado, responder a eventos ou transformar dados durante o render). Use-o apenas para sincronizar com sistemas externos (rede, DOM, subscriptions).
- Use `useMemo` para evitar recalcular cálculos pesados entre re-renders.

```tsx
// ❌ Evite: useEffect desnecessário para estado derivado
function Total({ price, quantity }: Props) {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(price * quantity);
  }, [price, quantity]);
  return <span>{total}</span>;
}

// ✅ Prefira: derive durante o render
function Total({ price, quantity }: Props) {
  const total = price * quantity;
  return <span>{total}</span>;
}
```

```tsx
// ✅ useMemo para cálculo pesado
function Report({ sales }: ReportProps) {
  const summary = useMemo(() => computeExpensiveSummary(sales), [sales]);
  return <Table rows={summary} />;
}
```

## Separação de responsabilidades

- Separe o acesso ao backend do código do componente. Componentes não fazem chamadas HTTP diretas — isso fica em hooks (`use...`) ou em serviços dedicados.

```tsx
// ❌ Evite: fetch dentro do componente
function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("http://localhost:3000/users")
      .then((res) => res.json())
      .then(setUsers);
  }, []);
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

```tsx
// ✅ Prefira: lógica isolada em um hook customizado
// src/hooks/useUsers.ts
function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.VITE_API_URL}/users`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { users, loading };
}

// src/components/UserList.tsx
function UserList() {
  const { users, loading } = useUsers();

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <ul className="divide-y">
      {users.map((user) => (
        <li key={user.id} className="py-2">
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

- Use hooks com prefixo `use` para conter lógica que fica separada do código do componente (estado, efeitos, chamadas à API, cálculos).

```tsx
// ✅ Hook customizado com lógica reusável
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

## Acessibilidade

- Sempre utilize propriedades de acessibilidade (`aria-*`, `role`, `alt`, rótulos em formulários).

```tsx
// ✅ Exemplo com atributos ARIA
function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div role="search">
      <label htmlFor="search-input" className="sr-only">
        Search products
      </label>
      <input
        id="search-input"
        type="search"
        aria-label="Search products"
        onChange={onSearch}
        className="rounded border px-3 py-2 focus:outline-none focus:ring-2"
      />
      <button aria-live="polite" className="ml-2 rounded bg-blue-600 px-4 py-2 text-white">
        Search
      </button>
    </div>
  );
}
```

## Estilização

- Faça a estilização dos componentes utilizando Tailwind (utility-first, classes inline). Não use CSS modules, styled-components ou CSS global para estilizar componentes.

```tsx
// ✅ Exemplo com Tailwind
function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700"
    >
      {children}
    </div>
  );
}
```
