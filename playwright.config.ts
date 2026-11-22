import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://ecosky.id',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'brave',
      use: {
        ...devices['Desktop Chrome'],
        executablePath: '/usr/bin/brave',
      },
    },
    {
      name: 'brave-mobile',
      use: {
        ...devices['Pixel 5'],
        executablePath: '/usr/bin/brave',
      },
    },
  ],
  webServer: undefined,
});