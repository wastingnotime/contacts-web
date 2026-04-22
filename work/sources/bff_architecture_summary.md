# BFF Architecture Decision Summary

## Context

Current setup:
- `contacts-web` -> SolidJS SPA
- `axiom-exp-contacts` -> Python (Sanic) API

Considering introducing a BFF (Backend for Frontend).

Key constraints:
- Same team works on SPA and BFF
- BFF is web-specific
- Mobile (`contacts-mobile`) will likely have its own BFF in the future

---

## Core Decision

### Architecture Shape

```text
Browser -> Web BFF -> API (axiom-exp-contacts)
```

Future evolution:

```text
contacts-web      -> SPA + Web BFF
contacts-mobile   -> Mobile App + Mobile BFF
axiom-exp-contacts -> Domain/API
```

---

## Repository Strategy

### Recommended Approach (Current Phase)

Keep:

- `contacts-web` (same repo)
  - SPA
  - Web BFF

- `axiom-exp-contacts` (separate repo)
  - Domain/API

### Example Structure

```text
contacts-web/
  apps/
    spa/
    bff/
  packages/
    shared/
```

---

## Why Keep BFF in Same Repo as SPA?

- Same team owns both
- BFF is web-specific, not shared
- Enables:
  - Single PR for UI + backend changes
  - Faster iteration
  - Easier local development
  - Less coordination overhead

---

## Why NOT a Separate Repo (for now)?

Avoid premature separation unless:

- Different teams own BFF and SPA
- Different deployment cadence required
- BFF becomes a shared gateway
- Operational complexity increases

---

## Technology Choice

### Recommended: Node.js + TypeScript

Reasons:

- Strong alignment with web ecosystem
- Easier sharing with frontend (types, schemas, clients)
- Better fit for:
  - HTTP composition
  - Auth/session handling
  - UI-oriented responses

---

## BFF Responsibilities

### Should Do

- Aggregate API calls
- Adapt domain responses to UI shape
- Handle auth/session (cookies, tokens)
- Hide backend changes from SPA
- Implement web-specific policies (caching, retries)

### Should NOT Do

- Core business logic
- Domain rules
- Persistence logic
- Anything needed by multiple channels (web + mobile)

---

## Key Insight

> Organize by delivery channel ownership, not by language.

- Web = SPA + Web BFF
- Mobile = Mobile App + Mobile BFF
- API = Domain capabilities

---

## Final Recommendation

- Keep BFF inside `contacts-web` repo
- Structure as a separate app, not mixed with SPA
- Use Node.js/TypeScript
- Keep `axiom-exp-contacts` focused on domain logic
- Evolve to per-channel BFFs (web/mobile)

---

## Mental Model

- SPA -> interaction + rendering
- BFF -> delivery adapter (web-specific)
- API -> domain/system behavior

---

## Status

This setup is ideal for:
- Exploratory phase
- Fast iteration
- Clear boundaries
- Future scalability toward multi-channel architecture
