'use client';

import { useState, useCallback } from 'react';
import { uploadImage, getUserUploads, getAllUploads } from '@/lib/uploadImage';

interface UseImageUploadState {
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  successMessage: string | null;
}

export function useImageUpload() {
  const [state, setState] = useState<UseImageUploadState>({
    isUploading: false,
    uploadProgress: 0,
    error: null,
    successMessage: null,
  });

  const handleUpload = useCallback(
    async (file: File, userId: string, metadata?: Record<string, any>) => {
      setState({
        isUploading: true,
        uploadProgress: 0,
        error: null,
        successMessage: null,
      });

      try {
        const result = await uploadImage(file, userId, metadata);

        if (result.success) {
          setState({
            isUploading: false,
            uploadProgress: 100,
            error: null,
            successMessage: 'Image uploaded successfully',
          });
          return result;
        } else {
          setState({
            isUploading: false,
            uploadProgress: 0,
            error: result.error || 'Upload failed',
            successMessage: null,
          });
          return result;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({
          isUploading: false,
          uploadProgress: 0,
          error: errorMessage,
          successMessage: null,
        });
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      successMessage: null,
    }));
  }, []);

  return {
    ...state,
    handleUpload,
    clearMessages,
    getUserUploads,
    getAllUploads,
  };
}
