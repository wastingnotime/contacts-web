# Implementation

## Slice

`solid_contacts_storybook_preview`

## What Changed

- added `storybook-solidjs-vite` as the Solid/Vite Storybook framework adapter
- added `storybook` and `build-storybook` npm scripts
- added `.storybook/main.js`
- added `.storybook/preview.jsx` with shared app styles and a layout decorator
- added deterministic story fixtures for `ContactFormFields`
- added deterministic story fixtures for `ContactsListPage`
- added a reusable story-only contacts API client helper
- updated the README with the Storybook startup command
- ignored generated `storybook-static/` output
- recorded the Storybook preview decision in `decisions.md`

## Behavior

- Storybook starts as a separate local preview runtime
- stories render without contacting the live backend
- component and page states can be inspected deterministically
- shared app styling applies inside the preview frame

## Validation

- `npm test`
- `npm run build`
- `npm run build-storybook`

## Notes

- Storybook stays separate from isolated app execution and from the live app bootstrap path
- generated Storybook build output is excluded from version control
