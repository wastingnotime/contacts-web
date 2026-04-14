# Session Metric Guidance

## Purpose

This document gives starter repositories a simple way to track session productivity during MRL work.

Use it as a lightweight operational hint, not as a scoring system. The goal is to notice whether sessions remain controlled, grounded, and productive over time.

---

## Primary Metric

* `output_efficiency = output_tokens / total_tokens`

### Interpretation

* ideal range: `5% - 10%`
* below `5%`: investigate context size, loop friction, or low progress per session
* above `15%`: investigate drift risk, weak grounding, or slice size

### Tracking Intent

* do not maximize output
* prefer input-heavy, output-controlled sessions
* optimize for small, controlled changes, consistent progress, and stable reasoning

### Operational Rule

* if `output_efficiency` stays between `5%` and `10%`, the session pattern is healthy
* if it goes outside that range, inspect context size or slice size before continuing in the same pattern

---

## Supporting Metrics

These metrics are optional but useful when the tooling exposes them.

* `reasoning_efficiency = reasoning_tokens / output_tokens`
* `cache_ratio = cached_tokens / input_tokens`

Interpret them conservatively:

* reasoning efficiency helps indicate whether the session is spending a reasonable amount of explicit reasoning relative to produced output
* cache ratio helps show whether the workflow is benefiting from stable repeated context

These numbers are hints, not targets.

---

## How To Use This In MRL

Track metrics per working session or per short delivery interval.

Review them when:

* a session feels expensive without much progress
* slice size may be too large
* context keeps growing across loops
* the team wants a lightweight historical view of delivery efficiency

Do not use these metrics to replace artifact review, commit review, or slice evaluation.
They are operational hints for the shape of the work, not truth about the value of the work.

---

## Session - 20260405

### Raw

* total_tokens: 411928
* input_tokens: 391746
* cached_tokens: 3500288
* output_tokens: 20182
* reasoning_tokens: 1729

### Derived

* output_efficiency: 4.90%
* reasoning_efficiency: 8.57%
* cache_ratio: 8.93x

### Productivity

* slices_applied: 0
* tokens_per_slice: n/a
* docs_commits: 7

### Notes

* historical measurement recorded from `mrl-starter`
* this is both a real repository measurement and the starter example format for future repositories that want to track MRL session productivity
* productivity is interpreted cumulatively from repository start through `2026-04-05`
* `git log --until 2026-04-05` shows no `feat:` commits in `mrl-starter`, so no delivered slice was counted for that cumulative window
* the same cumulative history shows seven `docs:` commits, so this measurement reflects documentation and method-shaping work rather than slice delivery

---

## Session - 20260412

### Raw

* total_tokens: 698633
* input_tokens: 670061
* cached_tokens: 6022784
* output_tokens: 28572
* reasoning_tokens: 2561

### Derived

* output_efficiency: 4.09%
* reasoning_efficiency: 8.96%
* cache_ratio: 8.99x

### Productivity

* slices_applied: 0
* tokens_per_slice: n/a
* docs_commits: 10

### Notes

* historical measurement recorded from `mrl-starter`
* productivity is interpreted cumulatively from repository start through `2026-04-12`
* `git log --until 2026-04-12` shows no `feat:` commits in `mrl-starter`, so no delivered slice was counted for that cumulative window
* the same cumulative history shows ten `docs:` commits, so this measurement reflects documentation and method-shaping work rather than slice delivery
