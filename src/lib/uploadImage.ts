import { supabase, isSupabaseConfigured } from './supabase-config';
import { db } from './firebase-config';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { deleteImageFromStorage } from './storage-service';

interface UploadResult {
  success: boolean;
  url?: string;
  docId?: string;
  error?: string;
}

export async function uploadImage(
  file: File,
  userId: string,
  metadata?: Record<string, any>
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file selected');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Image storage is not configured. Please try again later.');
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
      throw new Error('Failed to get public URL');
    }

    // Save to Firestore
    const uploadsRef = collection(db, 'uploads');
    const docRef = await addDoc(uploadsRef, {
      userId,
      fileName,
      imageUrl: publicUrl,
      fileType: file.type,
      fileSize: file.size,
      createdAt: new Date().toISOString(),
      ...metadata,
    });

    return {
      success: true,
      url: publicUrl,
      docId: docRef.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Image upload failed:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getUserUploads(userId: string) {
  try {
    const uploadsRef = collection(db, 'uploads');
    const q = query(uploadsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Get uploads failed:', error);
    return [];
  }
}

export async function getAllUploads() {
  try {
    const uploadsRef = collection(db, 'uploads');
    const snapshot = await getDocs(uploadsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Get all uploads failed:', error);
    return [];
  }
}

export async function deleteUploadImage(uploadId: string, fileName: string): Promise<boolean> {
  try {
    // Delete from Firestore
    const uploadRef = doc(db, 'uploads', uploadId);
    await deleteDoc(uploadRef);

    // Delete from Supabase Storage
    await deleteImageFromStorage(fileName);

    return true;
  } catch (error) {
    console.error('Delete upload failed:', error);
    return false;
  }
}
