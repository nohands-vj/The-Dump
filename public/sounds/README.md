# Spa Sounds for Relax Mode

This folder contains calming spa-like sounds that play when objects collide in relax mode.

## Required Sound Files:

You'll need to add these 5 calming spa sound files (MP3 format):

1. `spa-chime-1.mp3` - High-pitched calming chime
2. `spa-chime-2.mp3` - Mid-pitched calming chime
3. `spa-chime-3.mp3` - Low-pitched calming chime
4. `spa-bell.mp3` - Gentle bell tone
5. `spa-ting.mp3` - Soft metallic ting sound

## Where to Find Spa Sounds:

**Free Sources:**
- **Freesound.org** - Search for "spa chime", "meditation bell", "zen bell"
- **Pixabay.com** - Free spa and meditation sounds
- **ZapSplat.com** - Free sound effects (with attribution)

**Recommended Search Terms:**
- "zen bell"
- "tibetan bowl"
- "meditation chime"
- "spa bell"
- "singing bowl"
- "wind chime"

## How It Works:

- Each dump object is assigned a random spa sound when created
- Sounds play on collision based on impact velocity
- Heavier objects make louder sounds
- Volume scales with collision force (max 40%)
- Creates a calming, meditative experience as you interact with objects

## Upload Instructions:

1. Download 5 calming MP3 files
2. Rename them to match the filenames above
3. Upload to: `public/sounds/` via GitHub
4. Or place them in this directory if working locally
