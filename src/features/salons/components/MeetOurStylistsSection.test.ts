import { describe, it, expect } from 'vitest';
import { defaultSpecialists, mockSalons } from '../../../data/mockData';
import { SpecialistItem, Salon } from '../../../types';

describe('Meet Our Stylists Feature Suite', () => {
  const sampleSalon: Salon = mockSalons[0];

  describe('1. Stylist Profile Data Structure & Specializations', () => {
    it('provides high quality professional profile fields for all default stylists', () => {
      expect(defaultSpecialists.length).toBeGreaterThanOrEqual(4);

      defaultSpecialists.forEach((stylist) => {
        expect(stylist.id).toBeTruthy();
        expect(stylist.name).toBeTruthy();
        expect(stylist.role).toBeTruthy();
        expect(stylist.rating).toBeGreaterThanOrEqual(4.5);
        expect(stylist.experienceYears).toBeGreaterThan(0);
        expect(stylist.photoUrl).toMatch(/^https?:\/\//);
        expect(stylist.earliestSlot).toBeTruthy();
        expect(Array.isArray(stylist.specialties)).toBe(true);
        expect(stylist.specialties!.length).toBeGreaterThan(0);
        expect(stylist.bio).toBeTruthy();
        expect(Array.isArray(stylist.availableDays)).toBe(true);
        expect(stylist.workingHours).toBeTruthy();
        expect(Array.isArray(stylist.availableSlotTimes)).toBe(true);
      });
    });

    it('contains certified haircut and barber specialists', () => {
      const hairSpecialist = defaultSpecialists.find((s) =>
        s.role.toLowerCase().includes('stylist')
      );
      expect(hairSpecialist).toBeDefined();
      expect(hairSpecialist?.specialties).toContain('Fade Cut');

      const beardSpecialist = defaultSpecialists.find((s) =>
        s.role.toLowerCase().includes('barber') || s.role.toLowerCase().includes('beard')
      );
      expect(beardSpecialist).toBeDefined();
      expect(beardSpecialist?.specialties).toContain('Royal Shave');
    });

    it('contains certified skin & facial expert', () => {
      const skinSpecialist = defaultSpecialists.find((s) =>
        s.role.toLowerCase().includes('skin') || s.role.toLowerCase().includes('facial')
      );
      expect(skinSpecialist).toBeDefined();
      expect(skinSpecialist?.specialties).toContain('Charcoal Facial');
    });
  });

  describe('2. Stylist Specialization Filtering Logic', () => {
    it('filters specialists by Hair category', () => {
      const hairSpecialists = defaultSpecialists.filter((s) =>
        s.role.toLowerCase().includes('hair') ||
        s.specialties?.some((spec) => spec.toLowerCase().includes('hair') || spec.toLowerCase().includes('cut'))
      );
      expect(hairSpecialists.length).toBeGreaterThan(0);
      expect(hairSpecialists.some((s) => s.name === 'Mahesh Kumar')).toBe(true);
    });

    it('filters specialists by Beard category', () => {
      const beardSpecialists = defaultSpecialists.filter((s) =>
        s.role.toLowerCase().includes('beard') ||
        s.specialties?.some((spec) => spec.toLowerCase().includes('beard') || spec.toLowerCase().includes('shave'))
      );
      expect(beardSpecialists.length).toBeGreaterThan(0);
      expect(beardSpecialists.some((s) => s.name === 'Vikram Singh')).toBe(true);
    });

    it('filters specialists by Skin & Facial category', () => {
      const skinSpecialists = defaultSpecialists.filter((s) =>
        s.role.toLowerCase().includes('facial') ||
        s.role.toLowerCase().includes('skin') ||
        s.specialties?.some((spec) => spec.toLowerCase().includes('facial') || spec.toLowerCase().includes('skin'))
      );
      expect(skinSpecialists.length).toBeGreaterThan(0);
      expect(skinSpecialists.some((s) => s.name === 'Ananya Sharma')).toBe(true);
    });
  });

  describe('3. Availability & Slot Selection Integration', () => {
    it('verifies that each stylist has open real-time slots and working days', () => {
      defaultSpecialists.forEach((stylist) => {
        expect(stylist.isAvailableToday).toBe(true);
        expect(stylist.availableSlotTimes?.length).toBeGreaterThan(0);
        expect(stylist.availableDays).toContain('Sat');
      });
    });

    it('verifies salon integration includes specialists by default', () => {
      const salonSpecialists = sampleSalon.specialists || defaultSpecialists;
      expect(salonSpecialists.length).toBeGreaterThan(0);
      expect(salonSpecialists[0].id).toBe('spec-1');
    });
  });
});
