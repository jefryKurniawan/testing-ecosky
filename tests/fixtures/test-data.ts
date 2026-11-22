export const TEST_DATA = {
  validEmail: 'test@example.com',
  validName: 'Test User',
  validMessage: 'This is a test message from automated e2e test.',
  invalidEmail: 'not-an-email',
  emptyString: '',
  longMessage: 'A'.repeat(5000),
} as const;

export const TEST_SELECTORS = {
  // Common patterns
  anyButton: 'button, [role="button"], input[type="submit"], input[type="button"]',
  anyInput: 'input, textarea, select',
  anyLink: 'a[href]',
  anyForm: 'form',
  anyHeading: 'h1, h2, h3, h4, h5, h6',
  anyImage: 'img',
} as const;