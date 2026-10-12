import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export const storageService = {
  // Validate file format and size (max 5MB)
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validTypes.includes(file.type.toLowerCase()) && !validExtensions.includes(fileExt)) {
      return {
        valid: false,
        error: 'Invalid format. Supported image formats are JPG, JPEG, PNG, WEBP.',
      };
    }

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE_BYTES) {
      return {
        valid: false,
        error: 'File size exceeds 5 MB limit. Please select a smaller photo.',
      };
    }

    return { valid: true };
  },

  // Helper to convert file to persistent data URL for offline/mock mode
  async fileToDataUrl(file: File): Promise<string> {
    if (typeof FileReader !== 'undefined') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    }

    // Node.js test environment fallback
    try {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = file.type || 'image/jpeg';
      return `data:${mimeType};base64,${base64}`;
    } catch {
      return `data:image/jpeg;base64,mockAvatarDataUrl-${Date.now()}`;
    }
  },

  async uploadAvatar(
    userId: string,
    file: File
  ): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (!isSupabaseConfigured() || import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      try {
        const dataUrl = await this.fileToDataUrl(file);
        return { success: true, publicUrl: dataUrl };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to read image file.' };
      }
    }

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      return {
        success: true,
        publicUrl: data.publicUrl,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to upload image.',
      };
    }
  },
};
