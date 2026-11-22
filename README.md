# Ecosky.id E2E Tests

End-to-end tests for [ecosky.id](https://ecosky.id) using **Bun** and **Playwright** with **Brave Browser**.

## Prerequisites

- [Bun](https://bun.sh/) v1.0+
- [Brave Browser](https://brave.com/) installed on your system

## Installation

```bash
# Install dependencies
bun install

# Install Playwright browsers (optional, for other browsers)
bun run install:playwright
```

## Running Tests

```bash
# Run all tests with Brave (headless)
bun test

# Run tests with Brave browser UI visible
bun run test:headed

# Run tests with Playwright UI mode
bun run test:ui

# Debug tests step by step
bun run test:debug

# Run specific test file with Brave
bun test tests/home.spec.ts

# Run specific test
bun test -t "should load homepage successfully"

# Run only Brave desktop tests
bun run test:brave

# Run Brave desktop tests with UI visible
bun run test:brave:headed
```

## Test Structure

```
tests/
├── home.spec.ts      # Homepage and basic navigation tests
└── features.spec.ts  # Feature-specific tests (forms, SEO, accessibility, etc.)
```

## Configuration

- `playwright.config.ts` - Playwright configuration
- Tests run against `https://ecosky.id` (configured in `playwright.config.ts`)
- **Primary browser: Brave** (uses your installed Brave browser)
- Mobile viewport: Pixel 5 (with Brave)

## CI/CD

For CI environments, tests run with:
- 2 retries on failure
- Single worker
- HTML reporter for artifacts

## Writing New Tests

1. Create a new `.spec.ts` file in `tests/`
2. Use `@playwright/test` imports
3. Follow the existing patterns in `home.spec.ts` and `features.spec.ts`

## Troubleshooting

### Brave browser not found
Make sure Brave is installed and in your PATH. Playwright will auto-detect it via the `channel: 'brave'` setting.

### Tests timeout
Increase timeout in `playwright.config.ts` or individual tests:
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

### Selector issues
Use Playwright's codegen to generate selectors:
```bash
bunx playwright codegen https://ecosky.id
```

## Reports

HTML reports are generated in `playwright-report/` after test runs.
Open with: `bunx playwright show-report`