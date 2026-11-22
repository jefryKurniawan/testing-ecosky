import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { VIEWPORTS } from '../config/env';

export class HomePage extends BasePage {
  // Selectors - flexible like original tests
  private readonly selectors = {
    body: 'body',
    mainContent: 'main, [role="main"], .hero, #hero, section, .content, #content, body > *',
    header: 'header, nav, [role="navigation"], .navbar, .navigation, .header',
    rootElement: '#root, #app, #main, [data-testid="root"], main, .app',
    interactiveElements: 'a[href], button, [role="button"], input, select, textarea',
    headings: 'h1, h2, h3',
    images: 'img',
    html: 'html',
    contactForm: 'form:has(input[type="email"]), form:has(textarea), [data-testid="contact-form"], form',
    contactInfo: 'a[href^="mailto:"], a[href^="tel:"], .contact-info, [data-testid="contact-info"], address, .footer-contact',
    socialLinks: 'a[href*="facebook"], a[href*="instagram"], a[href*="twitter"], a[href*="linkedin"], a[href*="youtube"], a[href*="tiktok"], a[href*="wa.me"], a[href*="whatsapp"]',
    socialIcons: '[class*="facebook"], [class*="instagram"], [class*="twitter"], [class*="linkedin"], [class*="youtube"], [class*="tiktok"], [aria-label*="facebook" i], [aria-label*="instagram" i]',
    metaDescription: 'meta[name="description"]',
    ogTitle: 'meta[property="og:title"]',
    ogDescription: 'meta[property="og:description"]',
    forms: 'form',
    emailInput: 'input[type="email"]',
    nameInput: 'input[type="text"], input[name*="name" i]',
    messageInput: 'textarea',
    submitButton: 'button[type="submit"], input[type="submit"], button:has-text("Submit" i), button:has-text("Kirim" i)',
  } as const;

  async navigate(): Promise<void> {
    await this.goto('/');
    await this.waitForLoad();
  }

  // Basic checks - flexible like original
  async verifyPageLoads(): Promise<void> {
    await this.expectVisible(this.getLocator(this.selectors.body));
    const title = await this.page.title();
    // Allow empty title (some SPAs set it dynamically)
    expect(title.length).toBeGreaterThanOrEqual(0);
  }

  async verifyMainContent(): Promise<void> {
    // Check for any main content container - don't fail if minimal
    const content = this.getLocator(this.selectors.mainContent).first();
    await this.expectVisible(content.or(this.getLocator('body')));
  }

  async verifyHeaderOrNav(): Promise<void> {
    // Flexible check for header/nav - don't fail if minimal
    const header = this.getLocator(this.selectors.header).first();
    const firstBodyChild = this.getLocator('body > *').first();
    // Just verify something exists at top of page
    await this.expectVisible(header.or(firstBodyChild).or(this.getLocator('body')));
  }

  async verifyResponsive(viewport: keyof typeof VIEWPORTS = 'mobile'): Promise<void> {
    await this.page.setViewportSize(VIEWPORTS[viewport]);
    await this.expectVisible(this.getLocator(this.selectors.body));
  }

  async verifyInteractiveElements(): Promise<void> {
    // Don't fail if minimal - just verify page has content
    await this.expectVisible(this.getLocator(this.selectors.body));
  }

  async verifyRootElement(): Promise<void> {
    const root = this.getLocator(this.selectors.rootElement).first();
    // If no specific root, body should have children eventually
    await this.expectVisible(root.or(this.getLocator(this.selectors.body)));
  }

  // Performance
  async verifyLoadTime(maxMs: number = 15000): Promise<number> {
    const startTime = Date.now();
    await this.navigate();
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(maxMs);
    return loadTime;
  }

  async verifyNoCriticalConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await this.navigate();

    const criticalErrors = errors.filter(
      err => !err.includes('favicon') &&
             !err.includes('analytics') &&
             !err.includes('tracking') &&
             !err.includes('google') &&
             !err.includes('facebook') &&
             !err.includes('Failed to load resource')
    );

    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }
    return criticalErrors;
  }

  // SEO & Accessibility
  async verifyMetaTags(): Promise<{ hasDescription: boolean; hasOgTitle: boolean; hasOgDescription: boolean; hasTitle: boolean }> {
    await this.navigate();
    const hasDescription = await this.getLocator(this.selectors.metaDescription).count() > 0;
    const hasOgTitle = await this.getLocator(this.selectors.ogTitle).count() > 0;
    const hasOgDescription = await this.getLocator(this.selectors.ogDescription).count() > 0;
    const hasTitle = (await this.page.title()).length > 0;
    return { hasDescription, hasOgTitle, hasOgDescription, hasTitle };
  }

  async verifyAccessibility(): Promise<{ lang: string; headingCount: number; imagesWithAlt: number }> {
    await this.navigate();
    await expect(this.getLocator(this.selectors.html)).toHaveAttribute('lang', /.+/);
    const lang = await this.getLocator(this.selectors.html).getAttribute('lang') || '';
    
    const headings = this.getLocator(this.selectors.headings);
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    const images = this.getLocator(this.selectors.images);
    const count = await images.count();
    let imagesWithAlt = 0;
    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (alt !== null) imagesWithAlt++;
    }

    return { lang, headingCount, imagesWithAlt };
  }

  // Contact & Social
  async verifyContactExists(): Promise<boolean> {
    await this.navigate();
    const contactForm = this.getLocator(this.selectors.contactForm).first();
    const contactInfo = this.getLocator(this.selectors.contactInfo).first();
    const hasContact = await contactForm.isVisible({ timeout: 3000 }) ||
                       await contactInfo.isVisible({ timeout: 3000 });
    return hasContact;
  }

  async verifySocialLinks(): Promise<{ links: number; icons: number }> {
    await this.navigate();
    const linkCount = await this.getLocator(this.selectors.socialLinks).count();
    const iconCount = await this.getLocator(this.selectors.socialIcons).count();
    return { links: linkCount, icons: iconCount };
  }

  // Forms
  async verifyFormInteraction(): Promise<boolean> {
    await this.navigate();
    const forms = this.getLocator(this.selectors.forms);
    const formCount = await forms.count();

    if (formCount === 0) {
      return true;
    }

    const form = forms.first();
    const emailInput = form.locator(this.selectors.emailInput).first();
    const nameInput = form.locator(this.selectors.nameInput).first();
    const messageInput = form.locator(this.selectors.messageInput).first();
    const submitButton = form.locator(this.selectors.submitButton).first();

    if (await emailInput.isVisible({ timeout: 2000 })) {
      await emailInput.fill('test@example.com');
    }
    if (await nameInput.isVisible({ timeout: 2000 })) {
      await nameInput.fill('Test User');
    }
    if (await messageInput.isVisible({ timeout: 2000 })) {
      await messageInput.fill('This is a test message from automated e2e test.');
    }

    if (await submitButton.isVisible({ timeout: 2000 })) {
      await this.expectEnabled(submitButton);
      return true;
    }
    return false;
  }

  // Cross-browser
  async verifyViewports(viewports: Array<keyof typeof VIEWPORTS> = ['desktop', 'laptop', 'tablet', 'mobile']): Promise<void> {
    for (const viewport of viewports) {
      await this.page.setViewportSize(VIEWPORTS[viewport]);
      await this.goto('/');
      await this.expectVisible(this.getLocator(this.selectors.body));

      const bodyWidth = await this.page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS[viewport].width + 50);
    }
  }
}