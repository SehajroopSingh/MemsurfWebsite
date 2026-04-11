// Video configuration
// Simply update the VIDEO_FILENAME below when you change the video file in /public/videos/
// The component will automatically use whatever video file you specify here.

// Current video file (just the filename, not the full path)
// Update this when you swap out videos in the /public/videos/ folder
export const VIDEO_FILENAME = 'veo3.1_with_reference_images.mp4'

// Full video path (automatically constructed)
export const VIDEO_PATH = `/videos/${VIDEO_FILENAME}`

// Placeholder image (first frame of the video)
// This should be extracted from the video and saved as a static image
export const VIDEO_PLACEHOLDER = `/videos/${VIDEO_FILENAME.replace('.mp4', '_placeholder.png')}`

// Still behind the hero phone video (object-fit contain + shader mix). Must match the hero campaign:
// when you change VIDEO_FILENAME, point this at the matching *-poster.jpg in /public/videos/ so the
// static layer and video look related (the video layer still dominates unless you lower SCREEN_VIDEO_OVER_BG in PhoneHeroMockup).
export const HERO_PHONE_SCREEN_BG = '/videos/veo3.1-with-reference-images-poster.jpg'

