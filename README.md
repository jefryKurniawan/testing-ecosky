# EcoSky E2E Tests

Repository ini berisi **end-to-end (E2E) test** untuk website **[EcoSky](https://ecosky.id)** — platform yang mengubah minyak goreng bekas (UCO) menjadi bahan bakar penerbangan berkelanjutan (SAF).

---

## Apa Itu EcoSky?

EcoSky adalah platform yang menghubungkan restoran, hotel, dan industri dengan sistem energi sirkular. Minyak goreng bekas dikumpulkan, diproses, dan diubah menjadi bahan bakar penerbangan (Sustainable Aviation Fuel) yang berkarbon rendah.

**Fitur utama:**
- **UCO Collection** — Penjemputan minyak bekas dari restoran & hotel
- **Sustainable Aviation Fuel (SAF)** — Bahan bakar penerbangan ramah lingkungan
- **Carbon Reduction Platform** — Pelacakan & verifikasi dampak karbon
- **Digital Platform** — Monitoring real-time, optimasi logistik, traceability UCO

**Program:**
- EcoSky Goes To School
- School Sustainability Partnership
- Restaurant & Cafe Sustainability Partnership
- Hospitality Sustainability Partnership
- Kitchen Sustainability Partnership

---

## Tech Stack Website EcoSky (ecosky.id)

| Lapisan | Teknologi | Alasan Dipakai |
|---------|-----------|----------------|
| **Backend** | Laravel | Framework PHP yang solid, Eloquent ORM memudahkan manajemen data kompleks, ecosystem lengkap (Sanctum, Telescope, Pulse) |
| **Frontend** | Alpine.js + Tailwind CSS | Alpine.js ringan (15kb) untuk interaktivitas sederhana (dropdown, modal), Tailwind CSS untuk styling cepat via utility classes |
| **Hosting** | Hostinger VPS + CyberPanel | Murah, managed, SSL auto-renew, backup otomatis, support PHP 8.3/Redis/MySQL 8 |
| **Komunikasi** | WhatsApp Business API (Meta Cloud) | Partner (restoran/hotel) di Indonesia aktif di WhatsApp, tidak email. Notifikasi real-time via WA |
| **Font** | Google Fonts (Inter, Manrope, Montserrat) | Inter untuk UI, Manrope untuk angka/animasi, Montserrat untuk heading. Total ~40kb |
| **AI** | Cursor, ChatGPT, GitHub Copilot | Dipakai untuk boilerplate, debug, generate test data. Semua kode direview manusia sebelum production |

---

## Prasyarat

- [Bun](https://bun.sh/) versi 1.0 atau lebih baru
- [Brave Browser](https://brave.com/) sudah terinstall di komputer

## Instalasi

```bash
# Install dependencies
bun install

# Optional: install browser lain untuk Playwright
bun run install:playwright
```

## Menjalankan Test

```bash
# Jalankan semua test (headless, tidak ada UI browser)
bun test

# Jalankan dengan UI browser terlihat
bun run test:headed

# Mode UI Playwright (interaktif)
bun run test:ui

# Debug step-by-step
bun run test:debug

# Jalankan file test tertentu
bun test tests/home.spec.ts

# Jalankan test tertentu berdasarkan nama
bun test -t "should load homepage successfully"

# Hanya test desktop Brave
bun run test:brave
bun run test:brave:headed

# Load test dengan k6
k6 run load-tests/load-test.js
# Atau dengan URL custom (misal staging)
BASE_URL=https://staging.ecosky.id k6 run load-tests/load-test.js
```

## Struktur Folder Test

```
tests/
├── config/env.ts           # Konfigurasi terpusat (URL, viewport, user test)
├── pages/
│   ├── BasePage.ts         # Class dasar dengan fungsi umum
│   ├── HomePage.ts         # Page object halaman utama (selector fleksibel)
│   └── index.ts            # Export semua page object
├── fixtures/
│   ├── test-data.ts        # Data test (konstanta, bukan hardcode)
│   └── index.ts
├── home.spec.ts            # 14 test: homepage, struktur, performa, proses 5-step
└── features.spec.ts        # 14 test: navigasi, solusi, kontak, SEO, aksesibilitas, social, cross-browser
load-tests/
└── load-test.js            # k6 load test: ramp stages, thresholds, custom metrics
```

## Konfigurasi Penting

- **playwright.config.ts** — Konfigurasi Playwright: Brave desktop + mobile (Pixel 5), 2x retry jika gagal, simpan trace saat error
- **Base URL:** `https://ecosky.id` (bisa diubah via environment variable `E2E_BASE_URL`)
- **OR-selectors** — Selector fleksibel yang tahan terhadap perubahan markup HTML
- **Page Object Model** — Setiap halaman punya file sendiri, mudah dipelihara

## Coverage Test: 28 Test Lolos ✅

| Area | Jumlah Test | Yang Diuji |
|------|-------------|------------|
| Homepage | 6 | Load halaman, judul, hero section, proses 5-step, tombol CTA, navigasi |
| Struktur HTML | 4 | Semantik, meta tags, heading, gambar |
| Performa | 4 | Waktu load, resource, Core Web Vitals, memori |
| Navigasi | 3 | Dropdown: Platform, Solutions, Resources, Programs |
| Solusi | 2 | Halaman UCO Collection, SAF, Carbon Reduction |
| Kontak & Form | 3 | Halaman kontak, form, validasi |
| SEO | 2 | Meta tags, structured data (JSON-LD) |
| Aksesibilitas | 2 | Landmark, navigasi keyboard, kontras warna |
| Social Media | 1 | Link LinkedIn, Instagram, dll |
| Cross-browser | 1 | Desktop + Mobile viewport |

---

## Load Test (k6) — Siap Production

```
Tahapan beban: 30s→10 user → 1m→50 user → 30s→100 user → 2m sustain → 30s ramp-down
Batas (thresholds): p95 < 2 detik, error rate < 5%
Metrik: Custom Rate, Trend, Counter + setup/teardown
```

> **Tips:** Untuk CI/CD, jalankan load test terhadap **staging environment**, bukan production (production akan rate-limit).

---

## Contoh CI/CD (GitHub Actions)

```yaml
- uses: actions/checkout@v4
- uses: oven-sh/setup-bun@v1
- run: bun install
- run: bun test
```

Hasil report HTML ada di folder `playwright-report/` setelah test selesai.
Lihat dengan: `bunx playwright show-report`

---

## Menulis Test Baru (Best Practice)

1. Buat file `.spec.ts` baru di folder `tests/`
2. Import `@playwright/test`
3. Extend `BasePage` untuk page object baru
4. Ikuti pola yang ada di `home.spec.ts` dan `features.spec.ts`
5. Gunakan OR-selectors agar test tidak mudah patah (brittle)

---

## Troubleshooting

**Brave Browser tidak ditemukan?**
Install Brave Browser. Playwright akan otomatis mendeteksi via `channel: 'brave'`.

**Test timeout?**
Tambah timeout di `playwright.config.ts` atau per test:
```typescript
test.setTimeout(60000) // 60 detik
```

**Selector flaky / tidak stabil?**
Gunakan Playwright codegen untuk generate selector yang akurat:
```bash
bunx playwright codegen https://ecosky.id
```

---

**EcoSky** — Mengubah limbah jadi energi penerbangan. Dibangun dengan teknologi praktis yang delivers.

*Repository ini hanya berisi test otomatis. Kode website EcoSky berada di repository terpisah.*