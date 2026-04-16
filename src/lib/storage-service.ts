import { supabase, isSupabaseConfigured } from './supabase-config';

export async function deleteImageFromStorage(fileName: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase is not configured, skipping image deletion');
      return true; // Soft fail
    }

    const { error } = await supabase.storage.from('images').remove([fileName]);

    if (error) {
      console.error('Error deleting from storage:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete image failed:', error);
    return false;
  }
}

export async function getImageUrl(fileName: string): Promise<string | null> {
  try {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase is not configured, cannot get image URL');
      return null;
    }

    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    return data?.publicUrl || null;
  } catch (error) {
    console.error('Get image URL failed:', error);
    return null;
  }
}
