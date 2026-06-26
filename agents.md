# Agents: Build, Style, and Architecture Rules

This file defines development policy for the coding agent working in this repo.
It also contains explicit product/runtime requirements where noted.

## Commands

Frontend (Vite):

- Dev server: `npm run dev`
- Build (prod): `npm run build`
- Build (dev): `npm run build:dev`
- Lint: `npm run lint`
- Preview: `npm run preview`

Backend:

- use conda env refero-env 
- Tests use pytest
- Full backend tests: `pytest api/tests -q`
- Single test file: `pytest api/tests/test_http_endpoints.py -q`
- Single test by name: `pytest api/tests -k test_chat_intro_happy_path -q`

Integration tests:

- Tests must run without external credentials by default.
- Any test that requires live services/keys must skip unless `RUN_INTEGRATION_TESTS=1`.

1. Guided Autonomy & Transparency
Prioritize momentum, but never hide your reasoning or make silent structural decisions.

State, Then Execute: If an implementation detail is ambiguous, choose the standard best-practice approach, state your assumption clearly in your response, and proceed. Only halt and ask the user if a missing credential, conflicting requirement, or missing dependency completely blocks execution.

Surface Tradeoffs Briefly: If choosing between two valid paths (e.g., memory efficiency vs. speed), implement the simpler one but briefly note the alternative to the user.

No Mocking/Placeholders: Never write mock API responses, placeholder modes, or fake data unless explicitly instructed. If an endpoint or key is missing, build the architecture to support it, then ask the user for the actual integration details.

Optimize first for human readers: clarity, locality, explicitness, visible control flow, consistent conventions, and practical correctness over cleverness, minimal keystrokes, or fashion.

2. Radical Simplicity (YAGNI & KISS)
Write the absolute minimum amount of code necessary. 

No Premature Abstractions: Only abstract code if it immediately reduces duplication or solves a structural problem for features that are required today. Do not build abstract classes, factories, or generic interfaces for hypothetical future use cases.

Treat rising complexity as defect risk: split tangled routines or modules, remove duplication that multiplies maintenance effort, and reduce what a maintainer must keep in working memory.

Literal Execution: Only implement features explicitly requested by the user. Do not anticipate future edge cases that fall outside the current scope.

Targeted Error Handling: Only implement error handling for volatile external I/O (e.g., api calls, database queries, file system access). Do not add defensive type-checking or try/catch blocks to deterministic local functions unless requested.

Keep functions or methods small, focused, and at one level of abstraction. Tell the story top-down so intent appears before detail.

Let design emerge through tests, duplication removal, expressiveness, and minimal structure; do not add needless abstractions or infrastructure.

3. Surgical & Non-Invasive Edits
Limit changes to only what is strictly necessary.

Zero Collateral Damage: Do not reformat, refactor, compress, or "clean up" adjacent code, imports, or files that are outside the immediate scope of the user's request.

Match Existing Paradigms: Adopt the exact naming conventions, file structures, and coding styles present in the surrounding code, even if it contradicts modern generic best practices.

Leave Dead Code Alone: If you spot unused or deprecated code, leave it exactly as it is. You may flag it to the user in chat, but do not delete it from the codebase.

Clean Up After Yourself: Any temporary scaffolding or scripts created purely to verify your own work must be deleted before you finish the task.

When cleanup starts spreading into unrelated areas, cut back to the smallest refactor that keeps the requested change safe and readable.


4. Verifiable Execution
Prove the code works before concluding the task with tests. 

Test-Driven Fixes: When fixing a bug, attempt to write a failing test or isolated reproduction script first. The bug is only considered fixed when this exact test passes.

Regression Awareness: Always ensure your changes do not break existing code. If test suites or type checkers are available in the repository, run them before declaring the task complete.

Clear Success States: Avoid abstract goals. Define exactly what output, terminal code, or visual change dictates that the task is successfully finished.

When fixing a bug or changing behavior, add or update the test that protects the intended contract.
---

## Non-Negotiables

1. Separation of concerns over convenience.
2. No business logic in layout/presentational UI.
3. API routes stay thin: validate/authorize/orchestrate only.
4. Data access is centralized (no scattered Supabase calls).
5. Keep cross-layer contracts explicit (schemas/types) and versionable.
6. Tests are required for behavior changes and bug fixes.
7. Do not read the `.env` file. Assume keys are injected by the environment. If it is suspected they are missing, ask the user to check.
8. There should be no hardcoded information like text blocks, urls, etc. anywhere that could represent replaceable data, these should instead be moved into appropriate location within the folder.
---

## Repo Boundaries

### Backend (`api/`)

Owns:
- HTTP endpoints (FastAPI)
- Authentication/authorization handling
- Orchestration of app workflows (WhatsApp webhook, web chat)
- Domain logic (agent/message processing)
- Server-side integrations (WhatsApp API, LLM provider)

Must NOT:
- Import frontend-only env vars (`VITE_*`). Backend envs are backend-only.
- Mix HTTP route code with DB queries and business rules in the same function.
- Keep all routes and dependencies in a single mega file (split by domain).
- Return database rows directly without shaping them into response models.

### Database (`supabase/`)

Owns:
- Schema, RLS policies, and SQL
- Migrations / structure files

Must NOT:
- Encode business rules only in the client (rules that matter belong in DB constraints/RLS and/or server).

### Frontend (`client/`)

Owns:
- UI/UX, routing, state management, data fetching
- Presentational components and page composition (separate from logic)
- Client-side auth session handling

Must NOT:
- Contain secrets (no service role keys; no privileged Supabase keys)
- Perform backend-only business logic that must be trusted

---

## Frontend Structure Rules

Default pattern: *pages orchestrate, hooks implement logic, components render.*

- `client/pages/`: route-level containers.
  - OK: routing, composing sections, wiring hooks, handling loading/error states.
  - NOT OK: direct API wiring or Supabase calls.
- `client/components/`: reusable UI building blocks.
  - OK: render props, styling, accessibility, local UI state.
  - NOT OK: calling `fetch`, `supabase.*`, or mutating global state.
- `client/hooks/`: reusable stateful logic.
  - OK: auth/session hooks, derived state, side-effects, data fetching.
- `client/lib/`: pure utilities and client-side service helpers.
- `client/integrations/`: external SDK wrappers.

Practical rules:
- Components under `client/components/` should be testable by passing props.
- Prefer container/presenter split when a component grows.
- Prefer React Query for server state; avoid ad-hoc `useEffect` fetching.
- Keep domain transformations out of JSX (map/format in hooks/helpers).

---

## Backend Structure Rules

Route handlers (FastAPI endpoints) may:
- Parse and validate request (`api/schemas/...`)
- Call a service function
- Shape response (explicit schema) and map exceptions to HTTP errors

Route handlers must NOT:
- Perform raw Supabase REST queries inline
- Build LLM prompts inline
- Copy/paste httpx calls across endpoints

Service layer:
- Use service modules for workflow logic (e.g., `api/message_service.py`).
- Fetch data via a repository/client wrapper.
- Apply domain rules and persist results.

Data access:
- Centralize Supabase access behind one boundary.
- Prefer `api/utils/supabase_client.py` as the single place for Supabase REST calls.
- If data access grows, split into `api/repositories/*.py` but keep one boundary.

Structure and size:
- Split routes by domain (e.g., `api/routes/messages.py`).
- Keep `api/index.py` as the app entry point only.
- Group agent/LLM dependencies under `api/agents/`.

Schemas and contracts:
- All request/response bodies must have Pydantic models under `api/schemas/`.
- Keep naming consistent with DB and frontend types (`client_id`, `phone_number`, etc.).
- Never let internal DB column changes leak into API responses without mapping.

---

## Supabase Usage Rules

- **Frontend**: Uses anon/publishable key only.
- **Backend**: Uses service role key *only* when it must bypass RLS (e.g., admin operations). 
- **JWTs & RLS**: For user-initiated requests (web chat/dashboard/messages), read/write data with the end-user JWT (Authorization header) so RLS is enforced. Do not use admin/service role access for convenience.
- **Authorization**: Any endpoint that accepts `client_id` must verify access with the caller JWT before reads/writes; reject unauthorized access early.
- **Keep env vars split**:
  - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
  - Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Code Style Guidelines

General:
- Match existing style in the file you edit.
- Prefer explicit types for public APIs, hook returns, and props.

Imports:
- Group imports: external libs, internal modules, relative paths.
- Use path aliases (`@/`) when available.
- Avoid unused imports.
- don't do imports in the middle of the code , but on the header.

TypeScript:
- Use `type` for unions and simple aliases; `interface` for object shapes when extending.
- Props are `PascalCase` types, component names are `PascalCase`.
- Functions and variables are `camelCase`.

Python:
- Use type hints on public functions.
- Keep side effects out of import time.
- Use `async`/`await` for I/O and keep handlers non-blocking.

Error handling:
- Catch and handle network errors in hooks/services.
- Return user-safe messages; log details without secrets.
- Use HTTPException mapping in routes, not in services.

Logging:
- Log intent and outcomes; do not log secrets, tokens, or full PII payloads.

---
## Development Guardrails (Implementation Policy)

The rules in this section are additional coding policies discovered on previous bad behaviour discovered, therefore should be followed .

- LangGraph conversation state must have a single source of truth per flow: either checkpointer/thread state or explicit provided history, but never both at once.
- LangGraph nodes that inspect tool outputs must avoid scanning stale historical tool messages from prior turns.
- Add/maintain unit tests for auth boundaries, env/key boundaries, localization of user-facing errors, and state-management invariants (not only integration tests).
- Avoid circular imports by enforcing one-way module dependencies across layers (routes -> services -> agents/utils/repositories); refactor shared logic into lower-level modules instead of creating cycles.
- Do not introduce pass-through wrapper functions whose only purpose is delaying imports; fix dependency direction and module ownership instead.