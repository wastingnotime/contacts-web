# Implementation

## Slice Implemented

`docs/slices/contacts_web_split_license_boundary.md`

## What Changed

- Added a split-license notice at the repository root in `LICENSE`
- Added full MIT text under `LICENSES/MIT.txt`
- Added full MPL 2.0 text under `LICENSES/MPL-2.0.txt`
- Recorded the split-license decision in `decisions.md`
- Added a README note pointing readers to the split-license boundary
- Set the package metadata license to `MPL-2.0` for the `contacts-web` product surface

## Notes On Boundary Shape

- MRL operating and workflow artifacts remain MIT
- `contacts-web` product artifacts remain MPL 2.0
- the root `LICENSE` now acts as a scope notice instead of a single-license claim
- package metadata aligns with the product-side license choice

## Validation

- reviewed the root `LICENSE` scope notice
- reviewed `LICENSES/MIT.txt`
- reviewed `LICENSES/MPL-2.0.txt`
- reviewed `package.json` for the product-side license metadata
- reviewed `decisions.md` and `readme.md` for the split-license pointer

No runtime tests were needed because this slice only changes repository governance and publication metadata.
