# EcoSky E2E Tests

End-to-end tests for **[EcoSky](https://ecosky.id)** — turning used cooking oil into sustainable aviation fuel. 🌱✈️

---

## The Story Behind the Stack

Ecosky.id wasn't built by chasing hype. It was built by a small team solving a real problem: **Indonesia produces massive amounts of used cooking oil, and most of it gets dumped or reused dangerously.** We needed a platform that could track every liter from kitchen to jet engine — reliably, transparently, at scale.

### Laravel — The Backbone
We chose Laravel not because it's trendy, but because it *stays out of the way*. Eloquent makes the complex UCO→SAF supply chain readable. Queues handle async pickup scheduling. Policies gate partner access. The ecosystem (Sanctum, Telescope, Pulse) means we ship features, not glue code. Zero regrets.

### Alpine.js — Just Enough Reactivity
No virtual DOM. No build step for interactivity. Alpine lives in the blade templates, sprinkles reactivity exactly where needed — dropdowns, modals, mobile nav, counter animations. 15kb gzipped. The team learns it in an afternoon. It respects the server-rendered HTML instead of fighting it.

### Tailwind CSS — Design System in Config
Custom design tokens (EcoSky greens `#1F7A63`, `#4F936B`, `#E9F2EF`) live in `tailwind.config.js`. Dark mode? One class. Responsive? Mobile-first utilities. No context-switching between HTML and CSS files. The 5-step process cards, floating stat cards, dropdown menus — all built without writing a single custom CSS file.

### Hostinger — Boring Infrastructure That Works
VPS + CyberPanel. SSL auto-renew. Backups scheduled. PHP 8.3, Redis, MySQL 8 — all managed. Costs less than a team lunch. We deploy via GitHub Actions → SSH → `php artisan migrate --force`. Zero Kubernetes YAML, zero 3am paging.

### WhatsApp Business API — Where the Partners Actually Are
Restaurants and hotels in Indonesia don't check email. They check WhatsApp. Pickup confirmations, schedule changes, volume reports — all flow through WA templates. Meta's Cloud API means no on-premise gateway to maintain. Webhook → Laravel job → partner notified in seconds.

### Google Fonts — Inter + Manrope + Montserrat
Inter for UI density. Manrope for numbers that need personality (those animated counters). Montserrat for headers that command attention. Variable fonts, preloaded, subset for Latin — ~40kb total. Performance budget respected.

### AI — The Intern That Never Sleeps
Cursor for boilerplate. ChatGPT for regex, SQL optimization, Tailwind config debugging, test data generation. Copilot for the mundane. We review every line. AI writes the first draft; humans make it production. The "AI slop" label? That's the stuff we *rejected*.

---

## Prerequisites

- [Bun](https://bun.sh/) v1.0+
- [Brave Browser](https://brave.com/) installed

## Installation

```bash
bun install
bun run install:playwright  # optional, for other browsers
```

## Running Tests

```bash
# All tests, headless Brave
bun test

# Headed (see the browser)
bun run test:headed

# Playwright UI mode
bun run test:ui

# Debug step-by-step
bun run test:debug

# Single file / single test
bun test tests/home.spec.ts
bun test -t "should load homepage successfully"

# Brave desktop only
bun run test:brave
bun run test:brave:headed

# Load test (k6)
k6 run load-tests/load-test.js
BASE_URL=https://staging.ecosky.id k6 run load-tests/load-test.js
```

## Test Architecture

```
tests/
├── config/env.ts           # Centralized config (ENV, VIEWPORTS, TEST_USER)
├── pages/
│   ├── BasePage.ts         # Abstract base — common utilities
│   ├── HomePage.ts         # Page object with OR-selectors (resilient)
│   └── index.ts
├── fixtures/
│   ├── test-data.ts        # Constants, not magic strings
│   └── index.ts
├── home.spec.ts            # 14 tests: homepage, 5-step process, perf, structure
└── features.spec.ts        # 14 tests: nav, solutions, contact, SEO, a11y, social, cross-browser
load-tests/
└── load-test.js            # k6: ramp stages, thresholds, custom metrics
```

## Config Highlights

- **playwright.config.ts** — Brave desktop + mobile (Pixel 5), 2 retries, trace on failure
- **Base URL:** `https://ecosky.id` (override via `E2E_BASE_URL`)
- **OR-selectors** — handle markup variations without brittle tests
- **Page Object Model** — single responsibility, reusable, maintainable

## Coverage: 28 Tests Passing

| Area | Tests | What's Covered |
|------|-------|----------------|
| Homepage | 6 | Load, title, hero, 5-step process, CTAs, nav |
| Structure | 4 | Semantics, meta, headings, images |
| Performance | 4 | Load time, resources, CWV, memory |
| Navigation | 3 | Dropdowns: Platform, Solutions, Resources, Programs |
| Solutions | 2 | UCO Collection, SAF, Carbon Reduction |
| Contact/Form | 3 | Page, forms, validation |
| SEO | 2 | Meta tags, JSON-LD |
| Accessibility | 2 | Landmarks, keyboard, contrast |
| Social | 1 | LinkedIn, Instagram, etc. |
| Cross-browser | 1 | Desktop + Mobile viewports |

---

## k6 Load Test — Production Ready

```
Stages:  30s→10 VUs → 1m→50 VUs → 30s→100 VUs → 2m sustain → 30s ramp-down
Thresholds: p95 < 2s, error rate < 5%
Metrics:   Custom Rate, Trend, Counter + setup/teardown
```

> **Pro tip:** Run against staging in CI. Production will rate-limit you.

---

## CI/CD Example

```yaml
- uses: actions/checkout@v4
- uses: oven-sh/setup-bun@v1
- run: bun install
- run: bun test
```

HTML reports → `playwright-report/` → `bunx playwright show-report`

---

## Writing New Tests

1. New `.spec.ts` in `tests/`
2. Import `@playwright/test`
3. Extend `BasePage` for page objects
4. Follow `home.spec.ts` / `features.spec.ts` patterns
5. Use OR-selectors for resilience

---

## Troubleshooting

**Brave not found?** Install it. Playwright detects via `channel: 'brave'`.

**Timeout?** Bump in config or per-test: `test.setTimeout(60000)`

**Selector flaky?** `bunx playwright codegen https://ecosky.id`

---

**EcoSky** — Waste to wing. Built with boring tech that ships. 🚀