# Firebase Setup Instructions

This project uses **Firestore only** to store dump object metadata (names, positions, lore, etc.). Images are stored in the repository itself at `/public/dump-objects/` and deployed with your site.

This approach is **completely FREE** and doesn't require Firebase Storage (which needs a paid plan).

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `the-dump` (or any name you prefer)
4. Disable Google Analytics (optional, not needed for this project)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll configure rules next)
4. Select a location (choose closest to your users)
5. Click "Enable"

### Configure Firestore Security Rules

1. Go to the **Rules** tab in Firestore
2. Replace the default rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /dumpObjects/{document=**} {
      // Allow anyone to read (view) dump objects
      allow read: if true;
      // Disable public writes - only you can write via localhost
      allow write: if false;
    }
  }
}
```

**Important:** These rules make the database **read-only** for the public. Only you can add items when running locally in development mode.

3. Click "Publish"

**Note:** You do NOT need to enable Firebase Storage. Images are stored in your repository.

## Step 3: Get Your Firebase Configuration

1. Go to **Project Settings** (gear icon in sidebar)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`) to add a web app
4. Enter app nickname: `the-dump-web`
5. **Do NOT** check "Also set up Firebase Hosting"
6. Click "Register app"
7. You'll see your Firebase configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "the-dump-xxxxx.firebaseapp.com",
  projectId: "the-dump-xxxxx",
  storageBucket: "the-dump-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Create Environment Variables File

1. In your project root (`/home/user/The-Dump/`), create a file named `.env.local`
2. Add your Firebase configuration values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Important:** Replace all the placeholder values with your actual Firebase config values from Step 4.

## Step 5: Add Environment Variables to GitHub

For your GitHub Pages deployment to work, you need to add these as GitHub Secrets:

1. Go to your GitHub repository: https://github.com/nohands-vj/The-Dump
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret" and add each of these:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

## Step 6: How to Add Dump Objects

### Adding Objects Locally (Development Mode)

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Open http://localhost:3000 in your browser

3. Click the **dump truck icon** in the top left (only visible in dev mode)

4. Upload your images - they will be:
   - Compressed and saved to `/public/dump-objects/`
   - Metadata saved to Firestore with reference to the image path

5. The images are now in your repository! To deploy them:
   ```bash
   git add public/dump-objects/
   git commit -m "Add new dump objects"
   git push
   ```

### Production (Deployed Site)

- Upload button is hidden (users can't upload)
- Users can only view and interact with existing objects
- Images load from your deployed `/The-Dump/dump-objects/` folder
- Metadata loads from Firestore (read-only)

## Step 7: Test Locally

1. Make sure your `.env.local` file has all the correct Firebase values
2. Clear your browser's localStorage to remove old data:
   - Open browser console (F12)
   - Type: `localStorage.clear()`
   - Press Enter
3. Restart your development server:
   ```bash
   pnpm dev
   ```
4. Upload a test image:
   - Click the dump truck icon
   - Select an image file
   - It will be saved to `/public/dump-objects/`
   - Metadata will be saved to Firestore

5. Check that it worked:
   - Look in `/public/dump-objects/` folder for your image
   - Refresh the page - your object should load from Firestore!

## Step 8: Deploy to GitHub Pages

After uploading your dump objects locally:

1. Add and commit the images:
   ```bash
   git add public/dump-objects/
   git commit -m "Add dump objects"
   ```

2. Push to your branch:
   ```bash
   git push
   ```

3. GitHub Actions will automatically build and deploy with Firebase configured

## Migration from localStorage

If you have existing objects in localStorage that you want to keep:

1. Before clearing localStorage, you can export them:
   ```javascript
   // In browser console:
   const existingObjects = localStorage.getItem('dumpObjects')
   console.log(existingObjects)
   // Copy this JSON
   ```

2. After Firebase is set up, you can manually upload those images again through the UI

**Or** simply start fresh - Firebase will handle all new uploads from now on.

## Troubleshooting

### "Failed to add objects. Make sure you are running in development mode."

- Make sure you're running `pnpm dev` (not `pnpm build` or production)
- The upload API route only works in development mode
- Check that port 3000 is not blocked

### Objects not loading after refresh

- Check browser console for Firebase errors
- Verify Firestore has the `dumpObjects` collection with documents
- Check that security rules allow read access
- Make sure `.env.local` has correct Firebase credentials

### Images not displaying

- Check that images exist in `/public/dump-objects/` folder
- Verify the imageUrl in Firestore points to `/The-Dump/dump-objects/{filename}`
- Make sure you've committed and pushed the images to GitHub
- Check that GitHub Pages deployment succeeded

### Upload button not showing

- Upload button only appears in development mode (`pnpm dev`)
- In production (deployed site), users cannot upload - this is intentional

## Benefits of This Approach

✅ **Completely FREE** - No Firebase Storage costs, only free Firestore
✅ **No QuotaExceededError** - No localStorage limits
✅ **Simple deployment** - Images deploy with your site
✅ **Fast loading** - Images served directly from GitHub Pages CDN
✅ **Automatic compression** - Images optimized to ~800px, 80% quality
✅ **Full control** - All data in your repository

## Cost

This setup is **completely FREE**:

**Firestore (FREE tier):**
- 1GB storage for metadata
- 50K reads/day
- 20K writes/day (only you write, users only read)

**GitHub Pages (FREE):**
- Unlimited bandwidth
- Images served from CDN
- No storage limits for public repos

For a personal dump collection site with 1000 items, you'll **easily stay within the free tier**. Firestore metadata is tiny (few KB per object), so 1GB can store hundreds of thousands of objects.
