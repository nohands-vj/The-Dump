# Admin Access Guide

## Live Admin URLs

### Production (GitHub Pages)
**URL:** https://nohands-vj.github.io/The-Dump/admin

This is your live admin panel where you can:
- Auto-populate Firestore with dump objects
- Manage the database directly
- View image manifest

### Local Development
**URL:** http://localhost:3000/admin

For testing and development before deploying to production.

## How to Access

### 1. Production (GitHub Pages)
Simply visit: **https://nohands-vj.github.io/The-Dump/admin**

The admin page is publicly accessible and will:
- Auto-load all images from `/public/dump-objects/`
- Allow you to populate Firestore with one click
- Show detailed progress in the browser console (F12)

### 2. Local Development

```bash
# Install dependencies
pnpm install

# Create .env.local from the example
cp .env.local.example .env.local

# Add your Firebase credentials to .env.local
# (Get these from Firebase Console > Project Settings > Your Apps)

# Start the dev server
pnpm dev

# Visit http://localhost:3000/admin
```

## Firebase Setup Required

For the admin page to work, you need Firebase configured:

### GitHub Secrets (for production)
Make sure these secrets are set in your GitHub repository:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Location:** GitHub repo → Settings → Secrets and variables → Actions

### Local Development (.env.local)
Copy `.env.local.example` to `.env.local` and fill in your Firebase values.

## Troubleshooting

### "Permission denied" error
Check your Firestore security rules. For development, use:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

### "Firebase not initialized" error
- **Production:** Check that GitHub Secrets are properly set
- **Local:** Verify `.env.local` file exists and has correct values

### Admin page not loading
- Ensure you're using the correct URL with `/admin` path
- Check browser console (F12) for detailed error messages
- Verify the deployment succeeded in GitHub Actions tab

### No images showing up
- Images should be in `/public/dump-objects/` directory
- The image manifest at `/lib/image-manifest.ts` should list all filenames
- Check browser console for loading errors

## Deployment

The site auto-deploys when you push to the `main` branch:

1. Push changes to `main`
2. GitHub Actions builds and deploys automatically
3. Wait ~2-3 minutes for deployment
4. Visit https://nohands-vj.github.io/The-Dump/admin

Check deployment status: **GitHub repo → Actions tab**

## Quick Reference

| Environment | Main Site | Admin Panel |
|------------|-----------|-------------|
| **Production** | https://nohands-vj.github.io/The-Dump/ | https://nohands-vj.github.io/The-Dump/admin |
| **Local Dev** | http://localhost:3000/ | http://localhost:3000/admin |

---

**Need help?** Check the browser console (F12) for detailed error messages and Firebase connection status.
