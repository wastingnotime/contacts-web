# Implementation

## What Changed

- made the contacts-web promotion workflow update the pinned swarm image line directly
- removed the placeholder-only assumption so infra promotion works whether the stack file still uses a variable placeholder or already has a literal image reference

## Validation

- reviewed the workflow path against the current infra stack format
- the image build path already succeeded before this promotion fix
