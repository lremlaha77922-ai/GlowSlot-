import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export const storageService = {
  async uploadAvatar(
    userId: string,
    file: File
  ): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
    if (!isSupabaseConfigured() || import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      // Mock avatar preview URL
      const mockUrl = URL.createObjectURL(file);
      return { success: true, publicUrl: mockUrl };
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
