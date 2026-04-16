'use client';

import { useRef } from 'react';
import { useImageUpload } from '@/lib/useImageUpload';
import { Button } from './ui/button';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface ImageUploadProps {
  userId: string;
  onSuccess?: (imageUrl: string, docId?: string) => void;
  onError?: (error: string) => void;
  metadata?: Record<string, any>;
  className?: string;
}

export function ImageUploadWidget({
  userId,
  onSuccess,
  onError,
  metadata,
  className = '',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isUploading, error, successMessage, handleUpload, clearMessages } = useImageUpload();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files[0]) return;

    const result = await handleUpload(files[0], userId, metadata);

    if (result.success) {
      onSuccess?.(result.url!, result.docId);
    } else {
      onError?.(result.error!);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />

      <Button
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="w-full"
        variant="outline"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Upload Image'}
      </Button>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">{successMessage}</p>
        </div>
      )}
    </div>
  );
}
