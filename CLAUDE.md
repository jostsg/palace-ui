# Palace UI

A CSS-only design system. No build step, no JavaScript, no preprocessor.

## Structure

- `palace.css` — the entire design system: tokens, reset, component classes
- `catalog.html` — visual component catalog (open in browser to see everything)
- `SPEC.md` — AI-first design specification (included in the npm package)

## Rules

- All design tokens use the `--p-` prefix
- `border-radius: 0` everywhere, no exceptions
- Shadows are always hard (0 blur): a `--p-shadow-*` size and a colour, never a raw offset
- Transitions are always `0.1s`
- No CSS preprocessors, no build step — this ships as a single CSS file
- Test changes by opening the HTML files in `examples/` (when they exist)
- Spacing comes from the container: `space-*` between children, `gap-*` in flex and grid rows. Margin only for a single exception, said in a comment; padding only for the inside of a box. Components set no outer margin; a component that spaces its own children does it in `:where()` so the utilities win. Missing values become `--p-` tokens, not raw numbers. Dividers and `margin: auto` centring are exempt. See SPEC.md Spacing Rules.

## Design Source of Truth

palace-ui is the design source of truth. App-specific CSS may extend behavior but must not contradict palace-ui patterns. Any new reusable pattern belongs in `palace.css`, not in app stylesheets.

## Versioning

- Follow semver: breaking class/token renames or removals = major bump
- Adding new classes or tokens = minor bump
- Fixing existing styles = patch bump
- Update the version comment at the top of `palace.css` when bumping
