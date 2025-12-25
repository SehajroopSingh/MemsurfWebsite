#!/usr/bin/env node

/**
 * Script to extract the first frame from a video file
 * 
 * Usage:
 *   node scripts/extract-first-frame.js [video-path] [output-path]
 * 
 * Example:
 *   node scripts/extract-first-frame.js public/videos/veo3.1_with_reference_images.mp4 public/videos/veo3.1_with_reference_images_placeholder.png
 * 
 * Requirements:
 *   - ffmpeg must be installed
 *   - Install with: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const videoPath = process.argv[2] || 'public/videos/veo3.1_with_reference_images.mp4';
const outputPath = process.argv[3] || videoPath.replace('.mp4', '_placeholder.png');

// Check if ffmpeg is available
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ ffmpeg is not installed or not in PATH');
  console.error('\nInstall ffmpeg:');
  console.error('  macOS: brew install ffmpeg');
  console.error('  Linux: sudo apt-get install ffmpeg');
  console.error('  Windows: Download from https://ffmpeg.org/download.html');
  process.exit(1);
}

// Check if video file exists
if (!fs.existsSync(videoPath)) {
  console.error(`❌ Video file not found: ${videoPath}`);
  process.exit(1);
}

// Create output directory if it doesn't exist
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`📹 Extracting first frame from: ${videoPath}`);
console.log(`💾 Saving to: ${outputPath}`);

try {
  // Extract first frame with ffmpeg
  // -ss 0: Start at 0 seconds
  // -vframes 1: Extract only 1 frame
  // -q:v 2: High quality (lower number = higher quality, 2 is very high)
  execSync(
    `ffmpeg -i "${videoPath}" -ss 00:00:00 -vframes 1 -q:v 2 "${outputPath}"`,
    { stdio: 'inherit' }
  );
  
  console.log('✅ Successfully extracted first frame!');
  console.log(`\n📁 File saved at: ${outputPath}`);
} catch (error) {
  console.error('❌ Failed to extract first frame:', error.message);
  process.exit(1);
}

