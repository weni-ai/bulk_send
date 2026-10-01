<!--
Sync Impact Report:
- Version change: none (unfilled template) → 1.0.0
- Modified principles: none (first generation; all template placeholders replaced)
- Added principles:
  I. Version Control and Review
  II. Security and Secrets
  III. Observability
  IV. Versioned Contracts
  V. Specification Traceability
  VI. No Silent Divergence
  VII. Code as Documentation
  VIII. Type Safety
  IX. Single Responsibility
  X. Naming Conventions (with project exception)
  XI. Component Architecture
  XII. Semantic HTML
  XIII. State Management
  XIV. Async State Correctness
  XV. API Integration
  XVI. API and Data Boundaries
  XVII. Design System Component Usage
  XVIII. Deprecated Components
  XIX. Styling Standards and BEM
  XX. Token Consumption
  XXI. Microfrontend Isolation
  XXII. Microfrontend Communication
  XXIII. Testing (with project exception)
  XXIV. Accessibility
  XXV. Performance
  XXVI. Internationalization
  XXVII. Defensive Programming
  XXVIII. Maintainability
  XXIX. Linting and Formatting
  XXX. Commit Messages
  XXXI. Changelog Maintenance
- Added sections: Core Principles, Design System Integration, Microfrontend
  Principles, Quality Standards, Development Workflow, Governance
- Removed sections: none
- Project exceptions (ratified by maintainer on 2026-10-01):
  - X. Naming Conventions: PascalCase for Vue SFCs and component directories,
    camelCase for TypeScript module files.
  - XXIII. Testing: tests live in a single `src/__tests__/` tree that mirrors
    `src/`, instead of being colocated next to the source.
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no change required (Constitution
    Check gates are derived from this file at plan time)
  - .specify/templates/spec-template.md ✅ no change required (inheritance
    section is mandated here by Principle V and added per spec)
  - .specify/templates/tasks-template.md ✅ no change required
- Follow-up TODOs:
  - TODO(DEPENDENCY_SCANNING): CI (`.github/workflows/ci.yml`) has no automated
    vulnerability scan (e.g., `npm audit`, Dependabot); Principle II requires one.
  - TODO(BRANCH_PROTECTION): confirm GitHub branch protection on `main`
    enforces 1+ approval and green CI (not verifiable from the repository).
  - TODO(MFE_CONTRACT_DOC): the host contract (Principle XXII) is not yet
    documented in README.md or docs/.
  - TODO(GLOBAL_STYLE_LEAK): `src/styles/global.scss` styles `html`, `body`
    and `*`, which the PostCSS prefix ignores, so they leak to the host
    (Principle XXI).
  - TODO(GLOBAL_SCOPE): `src/utils/plugins/fb.ts` assigns `window.fbAsyncInit`
    (required by the Facebook SDK); document it as a justified exception or
    isolate it (Principle XXI).

Provenance:
- Source: weni-ai/vtex-cx-engineering-constitutions (main @ a516a7c)
- Bases: base-constitution.md, frontend/base-constitution.md,
  frontend-platform/base-constitution.md
- Domains: frontend-platform (extends frontend)
-->

# Bulk Send Constitution

Bulk Send (`bulk_send`) is a Vue 3 + TypeScript microfrontend of the Weni / VTEX
CX Platform for building and sending WhatsApp broadcasts. It is built with
Rspack (`@weni/rspack-config`) and exposed to the host application through
Module Federation, and it can also run standalone.

## Core Principles

### I. Version Control and Review

All code MUST enter `main` through a pull request. A merge MUST require at least
one approved review and a green CI run of the `lint-test-build` job in
`.github/workflows/ci.yml` (lint, Vitest coverage gate, Codecov upload,
`npm run build` including `vue-tsc` type-check). Direct pushes to `main` MUST be
blocked through GitHub branch protection. Reviewers are assigned via
`.github/CODEOWNERS`, and PRs SHOULD fill in `.github/pull_request_template.md`.

**Rationale:** the policy is only real when the platform enforces it, not when
it relies on trust. Peer review and a protected main branch keep history
auditable and stop unreviewed changes from reaching production.

### II. Security and Secrets

Secrets MUST never be committed to the repository. `.env` is local-only and
MUST stay git-ignored. Runtime configuration MUST be read through
`src/utils/env.ts` (`process.env`, `window.configs` injected at container start
by `docker-entrypoint.sh`, or `import.meta.env`). Any value that reaches the
browser is public by definition, so only non-secret configuration (e.g.,
`SENTRY_DSN`, API base URLs) MAY be exposed this way. Access MUST follow least
privilege by default. Dependencies MUST come only from trusted sources (the
public npm registry and `@weni/*` packages), MUST be pinned through the
committed `package-lock.json`, and MUST be checked for known vulnerabilities.

**Rationale:** leaked credentials and untrusted dependencies are among the most
common and damaging breaches; prevention is far cheaper than remediation.

### III. Observability

Logs MUST be structured and MUST never contain secrets (such as the auth token
from the shared store) or sensitive personal data (such as contact names, phone
numbers, or imported contact files). Errors MUST be reported to Sentry
(`@sentry/vue`, initialized in `src/main.ts`) with descriptive tags and context,
following the pattern in `src/utils/moduleFederation.ts`. Errors MUST be
traceable across components: Sentry browser tracing (bound to the router) MUST
stay enabled so traces link the frontend to backend calls. Session Replay MUST
keep its default text and input masking. Console logs SHOULD be prefixed with
their origin (e.g., `[BulkSend - main.ts]`, `[Module Federation]`).

**Rationale:** structured, privacy-safe telemetry makes incidents diagnosable
without creating new data-exposure risks. This is critical in a product that
handles end-customer contact data.

### IV. Versioned Contracts

Any change to a public interface MUST be versioned following SemVer through the
`version` field in `package.json`. Public interfaces of this repository are the
Module Federation exposes (`./main` and `./locales/{pt_br,en,es,ro}`), the
`mountBulkSendApp` options and return value, and the consumed host remote
`connect/sharedStore`. Changes MUST be backward compatible or ship with an
announced deprecation path. Silent breaking changes MUST NOT be introduced.

**Rationale:** the host shell and other modules depend on stable contracts.
Explicit versioning and deprecation give them a predictable path to adapt
without outages.

### V. Specification Traceability

Every engineering spec (Speckit features under `specs/<feature>/`) MUST derive
from exactly one approved product spec. It MUST reference that product spec
through an immutable, pinned version (commit or tag); a mutable URL or ID alone
MUST NOT be used. The product spec MUST exist and be tagged before its
engineering spec is created. An engineering spec MUST NOT redefine the "what"
it inherits: problem, scope, success criteria, and binding decisions belong to
the product spec. A technical architecture document SHOULD be produced for
non-trivial features. When it exists, it MUST be linked from the engineering
spec and pinned by commit or tag, but its absence MUST NOT block the
engineering spec.

Every engineering spec MUST open with an inheritance section in exactly this
format:

```
## Inheritance from Product Spec
- Product Spec: <title> — <URL>
- Pinned version: <commit/tag>
- Architecture doc: <none | URL + commit/tag>
- Inherited binding decisions: <short list>
- Scope of this spec: <slice implemented by this repo>
- Divergences: <none | link to amendment>
```

**Rationale:** traceability from product intent to technical execution keeps
decisions auditable. Pinning the version guarantees every team implements the
same version of a feature, not divergent readings of a spec that changed
mid-flight. A mandatory product spec prevents engineering work without an
agreed problem; an optional architecture doc avoids blocking trivial designs on
ceremony. A single inheritance format keeps the link machine-checkable across
repositories.

### VI. No Silent Divergence

When a technical need contradicts something inherited from the product spec
(scope, success criteria, or a binding decision), the divergence MUST NOT be
implemented silently in code. It MUST be raised as an amendment in the product
repository and recorded in the `Divergences` field of the engineering spec's
inheritance section, with a link to that amendment. Once the amendment is
approved and produces a new tag, the engineering spec's `Pinned version` MUST
be updated to it. A technical difference that contradicts nothing inherited is
an implementation decision, not a divergence, and MUST live in the engineering
spec.

**Rationale:** in a federated model where the product spec is the single source
of truth, a silent code deviation lets intent and implementation drift apart
with no audit trail. Routing divergences through amendments keeps the spec
authoritative.

### VII. Code as Documentation

All code MUST be written in English, including identifiers, comments, and
documentation. Domain-specific terms or acronyms that only have meaning in the
original language MAY remain untranslated. Code MUST favor readability and
clarity over brevity. Every non-trivial decision MUST be documented with a
comment that explains the "why", not the "what".

**Rationale:** a codebase everyone can read enables open-source and
cross-team collaboration. Comments that explain reasoning prevent future
developers from breaking invariants they cannot see.

### VIII. Type Safety

All new files MUST be written in TypeScript, and Vue SFCs MUST use
`<script setup lang="ts">` or `lang="ts"`. JavaScript files SHOULD only be
modified for bug fixes or small changes; substantial modifications SHOULD
include migration to TypeScript. Type definitions MUST be explicit and shared
domain types MUST live in `src/types/`. `any` SHOULD be avoided except when
interfacing with untyped external libraries or federated remotes, and each
such use MUST carry a scoped ESLint disable. `strict` MUST remain enabled in
`tsconfig.json`, and `npm run type-check` (`vue-tsc --build`) MUST pass.

**Rationale:** static typing catches errors at compile time, improves tooling,
and serves as inline documentation. Gradual migration allows incremental
adoption without blocking delivery.

### IX. Single Responsibility

Each file SHOULD contain no more than 350 lines of code. Each function MUST
have only one responsibility. Template logic MUST be extracted to computed
properties or methods so markup stays clean and declarative. Complex
conditional rendering MUST be abstracted into descriptively named boolean
variables.

**Rationale:** small, focused units are easier to test, review, and refactor.
Large files and multi-purpose functions create cognitive overload and hide
bugs.

### X. Naming Conventions

Variable and function names MUST use `camelCase`. Component names MUST use
`PascalCase`. Abbreviations MUST be avoided unless universally understood;
clarity MUST take precedence over conciseness. File and directory names MUST be
lowercase, with the following project exception.

**Project exception:** Vue single-file components and the directories that group
them MUST use `PascalCase` matching the component name (e.g.,
`src/components/NewBroadcast/GroupSelection/GroupSelectionList.vue`).
TypeScript module files MUST use `camelCase` (e.g., `src/stores/contactImport.ts`,
`src/composables/useUploadProgress.ts`). All other directories (`api`,
`stores`, `utils`, `types`, `locales`, ...) MUST stay lowercase. Justification:
this follows the official Vue style guide, is required for
`unplugin-vue-components` to auto-register components by file name, and matches
the existing codebase. Renaming the existing files would cause churn with no
gain in consistency.

**Rationale:** consistent naming reduces cognitive load and makes the codebase
searchable. Predictable file naming enables automated tooling and faster
navigation.

### XI. Component Architecture

Components MUST be named descriptively and reflect their purpose. Related
components SHOULD be grouped in feature folders under `src/components/` (e.g.,
`NewBroadcast/ContactImport/`), with route-level screens in `src/views/` and
shells in `src/layouts/`. Component prefixes SHOULD indicate scope or nature
(e.g., `NewBroadcastHeader`, `GroupSelectionList`). Props MUST have descriptive
names (e.g., `userName`). Events MUST be prefixed with `on` (e.g.,
`onUserEmailChange`). Methods that handle state updates SHOULD be prefixed with
`handle` (e.g., `handleUserPermissions`). State variables MUST clearly reflect
what they represent (e.g., `isLoadingUser`, `errorStatusUser`).

**Rationale:** a predictable component structure keeps the codebase navigable.
Clear naming for props, events, and state reduces integration errors and makes
component interfaces self-documenting.

### XII. Semantic HTML

Markup MUST use semantic elements (`header`, `nav`, `main`, `section`,
`article`, `aside`, `footer`) wherever they apply. Non-semantic containers
(`div`, `span`) MUST only be used when no semantic alternative exists. Heading
tags (`h1`–`h6`) MUST follow a logical hierarchy, and every page MUST have
exactly one `h1`. Elements SHOULD have at least one class that describes their
purpose, even when no styling is applied.

**Rationale:** semantic HTML improves accessibility for assistive technologies
and makes markup self-documenting. Proper heading hierarchy is critical for
screen reader navigation.

### XIII. State Management

Global state MUST be managed with Pinia stores in `src/stores/`. State MUST NOT
be duplicated across components or stores. Related state SHOULD be grouped into
cohesive stores by feature (e.g., `broadcasts`, `contactImport`, `templates`).
Local component state SHOULD be preferred when the data does not need to be
shared. State provided by the host through `connect/sharedStore` MUST be
consumed through its contract (Principle XXII), not re-derived.

**Rationale:** a single, non-duplicated state source prevents synchronization
bugs and keeps data flow traceable. Modular stores mirror feature boundaries
and simplify testing.

### XIV. Async State Correctness

Async operations MUST track loading, success, and error states consistently.
Silent failures MUST NOT occur; errors MUST be surfaced to the user or reported
for debugging (Principle III). Contradictory states (e.g., loading and error at
the same time) MUST be prevented. Double submissions MUST be guarded against;
operations with side effects on the backend, such as creating a broadcast,
MUST use an idempotency key (see `docs/idempotency-key.md`). State MUST be
rolled back when an operation fails after an optimistic update.

**Rationale:** incorrect async state is one of the most common sources of bugs
and broken UX. A duplicated broadcast sends real messages to real contacts, so
users must always know what is happening.

### XV. API Integration

API calls MUST be encapsulated in service modules under `src/api/resources/`
and use the shared client from `src/api/http.ts`. Components MUST NOT call
`axios` directly. Error handling MUST be explicit; API errors MUST NOT surface
as unhandled exceptions. Loading and error states MUST be tracked and reflected
in the UI.

**Rationale:** separating API logic from presentation enables reuse, simplifies
testing, and keeps components focused on rendering.

### XVI. API and Data Boundaries

Backend contracts MUST stay at the API/service boundary. Internal code MUST use
camelCase. Response payloads are normalized by the `camelcase-keys` interceptor
in `src/api/http.ts`, and outgoing payloads MUST be converted to the backend
convention inside the service layer. Raw backend fields MUST NOT leak into
stores, business logic, or components. DTOs or raw API interfaces that
intentionally represent the backend contract MAY use the backend naming
convention.

**Rationale:** clean data boundaries prevent coupling between the frontend and
backend implementation details. Normalizing at the edge keeps the rest of the
codebase consistent and refactorable.

## Design System Integration

### XVII. Design System Component Usage

UI primitives MUST come from the Unnnic design system (`@weni/unnnic-system`)
when available. `Unnnic*` components are auto-resolved by
`unplugin-vue-components` (configured in `rspack.config.mjs`) and MUST NOT be
reimplemented. Custom components MUST NOT duplicate design system
functionality. Design system updates MUST be adopted through controlled version
upgrades of the pinned dependency in `package.json`, never by copying code. The
Unnnic skill MUST be consulted for components, props, tokens, and usage
patterns.

**Rationale:** a shared component library guarantees visual consistency,
reduces duplication, and centralizes accessibility fixes. Versioned consumption
gives a predictable upgrade path.

### XVIII. Deprecated Components

Legacy Unnnic components MUST NOT be introduced in new code when a modern
alternative exists; the Unnnic skill lists deprecated components and their
replacements (e.g., `UnnnicSelectSmart` → `UnnnicSelect`, migrated in 1.11.0).
Existing usages SHOULD be migrated when the surrounding code is modified.

**Rationale:** deprecated components will be removed in future versions.
Blocking new usages limits migration scope and keeps the codebase moving
forward.

### XIX. Styling Standards and BEM

CSS selectors MUST use classes only; IDs MUST be reserved for JavaScript
targeting when no alternative exists. Nested selectors SHOULD be avoided to
keep specificity under control. Class names MUST follow BEM: blocks are
independent components (`.button`), elements use double underscores
(`.button__text`), and modifiers use double hyphens (`.button--large`).
Elements MUST NOT be nested in class names (`.block__elem`, not
`.block__elem1__elem2`). Component styles MUST be written in SCSS within the
SFC; shared mixins belong in `src/styles/mixins.scss`.

**Rationale:** BEM provides collision-free CSS that scales across teams.
Avoiding IDs and deep nesting prevents specificity wars that make CSS
unpredictable.

### XX. Token Consumption

Color, typography, spacing, shadow, and radius values MUST reference Unnnic
design tokens (injected into every SCSS file through `sass-loader`
`additionalData` in `rspack.config.mjs`), never raw values. Semantic tokens
MUST be preferred over primitive tokens when styling UI surfaces. Tokens MUST
NOT be invented; only tokens documented in the Unnnic skill are valid.

**Rationale:** tokens decouple design decisions from implementation, enabling
global visual changes without hunting through code. Using only documented
tokens prevents inconsistencies and future breakage.

## Microfrontend Principles

### XXI. Microfrontend Isolation

The module MUST NOT pollute the global scope (`window`, `document`, or global
styles). Styles MUST stay scoped under the `.bulk-send-webapp` prefix applied by
PostCSS and added to the mount container in `src/main.ts`. Because the prefixer
ignores `html`, `body`, and `*`, new rules MUST NOT target those selectors.
Overlays MUST teleport into the module container (Unnnic `teleportTarget`), not
`body`. Global event listeners and timers MUST be cleaned up on unmount.
Libraries shared with the host (`pinia`, `vue-router`) MUST stay declared as
singletons in `sharedDeps`.

**Rationale:** isolation prevents interference between the module, the host,
and other microfrontends, and keeps the module independently deployable and
testable.

### XXII. Microfrontend Communication

The module MUST communicate with the host only through a documented contract:
the exposed `mountBulkSendApp({ containerId, initialRoute })` entry, the exposed
locale files, and the `connect/sharedStore` remote (auth token and current
project). The standalone fallback `src/shims/connectSharedStore.ts` MUST keep
the same shape as the remote. Remote imports MUST go through `safeImport` /
`safeAsyncComponent` in `src/utils/moduleFederation.ts`, so a missing remote
degrades gracefully and is reported. Direct DOM manipulation outside the module
container MUST NOT occur. Contract changes are governed by Principle IV.

**Rationale:** explicit contracts make integration predictable and let host and
module evolve independently. DOM encapsulation prevents fragile coupling.

## Quality Standards

### XXIII. Testing

Components, stores, composables, and services with business logic MUST have
unit tests written with Vitest and `@vue/test-utils` (jsdom). Tests MUST verify
behavior and outcomes, not implementation details. Tests MUST NOT be added
solely to increase coverage; they MUST validate real user behavior. A test that
would still pass after a regression MUST be fixed or removed. Tests MUST NOT
call real backends; HTTP and federated remotes MUST be mocked (shared mocks in
`src/__tests__/setup/global-mocks.ts` and `src/__tests__/mocks/`). CI MUST keep
statements, branches, functions, and lines at or above `COVERAGE_THRESHOLD`
(default 80%).

**Project exception:** instead of being colocated next to the source, tests
MUST live in the single `src/__tests__/` tree, mirroring the `src/` path of the
code under test (e.g., `src/stores/groups.ts` →
`src/__tests__/stores/groups.spec.ts`), and MUST use the `.spec.ts` suffix.
Justification: this is the established layout. `tsconfig.app.json` and
`eslint.config.ts` are already scoped to `src/**/__tests__/**`, and the
mirrored path keeps every test discoverable from its source file, which is the
goal of colocation.

**Rationale:** behavior-focused tests survive refactors; implementation-coupled
tests become maintenance liabilities. Tests that do not catch real bugs give
false confidence.

### XXIV. Accessibility

Interactive elements MUST be keyboard accessible. Form inputs MUST have
associated labels. Color MUST NOT be the only means of conveying information.
Images MUST have meaningful `alt` text or be marked decorative with `alt=""`.
Focus states MUST be visible.

**Rationale:** accessibility is a legal requirement in many jurisdictions and
improves usability for all users, not only those with disabilities.

### XXV. Performance

Unused dependencies MUST be removed. Heavy computations MUST be memoized or
debounced when executed on frequent events (e.g., search inputs, contact list
filtering). Assets MUST be optimized (images, fonts). Bundle size impact SHOULD
be considered before adding a dependency, and dependencies already provided by
the host SHOULD be shared through Module Federation rather than duplicated.
Initial load SHOULD prioritize above-the-fold content.

**Rationale:** frontend performance directly affects user experience. A lean
bundle matters even more for a module loaded inside a host shell.

### XXVI. Internationalization

User-facing strings MUST NOT be hardcoded; they MUST be externalized to the
locale files in `src/locales/` and consumed through `vue-i18n` using ICU
MessageFormat syntax. Date, number, and currency formatting MUST respect the
user's locale (`date-fns` / `@date-fns/tz`, `src/utils/date.ts`,
`src/utils/number.ts`). All supported locales (`en`, `es`, `pt_br`, `ro`) MUST
keep key parity. New strings introduced in a PR MUST be localized before merge.

**Rationale:** externalized strings enable translation without code changes,
and the locale files are also exposed to the host (Principle IV). Locale-aware
formatting prevents confusion and builds trust with international users.

### XXVII. Defensive Programming

Defensive guards (null checks, fallback branches, runtime assertions) SHOULD
only be added when the invalid state is realistically reachable. Root causes
MUST be fixed rather than masked with defensive code. Guards MUST follow the
patterns already established in the surrounding code.

**Rationale:** unnecessary defensive code clutters the codebase and obscures
real logic. Fixing root causes produces more robust code than layering
protection.

### XXVIII. Maintainability

Business rules MUST NOT be duplicated across locations; they MUST be
centralized in a single source of truth (stores, `src/utils/`, or
`src/constants/`). Local duplication of utility code MAY exist when extraction
would create unnecessary coupling. Abstractions SHOULD only be created when a
clear pattern exists across multiple use cases.

**Rationale:** not all duplication is harmful. Premature abstraction creates
coupling worse than the duplication it removes. Centralize business rules;
tolerate incidental duplication.

### XXIX. Linting and Formatting

All code MUST pass `npm run lint` without errors before merge. The ESLint
configuration (`eslint.config.ts`) MUST extend `@weni/eslint-config` (from
https://github.com/weni-ai/eslint-config) as its base. Formatting MUST be
enforced through the configured tooling (ESLint, Prettier, `.editorconfig`);
style debates MUST NOT occur in code review.

**Rationale:** a shared ESLint configuration keeps all frontend projects
consistent. Automated enforcement removes subjective discussions.

## Development Workflow

### XXX. Commit Messages

Commits MUST follow Conventional Commits: `<type>: <description>`. Allowed types
are `feat`, `fix`, `docs`, `refactor`, `test`, and `chore`. The description MUST
be imperative, specific, and no longer than 50 characters. Commits MUST be
atomic: one logical change per commit.

**Rationale:** conventional commits enable automated changelog generation and
semantic versioning. Atomic commits simplify bisecting, reverting, and
reviewing.

### XXXI. Changelog Maintenance

Because this module publishes versioned federated contracts (Principle IV),
`CHANGELOG.md` MUST be maintained in Keep a Changelog format. Every user-facing
change MUST appear under the appropriate category (Added, Changed, Deprecated,
Removed, Fixed, Security) in the release entry `## [x.y.z] - YYYY-MM-DD`. The
version in `package.json` MUST be bumped following SemVer in the same PR.

**Rationale:** a well-maintained changelog communicates impact to the host and
other consumers and serves as release documentation. SemVer alignment sets
predictable upgrade expectations.

## Governance

This constitution supersedes conflicting local practices. Content precedence is:
engineering root base > frontend base > frontend-platform base > project
adaptation. A project rule MAY specialize but MUST NOT weaken a base rule,
except through an explicit **Project exception** recorded inside the affected
principle with its justification.

- **Amendments**: changes MUST be made via pull request to
  `.specify/memory/constitution.md`, with an updated Sync Impact Report and a
  version bump. Base updates MUST be pulled by re-running `setup-engineering`,
  which preserves still-valid project exceptions. Changes to the bases
  themselves belong in `weni-ai/vtex-cx-engineering-constitutions`.
- **Versioning**: MAJOR for removing or redefining a principle or exception;
  MINOR for adding a principle, section, or materially expanded guidance; PATCH
  for clarifications and wording fixes.
- **Compliance**: every `/speckit.plan` MUST pass the Constitution Check gate
  derived from this document, and any violation MUST be justified in the plan's
  Complexity Tracking. `/speckit.analyze` treats conflicts with a MUST as
  CRITICAL. PR reviewers MUST verify compliance before approval.

**Version**: 1.0.0 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-01
