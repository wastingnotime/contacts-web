# Request

## Source

Follow-up request to introduce Storybook after the isolated-mode and MSW work.

## Signal

The repository needs a local preview runtime for inspecting contact UI states without running the full app.

## Evidence

- the repo already uses Solid and Vite
- isolated mode already covers backend-free app execution
- the contact form and contacts list have clear visual states worth inspecting independently

## Extracted Meaning

Storybook should be introduced as a preview tool, not as a second product runtime.

The preview should stay backend-free and deterministic, and it should focus on inspecting the existing UI states rather than adding new product behavior.
