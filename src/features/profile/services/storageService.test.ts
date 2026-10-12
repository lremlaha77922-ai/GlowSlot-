import { describe, it, expect, vi } from 'vitest';
import { storageService } from '../services/storageService';

describe('storageService Profile Photo Validation & Upload', () => {
  it('accepts valid JPEG, PNG, and WEBP image files under 5MB', () => {
    const validFileJpg = new File(['fake content'], 'avatar.jpg', { type: 'image/jpeg' });
    const validFilePng = new File(['fake content'], 'avatar.png', { type: 'image/png' });
    const validFileWebp = new File(['fake content'], 'avatar.webp', { type: 'image/webp' });

    expect(storageService.validateImageFile(validFileJpg).valid).toBe(true);
    expect(storageService.validateImageFile(validFilePng).valid).toBe(true);
    expect(storageService.validateImageFile(validFileWebp).valid).toBe(true);
  });

  it('rejects unsupported file formats like PDF or GIF or TXT', () => {
    const invalidFilePdf = new File(['fake content'], 'document.pdf', { type: 'application/pdf' });
    const invalidFileTxt = new File(['fake content'], 'notes.txt', { type: 'text/plain' });

    const pdfRes = storageService.validateImageFile(invalidFilePdf);
    expect(pdfRes.valid).toBe(false);
    expect(pdfRes.error).toContain('Supported image formats are JPG, JPEG, PNG, WEBP');

    const txtRes = storageService.validateImageFile(invalidFileTxt);
    expect(txtRes.valid).toBe(false);
  });

  it('rejects files exceeding the 5 MB limit', () => {
    // 6 MB dummy file
    const oversizedBlob = new Blob([new Uint8Array(6 * 1024 * 1024)]);
    const oversizedFile = new File([oversizedBlob], 'huge.png', { type: 'image/png' });

    const res = storageService.validateImageFile(oversizedFile);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('5 MB limit');
  });

  it('uploads valid photo and returns a valid public or data URL', async () => {
    const sampleBlob = new Blob(['sample-image-bytes'], { type: 'image/jpeg' });
    const validFile = new File([sampleBlob], 'profile.jpg', { type: 'image/jpeg' });

    const uploadRes = await storageService.uploadAvatar('user-test-id-123', validFile);
    expect(uploadRes.success).toBe(true);
    expect(uploadRes.publicUrl).toBeDefined();
    expect(typeof uploadRes.publicUrl).toBe('string');
  });
});
