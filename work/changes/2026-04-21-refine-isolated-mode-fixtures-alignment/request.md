# Request

## Source

Follow-up from the isolated-mode and Storybook work.

## Signal

The same local contact seeds are being maintained in separate fixture helpers for Storybook and isolated mode.

## Evidence

- Storybook uses a view-model fixture helper
- isolated mode uses MSW transport seed contacts
- both surfaces currently describe the same contacts in different places

## Extracted Meaning

The local fixture sources should be aligned so preview and isolated runtime stay in sync.

The next slice should introduce one shared seed source and derive the preview and transport shapes from it explicitly.
