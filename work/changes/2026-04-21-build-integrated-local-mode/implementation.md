# Implementation

## Slice

`solid_contacts_integrated_local_mode`

## What Changed

- added a dedicated `integrated-local` Vite mode preset via `.env.integrated-local`
- added `npm run dev:integrated-local` for the local service validation path
- added `npm run build:integrated-local` for the same preset at build time
- taught the runtime mode resolver to recognize `integrated-local`
- surfaced an explicit `Integrated local mode` badge in the app shell
- added an integrated-local Storybook shell preview
- added tests for the new runtime mode resolution and badge state
- recorded the local validation surface in `decisions.md`

## Behavior

- the frontend can be started explicitly in integrated local mode
- integrated local mode uses local service URLs from the dedicated Vite preset
- the mode remains distinct from isolated mode and Storybook preview

## Validation

- `npm test`
- `npm run build`
- `npm run build:integrated-local`

## Notes

- the mode is a local validation surface, not a substitute for the external backend contract
