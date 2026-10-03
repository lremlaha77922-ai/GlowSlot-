import { describe, it, expect } from 'vitest';
import i18n, { changeLanguage } from './i18n';

describe('i18n configuration and language switch', () => {
  it('loads English test key by default', () => {
    expect(i18n.t('test_key')).toBe('Welcome to GlowSlot');
  });

  it('switches to Hindi and returns Hindi test key', async () => {
    await changeLanguage('hi');
    expect(i18n.t('test_key')).toBe('ग्लोस्लॉट में आपका स्वागत है');

    // Reset back to English
    await changeLanguage('en');
    expect(i18n.t('test_key')).toBe('Welcome to GlowSlot');
  });
});
