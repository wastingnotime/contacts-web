# Public Contracts

This tree is the canonical entrypoint for the public browser boundaries in `contacts-web`.

Use it to understand what the repository exports outwardly before reading implementation paths or source internals.

## Contract Categories

- `frontend`
- `bff`
- `auth`
- `telemetry`
- `navigation`
- `session`

## How To Read This Tree

- Start at the category README that matches the boundary you are changing.
- Use the matching implementation-adjacent code and tests to verify the contract.
- Keep implementation details out of this tree unless they are part of the exported semantics.
- Treat these pages as the stable visitor map, not as a duplicate source tree.

## Implementation-Adjacent Surfaces

The current repository realizes these contracts through:

- `src/client/contracts/`
- `src/shared/config/`
- `src/shared/telemetry/`
- `tests/contracts/`
- `work/publications/`

These locations are not the public index. They are the places where the contracts are implemented, exercised, or handed off.
