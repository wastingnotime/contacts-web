# Web Architecture Strategy (SPA + BFF + Backend)

## Goal

Define a clean, consistent architecture across development and production environments for a SPA + BFF + backend system.

---

## Current Development Flow

* Vite dev server serves static files
* Browser talks only to Vite host
* Vite proxies `/api` → BFF
* BFF calls backend

### Flow

Browser → Vite → BFF → Backend

### Key Property

* Single origin from browser perspective
* No CORS complexity
* Simple mental model

---

## Previous Production Approach

* Nginx serves static files
* Browser calls BFF directly or via proxy

### Issues

* Browser may know multiple hosts (static + API)
* Introduces CORS, auth, and routing complexity
* Drift between dev and prod behavior

---

## Recommended Production Architecture

### Stack

* AWS CloudFront (public entry)
* Traefik (Swarm ingress / router)
* SPA static container (nginx or similar)
* BFF service
* Backend service (private)

---

## Final Flow

Browser
→ CloudFront
→ Traefik
→ SPA (for `/`)
→ BFF (for `/api`)
→ Backend (internal only)

---

## Routing Strategy

Single public domain:

[https://app.example.com](https://app.example.com)

### Traefik rules

* `/api/*` → BFF
* `/*` → SPA static service

---

## Frontend Rule

Always use relative paths:

```
fetch('/api/...')
```

### Benefits

* No environment-specific host config
* Same behavior in dev and prod
* No CORS issues

---

## Responsibilities by Layer

### CloudFront

* Public entrypoint
* TLS termination
* Static asset caching
* Forward `/api` without caching

### Traefik

* Central routing layer
* Path-based routing
* Swarm service discovery
* Load balancing

### SPA Static Service (nginx)

* Only serves built static files
* No routing logic

### BFF

* Handles frontend-specific logic
* Authentication/session
* Aggregation/orchestration
* Calls backend internally

### Backend

* Domain/business logic
* Not exposed publicly

---

## Why NOT Use nginx as Reverse Proxy for BFF

You *can*, but in this stack it is not ideal.

### nginx-as-proxy pattern

Browser → nginx → BFF → Backend

### Problems in this context

* Duplicates Traefik responsibilities
* Two routing layers (nginx + Traefik)
* More debugging complexity
* Less alignment with Swarm dynamic routing
* Harder to maintain consistent rules

---

## Preferred Principle

Separate concerns clearly:

* Traefik → routing
* nginx → static files
* BFF → application logic

---

## Dev vs Prod Symmetry

Environment comparison:

Dev

* Entry: Vite
* Proxy: Vite proxy

Prod

* Entry: CloudFront
* Proxy: Traefik

### Result

* Same mental model
* Same API paths (`/api`)
* Minimal surprises

---

## Final Recommendation

Use:

* CloudFront as single public entry
* Traefik as central router
* SPA calls relative `/api` paths
* nginx only serves static files
* BFF and backend remain internal

---

## One-Line Summary

Browser talks to one origin; Traefik routes everything; nginx stays dumb.
