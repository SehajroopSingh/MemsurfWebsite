const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const logosDir = path.join(__dirname, '../public/logos');

// Ensure logos directory exists
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

// Logo sources - using direct URLs provided by user and Simple Icons for others
const institutions = [
  { key: 'ucla', url: 'https://brand.ucla.edu/images/logos-and-marks/campus-logo.jpg', name: 'UCLA' },
  { key: 'uc-berkeley', url: 'https://brand.berkeley.edu/wp-content/uploads/2024/08/logo-variations-thumbnail-blue-white.png', name: 'UC Berkeley' },
  { key: 'stanford', url: 'https://dorm2dorm.com/wp-content/uploads/2024/10/stanford-university-logo.png', name: 'Stanford' },
  { key: 'mit', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/MIT_Logo_and_Wordmark.svg/960px-MIT_Logo_and_Wordmark.svg.png', name: 'MIT' },
  { key: 'harvard', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Harvard_University_logo.svg/2560px-Harvard_University_logo.svg.png', name: 'Harvard' },
  { key: 'yale', url: 'https://cdn.simpleicons.org/yale/0F4D92', name: 'Yale' },
  { key: 'princeton', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-t8gLnHfLdxw9WHZGk-3yXhTHCjUFiKtC9g&s', name: 'Princeton' },
  { key: 'airbnb', url: 'https://cdn.simpleicons.org/airbnb/FF5A5F', name: 'Airbnb' },
  { key: 'google', url: 'https://cdn.simpleicons.org/google/4285F4', name: 'Google' },
  { key: 'tinder', url: 'https://cdn.simpleicons.org/tinder/FF4458', name: 'Tinder' },
  { key: 'apple', url: 'https://cdn.simpleicons.org/apple/000000', name: 'Apple' },
  { key: 'microsoft', url: 'https://cdn.simpleicons.org/microsoft/00A4EF', name: 'Microsoft' },
  { key: 'meta', url: 'https://cdn.simpleicons.org/meta/0081FB', name: 'Meta' },
  { key: 'netflix', url: 'https://cdn.simpleicons.org/netflix/E50914', name: 'Netflix' },
  { key: 'amazon', url: 'https://cdn.simpleicons.org/amazon/FF9900', name: 'Amazon' },
];

function downloadLogo(institution, useFallback = false) {
  return new Promise((resolve, reject) => {
    const logoUrl = useFallback && institution.fallback ? institution.fallback : institution.url;
    const url = new URL(logoUrl);
    const client = url.protocol === 'https:' ? https : http;
    
    // Determine file extension from URL
    let extension = 'png';
    const urlPath = url.pathname.toLowerCase();
    if (urlPath.endsWith('.jpg') || urlPath.endsWith('.jpeg')) {
      extension = 'jpg';
    } else if (urlPath.endsWith('.png')) {
      extension = 'png';
    } else if (urlPath.endsWith('.svg')) {
      extension = 'svg';
    }
    
    const filePath = path.join(logosDir, `${institution.key}.${extension}`);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`✓ ${institution.name} already exists, skipping...`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filePath);
    
    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    // For HTTPS, allow self-signed certificates for problematic domains
    if (url.protocol === 'https:') {
      requestOptions.rejectUnauthorized = false;
    }
    
    const request = client.get(logoUrl, requestOptions, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded ${institution.name}${useFallback ? ' (fallback)' : ''}`);
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(filePath);
          downloadLogo({ ...institution, url: redirectUrl }, useFallback).then(resolve).catch(reject);
        } else {
          file.close();
          fs.unlinkSync(filePath);
          // Try fallback if available
          if (!useFallback && institution.fallback) {
            downloadLogo(institution, true).then(resolve).catch(reject);
          } else {
            reject(new Error(`Redirect without location for ${institution.name}`));
          }
        }
      } else {
        file.close();
        fs.unlinkSync(filePath);
        // Try fallback if available
        if (!useFallback && institution.fallback) {
          downloadLogo(institution, true).then(resolve).catch(reject);
        } else {
          reject(new Error(`Failed to download ${institution.name}: ${response.statusCode}`));
        }
      }
    });

    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      // Try fallback if available
      if (!useFallback && institution.fallback) {
        downloadLogo(institution, true).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });

    file.on('error', (err) => {
      file.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(err);
    });
  });
}

async function downloadAllLogos() {
  console.log('Starting logo downloads...\n');
  
  // Download with delays to avoid rate limiting
  const results = [];
  for (let i = 0; i < institutions.length; i++) {
    try {
      await downloadLogo(institutions[i]);
      results.push({ status: 'fulfilled', institution: institutions[i] });
    } catch (err) {
      results.push({ status: 'rejected', reason: err, institution: institutions[i] });
    }
    
    // Add delay between requests (except for the last one)
    if (i < institutions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
  }

  console.log('\n--- Download Summary ---');
  const successful = results.filter(r => r.status === 'fulfilled' || (r.status === 'rejected' && r.reason?.message?.includes('already exists'))).length;
  const failed = results.filter(r => r.status === 'rejected' && !r.reason?.message?.includes('already exists')).length;
  
  console.log(`✓ Successful: ${successful}`);
  if (failed > 0) {
    console.log(`✗ Failed: ${failed}`);
    results.forEach((result) => {
      if (result.status === 'rejected' && !result.reason?.message?.includes('already exists')) {
        console.log(`  - ${result.institution.name}: ${result.reason.message}`);
      }
    });
  }
  
  console.log('\nDone! Logos saved to public/logos/');
}

downloadAllLogos().catch(console.error);

