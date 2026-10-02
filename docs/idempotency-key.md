# `Idempotency-Key` for `POST /api/v2/internals/whatsapp_broadcasts`

## Context

The Bulk Send frontend sends an `Idempotency-Key` HTTP header on every
`POST /api/v2/internals/whatsapp_broadcasts` request. The header is generated
once per submission (one click on "Continue" in the Confirm and Send step) and
reused for any retry of the same logical submission.

This was added after a production incident in which a single user submission
generated three identical `POST /whatsapp_broadcasts` requests, causing the
backend to dispatch the broadcast three times and bill the customer three times.
The frontend now has a synchronous re-entry guard that prevents that specific
race, but the header is the **defense-in-depth** layer: it lets the backend
deduplicate any duplicate POST regardless of where it originates (browser bug,
proxy retry, axios retry config in the future, etc.).

> **Important — backwards compatibility.** The `POST /whatsapp_broadcasts`
> endpoint is consumed by other applications besides the Bulk Send frontend.
> Those consumers do not (and may never) send the `Idempotency-Key` header.
> The header MUST therefore stay **optional** on the backend: requests without
> it have to be processed normally, just without the dedupe guarantee. The
> mandatory contract lives only on the Bulk Send frontend side, where every
> outbound request is required to include the header.

## Wire format

- **Header name:** `Idempotency-Key`
- **Value:** an opaque string, currently a UUIDv4 produced by `crypto.randomUUID()`.
  - Example: `Idempotency-Key: 7f3b9c2e-5e4a-4a4b-9ad8-12c9f3a2e1b1`
  - Backends MUST treat the value as opaque (do not assume UUID format).
  - Length is bounded but not strictly fixed; treat anything up to 200 chars as valid.
- **Scope:** one key per submission (one `handleContinue` invocation in the
  frontend). The same key is reused if the same submission is retried at the
  HTTP layer, and a fresh key is generated for any new submission attempt
  (including after the user dismisses an error modal and clicks Continue again).

## Required backend behavior

The `Idempotency-Key` header is **optional**. The endpoint must keep accepting
requests that omit it (other consumers rely on that contract). When the header
is absent, process the request normally — there is simply no replay protection
for that call.

### When the header is present

1. **Lookup:** check whether a previous request from the same project (or
   tenant) has been processed with this exact key.
2. **First time:** process the request normally, persist the result keyed by
   `(project_uuid, idempotency_key)`, and return the response.
3. **Replay (same key, same body):** return the cached response from step 2
   without re-dispatching the broadcast and without billing again. The status
   code and body should be identical to the original response.
4. **Replay with conflicting body (same key, different body):** reject with
   `409 Conflict` and a clear error message. This indicates a client bug.
5. **Retention:** the key/response cache should live at least 24 h. A short
   window (e.g. 60 s) is enough to cover the double-click case but a longer
   window protects against background workers retrying.

### When the header is absent

Process the request as before — no lookup, no persistence under an
idempotency namespace, no `409` ever raised on this axis. Treat it exactly
like the legacy contract.

## Suggested storage

- Redis with `SET key value NX EX 86400` keyed by
  `idempotency:whatsapp_broadcasts:{project_uuid}:{idempotency_key}`.
- Store either the full response payload or a pointer to the persisted
  broadcast row so step 3 can rebuild the response.

## Edge cases

- **Missing header:** an explicitly supported case — other consumers of this
  endpoint do not send `Idempotency-Key`. The backend MUST process the request
  normally (do not respond with `400`); it simply skips the dedupe path. Only
  the Bulk Send frontend is required to send the header.
- **Empty/whitespace value:** treat as missing (i.e. fall back to the
  no-header path).
- **Two concurrent requests with the same key:** only one should win. Use an
  atomic `SETNX` (or DB unique constraint) so the second one waits or returns
  the in-flight response. Returning `409 Conflict` for the second is acceptable
  but suboptimal — the frontend will surface that as an error to the user even
  though the broadcast did go through.

## Frontend reference

- Generation: `generateIdempotencyKey()` in
  [`src/components/NewBroadcast/ConfirmAndSend/composables/useConfirmActions.ts`](../src/components/NewBroadcast/ConfirmAndSend/composables/useConfirmActions.ts).
- Plumbed through:
  - [`broadcastsStore.createBroadcast`](../src/stores/broadcasts.ts) (required arg)
  - [`BroadcastsAPI.createBroadcast`](../src/api/resources/flows/broadcasts.ts) (required arg, sets the header)
- Tests:
  - API: [`src/__tests__/api/flows/broadcasts.spec.ts`](../src/__tests__/api/flows/broadcasts.spec.ts) — asserts the header is sent.
  - Component: [`src/__tests__/components/NewBroadcast/ConfirmAndSend/ConfirmAndSend.spec.ts`](../src/__tests__/components/NewBroadcast/ConfirmAndSend/ConfirmAndSend.spec.ts) — asserts triple-click only fires `createBroadcast` once.
