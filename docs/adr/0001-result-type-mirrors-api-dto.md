# Loadout result type mirrors the API response, no domain mapping layer

## Status

accepted

## Context

`src/features/loadout/types.ts` originally argued for decoupling the domain `LoadoutResult`
from the transport shape (DIP), but that decoupling was written against a *guessed* response
(`{ armor, decos, skills }`) before the real `/api/mh-wilds/search` endpoint existed. The real
response is much richer (`armorNames`, `rarities`, `setSkills`, `groupSkills`, `decoNames`,
`freeSlots`, `slots`, `defense`, `elementalDefenses`) and the backend exports Zod-derived schemas
as the source of truth.

## Decision

`LoadoutResult` mirrors the API response shape **exactly** — same field names, no rename, no
`toLoadoutResult` mapper. Result components consume the response directly. We do **not** import the
backend's `SearchResultDto` type across the package boundary; we keep a local interface that matches it.

## Consequences

- Every result-rendering component had to be rewritten for the real field names regardless, so a
  mapper would have added a layer with no payoff for a single-consumer UI.
- Trade-off accepted: a future backend contract change lands directly in components instead of being
  absorbed by one mapper. Mitigated only by the local interface, which turns a field rename into a
  compile error at the fetch boundary.
- This intentionally reverses the original decoupling comment in `types.ts` — that comment should be
  updated so the next reader doesn't "restore" the abstraction.
