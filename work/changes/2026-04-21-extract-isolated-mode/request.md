# Request

## Source

Local note from `/home/henrique/Downloads/isolated_mode.md`.

## Signal

The repository should support an isolated UI mode for fast iteration without backend dependency.

## Evidence

- stack: SolidJS (Vite)
- supporting tools: MSW and Storybook
- characteristics: no real backend, fully deterministic, fast feedback loop
- intended uses: UI development, edge states, component inspection

## Extracted Meaning

This is not a product requirement for contacts data itself.

It is a development and testability signal that may justify a separate backend-free UI path, provided it stays clearly separated from live contract behavior.
