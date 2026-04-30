# Goa.City — Master Code Standards

> [!IMPORTANT]
> **This is the single source of truth for all code written in this project.**
> Every agent, human developer, or contributor MUST follow these standards.
> **DO NOT bypass these instructions.** Failure to maintain these standards or accidental deletion of data is UNACCEPTABLE.
> Last updated: 2026-04-25

---

## 1. Data Integrity & Prisma Rules

### Rule: NEVER run commands that can wipe or reset the production database.

1. **Safety First**: When updating the schema, prefer `npx prisma db push` for quick iterative changes or safe migrations.
2. **Migration Caution**: NEVER run `npx prisma migrate dev` if it prompts to reset the database. If a reset is required, back up all data first.
3. **Seeding**: Always maintain a safe seed script (`prisma/seed.ts` or `prisma/seed-templates.ts`) to restore critical system data (Templates, Default Cities, SuperAdmins) if a disaster occurs.
4. **ID Preservation**: Critical system records (like OTP templates) must have fixed IDs (1, 2, etc.) to ensure hardcoded references in the backend never break.

---

## 2. Design Aesthetics & Styling

### Rule: Maintain the established "Look and Feel". DO NOT change global CSS variables or base styles without explicit permission.

The project uses two distinct design languages:

### 2a. Member Portal Style (Premium, High-Contrast)
- **Rounded Corners**: Always use `rounded-2xl` (16px) for cards and main buttons.
- **Backgrounds**: Cards should use `bg-white dark:bg-zinc-900/30`. Avoid flat dark backgrounds; prefer translucent/glassmorphic effects.
- **Shadows (The "Stewardship" Look)**:
    - Default: `shadow-2xl shadow-zinc-200/50 dark:shadow-none`.
    - Hover: `hover:shadow-2xl hover:shadow-indigo-600/20 hover:-translate-y-1 transition-all`.
- **Borders**: Prefer `border-none`. Use subtle dividers (`divide-zinc-50 dark:divide-zinc-800`) for lists/tables instead of full card borders.
- **Typography**: Inter (Sans) for body, Montserrat (Display) for headings. Headings are typically `font-black` and `tracking-tighter`.
- **Primary Classes**:
    - `.member-card`: Translucent background with heavy premium shadow.
    - `.member-btn`: Indigo-600, `rounded-2xl`, bold, with a corresponding colored shadow.
    - `.member-input`: `rounded-2xl`, `bg-zinc-50 dark:bg-zinc-900/50`, shadow-sm.

### 2b. Admin Console Style (Professional, Dark Mode Optimized)
- **Rounded Corners**: `rounded-lg` (8px).
- **Primary Color**: Indigo-600.
- **Shadows**: `shadow-2xl shadow-zinc-200/20 dark:shadow-none`.
- **Primary Classes**:
    - `.admin-card`: `rounded-lg`, subtle border, shadow.
    - `.admin-btn`: Indigo-600, `rounded-lg`, uppercase tracking-wider, shadow-lg.
    - `.admin-input`: `rounded-lg`, white/zinc-950 bg.

### 2c. Icons
- Use **Heroicons (v24/solid or outline)** for all icons.
- Consistency: Use the same icons for the same actions (e.g., `PencilSquareIcon` for Edit, `TrashIcon` for Delete).

---

## 3. Language & File Extensions

### Rule: All React component files use `.tsx`. All non-component utility files use `.ts`.

| File Type              | Extension | Example                          |
|------------------------|-----------|----------------------------------|
| React component/page   | `.tsx`    | `AdminMembers.tsx`               |
| Hook                   | `.ts`     | `useAuth.ts`                     |
| Context                | `.tsx`    | `AuthContext.tsx`                 |
| Utility / helper       | `.ts`     | `formatDate.ts`                  |
| API module             | `.ts`     | `admin-forms.api.ts`             |
| Type definitions       | `.ts`     | `meeting.types.ts`               |
| Config                 | `.ts`     | `vite.config.ts`                 |

**Never use `.jsx` or `.js` for source files.** The only exception is `main.tsx` (the Vite entry point).

### Backend
- All backend source files use `.ts` extension.
- Compiled output goes to `dist/` as `.js` (never edit compiled files).

---

## 4. TypeScript Conventions

### 2a. Component Typing

Every React component MUST be typed with `React.FC`:

```tsx
// ✅ CORRECT
const AdminMembers: React.FC = () => {
    return <div>...</div>;
};

// ❌ WRONG — untyped arrow function
const AdminMembers = () => {
    return <div>...</div>;
};
```

### 2b. State Typing

Always provide explicit generic types for `useState` when the initial value doesn't fully describe the type:

```tsx
// ✅ CORRECT — array starts empty, type not inferable
const [members, setMembers] = useState<Member[]>([]);
const [selectedId, setSelectedId] = useState<number | null>(null);

// ✅ OK — type is obvious from initial value
const [loading, setLoading] = useState(false);
const [searchTerm, setSearchTerm] = useState('');

// ❌ WRONG — empty array without generic
const [members, setMembers] = useState([]);
```

### 2c. Interface Naming

- Data model interfaces: PascalCase noun — `Member`, `Meeting`, `Stream`
- Props interfaces: `ComponentNameProps` — `MemberCardProps`
- API response interfaces: `ComponentNameResponse` or inline

```tsx
interface Member {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
}

interface AdminMembersProps {
    initialFilter?: string;
}
```

### 2d. Event Handler Typing

```tsx
// ✅ CORRECT
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... };
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { ... };
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { ... };

// For callbacks with known shapes
const handleDelete = async (id: number): Promise<void> => { ... };
```

### 2e. API Response Typing

```tsx
// ✅ Define the shape, use it at the call site
interface MeetingResponse {
    id: number;
    title: string;
    meeting_date: string;
    stream_id: number | null;
}

const res = await api.get<MeetingResponse[]>('/admin/meetings');
```

### 2f. `any` Usage

- **Never use `any` for new code** unless interfacing with an untyped third-party library.
- If `any` is unavoidable, add a `// TODO: type this properly` comment.
- Prefer `unknown` over `any` when the type is genuinely unknown.

---

## 5. React Component Patterns

### 3a. File Structure

Every page component file follows this order:

```tsx
// 1. Imports (React, libraries, local)
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

// 2. Type/Interface definitions
interface Meeting { ... }

// 3. Component declaration
const AdminMeetings: React.FC = () => {
    // 3a. Hooks (state, refs, navigation, context)
    // 3b. Effects
    // 3c. Handler functions
    // 3d. Render
    return ( ... );
};

// 4. Default export (always at the bottom)
export default AdminMeetings;
```

### 3b. Component Naming

| Type           | Convention          | Example                    |
|----------------|--------------------|-----------------------------|
| Admin page     | `Admin` + Entity    | `AdminMembers`             |
| Admin editor   | `Admin` + Entity + `Editor` | `AdminMeetingEditor` |
| Member page    | Entity name         | `Dashboard`, `Profile`     |
| Layout         | Entity + `Layout`   | `AdminLayout`              |
| Shared UI      | PascalCase          | `Card`, `Button`, `Input`  |

### 3c. Hooks Best Practices

```tsx
// ✅ Destructure what you need
const { register, handleSubmit, watch, setValue, reset } = useForm<MeetingFormData>();
const navigate = useNavigate();
const { id } = useParams<{ id: string }>();

// ✅ Type useParams
const { id } = useParams<{ id: string }>();
```

### 3d. Conditional Rendering

```tsx
// ✅ Early return for loading/error states
if (loading) return <LoadingSpinner />;
if (error) return <ErrorDisplay message={error} />;

// ✅ Inline conditionals for simple cases
{isEdit && <DeleteButton />}

// ❌ Avoid nested ternaries
{a ? (b ? <X /> : <Y />) : <Z />}
```

---

## 6. Styling

- **TailwindCSS v4** via `@tailwindcss/vite` plugin.
- All utility classes go directly in JSX `className` attributes.
- Use `clsx()` or `tailwind-merge` for conditional classes.
- Dark mode: always provide `dark:` variants for backgrounds, text, and borders.
- Design tokens: use the zinc/slate palette for neutrals, indigo for primary actions, emerald for success/WhatsApp, red for destructive actions.

---

## 7. State Management

- **Local state**: `useState` for component-scoped state.
- **Server state**: `@tanstack/react-query` for data fetching and caching.
- **Form state**: `react-hook-form` for all form handling.
- **Global state**: React Context (via `useAuth`, `useAdminAuth`, `useTheme`).
- **No Redux, no Zustand** — the app is not complex enough to warrant them.

---

## 8. API Integration

### 6a. Axios Instance

All API calls go through the shared Axios instance at `src/api/axios.ts`. Never use raw `fetch` or create new Axios instances.

```tsx
import api from '../../api/axios';

// ✅ CORRECT
const res = await api.get<Member[]>('/admin/users');

// ❌ WRONG
const res = await fetch('/api/admin/users');
```

### 6b. Error Handling

```tsx
try {
    const res = await api.get('/admin/meetings');
    setMeetings(res.data);
} catch (error) {
    console.error('Failed to fetch meetings:', error);
    // Show user-facing feedback
}
```

### 6c. Toast/Notification Pattern

Use the local toast state pattern (no external toast library):

```tsx
const [toast, setToast] = useState('');

const showToast = (msg: string): void => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
};

// In JSX:
{toast && (
    <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold ...">
        {toast}
    </div>
)}
```

---

## 9. File & Directory Structure

### 9a. Standard Directory Layout

```
frontend/src/
├── api/              # Global Axios instance & core API config
├── components/       # Global shared reusable components (Navbar, Sidebar)
├── context/          # React Contexts (Auth, Theme, etc.)
├── features/         # Feature-based modules (The primary location for logic)
│   └── [feature-name]/
│       ├── api/          # Feature-specific API modules (e.g. news.api.ts)
│       ├── components/   # UI components unique to this feature
│       ├── hooks/        # Feature-specific custom hooks (e.g. useNews.ts)
│       └── types/        # Feature-specific TypeScript interfaces
├── hooks/            # Global custom hooks (useDebounce, etc.)
├── layouts/          # Layout wrappers (AdminLayout, DashboardLayout)
├── pages/            # Route-level page components (Entry points only)
│   ├── admin/        # Admin panel pages
│   └── ...           # Member-facing pages
├── shared/           # Atomic UI primitives (Card, Button, Input)
└── utils/            # Pure utility functions (date, string manipulation)
```

### 9b. Feature-Based Architecture Rules

1. **Feature Encapsulation**: All business logic, API calls, and domain-specific UI components MUST live inside a subfolder in `src/features/`.
2. **Page as a Thin Wrapper**: Files in `src/pages/` should be minimal. Their primary job is routing and layout. They should simply import and render a "View" component from a feature.
   
   ```tsx
   // ✅ CORRECT (src/pages/Meetings.tsx)
   import React from 'react';
   import MeetingsView from '../features/meetings/components/MeetingsView';
   
   const MeetingsPage: React.FC = () => {
       return <MeetingsView />;
   };
   export default MeetingsPage;
   ```

3. **No Cross-Feature Imports (Strict)**: A component in `feature-A` should NOT import logic from `feature-B`. If logic is shared, it must be moved to `src/shared/`, `src/hooks/`, or `src/api/`.
4. **Consistency**: Ensure folder names are plural and lowercase (e.g., `meetings`, `news`, `members`).

**Rule**: Do NOT create duplicate files across `pages/` and `features/`. Each component exists in exactly one canonical location.

---

## 10. Backend Conventions

### 8a. Controller Pattern

```typescript
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getItems = async (req: Request, res: Response) => {
    try {
        const items = await prisma.model.findMany({ ... });
        return res.json(items);
    } catch (error: any) {
        console.error('getItems Error:', error);
        return res.status(500).json({ message: error.message });
    }
};
```

### 8b. Prisma Scoping

- The Prisma client extension automatically scopes queries by `city_id`.
- `findUnique` is excluded from scoping (cannot inject `city_id` into unique where clauses).
- Global models (`City`, `Admin`, `Otp`) are never scoped.
- Always use Prisma's fluent API over raw SQL unless complex joins are required.

### 8c. Route Registration

All admin routes live in `admin.routes.ts`. Pattern:
```typescript
router.get('/resource', getResources);
router.post('/resource', validate(createResourceSchema), createResource);
router.get('/resource/:id', getResourceById);
router.put('/resource/:id', validate(updateResourceSchema), updateResource);
router.delete('/resource/:id', deleteResource);
```

**Every POST and PUT route MUST have a Zod validation middleware.** See Section 11 below.

### 8d. Multer for File Uploads

Any route that accepts `FormData` MUST include `upload.single('fieldname')` or `upload.array('fieldname')` middleware BEFORE the controller. Without it, `req.body` will be `undefined`.

---

## 11. Input Validation with Zod

### 9a. Why Zod is Mandatory

The project uses **Zod v4** for runtime input validation on the backend. Every route that accepts user input (`POST`, `PUT`, `PATCH`) MUST validate `req.body` through a Zod schema before the controller runs.

**Current state**: Zod is installed and the middleware exists (`middleware/validate.ts`), but it is only used on auth routes. All admin routes currently lack validation — this is a known gap that must be closed when modifying any admin route.

### 9b. Schema File Location

All Zod schemas live in `backend_node/src/validations/`:

```
validations/
├── auth.schema.ts      # Login, OTP
├── meeting.schema.ts   # Meeting CRUD
├── member.schema.ts    # Member CRUD
├── stream.schema.ts    # Stream CRUD
└── template.schema.ts  # Email/WhatsApp templates
```

### 9c. Schema Pattern

```typescript
// validations/meeting.schema.ts
import { z } from 'zod';

export const createMeetingSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        meeting_date: z.string().min(1, 'Meeting date is required'),
        stream_id: z.number().int().positive().optional(),
        description: z.string().optional(),
        location_name: z.string().optional(),
        payment_amount: z.union([z.string(), z.number()]).optional(),
    }),
});

export const updateMeetingSchema = createMeetingSchema.extend({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID must be a number'),
    }),
});
```

### 9d. Applying Validation to Routes

```typescript
// routes/admin.routes.ts
import { validate } from '../middleware/validate.js';
import { createMeetingSchema, updateMeetingSchema } from '../validations/meeting.schema.js';

router.post('/meetings', upload.single('payment_qr_image'), validate(createMeetingSchema), createMeeting);
router.put('/meetings/:id', upload.single('payment_qr_image'), validate(updateMeetingSchema), updateMeeting);
```

**Order matters**: `multer` → `validate` → `controller`. Multer populates `req.body` from multipart data, then Zod validates the shape, then the controller runs.

### 9e. Frontend Validation

For critical forms (meeting creation, member registration), add client-side validation BEFORE submitting:

```tsx
// ✅ Validate before API call
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
        showToast('Title is required');
        return;
    }
    // ... submit
};
```

This provides instant user feedback. The backend Zod validation is the **safety net**, not the primary UX mechanism.

---

## 12. Error Handling

### 10a. Backend Error Hierarchy

The project has a layered error handling system:

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Zod Validation (middleware/validate.ts)│  ← Catches bad input BEFORE controller
│  Returns: 400 + { message, errors[] }           │
├─────────────────────────────────────────────────┤
│  Layer 2: Controller try/catch                   │  ← Catches business logic & DB errors
│  Returns: 4xx/5xx + { message }                 │
├─────────────────────────────────────────────────┤
│  Layer 3: Global Error Handler (error.handler.ts)│  ← Catches anything controllers miss
│  Returns: 500 + { message, stack? }             │
├─────────────────────────────────────────────────┤
│  Layer 4: Process Guards (index.ts)              │  ← Prevents server crash from unhandled
│  Logs error, keeps server running                │     promises/exceptions
└─────────────────────────────────────────────────┘
```

### 10b. Error Classes

```typescript
// utils/errors.ts
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) { ... }
}

export class ValidationError extends AppError {
    public readonly errors: { path: string; message: string }[];
    constructor(message: string, errors: { path: string; message: string }[]) { ... }
}
```

Use `AppError` for known, recoverable errors:
```typescript
if (!meeting) throw new AppError('Meeting not found', 404);
if (!meeting.stream_id) throw new AppError('Meeting is not linked to a stream', 400);
```

### 10c. Process-Level Crash Guards

**MANDATORY** in `index.ts` — prevents the entire server from crashing on unhandled errors:

```typescript
// index.ts — add AFTER app.listen()
process.on('uncaughtException', (error: Error) => {
    console.error('[FATAL] Uncaught Exception:', error);
    // Don't exit — PM2 will restart if needed
});

process.on('unhandledRejection', (reason: unknown) => {
    console.error('[FATAL] Unhandled Promise Rejection:', reason);
    // Don't exit — PM2 will restart if needed
});
```

### 10d. Standardized API Error Response Contract

All error responses from the backend MUST follow this shape:

```typescript
interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: { path: string; message: string }[];  // Only for validation errors
    stack?: string;                                 // Only in development
}
```

### 10e. Frontend Error Handling

The frontend MUST handle API errors gracefully — never show raw error objects to users.

```tsx
// ✅ CORRECT — parse error response, show user-friendly message
try {
    await api.post('/admin/meetings', formData);
    showToast('Meeting saved successfully');
} catch (error: any) {
    const message = error.response?.data?.message || 'Something went wrong';
    showToast(message);
    console.error('Save failed:', error);
}

// ❌ WRONG — raw alert
catch (error) {
    alert(error);
}

// ❌ WRONG — silent failure
catch (error) {
    console.error(error);
    // No user feedback!
}
```

### 10f. Axios Response Interceptor

The shared Axios instance should include a response interceptor for global error handling:

```typescript
// api/axios.ts
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle token expiry — redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

---

## 13. Testing & Deployment

- Always run `npm run build` locally for both frontend and backend before deploying.
- TypeScript compilation errors MUST be fixed before deployment — never use `// @ts-ignore`.
- Use the `4-DEPLOY-TO-SERVER.command` script for production deployments.
- Database schema changes require `npx prisma db push && npx prisma generate` on the server.
- **Never add a new npm dependency without confirming it is in `package.json`.** The `react-hot-toast` incident (broke the build because it wasn't installed) is the canonical example.

---

## 14. What NOT to Do

| Anti-Pattern | Why | Instead |
|---|---|---|
| `.jsx` / `.js` extensions | Inconsistent, no type safety | Always `.tsx` / `.ts` |
| `any` without comment | Defeats TypeScript's purpose | Use proper types or `unknown` |
| `react-hot-toast` or other unlisted deps | Not in package.json, breaks builds | Use local toast pattern |
| Raw SQL for simple queries | Bypasses Prisma scoping, error-prone | Use Prisma fluent API |
| Manual `Content-Type: multipart/form-data` | Breaks Axios boundary generation | Let Axios handle it |
| `// @ts-ignore` or `// @ts-nocheck` | Hides real bugs | Fix the type error |
| Duplicate files in pages/ and features/ | Confusing imports, stale code | One canonical location per component |
| POST/PUT route without Zod validation | Allows malformed data into the database | Always add `validate(schema)` middleware |
| Bare `req.body` destructuring without validation | Crashes on undefined fields (the "req.body is undefined" bug) | Zod validates shape first, then destructure |
| `alert()` for user feedback | Blocks UI, unprofessional | Use the `showToast()` pattern |
| Silent `catch` with only `console.error` | User has no idea something failed | Always show user-facing feedback |
| Adding deps to `import` without `npm install` | Build passes locally (cached), fails on deploy | Run `npm install <pkg>` first, verify `package.json` |
| Using non-standard date formats | Inconsistent UX across pages | Always use `dd/mm/yyyy` (e.g., 25/12/2026) |

---

## 15. Date Formatting Conventions

### Rule: Always use `dd/mm/yyyy` for date display across the platform.

1. **Frontend Standard**: Use a shared utility function (e.g., `formatDate`) to ensure consistency.
2. **Backend Standard**: When formatting dates for API responses (if necessary), follow the same `dd/mm/yyyy` pattern.
3. **Internal Storage**: Always use ISO strings or Date objects for state and data transfer; only format at the "last mile" of rendering.

```tsx
// ✅ CORRECT — Utility usage
import { formatDate } from '../utils/date';
<span>{formatDate(post.created_at)}</span> // Output: 25/04/2026

// ❌ WRONG — Locale-dependent or custom formats
<span>{new Date(date).toLocaleDateString()}</span> // Format varies by browser
<span>{format(new Date(date), 'MMM do')}</span> // Non-standard
```

