import { describe, it, expect, beforeEach } from 'vitest';
import {
  reengagementService,
  generateReengagementMessage,
  generateWhatsAppClickToChatUrl,
  generateBookingLink,
} from './reengagementService';

describe('30-Day Customer Re-engagement Automation Suite', () => {
  beforeEach(() => {
    reengagementService._clearMemoryCacheForTesting();
  });

  describe('1. Message & Link Generation', () => {
    it('generates friendly non-spammy re-engagement message', () => {
      const msg = generateReengagementMessage('Aarav Sharma', 'Luxe Cut Studio', 'https://glowslot.app/?salonId=sal-1');
      expect(msg).toContain('Hi Aarav Sharma 👋');
      expect(msg).toContain("It's been a while since your last visit to Luxe Cut Studio.");
      expect(msg).toContain('Ready for your next beauty & grooming session?');
      expect(msg).toContain('https://glowslot.app/?salonId=sal-1');
      expect(msg).toContain('— GlowSlot');
    });

    it('generates valid WhatsApp click-to-chat URL with clean phone number', () => {
      const url = generateWhatsAppClickToChatUrl('+91 98765 43210', 'Test message');
      expect(url).toBe('https://wa.me/919876543210?text=Test%20message');
    });

    it('generates deep booking link with salon context', () => {
      const link = generateBookingLink('sal-1');
      expect(link).toContain('salonId=sal-1');
    });
  });

  describe('2. Automation Execution & Idempotency', () => {
    it('identifies completed bookings older than 30 days and creates reminder records', async () => {
      const report = await reengagementService.runReengagementJob({ isTestMode: true, daysOld: 30 });

      expect(report.totalEligible).toBeGreaterThan(0);
      expect(report.processed).toBeGreaterThan(0);
      expect(report.created).toBeGreaterThan(0);
      expect(report.records.length).toBe(report.created);

      const record = report.records[0];
      expect(record.booking_id).toBeDefined();
      expect(record.reminder_type).toBe('30_day_reengagement');
      expect(record.status).toBe('pending');
      expect(record.message_text).toContain('GlowSlot');
      expect(record.whatsapp_url).toContain('https://wa.me/');
    });

    it('STRICT IDEMPOTENCY: running the automation a second time produces 0 duplicate records', async () => {
      // Run 1: Should create initial records
      const firstRun = await reengagementService.runReengagementJob({ isTestMode: true, daysOld: 30 });
      expect(firstRun.created).toBeGreaterThan(0);

      // Run 2: Should detect duplicates and create 0 new records
      const secondRun = await reengagementService.runReengagementJob({ isTestMode: true, daysOld: 30 });
      expect(secondRun.created).toBe(0);
      expect(secondRun.skippedDuplicate).toBe(firstRun.created);
    });

    it('reflects WhatsApp provider configuration status safely', () => {
      const hasProvider = reengagementService.hasWhatsAppProvider();
      expect(typeof hasProvider).toBe('boolean');
    });
  });
});
