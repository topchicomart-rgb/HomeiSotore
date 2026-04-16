# Social Media Task Platform Enhancements

## Current Status
- YouTube platform partially implemented with progress tracking
- TikTok, Instagram, Facebook, X, and Telegram need similar enhancements
- All platforms should follow consistent UI/UX patterns

## Implementation Details

### YouTube Complete Structure (Template)
```
├── Platform Card (Red theme)
├── Checkbox & Title
├── Progress Bar (when selected)
├── Step 1: Subscribe Button + Link open
├── Step 2: Username Input
├── Step 3: Proof Upload
├── Cancel Button
└── Visual feedback for completion
```

### Remaining Platforms to Enhance

#### 1. **TikTok** (Orange/Black theme)
- Color: #FF0050 (TikTok red) or #000000
- Icon: Music2 (placeholder) or TiktokIcon
- Channel URL format
- Handle validation

#### 2. **Instagram** (Purple/Pink gradient)
- Color: #E4405F (Instagram pink)
- Icon: Instagram
- Account URL pattern
- Story screenshot or profile screenshot

#### 3. **Facebook** (Blue theme)
- Color: #1f2937 (Facebook blue)
- Icon: Facebook
- Page/Profile follow requirement
- Screenshot of follow confirmation

#### 4. **X (Twitter)** (Light Blue theme)
- Color: #0ea5e9 (Sky blue)
- Icon: Mail or X icon
- @username format
- Follow confirmation screenshot

#### 5. **Telegram** (Light Blue theme)
- Color: #0088cc (Telegram blue)
- Icon: Send or MessageCircle
- Channel/User ID format
- Join screenshot proof

### Common Features for All Platforms

#### 1. **Visual State Management**
```typescript
{
  platform: 'youtube',
  username: '',
  proof: null,
  completed: false,
  verified: false
}
```

#### 2. **Progress Tracking**
- 33%: User selects platform
- 67%: User enters username
- 100%: User uploads proof

#### 3. **Validation Rules**
- Username: Non-empty, no special chars (platform-specific)
- Proof: Image file required, max 5MB
- All 3+ platforms required for submission

#### 4. **Color Scheme Template**
```typescript
const platformColors = {
  youtube: { primary: '#ef4444', light: '#fef2f2', text: '#dc2626' },
  tiktok: { primary: '#000000', light: '#0a0a0a', text: '#FF0050' },
  instagram: { primary: '#E4405F', light: '#ffe0e6', text: '#E4405F' },
  facebook: { primary: '#1f2937', light: '#f3f4f6', text: '#1f2937' },
  x: { primary: '#0ea5e9', light: '#f0f9ff', text: '#0ea5e9' },
  telegram: { primary: '#0088cc', light: '#e0f2fe', text: '#0088cc' }
};
```

### Implementation Priority
1. ✅ YouTube (Done)
2. 🔄 TikTok (Next)
3. 🔄 Instagram (Next)
4. 🔄 Facebook (Next)
5. 🔄 X (Twitter) (Next)
6. 🔄 Telegram (Next)

### Submission Flow
1. User selects 3+ platforms
2. For each platform:
   - Opens social link in new tab
   - Toggles form to show
   - User enters username
   - User uploads screenshot
3. Validates all required fields
4. Submits to Firestore with:
   - userId
   - userName
   - userEmail
   - platforms array
   - status: 'pending'
   - createdAt timestamp
5. Admin reviews and approves
6. User gets 1 month + ₹20 credit

### Key Code Patterns

#### Platform Selection Toggle
```typescript
const togglePlatformSelection = (platform: string) => {
  setSelectedPlatforms(prev =>
    prev.includes(platform) 
      ? prev.filter(p => p !== platform)
      : [...prev, platform]
  );
};
```

#### Form State Management
```typescript
const handleSocialFormChange = (platform: string, field: 'username' | 'proof', value: any) => {
  setSocialTaskForms(prev => ({
    ...prev,
    [platform]: {
      ...prev[platform],
      [field]: value,
    },
  }));
};
```

#### Validation
```typescript
for (const platform of selectedPlatforms) {
  const form = socialTaskForms[platform];
  if (!form.username.trim()) {
    setSocialTaskMessage({ type: 'error', text: `Please enter ${platform} username` });
    return;
  }
  if (!form.proof) {
    setSocialTaskMessage({ type: 'error', text: `Please upload proof for ${platform}` });
    return;
  }
}
```

## UI/UX Enhancements

### 1. **Progressive Disclosure**
- Show only selected platforms' details
- Collapse completed platforms
- Show next steps inline

### 2. **Visual Feedback**
- Animated checkmarks on completion
- Progress bars for form completion
- Color-coded status indicators

### 3. **Mobile Optimization**
- Full-width on mobile
- Touch-friendly spacing
- Large clickable areas

### 4. **Accessibility**
- Proper form labels
- ARIA attributes
- Keyboard navigation support
- Clear error messages

## Testing Checklist

- [ ] All 6 platforms render correctly
- [ ] Selection toggle works for each
- [ ] Form submission validates properly
- [ ] Progress bars update in real-time
- [ ] Color themes match each platform
- [ ] Mobile view is responsive
- [ ] Dark mode works for all platforms
- [ ] Screenshot upload works
- [ ] Form reset after submission
- [ ] Error messages are helpful

## Files to Update
- `src/app/earn/page.tsx` - Main implementation
- `src/lib/firestore-social-service.ts` - Backend service (new)
- `src/components/social-task-card.tsx` - Component (optional refactor)

## Notes
- Currently uses local Firestore submission
- Admin panel review pending
- Email notifications not yet set up
- Reward auto-crediting pending

