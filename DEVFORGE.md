# DevForge: Project Definition

Keep this file at the root of the repo. Update the checklist and decision log as you go.

---

## 1. End goal

DevForge is a developer collaboration and project-management platform. Think of a focused mix of Linear, Jira and Trello, **not** a clone of any of them.

> Developers create organizations, workspaces and projects, track issues on a board, collaborate through comments, get notified about what matters, and see a full activity history.

It has two jobs:

1. **A real product** that works end to end: auth, multi-tenant data, roles, a board, real-time updates.
2. **A learning vehicle** that grows from a simple local app into a production-grade, deployed, observable system. The finished project must be something you can put on a portfolio and explain technically in an interview.

**Guiding rule:** learn a technology when the project hits the problem it solves. Never learn first and build later.

```
Build -> hit a problem -> pick the tool that solves it -> learn it -> implement it
      -> understand why it exists -> keep building
```

---

## 2. Users and roles

| Role | Can do |
|---|---|
| **Individual developer** | Register, create organizations and projects, manage issues, comment, upload files, get notifications, view activity |
| **Organization owner** | Everything below, plus: create/delete the organization, invite/remove members, assign roles, change org settings, transfer ownership |
| **Organization admin** | Manage members and projects, moderate activity, manage org-level settings (cannot delete the org or demote the owner) |
| **Organization member** | Work in projects they belong to: create/update issues (depending on permissions), comment, upload files, receive notifications |

Permissions are enforced on the server for every request. The UI hiding a button is never the real check.

---

## 3. Complete feature list

### 3.1 Authentication and accounts
- Registration, login, logout
- Password hashing (argon2 or bcrypt)
- Access tokens (short-lived) plus refresh tokens with rotation
- Secure httpOnly cookies
- Session management (list and revoke active sessions)
- Email verification, forgot password, reset password
- Profile (name, avatar)
- Later, optional: GitHub OAuth login

### 3.2 Organizations
- Create, update, delete organization
- Invite members (by email link), remove members
- Change member roles
- List members
- Organization settings

### 3.3 Projects
- Belong to an organization
- Fields: name, description, status, start date, target date
- Project members
- Contain issues, activity and files

### 3.4 Issues (the core feature)
- Fields: title, description, status, priority, assignee, creator, labels, due date, created/updated dates, project, attachments, comments
- Statuses: `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `CANCELLED`
- Priorities: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- Create, edit, delete, assign, change status, change priority, add/remove labels
- Per-project issue numbers (#1, #2, ...)
- Issue history (who changed what, when)

### 3.5 Listing, filtering, pagination
- Pagination, sorting
- Filter by status, priority, assignee, label, date range
- Example: `GET /api/projects/:id/issues?page=2&limit=20&status=IN_PROGRESS&priority=HIGH`

### 3.6 Project board (Kanban)
- Columns per status, issue cards
- Drag and drop between columns, which updates the backend
- Later: updates live for other users

### 3.7 Comments
- Add comments on issues
- Edit and delete (own comments; admins can moderate)
- @mentions of users
- Later: live comments

### 3.8 Notifications
Triggered by: issue assigned, mentioned in a comment, status changed, comment added, invited to an organization, project membership changed, deadline approaching.
- In-app notification list, unread count, mark as read
- Later: email notifications, live delivery

### 3.9 Activity feed
- Audit-style log of important events, per project and per organization
- Example: "Arjun changed issue #124 to IN_PROGRESS"

### 3.10 File uploads
- Attach to profiles, issues, comments, projects
- Local storage first, then S3 with secure (pre-signed) upload/download
- Validate type and size; never expose storage paths directly

### 3.11 Search
- Start with simple database queries
- Then PostgreSQL full-text search and indexes
- Searchable: issues, projects, users, comments
- Elasticsearch/OpenSearch only if a measured need appears

### 3.12 Real-time
- WebSockets for notifications, live comments, issue updates, online presence

### 3.13 Optional AI project assistant (late extension, not MVP)
- "What are the most important unresolved issues?" and "Summarize this project's week"
- Uses issues, comments, activity, deadlines
- Possible tech: LLM API, embeddings, RAG, tool calling, structured outputs, evaluation

---

## 4. Data model (starting point, design carefully before coding)

`User`, `Organization`, `OrganizationMember` (role), `Project`, `ProjectMember`, `Issue`, `Label`, `IssueLabel`, `Comment`, `Attachment`, `Notification`, `Activity`, `Session` / `RefreshToken`

Concepts to learn through it: relations, foreign keys, constraints, indexes, transactions, migrations, normalization, pagination strategies, query optimization, concurrency where relevant.

---

## 5. Technology stack and verdicts

| Tech | Verdict |
|---|---|
| **TypeScript** | Core. Go beyond syntax: generics, discriminated unions, type guards, `unknown`, utility types, DTO/domain types. Use advanced types only where they improve the code. |
| **Node + Express** | Fine. Express 5 handles async errors properly. A good first choice; Fastify/NestJS are alternatives but unnecessary now. |
| **PostgreSQL** | Right choice. Relational data (orgs, memberships, issues) is where Postgres beats the MongoDB you already know. |
| **Prisma** | Good for learning and type-safe access. You will still write raw SQL for some queries; learn `EXPLAIN` alongside it. |
| **Zod** | Core. Already in `packages/shared`, so the API and web app validate with the same schemas. Teaches compile-time types vs runtime validation. |
| **React + Vite** | Keep. |
| **Tailwind, TanStack Query, React Hook Form** | Good. TanStack Query for server state; plain React state otherwise. No Redux/Zustand until real client-state pain appears. |
| **Next.js** | **Optional, not a required phase.** An authenticated dashboard gains little from SSR. Worth doing as a deliberate exercise (rebuild the web app, or build a public landing/docs site), not because the project demands it. |
| **Redis** | Add when a real need appears: rate limiting, job queue, pub/sub for WebSockets across instances, caching measured slow queries. Not before. |
| **BullMQ** | Good fit once there are emails/reminders/file processing. Teaches retries, backoff, idempotency, failed jobs. |
| **WebSockets** | Use Socket.IO for convenience (reconnects, rooms) or `ws` to learn the protocol. Either is fine. Multi-instance scaling is where Redis pub/sub earns its place. |
| **Docker + Compose** | Right after the app works locally. You already have a Postgres compose file. |
| **GitHub Actions** | Start a **minimal** CI (lint, typecheck, test) very early, since it costs almost nothing. Expand it to build/deploy later. |
| **AWS (ECR, ECS Fargate, RDS, S3, Secrets Manager, CloudWatch)** | Right set. Use Fargate so you are not managing servers. |
| **CloudFront, Route 53** | Add near the end of deployment: S3+CloudFront for the web build, Route 53 for the domain. |
| **Kubernetes** | **Probably skip.** ECS already teaches containers, scaling and load balancing. If you want it, run it locally (kind/minikube) after AWS is done. Do not host it on EKS just for show. |
| **Elasticsearch/OpenSearch** | Skip unless Postgres full-text search measurably fails. |
| **AI/RAG** | Optional capstone after the platform is stable. Real data (issues, comments, activity) makes it a genuine feature. |

**Architecture notes**
- Keep the pnpm monorepo (`apps/api`, `apps/web`, `packages/shared`). It suits shared Zod schemas.
- Use `routes -> controllers -> services -> Prisma`. **Skip a separate repository layer** until you have a real reason; Prisma is already the data-access abstraction.
- Let structure emerge. Add folders (`jobs/`, `workers/`, `websocket/`) when the feature arrives.
- Make features **organization-scoped from day one**: every query filters by org/membership. Retrofitting multi-tenancy is painful.

---

## 6. Roadmap

Each phase lists: build, learn and why, concepts first, files, test, deploy, and the milestone to move on.

### Phase 0: Foundation (DONE)
- pnpm monorepo, Express API with validated env config, `GET /api/health`, supertest test
- Vite + React app calling the API through a dev proxy, shared Zod health schema
- ESLint, Prettier, strict `tsconfig`, Postgres 17 in `docker-compose.yml`

### Phase 1: Database and authentication (NEXT)
- **Build:** connect Postgres, `User` model, register/login/logout, protected route, global error handling
- **Learn:** Prisma (schema, migrations, client); password hashing; JWT access + refresh tokens, httpOnly cookies
- **Why:** nothing else works without persistent users and identity
- **Know first:** relational basics, why you never store plain passwords, how cookies and CORS interact, access vs refresh tokens
- **Files:** `prisma/schema.prisma`, `src/config/db.ts`, `src/routes/auth.ts`, `src/controllers/auth.controller.ts`, `src/services/auth.service.ts`, `src/middleware/{auth,error,validate}.ts`, `src/errors/AppError.ts`, shared auth schemas in `packages/shared`, a login/register page in web
- **Implement:** register, login, refresh with rotation (store hashed refresh tokens), logout, `GET /api/me`
- **Test:** integration tests against a real test database (register, duplicate email, wrong password, protected route, refresh rotation)
- **Also:** add minimal GitHub Actions CI (lint, typecheck, test)
- **Milestone:** you can register, log in, refresh, and log out through the UI, with passing tests and CI green

### Phase 2: Organizations, roles, projects
- **Build:** organizations, membership with roles, invites, projects, project members
- **Learn:** RBAC, authorization middleware, transactions, composite unique constraints, indexes
- **Why:** this is the multi-tenant core and the main authorization challenge
- **Know first:** authentication vs authorization, many-to-many relations, what a transaction guarantees
- **Files:** models `Organization`, `OrganizationMember`, `Project`, `ProjectMember`; `requireOrgRole()` middleware; org/project routes, services, schemas
- **Test:** permission matrix (owner/admin/member/outsider for every endpoint), creating an org + owner membership in one transaction
- **Milestone:** a non-member can never read or write another org's data, and you can prove it with tests

### Phase 3: Issues and the board (MVP complete)
- **Build:** issue CRUD, labels, assignment, filtering/sorting/pagination, issue history, Kanban board with drag and drop
- **Learn:** pagination strategies (offset vs cursor), composite indexes, `EXPLAIN`, TanStack Query (caching, optimistic updates), React Hook Form, Tailwind, a drag-and-drop library
- **Why:** it is the heart of the product and where query design matters
- **Know first:** how indexes work, query params validation, optimistic UI and rollback
- **Test:** filter/pagination edge cases, status changes, authorization on issues
- **Milestone (MVP):** a small team can run a real project in DevForge end to end

### Phase 4: Collaboration features
- **Build:** comments, mentions, activity feed, in-app notifications (polling first), simple search, local file uploads
- **Learn:** audit-log design, PostgreSQL full-text search, multipart upload handling
- **Why:** these make it a collaboration tool, not just a task list
- **Know first:** event-driven thinking (an action causes activity + notifications), file-upload risks
- **Test:** notification creation rules, mention parsing, upload validation
- **Milestone:** assigning or mentioning someone produces a notification they can see

### Phase 5: Hardening and end-to-end tests
- **Build:** rate limiting, security headers, CSRF strategy, CORS review, structured logging with request IDs, input limits
- **Learn:** `helmet`, `pino`, OWASP Top 10 basics, Playwright
- **Why:** security and reliability should be in before the app is exposed, not after
- **Test:** Playwright flow: register -> login -> create org -> project -> issue -> assign -> move -> comment -> logout; attempted XSS/SQL injection/IDOR cases
- **Milestone:** you can explain how each major attack is mitigated in your code

### Phase 6: Docker
- **Build:** Dockerfiles (multi-stage) for api and web, full `docker compose up` for web, api, Postgres (Redis later)
- **Learn:** images, layers, volumes, networks, health checks, env handling
- **Why:** reproducible environments and the prerequisite for ECS
- **Milestone:** a fresh clone runs with one command

### Phase 7: Redis, background jobs, real-time
- **Build:** Redis, BullMQ worker (emails, deadline reminders, cleanup), email verification/reset emails, WebSockets for live notifications/comments/board updates, Redis-backed rate limiting
- **Learn:** queues, retries, backoff, idempotency, failed-job handling, WebSocket auth, rooms, pub/sub
- **Why:** slow work must leave the request path, and users expect live updates
- **Test:** job retry behavior, duplicate-job safety, socket authorization
- **Milestone:** two browsers see each other's board changes live, and a failed email job retries correctly

### Phase 8: AWS deployment and CI/CD
- **Build:** S3 uploads with pre-signed URLs, ECR, ECS Fargate (api, worker), RDS, Secrets Manager, ALB, CloudFront + S3 for web, Route 53 domain; GitHub Actions to build, test, push image, deploy
- **Learn:** IAM least privilege, VPC basics and security groups, ECS task definitions, managed Postgres, pre-signed URLs
- **Why:** this is where it becomes a live, shareable product
- **Know first:** Docker well, how DNS and TLS work, networking basics
- **Milestone:** `git push` to main deploys automatically to a public URL. Set a billing alarm before you start.

### Phase 9: Observability and performance
- **Build:** structured logs shipped to CloudWatch, health/readiness endpoints, error tracking (Sentry), key metrics, dashboards and alarms
- **Optimize:** measure first, then index tuning, connection pooling, Redis caching only where measured, frontend code splitting, load testing
- **Milestone:** you can find and fix a real slow endpoint using data, not guesses

### Phase 10: Optional extensions (pick by interest)
- **AI project assistant:** summaries and Q&A over project data (LLM API, embeddings, RAG, tool calling, evals)
- **Next.js rebuild or public site:** App Router, Server Components, Server Actions, caching
- **Kubernetes (local):** pods, deployments, services, ingress, only if you still want it after ECS
- **GitHub OAuth, OpenTelemetry/Prometheus/Grafana**

---

## 7. Scope buckets

| Bucket | Contents |
|---|---|
| **MVP** | Auth, organizations + roles, projects, issues, board, filtering/pagination, tests, minimal CI |
| **Phase 2** | Comments, mentions, activity feed, notifications, search, local uploads |
| **Phase 3** | Hardening, Playwright E2E, Docker |
| **Production** | Redis, queues/workers, WebSockets, S3, AWS deploy, full CI/CD |
| **Advanced** | Observability, performance tuning, load testing |
| **Optional** | Next.js, Kubernetes, AI/RAG, OAuth, OpenSearch |

---

## 8. What you should understand when finished

- Relational design, migrations, indexes, transactions, query tuning
- Authentication and authorization (sessions/tokens, refresh rotation, RBAC, tenant isolation)
- API design: validation, error handling, pagination, versioning basics
- Type-safe full-stack code with shared schemas
- Testing at three levels (unit, integration, E2E) and what each is for
- Web security: XSS, CSRF, CORS, injection, IDOR, secrets handling
- Async architecture: queues, retries, idempotency, real-time messaging
- Containers, CI/CD, and deploying to AWS with least-privilege IAM
- Logs, metrics, alerts, and debugging a running system
- Why you chose each tool, and what you deliberately left out

## 9. Portfolio value

Strong signals: multi-tenant RBAC with a tested permission matrix, real-time board, background jobs with retries, a live deployed URL with CI/CD, and a README that explains trade-offs and decisions. The "tools I chose not to use, and why" section (Kubernetes, Elasticsearch, Redux) shows judgment, which interviewers value more than a long tech list.

---

## 10. Current status

**Done:** Phase 0 (see above).

**Loose ends from the current repo**
- `apps/api/.env.example` is empty, but `env.ts` requires `DATABASE_URL`. Suggested value: `postgresql://devforge:devforge@localhost:5432/devforge`
- Remove Vite template leftovers in `apps/web` (default README, `hero.png`, `react.svg`, page title "web")
- TypeScript versions differ between `apps/api` (^7) and `apps/web` (~6); consider aligning

**Next step:** start Phase 1.
1. Fill `.env.example`, start Postgres with `docker compose up -d`
2. Add Prisma, define the `User` model, run the first migration
3. Build register and login with Zod validation and password hashing
4. Add refresh tokens, logout, and `GET /api/me`
5. Write integration tests and add minimal CI

## 11. Decision log

| Date | Decision | Reason |
|---|---|---|
| 2026-10-22 | pnpm monorepo with shared Zod package | One source of truth for API/web types |
| 2026-10-22 | No repository layer for now | Prisma already abstracts data access |
| 2026-10-22 | Kubernetes and Next.js are optional | ECS covers the learning goals; SSR adds little to a dashboard |
