# Firebase + Supabase Integration Setup

## Configuration Files

### `/src/lib/firebase-config.ts`
- Initializes Firebase with the provided configuration
- Exports: `firebaseApp`, `auth`, `database`, `db` (Firestore)

### `/src/lib/supabase-config.ts`
- Initializes Supabase client for storage only
- Exports: `supabase`

## Services

### `/src/lib/uploadImage.ts`
Main image upload service with functions:
- `uploadImage(file, userId, metadata?)` - Upload to Supabase, save to Firestore
- `getUserUploads(userId)` - Get user's uploads from Firestore
- `getAllUploads()` - Get all uploads (admin)
- `deleteUploadImage(uploadId, fileName)` - Delete from both Firestore and Supabase

### `/src/lib/storage-service.ts`
Supabase storage operations:
- `deleteImageFromStorage(fileName)` - Remove file from bucket
- `getImageUrl(fileName)` - Get public URL for image

### `/src/lib/firestore-service.ts`
Extended with:
- `deleteUpload(uploadId)` - Firestore deletion

## Hooks

### `/src/lib/useImageUpload.ts`
React hook for easy upload handling:
```typescript
const {
  isUploading,
  uploadProgress,
  error,
  successMessage,
  handleUpload,
  clearMessages,
  getUserUploads,
  getAllUploads
} = useImageUpload();
```

## Components

### `/src/components/image-upload-widget.tsx`
UI component for image uploads:
```typescript
<ImageUploadWidget
  userId={user.id}
  onSuccess={(imageUrl, docId) => {}}
  onError={(error) => {}}
  metadata={{ customField: 'value' }}
/>
```

### `/src/components/admin-uploads-list.tsx`
Admin gallery component:
```typescript
<AdminUploadsList
  onDelete={async (uploadId) => {}}
/>
```

## Data Flow

1. **Upload**
   - User selects image → Upload to Supabase storage
   - Get public URL → Save metadata to Firestore "uploads" collection
   - Return URL and document ID

2. **Fetch**
   - Query Firestore "uploads" collection
   - Display with Supabase public URLs

3. **Delete**
   - Delete from Firestore "uploads" document
   - Delete file from Supabase storage bucket "images"

## Firestore Schema

Collection: `uploads`
```json
{
  "userId": "user_id",
  "fileName": "timestamp_random_filename.png",
  "imageUrl": "https://supabase_url/storage/v1/...",
  "fileType": "image/png",
  "fileSize": 1024000,
  "createdAt": "2026-04-10T12:00:00Z",
  "userName": "User Name",
  "userEmail": "user@email.com"
}
```

## Example Page

Visit `/uploads` for complete working example with:
- Image upload widget
- Live preview
- Admin gallery with download/delete

## Error Handling

All functions use try-catch with proper error logging:
- Upload errors from Supabase
- Firestore permission errors
- Storage access issues

## Security Notes

- No sensitive data in metadata
- Supabase bucket "images" must exist
- Firestore rules should restrict to authenticated users
- Storage public URLs are read-only
