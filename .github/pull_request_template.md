## Summary

- What changed:
- Why:

## Validation

- [ ] `lint` run for touched files
- [ ] relevant tests run
- [ ] manual QA completed for touched UI paths

## Engineering Checklist

- [ ] No touched code/style file exceeds ~800 lines (or exception is documented)
- [ ] Reused existing utilities/components where possible
- [ ] New repeated logic/style was extracted to shared utility/module
- [ ] No stale prototype naming introduced (for example, `Burst` in JobViz)
- [ ] Hook imports and moved state references verified (no orphan setters/undefined hooks)

## Navigation Behavior Checklist

- [ ] Route/query state is preserved where expected (`tourId`, `edit`, `sort`, filters, preview flags)
- [ ] Shallow routing is used for state-only transitions where appropriate
- [ ] Back/forward behavior restores expected UI state
- [ ] Scroll/focus behavior is intentional and stable after navigation/toggles
- [ ] Desktop/mobile nav flows remain equivalent in destination/state semantics
- [ ] Icon-only nav controls include accessible names

## UI/Aesthetic Checklist

- [ ] Conforms to [`docs/aesthetic-guidelines.md`](../docs/aesthetic-guidelines.md)
- [ ] `.textyCardHover` override used where hover underline/blue-link leakage can occur
- [ ] Breakpoints reuse existing patterns; no unnecessary new breakpoint variants

## Notes / Exceptions

- Any intentional exceptions and rationale:
