# TenJudge Frontend Architecture

This document records the first-stage frontend architecture for TenJudge. The current stage focuses on ordinary users, not the admin system.

## 1. Scope

The first stage should support:

- User registration, login, persistent authentication, and logout.
- Public problem list and problem detail pages.
- Contest list and contest detail pages.
- Contest registration and cancellation.
- Contest problem viewing.
- Contest standings.
- Code submission for public problems and contest problems.
- User submission list and submission detail.
- Clear success and failure feedback through bottom-right toast messages.

The first stage should not implement full admin workflows. Admin-related backend APIs may exist, but their UI should remain out of scope until the product scope is confirmed.

The following features should be placeholders or deferred because the current API document does not provide enough backend support:

- Judge status polling.
- User profile editing and user settings.
- Full Agent chat or Agent workflow.

## 2. Confirmed Product Decisions

- The UI language is English.
- Ordinary user registration must submit `role: "user"`.
- Problem statements are Markdown and must be rendered as Markdown in the UI.
- Markdown rendering must sanitize generated HTML before inserting it into the DOM.
- Authentication must be persistent across page refreshes.
- The token header name must come from the login response `tokenName`; do not assume a hardcoded header name in request code.
- Swagger / OpenAPI paths do not include `/api`; production should use `/api` through Nginx, while local development may call the backend origin directly through environment configuration.

## 3. Dependencies

Use mainstream dependencies already installed in this repository:

- `pinia` for application state.
- `vue-router` for routing.
- `axios` for HTTP requests.
- `markdown-it` for Markdown rendering.
- `dompurify` for sanitizing rendered Markdown HTML.

Do not introduce a third-party UI component library. Shared UI components should be built inside this project.

## 4. Recommended Directory Structure

```text
src/
  main.ts
  App.vue

  router/
    index.ts
    routes.ts
    guards.ts

  stores/
    auth.ts
    app.ts

  api/
    client.ts
    endpoints.ts
    auth.ts
    problems.ts
    contests.ts
    submissions.ts

  config/
    app.ts
    pagination.ts
    request.ts
    storage.ts

  constants/
    languages.ts
    contest.ts
    problem.ts
    user.ts

  types/
    common.ts
    auth.ts
    problem.ts
    contest.ts
    submission.ts

  utils/
    datetime.ts
    contest.ts
    error.ts
    markdown.ts
    storage.ts

  composables/
    useAsyncState.ts
    usePagination.ts
    useToast.ts
    useAuthRequired.ts

  components/
    base/
    layout/
    feedback/
    problem/
    contest/

  views/
    auth/
    problems/
    contests/
    submissions/
    agent/

  styles/
    reset.css
    tokens.css
    index.css
```

This is a target structure, not a requirement to create every file before it is needed. Add files as features are implemented.

## 5. Routing

Recommended first-stage routes:

```text
/
  Redirect to /contests

/auth/login
/auth/register

/contests
/contests/:contestId
/contests/:contestId/problems/:problemIndex

/problems
/problems/:problemId

/submissions
  User submission list.

/submissions/:userId
  Public user submission list.

/submission/:submissionId
  Submission detail.

/agent
  Placeholder until Agent product scope is confirmed.
```

Access rules:

- Visitors can browse contests, public problems, and problem details.
- Login and registration pages are visitor-facing.
- Contest registration, contest cancellation, and code submission require login.
- If a visitor triggers a login-required action, redirect to login and preserve the intended return route.

## 6. API Layer

The API layer should hide backend response details from pages.

`api/client.ts` should:

- Create one Axios instance.
- Read `baseURL` from `VITE_API_BASE_URL`.
- Add the persisted token to request headers using the dynamic `tokenName`.
- Parse the backend response shape: `code`, `message`, `data`.
- Return the unwrapped `data` to service functions.
- Throw a normalized frontend error when the backend returns a business error or when the network fails.

Environment defaults:

- `.env.development`: `VITE_API_BASE_URL=http://localhost:8080`
- `.env.production`: `VITE_API_BASE_URL=/api`

This keeps the frontend direct-to-backend in local development and preserves the `/api` Nginx routing contract in production. Deployments can override `VITE_API_BASE_URL` without touching business code.

`api/endpoints.ts` should centralize endpoint paths. Pages and components should not hardcode paths such as `/contest/register`.

Recommended service modules:

- `api/auth.ts`: register, login, logout.
- `api/problems.ts`: problem page, problem detail.
- `api/contests.ts`: contest page, contest detail, contest problem, contest standings, register, unregister.
- `api/submissions.ts`: submit judge request, submission list, contest submission list, submission detail.

Admin APIs should not be wired into views during the first stage unless the product scope changes.

## 7. Types

TypeScript types should be defined near the frontend domain rather than inline in components.

Core types:

- `ApiResult<T>`
- `PageResult<T>`
- `PageQuery`
- `User`
- `LoginRequest`
- `LoginResponse`
- `RegisterRequest`
- `ProblemListItem`
- `ProblemDetail`
- `ContestListItem`
- `ContestDetail`
- `ContestProblemBrief`
- `ContestBoardPage`
- `ContestBoardRow`
- `ContestBoardProblemResult`
- `JudgeRequest`
- `SubmitJudgeResult`
- `SubmissionListItem`
- `SubmissionDetail`

Important modeling details:

- Route params are strings; convert `problemId` and `contestId` to numbers before API calls.
- Contest problem indexes are strings such as `A`, so do not parse them as numbers.
- Backend `date-time` fields should remain strings at the API boundary. Format them for display through date utilities.

## 8. State Management

Use Pinia for shared application state.

`stores/auth.ts` should own:

- `tokenName`
- `tokenValue`
- `userInfo`
- whether the auth state has been restored
- login
- register
- logout
- restore session from persistent storage
- clear session

Authentication persistence should store both token data and `userInfo`. This avoids losing the displayed username after page refresh. If the backend later provides a current-user endpoint, app startup can refresh `userInfo` from the server.

Toast state can be implemented through either Pinia or a composable plus a provider component. Keep the API simple: success and error are enough for the first stage.

## 9. Configuration And Constants

Do not scatter business constants and request details across pages.

Centralize:

- Pagination defaults.
- Pagination query keys: `current`, `size`.
- Submit language options: `cpp`, `python`.
- Ordinary registration role: `user`.
- Contest status mapping.
- Problem visibility display mapping.
- Storage keys.
- API endpoints.

Recommended examples:

```text
config/pagination.ts
  DEFAULT_PAGE
  DEFAULT_PAGE_SIZE
  PAGE_SIZE_OPTIONS

constants/user.ts
  DEFAULT_REGISTER_ROLE = "user"

constants/languages.ts
  SUBMIT_LANGUAGES = [
    { value: "cpp", label: "C++" },
    { value: "python", label: "Python" }
  ]
```

## 10. Markdown Rendering

Problem statements are Markdown.

Implement rendering in one utility or component boundary:

- `utils/markdown.ts` creates and configures the Markdown renderer.
- Rendered HTML must pass through `dompurify`.
- `ProblemStatement.vue` receives the raw Markdown string and displays sanitized HTML.

Keep this isolated so the Markdown policy can be changed later without touching problem pages.

## 11. UI Architecture

Global layout:

- `AppShell`
- `AppHeader`
- `MainNav`
- `PageContainer`
- `ToastProvider`

Main navigation:

- Contests
- Problems
- Submissions
- Agent

`Agent` can exist as a placeholder page, but it should not imply a finished feature.

Reusable base components should start small:

- `BaseButton`
- `BaseInput`
- `BaseSelect`
- `BaseTextarea`
- `BasePagination`
- `BaseSpinner`
- `BaseEmpty`

Feature components:

- `ContestStatusBadge`
- `ContestProblemList`
- `ProblemMeta`
- `ProblemStatement`
- `CodeSubmitPanel`

Do not build a complex generic table system until two or more pages clearly need the same table behavior.

## 12. Page Responsibilities

### Contest List

- Fetch paginated contests.
- Display name, time, status, and registration state.
- Allow logged-in users to register or unregister.
- Redirect visitors to login for registration actions.

### Contest Detail

- Fetch contest detail.
- Show contest metadata.
- Show contest problems.
- Provide contest-level navigation only for features that exist.

### Contest Standings

- Fetch `GET /contest/{contestId}/board` with `current` and `size`.
- Use the returned `problems` array as the table column source, sorted by backend-provided `problemIndex`.
- Fill each row's problem cells from `problemResults[problemId]`; do not infer problem order from object key iteration.
- Display solved count and penalty in minutes.

### Contest Problem

- Fetch by `contestId` and `problemIndex`.
- Render Markdown statement.
- Submit with `contestId`.

Add a code comment near the contest submission payload explaining that contest submissions must include `contestId` for permission and contest-context checks.

### Problem List

- Fetch public problem page.
- Display ID, name, and difficulty.
- Avoid search and filters until the backend API supports them.

### Problem Detail

- Fetch public problem detail.
- Render Markdown statement.
- Submit without `contestId`.

### Submissions

- Fetch the current user's paginated non-Agent submissions for the submissions list.
- Fetch submission detail by `submissionId`; detail includes source code and test case results when the current user has permission.
- Fetch contest-scoped user submissions from the contest submissions tab.

### Auth Pages

- Login uses `account` and `password`.
- Register uses `username`, `email`, and `password`; it submits `role: "user"` internally rather than exposing a role selector to ordinary users.

## 13. Error And Feedback Policy

- Backend business failures should show the backend `message` in an error toast.
- Successful login, registration, contest registration, cancellation, logout, and code submission should show success toasts.
- Code submission success should display or otherwise preserve the returned `submissionId`.
- Dedicated judge status polling is still not available; any refresh behavior should be built on existing submission query APIs or confirmed with the backend first.
- Empty lists should use an empty state, not an error state.
- Missing problem or contest details should use a page-level error state.

## 14. Known API Gaps

Current API gaps affecting ordinary-user UX:

- No judge status polling API.
- No current-user refresh API.
- No user profile update API.

Frontend behavior should be explicit about these gaps. Avoid creating fake flows that look complete.

## 15. Implementation Order

Recommended implementation sequence:

1. Install and wire Vue Router, Pinia, Axios, global styles, and app shell.
2. Implement API client, endpoint constants, frontend types, and auth persistence.
3. Implement toast feedback and reusable base form components.
4. Implement login and registration.
5. Implement contest list, contest detail, registration, and contest problem view.
6. Implement problem list and public problem detail.
7. Implement `CodeSubmitPanel` for both public and contest submissions.
8. Implement submission list and submission detail.
9. Add a placeholder page for Agent.

This order validates shared infrastructure early while keeping the first visible product path focused on ordinary users.
