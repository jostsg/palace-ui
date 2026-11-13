# Palace UI — Design Specification

> AI-first design spec. When building UIs for projects that use Palace UI,
> follow this document exactly. Include `palace.css` and write HTML using
> these classes. Do not invent new patterns — use what's here.

## Philosophy

- **Retro-technical.** Hard edges (border-radius: 0 everywhere), thick 2px borders, chunky offset box-shadows. Gradients on text, thin decorative stripes (≤3px), and narrow fixed bars (e.g. sticky CTAs) only — never on large surfaces or card backgrounds.
- **Three-color accent system.** Hot pink `#ff2d9b`, electric purple `#5b4cff`, cyan `#00e5ff`. These rotate across card lists and provide visual rhythm.
- **Snappy interactions.** All transitions are `0.1s`. Hovers lift elements up-left and cast a hard shadow down-right. Fast, mechanical feedback.
- **Uppercase everything.** All headings, labels and buttons are `text-transform: uppercase` with tracked letter-spacing. Body text and status messages, which are sentences, are the exception.
- **Dark on light.** `#0a0a0a` text on `#f0f0f0` background. Cards are white `#fff`. Code blocks invert to dark `#0a0a0a` backgrounds.
- **No border radius.** Ever. `border-radius: 0` is the rule, not the exception.
- **Content-width containers.** Max-width `640px` for main content, `420px` for auth/narrow forms.

## Setup

### Fonts

palace-ui ships Space Grotesk and JetBrains Mono as woff2 files in `fonts/`
(SIL Open Font License 1.1) and loads them from `palace.css` itself. Do not add
Google Fonts links: they send every visitor's IP address to Google, which German
courts have held to violate the GDPR without consent. Keep `fonts/` next to
`palace.css` when serving.

### Stylesheet

```html
<link rel="stylesheet" href="/vendor/palace-ui/palace.css">
```

Or if consuming via npm with a build tool:

```css
@import 'palace-ui/palace.css';
```

## Token Reference

### Colors

| Token | Value | Usage |
|---|---|---|
| `--p-accent-1` | `#ff2d9b` | Primary action, CTA buttons, first card in rotation |
| `--p-accent-2` | `#5b4cff` | Secondary action, links, input focus, second card |
| `--p-accent-3` | `#00e5ff` | Tertiary accent, navbar user, code highlights, third card |
| `--p-text` | `#0a0a0a` | Body text, borders |
| `--p-text-secondary` | `#444` | Body copy in cards, descriptions |
| `--p-text-muted` | `#666` | Subtitles, labels |
| `--p-text-faint` | `#6b6b6b` | Table headers, brand labels, meta text |
| `--p-bg` | `#f0f0f0` | Page background |
| `--p-surface` | `#fff` | Card/container backgrounds |
| `--p-surface-inset` | `#f7f7f7` | Inset/recessed surfaces |
| `--p-dark` | `#0a0a0a` | Dark backgrounds (navbar, code, hover fills) |
| `--p-error` | `#ff4444` | Error states, danger zones: fills, borders, the error box |
| `--p-error-text` | `#c40000` | Red text (danger buttons, error text): 6.3:1 on white, where `#ff4444` is 3.4:1 |
| `--p-success` | `#00ff88` | Success states |
| `--p-warning` | `#ffcc00` | Warning states |
| `--p-info` | `var(--p-accent-3)` | Informational states (semantic alias for cyan) |
| `--p-overlay` | `rgba(10, 10, 10, 0.7)` | Overlay/backdrop for dialogs |
| `--p-hover-bg` | `#e8e8e8` | Subtle hover background for rows/lists |
| `--p-code-bg` | `#1a1a2e` | Inline code background on dark surfaces |
| `--p-code-highlight` | `#00ff88` | Highlighted code text (values, keys) |

### Typography

| Token | Value |
|---|---|
| `--p-font` | `'Space Grotesk', system-ui, sans-serif` |
| `--p-font-mono` | `'JetBrains Mono', monospace` |

### Spacing

| Token | Value | Usage |
|---|---|---|
| `--p-space-xs` | `4px` | Tight gaps |
| `--p-space-sm` | `8px` | Button gaps, label to control |
| `--p-space-md` | `16px` | Space between cards and fields, standard padding |
| `--p-space-lg` | `24px` | Card padding, section spacing |
| `--p-space-xl` | `32px` | Intermediate section gaps |
| `--p-space-2xl` | `48px` | Hero padding, major section gaps |

### Spacing Rules

Spacing comes from the container, never from the component inside it.

1. **`space-*` between children.** A container spaces its direct children vertically with the owl selector (`> * + *` gets `margin-top`). Use it for any column: paragraphs, fields, cards, sections.

2. **`gap-*` in rows and grids.** A flex or grid container sets its `gap`. Its children get no margin.

3. **Margin only for a single exception.** One element that needs more or less space than its container gives it gets its own margin, with a comment saying why.

4. **Padding is the inside of a box**, never the space between things.

5. **Components set no outer margin.** A component styles its inside only: `.card`, `.card-static`, `label`, `.stat-row`, `.page-header` and dialog parts have no margin around them. An outer margin would add to a `gap` or fight a `space-*`. Components that space their own children (`.page-header`, `.code-reveal`, `dialog`, list items in a container) do it with `:where()` rules, so a `space-*` utility on them always wins.

6. **Missing values become tokens.** When a value is missing, add it to palace as a token instead of writing a raw number in an app. A raw value is only for a genuine one-off, with a comment saying why.

Sizes for both: `xs` (4px), `sm` (8px), `md` (16px), `lg` (24px), `xl` (32px), `2xl` (48px), the `--p-space-*` scale.

**Exceptions:** dividers (`.divider`, `.divider-danger`, `.gradient-stripe`) use top and bottom margin because they are separators by nature. `margin: auto` centres containers and dialogs. The `.stat-label` 2px optical nudge and the rules between the navbar menu's groups are part of those components.

### Shadows

Offsets only; combine with a colour: `box-shadow: var(--p-shadow-md) var(--p-accent-2)`. Pick a size by role, never write a raw offset. Inset indicator lines (`inset 3px 0 0`) are not offset shadows and stay as they are.

Shadows mark boxes that lie on the page: a bordered box inside a card or another shadowed box keeps its border and has no shadow.

| Token | Usage |
|---|---|
| `--p-shadow-xs` | Keys (`kbd`) |
| `--p-shadow-sm` | Small chips |
| `--p-shadow-md` | Controls: hover and focus |
| `--p-shadow-lg` | Boxes and cards: status boxes, cards, dialogs, the navbar menu panel |

Boxes, by component:

- **`lg`:** `.card-static` (`--p-text`, at rest and on hover; it never lifts), `.status` (`--p-text`), `dialog` and `.navbar-menu-panel` (`--p-accent-2`; the panel floats above the page like a dialog), and `.card` on hover (the lift casts its accent; at rest a `.card` is flat, so a list of cards shows the shadow where the pointer is).
- **Deliberately none:** tables (rules between rows, no outer box), `pre` and `.code-reveal` (they scroll sideways, which would clip a shadow), `.tag-sticker` and other tags (small chips, flat), and the disabled state of any control.

A shadow reaches 4px right and below its box. Leave that room inside a container that clips (`overflow: hidden`, `auto` or `scroll`); palace's own layouts clip nothing a box sits in.

### Layout

| Token | Value |
|---|---|
| `--p-container-width` | `640px` |
| `--p-container-narrow` | `420px` |
| `--p-navbar-height` | `52px` |

### Controls

| Token | Value | Usage |
|---|---|---|
| `--p-control-height` | `44px` | Text inputs, selects, number input, buttons |
| `--p-control-height-sm` | `32px` | `.btn-sm`, a button inside `.input-action` |
| `--p-control-height-lg` | `52px` | `.btn-lg`, `.cta` |

## Component Catalog

### Page Shell

Every page follows this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page Title</title>
  <!-- palace (keep fonts/ next to palace.css) -->
  <link rel="stylesheet" href="/vendor/palace-ui/palace.css">
</head>
<body>
  <!-- optional navbar -->
  <!-- content -->
</body>
</html>
```

### Navbar

```html
<nav class="navbar">
  <a href="/" class="navbar-brand">App Name</a>
  <div class="navbar-right">
    <span class="navbar-user">Username</span>
    <button class="btn btn-sm">Log Out</button>
  </div>
</nav>
```

A navbar menu for the signed-in user is a `<details class="navbar-menu">`: the summary looks like `.navbar-user`, and the panel's links and buttons are its items. A form in the panel (sign out) sits under a thin rule. It works without JavaScript; a script can add Escape and closing from outside.

```html
<nav class="navbar">
  <a href="/" class="navbar-brand">App Name</a>
  <div class="navbar-right">
    <details class="navbar-menu">
      <summary><span class="visually-hidden">Account: </span>Username</summary>
      <div class="navbar-menu-panel">
        <p class="navbar-menu-label" aria-hidden="true">Your teams</p>
        <ul aria-label="Your teams"><li><a href="/a" aria-current="true">Team A</a></li></ul>
        <a href="/account">Account</a>
        <form method="post" action="/logout"><button type="submit">Sign out</button></form>
      </div>
    </details>
  </div>
</nav>
```

Group items with `.navbar-menu-group`: a thin rule above, like the one before sign out, and an optional `.navbar-menu-label` as its heading. A setting that is switched on and off is a `button.navbar-menu-setting` with `aria-pressed`: its name sits on the left and a small square switch on the right, pink when pressed. Toggle `aria-pressed` with a script, or submit a form that renders the new state. Use it for on/off settings, not for links.

```html
<div class="navbar-menu-group" role="group" aria-labelledby="menu-settings">
  <p class="navbar-menu-label" id="menu-settings">Settings</p>
  <button type="button" class="navbar-menu-setting" aria-pressed="true">Notifications</button>
  <button type="button" class="navbar-menu-setting" aria-pressed="false">Sound</button>
</div>
```

`.visually-hidden` hides text visually and keeps it for screen readers (see Visually Hidden).

With an icon beside the brand name (`.navbar-brand` uses `inline-flex` layout with `gap: 10px`; images/SVGs are auto-sized to 24×24):

```html
<nav class="navbar">
  <a href="/" class="navbar-brand">
    <img src="/icons/app-icon.svg" alt="">
    <span>App Name</span>
  </a>
  <div class="navbar-right">
    <span class="navbar-user">Username</span>
    <button class="btn btn-sm">Log Out</button>
  </div>
</nav>
```

Light variant for pages that need a white navbar:

```html
<nav class="navbar navbar-light">
  <a href="/" class="navbar-brand">App Name</a>
  <div class="navbar-right">
    <span class="navbar-user">Username</span>
    <button class="btn btn-sm">Log Out</button>
  </div>
</nav>
```

### Page Header

Standard spacing for non-hero pages (after navbar). Provides `48px` top padding and `8px` between its children.

```html
<div class="container page-header">
  <h1>Page Title</h1>
  <p class="subtitle">Helpful subtitle</p>
  <!-- content -->
</div>
```

Combines with any container class:

```html
<div class="container-narrow page-header">
  <h1>Narrow Page</h1>
  <p class="subtitle">For auth forms</p>
  <!-- content -->
</div>
```

Spacing: `48px` top padding and `8px` between its children; it has no outer margin. To give the content more room than the heading, group the heading and subtitle and put a `space-*` class on the header:

```html
<div class="container page-header space-xl">
  <div class="space-sm">
    <h1>Page Title</h1>
    <p class="subtitle">Helpful subtitle</p>
  </div>
  <!-- content -->
</div>
```

Do **not** use on landing/hero pages (those use custom hero spacing).

### Hero Section (Landing Pages)

```html
<div class="container space-lg" style="padding-top: 80px; padding-bottom: 48px;">
  <p class="brand">App Name</p>
  <h1 class="h1-hero">Main Headline Here</h1>
  <p class="tagline">
    A sentence or two explaining what this does. Keep it short.
  </p>
  <div class="gap-sm" style="display: flex; flex-wrap: wrap;">
    <a href="/signup" class="cta cta-primary">Sign Up</a>
    <a href="/login" class="cta cta-secondary">Log In</a>
  </div>
</div>
```

When the app has a visual mark/icon, use `.brand-lockup` instead of a standalone `.brand`:

```html
<div class="container space-xl" style="padding-top: 80px; padding-bottom: 48px;">
  <div class="brand-lockup">
    <img src="/icons/app-icon.svg" alt="">
    <div>
      <p class="brand" style="font-size: 17px; letter-spacing: 3px;">App Name</p>
      <p class="subtitle">Short descriptor</p>
    </div>
  </div>
  <h1 class="h1-hero">Main Headline Here</h1>
  <!-- ... -->
</div>
```

### Brand Lockup

Icon beside app name and descriptor, forming a single cohesive block. The icon scales to match the combined text height.

```html
<div class="brand-lockup">
  <img src="/icons/app-icon.svg" alt="">
  <div>
    <p class="brand">App Name</p>
    <p class="subtitle">Short descriptor</p>
  </div>
</div>
```

Use in hero sections and landing pages where the app has a visual mark. The `.brand` and `.subtitle` classes handle typography; `.brand-lockup` handles layout only.

### Card List (3-Color Rotation)

When you have a list of cards, the accent color auto-rotates via `nth-child`. Cards have no margin; the list spaces them with `space-md` (or `gap-md` in a grid):

```html
<div class="container space-md">
  <div class="card">
    <h2>First Card</h2>
    <p>Description goes here. Color will be accent-1 (pink).</p>
  </div>
  <div class="card">
    <h2>Second Card</h2>
    <p>This one gets accent-2 (purple).</p>
  </div>
  <div class="card">
    <h2>Third Card</h2>
    <p>This one gets accent-3 (cyan).</p>
  </div>
</div>
```

For explicit accent control (e.g. server-rendered cards), use the `--accent` custom property:

```html
<div class="card" style="--accent: var(--p-accent-2)">
  <h2>Specific Accent</h2>
</div>
```

### Static Card

For cards used as form containers or static content that should not lift on hover. It keeps its `--p-shadow-lg` shadow in `--p-text`, at rest and on hover:

```html
<div class="card-static space-md">
  <div class="field">
    <label for="name">Name</label>
    <input type="text" id="name" placeholder="Enter your name">
  </div>
</div>
```

Use `.card-static` instead of `.card` when the card is a container (e.g. auth forms, settings panels) rather than a clickable list item.

### Buttons

Size modifiers compose with any color variant. `.btn` works on `<button>` and on `<a>` alike: a button and a link button of the same size are the same height (44px default, 32px `.btn-sm`, 52px `.btn-lg` and `.cta`, from the control height tokens) and line up side by side. The height is a minimum: a button grows when its label wraps.

```html
<!-- Size modifiers -->
<button class="btn btn-sm btn-primary">Small Primary</button>
<button class="btn btn-primary">Medium Primary</button>
<button class="btn btn-lg btn-primary">Large Primary</button>

<!-- Primary (hot pink) — main actions -->
<button class="btn btn-primary">Create</button>

<!-- Secondary (purple) — secondary actions -->
<button class="btn btn-secondary">Copy</button>

<!-- Outline (transparent) — tertiary actions -->
<button class="btn btn-outline">View Details</button>

<!-- Danger (red) — destructive inline actions -->
<button class="btn btn-sm btn-danger">Revoke</button>

<!-- Danger full-width — destructive section actions -->
<button class="btn btn-danger btn-block">Delete My Account</button>

<!-- CTA (larger) — hero sections. `.cta` is a semantic alias for `.btn-lg` -->
<a href="/signup" class="cta cta-primary">Sign Up</a>
<a href="/login" class="cta cta-secondary">Log In</a>

<!-- Disabled (any button) -->
<button class="btn btn-primary" disabled>Processing...</button>
```

### Forms

A `.field` holds a label, its control and an optional hint or error, with 8px between them. Labels have no margin of their own; always put a label and its control in a `.field`. Space a column of fields with `space-md`.

```html
<form class="card-static space-md">
  <div class="field">
    <label for="name">Your Name</label>
    <input type="text" id="name" placeholder="Enter your name">
  </div>
  <div class="field">
    <label for="email">Email</label>
    <input type="email" id="email" aria-invalid="true" aria-describedby="email-error">
    <p class="field-error" id="email-error">Enter an email address with a domain, like you@example.com.</p>
  </div>
  <div class="field">
    <label for="pass">Password</label>
    <input type="password" id="pass" aria-describedby="pass-hint">
    <p class="field-hint" id="pass-hint">At least 8 characters.</p>
  </div>
  <button class="btn btn-primary btn-block">Submit</button>
</form>
```

`.field-hint` is muted small text; `.field-error` is small red text. Connect either to the control with `aria-describedby`. `aria-invalid="true"` on an input, select or textarea gives it a red border, and a red shadow on focus.

All controls share one height. Text inputs, selects and the number input are exactly `--p-control-height` (44px) tall; buttons have it as a minimum and grow when a label wraps. A textarea starts at the control height. A field and a button beside it line up by construction.

A `<select>` is styled like the text inputs, with a drawn chevron:

```html
<div class="field">
  <label for="direction">Direction</label>
  <select id="direction"><option>Anticlockwise</option><option>Clockwise</option></select>
</div>
```

A `.control-row` puts inputs, fields and buttons on one line, aligned to the bottom, 8px apart. Inputs, selects, textareas, `.input-action`s and fields grow and share the width, starting from `--control-row-min` (12rem); buttons keep their natural width, may wrap their label, and the row wraps when it is narrow.

The row aligns its items to the bottom of each `.field`, so a field in a row holds only its label and control. Put the row's hint or error below the row, not inside the `.field`, or the button no longer lines up with the control. Space them with `space-sm` on a wrapper.

```html
<div class="control-row">
  <input type="text" placeholder="Label" aria-label="Label">
  <button class="btn btn-primary">Create</button>
</div>

<div class="control-row">
  <div class="field">
    <label for="driver">Driver</label>
    <input type="text" id="driver">
  </div>
  <div class="field">
    <label for="car">Car</label>
    <select id="car"><option>Red</option><option>Blue</option></select>
  </div>
  <button class="btn btn-primary">Add Driver</button>
</div>

<div class="space-sm">
  <div class="control-row">
    <div class="field">
      <label for="code">Transponder</label>
      <input type="text" id="code" aria-invalid="true" aria-describedby="code-error">
    </div>
    <button class="btn btn-primary">Assign</button>
  </div>
  <p class="field-error" id="code-error">That transponder is already assigned.</p>
</div>
```

Form grids and column layouts are not part of palace: build them with `gap-*` and `space-*`.

A field with a button inside, at its right end (show/hide a password, paste, copy). The input reserves the button's width plus its 8px inset from the edge (`--input-action-width` is the button's width, default `4.75rem`); the button is centred in the input's box and lifts with the input on focus, so they stay aligned. The button is the small control height. Use `.btn-sm`, a real `<button type="button">`, and for a toggle let the visible text and the accessible name change together ("Show" / `aria-label="Show password"` and "Hide" / "Hide password"). Pick one way to say the state: a changing name, or a fixed name with `aria-pressed` — never both.

```html
<div class="field">
  <label for="pw">Password</label>
  <div class="input-action">
    <input type="password" id="pw" autocomplete="off">
    <button type="button" class="btn btn-sm btn-outline" aria-label="Show password">Show</button>
  </div>
</div>
```

### Status Messages

```html
<!-- Success — use role="status" for polite announcements -->
<div class="status status-success" role="status">Account created successfully</div>

<!-- Error — use role="alert" for urgent announcements -->
<div class="status status-error" role="alert">Something went wrong</div>

<!-- Warning — use role="alert" for urgent announcements -->
<div class="status status-warning" role="alert">Your session will expire soon</div>

<!-- Info — use role="status" for polite announcements -->
<div class="status status-info" role="status">New features are available</div>

<!-- Neutral (base, no color variant) -->
<div class="status">Neutral message</div>
```

Use `role="alert"` for error and warning messages (assertive — interrupts the user). Use `role="status"` for success and info messages (polite — announced at the next opportunity). Omit the role for neutral/static messages that don't need to be announced.

Status boxes carry palace's hard shadow (`--p-shadow-lg` in `--p-text`); leave room for it (4px right and below) inside containers that clip.

Show/hide with JavaScript:
```js
function showStatus(el, msg, type) {
  el.textContent = msg;
  el.className = 'status status-' + type; // 'success', 'error', 'warning', 'info'
  el.style.display = 'block';
}
```

### Tables

```html
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Value</th>
      <th>Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Compression</td>
      <td style="font-weight: 600;">12 clicks</td>
      <td>Mar 1, 2026</td>
    </tr>
  </tbody>
</table>
```

### Code Blocks

Standard code block:
```html
<pre>const config = {
  server: "https://example.com"
};</pre>
```

Dark reveal panel (for secrets, API keys, terminal output). It puts 8px between its children:
```html
<div class="code-reveal">
  <p class="eyebrow" style="color: var(--p-accent-3);">
    Copy this — you won't see it again
  </p>
  <code>sk_live_abc123def456</code>
  <div class="gap-sm" style="display: flex;">
    <button class="btn-secondary">Copy</button>
  </div>
</div>
```

### Tags & Badges

```html
<!-- Tag (bordered, light background) -->
<span class="tag">Volume Spacer</span>

<!-- Badge (dark background, white text) -->
<span class="badge">clicks</span>
```

### Steps (Numbered Instructions)

```html
<div class="steps">
  <div class="step">
    <span class="step-num">1</span>
    <p><strong>Create an account</strong> with a passkey</p>
  </div>
  <div class="step">
    <span class="step-num">2</span>
    <p><strong>Get an API key</strong> and paste the config</p>
  </div>
  <div class="step">
    <span class="step-num">3</span>
    <p><strong>Go.</strong> Start using the tools</p>
  </div>
</div>
```

### Space and Gap

`space-*` puts the same vertical space between the direct children of a container. Apply it to the parent.

```html
<div class="space-md">
  <p>First item</p>
  <p>16px above</p>
  <p>16px above</p>
</div>
```

`gap-*` sets the gap of a flex or grid container, for rows and grids.

```html
<div class="gap-sm" style="display: flex; flex-wrap: wrap;">
  <span class="tag">One</span>
  <span class="tag">Two</span>
</div>
```

Available: `xs` (4px) · `sm` (8px) · `md` (16px) · `lg` (24px) · `xl` (32px) · `2xl` (48px), as `space-md`, `gap-md` and so on.

`.stack-*` is a deprecated alias of `space-*` and will be removed in a later release.

### Dividers

```html
<!-- Standard dashed divider -->
<hr class="divider">

<!-- Danger divider (above danger zones) -->
<hr class="divider-danger">
```

### Danger Zone

```html
<hr class="divider-danger">
<div class="danger-zone space-sm">
  <h2>Danger Zone</h2>
  <p>This will permanently delete your account. This cannot be undone.</p>
  <button class="btn btn-danger btn-block">Delete My Account</button>
</div>
```

### Footer

```html
<div class="container">
  <div class="footer">
    Built with care. <a href="/">Home</a>
  </div>
</div>
```

### Empty States

```html
<p class="empty">No items yet</p>
```

### Gradient Stripe

A thin (3px) animated gradient divider. Uses the 3-accent gradient with a shifting `background-position`.

```html
<hr class="gradient-stripe">
```

Use between header and content, or between major sections as a vibrant alternative to `.divider`.

### Stat Callout

Oversized number with a small label below. Picks up the card's `--accent` color automatically.

```html
<div>
  <div class="stat">180mm</div>
  <div class="stat-label">Travel</div>
</div>
```

Group multiple stats in a flex row with `.stat-row`:

```html
<div class="stat-row">
  <div>
    <div class="stat">180mm</div>
    <div class="stat-label">Travel</div>
  </div>
  <div>
    <div class="stat">20%</div>
    <div class="stat-label">Sag</div>
  </div>
</div>
```

### Sticker Tags

Filled accent-colored tags with slight rotation for a sticker-board feel. Use instead of `.tag` when you want more visual pop.

```html
<span class="tag-sticker">Volume Spacer</span>
<span class="tag-sticker">Custom Tune</span>
<span class="tag-sticker">Bleed Kit</span>
```

Rotation alternates automatically via `nth-child`. Tags pick up `--accent` from their parent card.

### Entrance Animation

Fade-up entrance for staggered card lists. Apply `.fade-up` and set `animation-delay` per element.

```html
<div class="card fade-up" style="animation-delay: 0s">...</div>
<div class="card fade-up" style="animation-delay: 0.1s">...</div>
<div class="card fade-up" style="animation-delay: 0.2s">...</div>
```

Uses `animation-fill-mode: both` so elements stay hidden until their delay fires.

### Watermark Background

Fixed-position SVG watermarks for visual texture. Non-interactive (`pointer-events: none`), very low opacity.

```html
<div class="watermarks">
  <svg style="top: 10%; left: -5%;"><!-- SVG content --></svg>
  <svg style="top: 50%; right: -5%;"><!-- SVG content --></svg>
</div>
```

### Lists

Lists inside `.container` or `.container-narrow` are automatically styled with proper padding and markers:

```html
<div class="container">
  <ul>
    <li>Unordered list item</li>
    <li>Another item</li>
  </ul>
  <ol>
    <li>Ordered list item</li>
    <li>Another item</li>
  </ol>
</div>
```

### Dialog

A native `<dialog>` styled as a card: border, purple offset shadow, overlay backdrop. It spaces its own children — its direct children, or children of a direct `<form>` (`<form method="dialog">`): 4px below the heading, 8px after a paragraph, 24px after the subtitle and before the actions. Actions go in a `<menu>`, one `<li>` per button; the buttons share the width equally. A modal dialog stays centred in any container.

```html
<dialog>
  <form method="dialog">
    <h2>Title</h2>
    <p class="subtitle">Supporting line</p>
    <p>Body text.</p>
    <menu>
      <li><button class="btn" value="cancel">Cancel</button></li>
      <li><button class="btn btn-primary" value="confirm">Confirm</button></li>
    </menu>
  </form>
</dialog>

<!-- Without a form, the same rhythm on its direct children -->
<dialog>
  <h2>Title</h2>
  <p class="subtitle">Supporting line</p>
  <p>Body text.</p>
  <menu>
    <li><button class="btn">Cancel</button></li>
    <li><button class="btn btn-primary">Confirm</button></li>
  </menu>
</dialog>
```

### Kbd

Inline keyboard key: bordered, uppercase mono, with a pink `--p-shadow-xs` shadow.

```html
<kbd>Ctrl</kbd> + <kbd>Z</kbd>
```

### Visually Hidden

`.visually-hidden` keeps text for screen readers and draws nothing: a label for an icon-only column, the name of the row an "Edit" button acts on.

```html
<button class="btn btn-sm btn-outline">Edit<span class="visually-hidden"> Ada</span></button>
```

It is absolutely positioned where the text would have been, with no `top` or `left`, so it stays where the text is and a screen reader moving to it does not jump the page. That means it still counts toward the width of its containing block. **A scrolling container (`overflow-x: auto`) holding `.visually-hidden` text needs `position: relative`**; without it the hidden text's containing block is the page, and a wide table makes the whole page scroll sideways on a phone.

```html
<div style="overflow-x: auto; position: relative;">
  <table>…<th><span class="visually-hidden">Actions</span></th>…</table>
</div>
```

## Accessibility

### Focus Visible

All interactive elements (buttons, links, inputs, checkboxes, radio buttons, `<summary>`) have `:focus-visible` styles with a `2px` outline in accent-2 (purple) and `2px` offset. Buttons also get a lift + shadow on focus. Text inputs show focus with a purple border and shadow instead; an input with `aria-invalid="true"` shows a red border and shadow. The navbar menu's summary keeps its own cyan ring.

### Reduced Motion

The system respects `prefers-reduced-motion: reduce`. When enabled, all animations and transitions are effectively disabled (duration set to `0.01ms`).

### Contrast

- Third-card headings (cyan rotation) use dark text (`--p-text`) instead of cyan for accessible contrast on white
- `--p-text-faint` is `#6b6b6b` (4.5:1 contrast ratio on `#f0f0f0`)

## Icon Style

When creating SVG icons for palace-ui projects:

- Use **stroke-based** icons (not filled)
- `stroke-linecap: square` and `stroke-linejoin: miter` (matches the hard-edge aesthetic)
- `stroke-width: 2` (matches `--p-border-width`)
- Color with `currentColor` so icons inherit text color

## Layout Patterns

### Auth Pages (Login, Register)

Use `container-narrow page-header` (420px). No navbar. Centered with top padding.

```html
<body>
  <div class="container-narrow page-header space-lg">
    <div class="space-sm">
      <p class="brand">App Name</p>
      <h1>Page Title</h1>
      <p class="subtitle">Helpful subtitle</p>
    </div>
    <form class="card-static space-md">
      <!-- fields -->
    </form>
    <p style="text-align: center; font-size: 13px; color: var(--p-text-muted);">
      Already in? <a href="/login">Log in</a>
    </p>
  </div>
</body>
```

### Dashboard Pages

Navbar + container with `page-header`. Use `divider` between major sections.

```html
<body>
  <nav class="navbar">...</nav>
  <div class="container page-header space-xl">
    <div class="space-sm">
      <h1>Dashboard</h1>
      <p class="subtitle">Manage your stuff</p>
    </div>
    <!-- content sections -->
    <hr class="divider">
    <!-- more sections -->
    <hr class="divider-danger">
    <div class="danger-zone">...</div>
  </div>
</body>
```

### Landing/Public Pages

Full container, no navbar. Hero section, then card list, then footer.

```html
<body>
  <div class="container" style="padding-top: 80px; padding-bottom: 48px;">
    <!-- hero -->
  </div>
  <div class="container" style="padding-bottom: 20px;">
    <!-- card list -->
  </div>
  <div class="container">
    <div class="footer">...</div>
  </div>
</body>
```

## Interaction Rules

1. **Hover = lift + shadow.** Elements move `translate(-1px, -1px)` or `translate(-2px, -2px)` and cast a hard shadow in the opposite direction. Shadow color matches the element's accent.
2. **Focus = border-color + shadow.** Input focus changes border to accent-2 (purple) and adds the `--p-shadow-md` shadow. Number inputs focus to accent-1 (pink).
3. **Disabled = flat gray.** `#ddd` background, `#999` text, `#ccc` border. No transform, no shadow, `cursor: not-allowed`.
4. **Transitions are 0.1s.** Never slower. The UI should feel mechanical and responsive.
5. **Links underline with border-bottom**, not `text-decoration`. Hover swaps from accent-2 (purple) to accent-1 (pink).
6. **`@keyframes` ≠ transitions.** The 0.1s rule applies to hover/focus transitions. Entrance animations (`@keyframes`) and infinite loops (gradient-shift) use their own appropriate durations.
7. **Gradient stripes** are decorative (≤3px). They use the 3-accent gradient with animated `background-position`. This is not a "gradient surface."

## Color Usage Rules

- **accent-1 (pink):** Primary buttons, first card in a list, CTA buttons, link hover color
- **accent-2 (purple):** Secondary buttons, links, input focus borders, second card
- **accent-3 (cyan):** Navbar user name, code highlights, key reveal borders, third card
- **Never mix** accent colors in a single element (except the gradient on h1 text)
- **The 3-color rotation** applies to any list of sibling cards: 1=pink, 2=purple, 3=cyan, 4=pink...
- **Error is always `#ff4444`**, success is always `#00ff88`, warning is `#ffcc00`, info is `#00e5ff`. Status colors are not accent colors. Text on a status color is always dark `--p-text`; red text uses `--p-error-text`, never `#ff4444`.

## Do's and Don'ts

### Do
- Use uppercase for headings, labels, buttons and badges; status messages are sentences in sentence case
- Use the 3-color card rotation for any list of cards
- Keep `border-radius: 0` everywhere
- Use `2px solid` borders on cards, buttons, inputs
- Use hard shadows (a `--p-shadow-*` size and a colour) — never blurred shadows
- Use `font-weight: 700` for headings and buttons
- Use `letter-spacing` on all uppercase text (0.5px to 2px)
- Keep containers at 640px max width
- Use dashed borders for dividers (`2px dashed #ccc`)

### Don't
- Add border-radius to anything
- Use `box-shadow` with blur (the third value must always be `0`)
- Use gradients on large surfaces or card backgrounds (allowed on: text, decorative stripes ≤3px, narrow fixed bars)
- Use colors outside the token system
- Use `text-decoration: underline` for links (use `border-bottom` instead)
- Use hover/focus transitions slower than `0.1s` (keyframe animations are exempt)
- Put body text in uppercase (only headings, labels, buttons)
- Use more than 640px for content width
- Create soft/subtle hover effects — make them obvious

## Responsive Breakpoint

Single breakpoint at `480px`:

```css
@media (max-width: 480px) {
  /* h1 shrinks, container gets tighter padding, cards lose some padding */
}
```

Palace CSS handles h1, container, and card adjustments automatically. For page-specific adjustments:

```css
@media (max-width: 480px) {
  .hero { padding: 48px 16px 32px; }
  .cta-row { flex-direction: column; }
}
```

## Migrating to 0.14

0.14 moves spacing from components to containers. Check every page:

- Rename `stack-*` to `space-*`. `.stack-*` is deprecated: it still works for now, as an alias of `space-*`, and will be removed in a later major version.
- `.card` and `.card-static` have no margin. Wrap a list of cards in `space-md`, or `gap-md` in a flex or grid container.
- Labels have no margin. Put each label and its control in a `.field`.
- `.page-header`, `.stat-row`, `.code-reveal` and dialog parts set no outer margin. Give the space after them from the parent with `space-*` or `gap-*`.
- A dialog, `.page-header` and `.code-reveal` now space only their own children (a dialog: its direct children, or those of a direct `<form>`), with `:where()` rules, so a `space-*` on them wins. Content nested deeper gets no space from them: give its wrapper a `space-*`.
- Inputs, selects and the number input are exactly 44px tall. Buttons are at least 44px (32px `.btn-sm`, 52px `.btn-lg` and `.cta`) and grow when a label wraps. Check rows of fields and buttons against them; a `.control-row` lines them up.
- In a `.control-row`, put a field's hint or error below the row, not inside the `.field`.
- Replace a margin that spaced siblings with `space-*` or `gap-*` on their parent.
