export const ENV = {
  baseURL: process.env.E2E_BASE_URL || 'https://ecosky.id',
  apiBaseURL: process.env.E2E_API_URL || 'https://api.ecosky.id',
  timeout: parseInt(process.env.E2E_TIMEOUT || '30000', 10),
  retries: parseInt(process.env.E2E_RETRIES || '2', 10),
  headless: process.env.E2E_HEADLESS !== 'false',
  slowMo: parseInt(process.env.E2E_SLOWMO || '0', 10),
} as const;

export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL || 'test@ecosky.id',
  name: process.env.E2E_TEST_NAME || 'Test User',
} as const;

export const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  laptop: { width: 1366, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const;