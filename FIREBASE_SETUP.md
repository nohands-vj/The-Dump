# Firebase Setup Instructions

This project now uses Firebase Storage and Firestore to store your dump objects, providing unlimited storage capacity instead of being limited by browser localStorage (5-10MB).

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
      // Allow anyone to read and write dump objects
      // WARNING: This is open access - fine for a personal project
      // For production, add authentication
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

## Step 3: Enable Firebase Storage

1. In your Firebase project, go to **Build** → **Storage**
2. Click "Get started"
3. Choose **Start in production mode**
4. Use the same location as your Firestore database
5. Click "Done"

### Configure Storage Security Rules

1. Go to the **Rules** tab in Storage
2. Replace the default rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /dump-objects/{allPaths=**} {
      // Allow anyone to read and write dump object images
      // WARNING: This is open access - fine for a personal project
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

## Step 4: Get Your Firebase Configuration

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

## Step 5: Create Environment Variables File

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

## Step 6: Add Environment Variables to GitHub

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

## Step 7: Update GitHub Actions Workflow

Your `.github/workflows/nextjs.yml` file needs to be updated to use these secrets during build.

I'll update this file for you in the next step.

## Step 8: Test Locally

1. Make sure your `.env.local` file has all the correct Firebase values
2. Clear your browser's localStorage to remove old data:
   - Open browser console (F12)
   - Type: `localStorage.clear()`
   - Press Enter
3. Restart your development server:
   ```bash
   pnpm dev
   ```
4. Upload a test image - it should now upload to Firebase Storage!
5. Refresh the page - your objects should load from Firestore!

## Step 9: Deploy to GitHub Pages

After setting up the GitHub Secrets (Step 6) and updating the workflow (Step 7):

1. Commit all changes
2. Push to your branch
3. Create a pull request
4. Merge to main
5. GitHub Actions will automatically build and deploy with Firebase configured

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

### "Failed to add objects. Please check your Firebase configuration."

- Check that all environment variables in `.env.local` are correct
- Make sure there are no quotes around the values in `.env.local`
- Verify Firestore and Storage are enabled in Firebase Console
- Check that security rules allow write access

### Objects not loading after refresh

- Check browser console for Firebase errors
- Verify Firestore has the `dumpObjects` collection with documents
- Check that security rules allow read access

### Images not displaying

- Check that Firebase Storage has the `dump-objects` folder with images
- Verify the imageUrl in Firestore points to a valid Firebase Storage URL
- Check CORS settings (Firebase Storage has CORS enabled by default for your domain)

## Benefits of Firebase Storage

✅ **Unlimited capacity** - No more QuotaExceededError!
✅ **Persistent across devices** - Access your dump from anywhere
✅ **Faster page loads** - Images are served from CDN
✅ **Automatic compression** - Images are optimized before upload
✅ **Scalable** - Support hundreds or thousands of objects

## Cost

Firebase free tier includes:
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Storage**: 5GB storage, 1GB/day downloads

For a personal dump collection site, you'll likely **stay within the free tier**.

If you exceed these limits, Firebase will email you. You can then upgrade to pay-as-you-go, which is very affordable for small projects.
