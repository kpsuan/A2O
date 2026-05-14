# Scheduler Redesign — Justification
## Kismet Suan

A review of the original Precision Garage Door scheduler against the redesigned
flow, with a summary of UX/CRO issues found, design changes made, implementation
notes, and assumptions / limitations.

## Summary

The original scheduler asked users to make three decisions (service, location, and time) across only two pages, with no visible progress indicator and a small "Only takes 3 minutes!" tagline as the only orientation cue. The zip-code input was buried in the footer of Step 1 with no validation, no explanation of why a zip was needed, and no recovery path for unserviceable areas. The date-and-time step then dumped every day and every slot into one large grid: and there was no scarcity, urgency, or trust signal anywhere in the flow.

The redesign addresses these issues directly. I rebuilt it around one idea: one decision per screen. Service, then location, then time, each step earns its own page, and a stepper plus progress bar means you always know where you are and how much is left.

The zip step grew up. It's a full screen with real-time validation — idle, checking, success, error, all visible. If your area isn't served, you get a graceful "try a different zip" instead of a dead end, and a phone CTA sits there the whole time for anyone who'd rather just call.

The date-time step finally pulls its weight. The calendar is wired up: tap a day, the slots panel scrolls to it. Sunrise/sun/sunset icons on every pill let you scan morning vs. afternoon without parsing AM/PM. And we surface scarcity in two places — a small amber number on calendar days showing how many slots remain, and a cream "Only X spots left" pill on the day header — so urgency is a feature, not a guess.

Trust signals (4.9★, 12,000+ homeowners, licensed, insured, warrantied, background-checked) live in the header band so they're with you at every step, not just on the landing page where commitment hasn't been asked for yet. The whole thing works in light and dark mode, scales to phone, and the calendar pins itself to the top of its container on mobile so you never lose the month header to a scroll bug.

---

## 1. UX / CRO issues identified in the original

| # | Issue | Why it hurts conversion |
|---|---|---|
| 1 | **No step progress** — three jobs (service, zip, time) crammed onto two pages with only an "Only takes 3 minutes!" tagline | Users can't see how far along they are; abandonment rises when "how much more?" is unclear |
| 2 | **Zip code input is buried in the footer of Step 1**, sharing the bar with `Next` | Easy to miss; no explanation for *why* zip is required; no error or success states visible |
| 3 | **Step 2 shows every day × every slot in one giant grid** | High cognitive load, no scarcity signal, no time-of-day affordance — all 8 AM–10 AM pills look identical to 2 PM–4 PM pills |
| 4 | **No trust signals inside the booking flow** (rating, warranty, license, background checks) | Misses a chance to reduce friction at the exact moment commitment is being asked for |
| 5 | **No phone fallback inside the modal** | Users who hit a snag (out-of-area zip, unfamiliar with online booking) bounce out instead of converting via phone |
| 6 | **No clear error state** for an unserviceable zip | The site presumably 404s or redirects; no graceful "we don't cover that area, try a different zip" recovery |
| 7 | **No urgency / scarcity** anywhere in the flow | Free CRO lever left on the table for a high-trust, low-frequency service |
| 8 | **Theme is fixed** (light only) and contrast is moderate | A subset of users prefer dark, and the bright body section after a dark header creates a visual jolt |

---

## 2. Design changes made

### Information architecture
- Split into **three explicit steps**: *Service → Location → Date/Time*, surfaced via a circular stepper (dark mode) and a progress bar (light mode). Each step does one thing.
- Service selection is now **toggle**-able (click the selected card again to deselect) instead of locked-in.

### Service cards (Step 1)
- Full-bleed image with title overlay, drop-shadow, and a **prominent check badge in the top-right** on selection 
- Unselected cards dim to 30% opacity + grayscale **only after another card is selected** — preserving discoverability on first view.
- **Card photography replaced** — the original site's service images were low-resolution and inconsistently lit. Swapped for higher-resolution, on-brand photography with consistent framing, lighting, and aspect ratio
- Added a **trust-badge row** beneath the cards: *Licensed & insured · 5-year warranty · No charge to book · Background-checked techs*.

### Location (Step 2 — new dedicated step)
- Single, large zip input with **inline validation states** (idle → checking spinner → green check or red ✕).
- Mocked **"unserviceable area" recovery** (zip `00000` triggers the error path) instead of silently failing.
- Persistent phone fallback CTA: *"Prefer to speak with someone? Call …"*.

### Date / Time (Step 3)
- Calendar is now **functional**: selecting a date auto-scrolls the slots panel to that day.
- **Period icons** on each time pill (`Sunrise` / `Sun` / `Sunset`) so the user reads "morning vs afternoon" without parsing AM/PM.
- **Scarcity pill** ("Only 2 spots left") in the cream brand colour on low-availability days.
- **Amber numbered badge** on calendar cells showing how many slots remain — only on **future, in-month** dates.

### Confirmation modal
- Branded receipt screen modeled after airline / hotel itineraries — header band, hero card with watermark, **Booking ID** pill, *Contact Support* button, structured detail card with date / technician / 2-hour window, and a Service Summary panel.

### Landing page
- Hero photograph of a real technician at work, dark-green gradient overlay for legibility, brand logo + neighborly tagline, and twin CTAs (*Schedule an appointment* in `#E7D2AD` cream, *Call (877) 301-7474* as outline).
- The cream `#E7D2AD` is now the primary-button colour in dark mode app-wide — pulled from the original's selected-card highlight to keep brand continuity.

### Cross-cutting
- Trust signals (4.9 ★, 12 000+ homeowners) live in the modal header so they appear at every step.
- Primary buttons have explicit **loading / success / error** visual states so async actions feel responsive.
- Full light/dark theme parity with a toggle in the corner.
- Mobile-first layout: modal goes full-screen on small viewports; Step 3 stacks calendar above slots and anchors `justify-start` so the month header isn't clipped.

---

## 3. Implementation notes

- **Stack**: Vue 3 + TypeScript + Vite, Tailwind v4, `motion-v` for animation.
- **Calendar primitives**: [Reka UI](https://reka-ui.com) (Vue port of Radix UI) — headless, fully keyboard-accessible. All visual styling is custom Tailwind.
- **Date math**: `@internationalized/date` (`CalendarDate`, `getLocalTimeZone`) for TZ-correct rendering.
- **State**: local Vue refs in `AppointmentScheduler.vue`; theme provided via a `provideTheme` composable so any child can read it.
- **Button system**: a single `<Button>` component with `variant` (`primary` / `outline` / `ghost`) × `state` (`default` / `loading` / `success` / `error`) so every CTA has the same animation grammar.
- **Animations**: entrance only (no infinite loops) — avoids the "blinking" feeling. Exception: subtle motion on step transitions and a one-shot scale-in on the confirmation check.
- **Service catalogue, trust badges, slot labels** are all data-driven arrays at the top of each `<script setup>` — easy to swap from a CMS later.
- **A11y**: `role="dialog"`, `aria-modal`, `aria-labelledby` on the scheduler; `aria-invalid` on the zip input; Escape closes; focus rings preserved.

---

## 4. Assumptions & limitations

- **No backend.** Zip validation, slot availability, urgency counts, and booking submission are all mocked (`lib/availability.ts` is pseudo-random per date; the "Find" call is a `setTimeout`).
- **Booking ID is a deterministic client-side hash** of the booking payload — production would use a server-issued reservation ID.
- **Slot inventory** is fixed (2-hour windows, 0–4 per day). A real integration would come from the dispatch / FSM system.
- **"Only X spots left"** triggers when ≤ 2 mocked slots remain — the threshold and copy are demonstrative, not tuned against real data.
- **Phone numbers in the demo** (`555-123-4567`, `877-301-7474`) are placeholders 
- **Locale is hard-coded to `en-US`** — weekday/month formatting, AM/PM, dollar-style mental model.
- **No payment / deposit step** — assumes the "No charge to book" trust badge is accurate.
- **No SMS/email side-effects** — the "we'll text you a reminder" copy is aspirational; needs a notification service.
- **Theme preference isn't persisted** — refreshes back to dark default. A `localStorage` hook is a one-line change.
- **Accessibility tested via keyboard + screen reader spot-checks** but not against a full WCAG 2.2 AA audit.
