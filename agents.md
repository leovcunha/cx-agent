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

## Principles 

### 1. Think and Align Before Coding
*Do not assume user intent, do not hide technical uncertainty, and always make tradeoffs explicit before writing code.*

* **Explicit Assumptions**: If a requirement is underspecified or ambiguous, stop and state your assumptions before proceeding. If you are uncertain about a design decision, ask for clarification from the user.
* **No Speculative Mocking/Fallbacks**: Never write speculative code, placeholder modes, or mock logic (e.g., simulating API responses because of missing keys) based on assumptions about user resources or configurations. If a resource or key is missing, halt and ask the user how they wish to proceed.
* **Surface Tradeoffs**: When multiple implementation paths exist, present them to the user with their pros, cons, and performance implications (e.g., latency, dependency overhead).
* **Propose Simpler Alternatives**: If a requested feature can be achieved through a simpler or more elegant design, propose it before implementing the more complex requested approach.
* **Halt on Confusion**: If you encounter contradictory requirements or confusing legacy code, stop immediately. Document the exact conflict and wait for clarification.

### 2. Radical Simplicity (YAGNI & KISS)
*Write the absolute minimum amount of code necessary to solve the problem. Do not write speculative code or build premature abstractions.*

* **No Speculative Features**: Only implement features explicitly requested. 
* **Compress and Rewrite**: Keep code compact and readable.
* **Realistic Error Handling**: Implement error handling for expected external failure modes (e.g., API timeouts, rate limits, network drops). Do not write redundant error handling or check for impossible states in deterministic local code.

### 3. Surgical and Non-Invasive Edits
*Limit the footprint of your changes. Touch only the files, lines, and functions that are strictly necessary to accomplish the goal.*

* **Strict Scope Isolation**: Do not "improve," reformat, or refactor adjacent code or files that are outside the scope of the requested change. Leave them exactly as they are.
* **Match Existing Style**: Conform entirely to the existing coding style, naming conventions, directory structures, and import patterns in the repository, even if you prefer a different approach.
* **Flag, Do Not Delete**: If you notice dead, unused, or deprecated code during your work, do not delete it. Instead, flag it to the user or note it in the pull request description.
* **Clean Up**: If temporary scripts are created to test anything that won't be part of the test suite, please remove them at the end.

### 4. Goal-Oriented and Verifiable Execution
*Define clear success criteria for every task and verify them programmatically before concluding work.*

* **Failing Test First (Reproduction)**: When fixing a bug, first write a test case or script that reproduces the bug and fails. Verify that the bug is fixed only when that specific test case passes.
* **Pre/Post Regression Checks**: Before and after making any change, run existing verification suites (linting, type checking, or unit tests) to ensure zero regressions are introduced.
* **Explicit Success Criteria**: Avoid vague definitions of done. Translate tasks into concrete, verifiable outcomes:
  * *Vague*: "Implement API endpoint validation."
  * *Verifiable*: "Write an integration test that sends invalid JSON to the endpoint, verify it returns 422 Unprocessable Entity, then make the test pass."
* **Test Structure**: All backend Python test suites must live in the `api/tests/` directory, use `pytest` assertions, and name test files with the `test_` prefix. **Unit tests** must be runnable in isolation and mock network calls to external APIs. **Integration tests** that require live services/keys must skip unless `RUN_INTEGRATION_TESTS=1` is set.

---

## Non-Negotiables

1. Separation of concerns over convenience.
2. No business logic in layout/presentational UI.
3. API routes stay thin: validate/authorize/orchestrate only.
4. Data access is centralized (no scattered Supabase calls).
5. Keep cross-layer contracts explicit (schemas/types) and versionable.
6. Tests are required for behavior changes and bug fixes.
7. Do not read the `.env` file. Assume keys are injected by the environment. If it is suspected they are missing, ask the user to check.

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
- AuthN/AuthZ (dependencies)
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
- Keep files small and focused; split when a module grows too large.

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

## Localization & Prompt Management

- **User-Facing Text**: All user-facing text and error messages must be internationalized using `react-i18next`. Do not use hardcoded strings. Language selection must be persisted across all pages (Landing, Login, Dashboard) using `localStorage` and/or cookies.
- **Prompt Sourcing**: All app prompt content must come from `api/locales/*/system_prompt.md`. Do not use `prompts.json` or hardcode prompt text in code.
- **Prompt Validation**: Locale prompt loading is mandatory. If prompt files are missing/unreadable, fail safely and log; do not silently fall back to hardcoded prompts.
- **Tool Parity**: Prompt instructions in locale files must exactly match actual implemented tool/function names.

---

## Product Runtime Requirements (App Behavior)

The rules in this section describe how the built app should behave at runtime. They are product requirements, not instructions about how the coding agent should format responses.

- This app uses LangGraph for app-side workflow orchestration (no PydanticAI or other framework).
- Enforce referral-only conversation: redirect off-topic messages back to referrals.
- If the user declines to participate, thank them and end the referral flow.

---

## Development Guardrails (Implementation Policy)

The rules in this section are coding policies for future implementations and refactors.

- LangGraph conversation state must have a single source of truth per flow: either checkpointer/thread state or explicit provided history, but never both at once.
- LangGraph nodes that inspect tool outputs must avoid scanning stale historical tool messages from prior turns.
- Add/maintain unit tests for auth boundaries, env/key boundaries, localization of user-facing errors, and state-management invariants (not only integration tests).
- Avoid circular imports by enforcing one-way module dependencies across layers (routes -> services -> agents/utils/repositories); refactor shared logic into lower-level modules instead of creating cycles.
- Do not introduce pass-through wrapper functions whose only purpose is delaying imports; fix dependency direction and module ownership instead.