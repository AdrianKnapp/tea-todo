# Code Generation Rules & Patterns

## Core Principles

This project follows specific coding patterns that prioritize readability, maintainability, and type safety. Always follow these conventions when generating or modifying code.

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.

## ✅ Quality Checklist

**After making changes, always run:**

```bash
pnpm lint --fix    # Fix linting issues automatically
npx tsc --noEmit    # Check for TypeScript errors
```

## Control Flow Patterns

### Early Return Pattern (No Else Statements)

Always use early returns instead of else blocks for better readability:

```typescript
// ✅ CORRECT - Early returns
if (isLoading && !plan) {
  return <div className="animate-pulse px-4">Loading...</div>
}

if (!plan) {
  return null
}

// Continue with main logic...
const { diet } = plan
return <div>...</div>

// ❌ WRONG - Avoid else blocks
if (isLoading && !plan) {
  return <div>Loading...</div>
} else if (!plan) {
  return null
} else {
  // main logic
}
```

### Conditional Rendering

Use conditional rendering with ternary operators for className concatenation:

```typescript
// ✅ CORRECT - Ternary for conditional classes
className={cn(
  'base-class',
  isActive ? 'active-class' : 'inactive-class',
  hasError && 'error-class'
)}

// ✅ CORRECT - Conditional component rendering
{attach && (
  <div className="...">
    <p>{attach}</p>
  </div>
)}

{index > 0 ? (
  <span className="...">{plain('myPlan.soon')}</span>
) : null}
```

## Layout & Spacing Patterns

### Flexbox with Gap (Avoid Margin/Spacing Utilities)

Always use `flex` with `gap` instead of `space-x`, `space-y`, or individual margins:

```typescript
// ✅ CORRECT - Use flex with gap
<div className="flex items-center gap-2">
<div className="flex flex-col gap-4">
<div className="flex w-full flex-wrap gap-4 lg:gap-12">
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

// ❌ WRONG - Avoid these spacing utilities
<div className="space-y-4">
<div className="space-x-2">
<div className="mb-4 mt-2">
```

### Responsive Design

Use responsive prefixes consistently:

```typescript
// ✅ CORRECT - Consistent responsive pattern
className = 'flex flex-col gap-4 lg:flex-row lg:gap-8'
className = 'text-sm lg:text-base'
className = 'px-4 lg:px-8'
className = 'hidden md:block'
```

## Component Patterns

### Component Structure

Follow this consistent component structure:

```typescript
// ✅ CORRECT - Standard component structure
export const ComponentName: FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. Hooks first
  const { plain } = useTranslation('namespace')
  const [state, setState] = useState()

  // 2. Early returns for loading/error states
  if (isLoading) return <Loading />
  if (error) return <Error />

  // 3. Main render logic
  return (
    <div className="flex flex-col gap-4">
      {/* content */}
    </div>
  )
}
```

### Props Interface

Always define clear, typed props interfaces:

```typescript
// ✅ CORRECT - Clear props interface
interface ComponentProps {
  title: string
  description?: string
  onAction: () => void
  variant?: 'primary' | 'secondary'
}
```

### JSX Rendering Anti-Patterns

**NEVER create functions inside components that return JSX.** This is a very bad practice that creates unnecessary function instances on every render and makes code harder to maintain.

```typescript
// ❌ WRONG - Function returning JSX inside component
export const MyComponent: FC = () => {
  const [currentStep, setCurrentStep] = useState(1)

  const renderStep = () => {
    if (currentStep === 1) return <StepOne />
    if (currentStep === 2) return <StepTwo />
    if (currentStep === 3) return <StepThree />
    return null
  }

  return <div>{renderStep()}</div>
}

// ✅ CORRECT - Direct conditional rendering in JSX
export const MyComponent: FC = () => {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div>
      {currentStep === 1 && <StepOne />}
      {currentStep === 2 && <StepTwo />}
      {currentStep === 3 && <StepThree />}
    </div>
  )
}

// ✅ ALSO CORRECT - Extract to separate component if complex
const StepRenderer: FC<{ currentStep: number }> = ({ currentStep }) => {
  if (currentStep === 1) return <StepOne />
  if (currentStep === 2) return <StepTwo />
  if (currentStep === 3) return <StepThree />
  return null
}

export const MyComponent: FC = () => {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div>
      <StepRenderer currentStep={currentStep} />
    </div>
  )
}
```

**Why this matters:**
- Functions created inside components are recreated on every render, causing performance issues
- Makes code less declarative and harder to read
- Breaks React DevTools component tree visualization
- If the logic is complex enough to need a function, extract it to a separate component instead

## State Management Patterns

### Local State with Hooks

Prefer local state with hooks over complex state machines:

```typescript
// ✅ CORRECT - Simple boolean flags for UI states
const [isDialogOpen, setIsDialogOpen] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)
const [activeTab, setActiveTab] = useState<'diet' | 'training'>('diet')

// Use for conditional rendering
if (isSubmitting) {
  return <LoadingSpinner />
}
```

### Context Usage

Use context for cross-component state that doesn't change frequently:

```typescript
// ✅ CORRECT - Context for shared state
const { user } = useUser()
const { data: plan } = useDietPlan()

// Avoid prop drilling
```

## Service Layer Patterns

### Service Classes

Use service classes for business logic with dependency injection:

```typescript
// ✅ CORRECT - Service class pattern
export class PlansService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async createPlan({ userId, ...params }: CreatePlanPayload) {
    if (!userId) throw new Error('Not authenticated')

    const { data, error } = await this.supabase
      .from('diet_plans')
      .upsert({ user_id: userId, ...params })
      .select()
      .single()

    if (error) throw error
    return data
  }
}
```

### Error Handling

Follow consistent error handling patterns:

```typescript
// ✅ CORRECT - Error handling pattern
try {
  const result = await service.operation()
  return NextResponse.json(result)
} catch (err: any) {
  console.error('Operation failed:', err)
  captureException(err)
  return NextResponse.json({ error: 'Internal error' }, { status: 500 })
}
```

## Type Safety Patterns

### Generic Types

Leverage TypeScript generics for type-safe APIs:

```typescript
// ✅ CORRECT - Generic hooks and functions
const useTranslation = <Page extends keyof PagesTranslations>(
  namespace: Page
): TranslationReturn<PagesTranslations[Page]>

// ✅ CORRECT - Generic service methods
async getById<T>(id: string): Promise<T | null>
```

### Type Guards

Use type guards for runtime type checking:

```typescript
// ✅ CORRECT - Type guards
if (error && error.code !== 'PGRST116') throw error

// ✅ CORRECT - Null checks
if (!user) return null
if (!plan) return <NoPlan />
```

---

## 🏗️ Core Principles

- **Feature-based organization** — group files by business domain.
- **Single responsibility** — one clear purpose per file.
- **Early return over else** — keep logic flat and readable.
- **Keep it simple** — no abstractions without need.
- **Explicit > implicit** — clear, predictable behavior.
- **Strict type safety** — no `any`, always define interfaces.
- **Fail fast, fail clearly** — surface typed, actionable errors.

---

## 📁 File & Folder Structure

Every entity — component, hook, util, service, context, or constant — follows the **same structure**:

```
<scope>/
└── <entity-name>/
    ├── index.ts[x]
    └── types.ts (optional)
```

**Rules:**

- Folder names must use **kebab-case**.
- Code always lives inside an `index` file.
- Create `types.ts` if there are props, parameters, or interfaces.
- Never add files directly to root-level feature folders.

---

## ⚛️ React & TypeScript

- Use `function components` with `FC<Props>` type.
- Prefer **named exports** only.
- Extract logic into hooks when possible.
- Use `forwardRef` when refs are needed.
- Avoid `any`; use `unknown` if necessary.
- Keep components small (< 200 lines).

---

## 💡 Quality & Readability

- No redundant comments or docstrings.
- Comment only complex business logic or reasoning.
- Use ESLint and Prettier strictly.
- Always type parameters and return values.
- No console logs, dead code, or commented-out blocks.

---

## 🧱 Naming Convention

| Item       | Pattern                   |
| ---------- | ------------------------- |
| Folder     | `kebab-case`              |
| Entry file | `index.ts` or `index.tsx` |
| Types      | `types.ts`                |
| Tests      | `index.spec.ts[x]`        |
| Styles     | `styles.ts`               |

---

## 🔒 Security & Accessibility

- Validate all user input with Zod.
- Sanitize output before rendering.
- Use semantic HTML and proper ARIA attributes.
- Ensure keyboard navigation and contrast compliance.

---

## 🧩 LLM Behavior

When generating or editing code:

- Always follow the **kebab-case + index file** rule.
- Always co-locate types and styles.
- Never use default exports.
- Never generate unnecessary comments.
- Keep code minimal, typed, and consistent with existing patterns.
- Favor clarity, maintainability, and structure over cleverness.
