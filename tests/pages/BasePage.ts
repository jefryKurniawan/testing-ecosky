import { Page, Locator, expect } from '@playwright/test';
import { ENV } from '../config/env';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = ENV.baseURL;
  }

  async goto(path: string = ''): Promise<void> {
    await this.page.goto(`${this.baseURL}${path}`, {
      waitUntil: 'domcontentloaded',
      timeout: ENV.timeout,
    });
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  protected getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  protected async expectVisible(locator: Locator, timeout = ENV.timeout): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  protected async expectEnabled(locator: Locator, timeout = ENV.timeout): Promise<void> {
    await expect(locator).toBeEnabled({ timeout });
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}-${Date.now()}.png`, fullPage: true });
  }
}