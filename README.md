# EcoSky E2E Tests

End-to-end tests untuk **[EcoSky](https://ecosky.id)** — ngubah minyak goreng bekas jadi penerbangan berkelanjutan. 🌱✈️

---

## Cerita di Balik Tech Stack (No Cap)

Ecosky.id bukan dibangun karena FOMO ikut hype. Dibangun tim kecil yang *actually* solve masalah nyata: **Indonesia produce minyak goreng bekas (UCO) masif, dan kebanyakan dibuang sembarangan atau dipakai ulang berbahaya.** Butuh platform yang bisa track setiap liter dari dapur ke mesin jet — andal, transparan, scalable.

### Laravel — The Real MVP (Backbone)
Pilih Laravel bukan karena trend, tapi karena *stay out of the way*. Eloquent bikin supply chain UCO→SAF yang kompleks jadi readable banget. Queues handle jadwal pickup async. Policies gate akses partner. Ecosystem-nya (Sanctum, Telescope, Pulse) berarti kita ship fitur, bukan ngelebih-lebihin glue code. Zero regrets, no cap.

### Alpine.js — Reaktivitas Secukupnya, Nggak Lebay
Nggak ada virtual DOM. Nggak ada build step untuk interaktivitas. Alpine stay di blade templates, taburkan reaktivitas di tempat yang butuh aja — dropdown, modal, mobile nav, animasi counter. 15kb gzipped only. Tim belajarnya sebentar. Dia hormatin server-rendered HTML bukan lawan. Simple but powerful.

### Tailwind CSS — Design System di Config, Zero Drama
Custom design tokens (hijau EcoSky `#1F7A63`, `#4F936B`, `#E9F2EF`) stay di `tailwind.config.js`. Dark mode? Satu class. Responsive? Mobile-first utilities. Nggak perlu context-switch antara HTML dan CSS. Kartu proses 5-step, floating stat cards, dropdown menu — semua dibangun tanpa nulis satu file CSS custom pun. Clean.

### Hostinger — Infra Boring Yang Work, Nggak Ribet
VPS + CyberPanel. SSL auto-renew. Backup terjadwal. PHP 8.3, Redis, MySQL 8 — semua managed. Harganya kurang dari makan siang tim. Deploy via GitHub Actions → SSH → `php artisan migrate --force`. Zero Kubernetes YAML, zero panggilan jam 3 pagi. Sleep well.

### WhatsApp Business API — Di Mana Partner Sebenarnya (Bukan Email)
Restoran dan hotel di Indonesia nggak cek email. Mereka cek WhatsApp. Konfirmasi pickup, perubahan jadwal, laporan volume — semua lewat WA templates. Meta Cloud API berarti nggak perlu gateway on-premise buat maintain. Webhook → Laravel job → partner ke-notifikasi dalam detik. Real talk.

### Google Fonts — Inter + Manrope + Montserrat, Aesthetic & Performant
Inter untuk UI density. Manrope untuk angka yang butuh personality (counter animasi). Montserrat untuk heading yang nangkep perhatian. Variable fonts, preloaded, subset Latin — ~40kb total. Performance budget terjaga. Looking good, loading fast.

### AI — Intern Yang Nggak Tidur, Tapi Kita Yang Review
Cursor untuk boilerplate. ChatGPT untuk regex, optimasi SQL, debug config Tailwind, generate test data. Copilot untuk yang mundane. Kita review setiap baris. AI nulis draft pertama; manusia bikin production. Label "AI slop"? Itu yang kita *tolak*. We use AI, we don't let AI use us.

---

## Prasyarat (Setup Dulu)

- [Bun](https://bun.sh/) v1.0+
- [Brave Browser](https://brave.com/) terinstall

## Instalasi

```bash
bun install
bun run install:playwright  # opsional, untuk browser lain
```

## Menjalankan Test (Gas)

```bash
# Semua test, headless Brave
bun test

# Headed (lihat browsernya)
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

## Arsitektur Test (Clean Architecture)

```
tests/
├── config/env.ts           # Config terpusat (ENV, VIEWPORTS, TEST_USER)
├── pages/
│   ├── BasePage.ts         # Base abstract — utilities umum
│   ├── HomePage.ts         # Page object dengan OR-selectors (resilient)
│   └── index.ts
├── fixtures/
│   ├── test-data.ts        # Konstanta, bukan magic strings
│   └── index.ts
├── home.spec.ts            # 14 test: homepage, proses 5-step, perf, structure
└── features.spec.ts        # 14 test: nav, solutions, contact, SEO, a11y, social, cross-browser
load-tests/
└── load-test.js            # k6: ramp stages, thresholds, custom metrics
```

## Config Highlights

- **playwright.config.ts** — Brave desktop + mobile (Pixel 5), 2 retries, trace on failure
- **Base URL:** `https://ecosky.id` (override via `E2E_BASE_URL`)
- **OR-selectors** — handle variasi markup tanpa test brittle
- **Page Object Model** — single responsibility, reusable, maintainable

## Coverage: 28 Test Passing ✅

| Area | Tests | Yang Dicover |
|------|-------|--------------|
| Homepage | 6 | Load, title, hero, proses 5-step, CTAs, nav |
| Structure | 4 | Semantik, meta, heading, images |
| Performance | 4 | Load time, resources, CWV, memory |
| Navigation | 3 | Dropdown: Platform, Solutions, Resources, Programs |
| Solutions | 2 | UCO Collection, SAF, Carbon Reduction |
| Contact/Form | 3 | Halaman, forms, validasi |
| SEO | 2 | Meta tags, JSON-LD |
| Accessibility | 2 | Landmarks, keyboard, contrast |
| Social | 1 | LinkedIn, Instagram, dll |
| Cross-browser | 1 | Desktop + Mobile viewports |

---

## k6 Load Test — Production Ready

```
Stages:  30s→10 VUs → 1m→50 VUs → 30s→100 VUs → 2m sustain → 30s ramp-down
Thresholds: p95 < 2s, error rate < 5%
Metrics:   Custom Rate, Trend, Counter + setup/teardown
```

> **Pro tip:** Jalankan against staging di CI. Production bakal rate-limit lu.

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

## Nulis Test Baru (Best Practices)

1. `.spec.ts` baru di `tests/`
2. Import `@playwright/test`
3. Extend `BasePage` untuk page objects
4. Ikuti pattern `home.spec.ts` / `features.spec.ts`
5. Pakai OR-selectors biar resilient

---

## Troubleshooting (Kalau Error)

**Brave nggak ketemu?** Install aja. Playwright deteksi via `channel: 'brave'`.

**Timeout?** Naikin di config atau per-test: `test.setTimeout(60000)`

**Selector flaky?** `bunx playwright codegen https://ecosky.id`

---

**EcoSky** — Dari limbah ke sayap. Dibangun pakai tech boring yang deliver. 🚀

*No AI slop here. Just code that works.*