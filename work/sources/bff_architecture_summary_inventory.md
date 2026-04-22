# BFF Architecture Summary Inventory

## Purpose

This file records the source evidence used during the 2026-04-22 `extract` pass for the `contacts-web` BFF direction.

It exists so later phases can trace the BFF architecture intent without depending on chat history.

## Source Evidence

1. `/home/henrique/Downloads/bff-architecture-summary.md`
   - establishes the current architecture shape as `Browser -> Web BFF -> API`
   - recommends keeping the SPA and web BFF in the same `contacts-web` repo
   - frames the BFF as web-specific and not shared with mobile
   - recommends Node.js plus TypeScript for the BFF layer
   - defines the BFF as a delivery adapter that aggregates API calls and shapes responses for the UI

## Extracted Signals

- `contacts-web` should be treated as a repository that can house both the SPA and a web-specific BFF.
- The BFF is intended to own delivery concerns, not domain rules or persistence.
- The BFF should remain channel-specific so mobile can have its own future adapter.
- The BFF direction favors Node.js plus TypeScript even though the existing web app stack is Solid.
