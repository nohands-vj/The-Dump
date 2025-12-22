# Dump Objects Images

This directory stores all the images for your dump objects.

## How It Works

When you run the site locally in development mode (`pnpm dev`):
- Upload images through the dump truck icon
- Images are saved to this folder
- Metadata is saved to Firestore

When you deploy to GitHub Pages:
- All images in this folder are deployed with the site
- Users can view the images (read-only)
- Upload functionality is disabled in production

## Important Notes

- **DO commit these images to git** - they need to be in the repo to deploy
- Images are automatically compressed to ~800px max dimension
- Images are saved as JPEG with 80% quality for smaller file sizes
- Image URLs in Firestore reference: `/The-Dump/dump-objects/{filename}`

## Workflow

1. Run `pnpm dev` locally
2. Upload images through the site UI
3. Images save here automatically
4. Commit and push to deploy
