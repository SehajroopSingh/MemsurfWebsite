# Extract First Frame from Video

## Quick Method (Browser - No Installation)

1. Open `scripts/extract-first-frame.html` in your browser
2. Select your video file
3. Click "Extract First Frame"
4. Download the image
5. Save it as `veo3.1_with_reference_images_placeholder.png` in `public/videos/`

## Command Line Method (Requires ffmpeg)

### Install ffmpeg (macOS)

```bash
brew install ffmpeg
```

### Extract First Frame

```bash
node scripts/extract-first-frame.js
```

Or manually:

```bash
ffmpeg -i public/videos/veo3.1_with_reference_images.mp4 \
  -ss 00:00:00 \
  -vframes 1 \
  -q:v 2 \
  public/videos/veo3.1_with_reference_images_placeholder.png
```

The script will automatically:
- Extract the first frame at 0 seconds
- Save it as a high-quality PNG
- Use the correct filename format

