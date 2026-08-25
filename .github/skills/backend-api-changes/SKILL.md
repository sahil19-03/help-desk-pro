---
name: backend-api-changes
description: 'Implement and validate backend/API changes in this Help Desk repository. Use when adding or changing Express routes, request validation, ticket routing, support-team behavior, response contracts, or related PostgreSQL schema work.'
argument-hint: 'Describe the API behavior or endpoint to change'
user-invocable: true
---

# Backend/API Changes

## Outcome

Deliver a small, tested backend change that preserves the existing API contract and keeps the in-memory milestone behavior consistent with the documented PostgreSQL direction.

## When to Use

- Add or change an Express endpoint in `server/src/index.js`.
- Change ticket creation, validation, assignment, routing, or support-team availability.
- Change an API response shape or error behavior.
- Add a database-backed field or change `database/schema.sql` for a planned persistence milestone.

## Procedure

1. Read `README.md`, `server/src/index.js`, and the relevant package scripts before editing. Identify the owning route or helper and record the current method, path, request fields, response status, and response shape.
2. State the behavior change as a concrete example, including a valid request, an invalid request, and any routing or persistence consequence. Keep the change scoped to the owning backend surface.
3. Decide whether the change is in the current in-memory milestone or the future PostgreSQL milestone:
   - For current milestone behavior, update the Express implementation and keep the API runnable without a database connection.
   - For persistence work, update `database/schema.sql` and the server integration together. Do not imply database support by changing the schema alone.
4. Implement validation at the route boundary. Reject missing or malformed required values with HTTP `400` and the repository's `{ message: string }` error shape. Trim user-entered text before storing or returning it.
5. Preserve existing contracts unless the request explicitly requires a breaking change:
   - Keep `/api/health`, `/api/tickets`, and `/api/support-teams` behavior intact.
   - Return a created ticket with HTTP `201` from ticket creation.
   - Keep ticket identifiers, status, team, assignee, response-time, and creation-date fields consistent with existing responses.
6. For assignment changes, verify category matching first, then available capacity, then the documented fallback behavior. Make the no-available-team case explicit and test it.
7. Add or update the narrowest available automated check. At minimum, exercise health, successful creation, invalid creation, and the changed routing or response case. If no test framework exists, use a small repeatable smoke check or document the manual HTTP requests needed.
8. Run the focused server check, then the repository checks available from package scripts. Confirm the server starts cleanly and that the API responds on its configured port.
9. Review the final diff for accidental contract changes, unvalidated input, stale schema/API mismatches, and unrelated edits. Update `README.md` when the endpoint behavior or startup procedure changes.

## Decision Rules

- A request that only changes API behavior belongs in `server/src/index.js` unless a shared constant or dedicated module is already present.
- A schema-only change is appropriate only when it documents the next persistence milestone; it must not be described as runtime-backed behavior.
- A new required field needs both boundary validation and an explicit response/test expectation.
- A route that mutates ticket state must define behavior for unknown ticket IDs and invalid state transitions before implementation.
- Prefer the existing Express and workspace scripts. Do not introduce a new framework or database client for a narrow endpoint change.

## Completion Criteria

- The requested endpoint behavior is implemented at its owning route.
- Valid requests return the intended status and response shape.
- Invalid requests return a clear `400` error without mutating state.
- Routing and capacity edge cases are covered.
- The server starts successfully and focused checks pass.
- Documentation and schema remain honest about the current in-memory milestone.
