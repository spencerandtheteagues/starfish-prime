#!/usr/bin/env node
/**
 * Enable Firebase Email/Password Authentication via API
 *
 * This script uses the Firebase Management API and Service Account
 * to automatically enable Email/Password authentication.
 */

const https = require('https');
const { GoogleAuth } = require('google-auth-library');
const serviceAccount = require('../functions/service-account.json');

const PROJECT_ID = serviceAccount.project_id;

console.log('========================================');
console.log('Auto-Enable Firebase Authentication');
console.log('========================================');
console.log('');
console.log(`Project ID: ${PROJECT_ID}`);
console.log('');

/**
 * Enable Identity Toolkit API
 */
async function enableIdentityToolkitAPI() {
  try {
    console.log('Step 1: Enabling Identity Toolkit API...');

    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to get access token');
    }

    // Enable the Identity Toolkit API
    const enableApiUrl = `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/identitytoolkit.googleapis.com:enable`;

    const response = await makeRequest(enableApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Identity Toolkit API enabled successfully');
    console.log('');
    return true;
  } catch (error) {
    if (error.message && error.message.includes('already enabled')) {
      console.log('✅ Identity Toolkit API is already enabled');
      console.log('');
      return true;
    }
    console.error('❌ Error enabling Identity Toolkit API:', error.message);
    return false;
  }
}

/**
 * Configure Email/Password provider
 *
 * Note: This is a workaround since Firebase doesn't provide direct API
 * to enable auth providers. We'll try to configure the project's
 * Identity Platform settings.
 */
async function enableEmailPasswordProvider() {
  try {
    console.log('Step 2: Attempting to enable Email/Password provider...');

    // Unfortunately, there's no public API to enable auth providers
    // This must be done through the Firebase Console
    console.log('');
    console.log('⚠️  Email/Password provider must be enabled manually');
    console.log('');
    console.log('The Firebase Management API does not support programmatic');
    console.log('enablement of authentication providers for security reasons.');
    console.log('');
    console.log('Please complete this step manually (takes 30 seconds):');
    console.log('');
    console.log('1. Open your browser to:');
    console.log(`   https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers`);
    console.log('');
    console.log('2. Click on "Email/Password"');
    console.log('');
    console.log('3. Toggle "Enable" to ON');
    console.log('');
    console.log('4. Click "Save"');
    console.log('');

    // Try to open the URL automatically
    const { exec } = require('child_process');
    exec(`open "https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"`, (error) => {
      if (error) {
        // Silently fail if open command doesn't work
      }
    });

    return false;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

/**
 * Helper to make HTTPS requests
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data || '{}'));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Main function
 */
async function main() {
  try {
    // Check if google-auth-library is available
    try {
      require.resolve('google-auth-library');
    } catch (e) {
      console.log('Installing required dependency: google-auth-library...');
      const { execSync } = require('child_process');
      execSync('npm install --no-save google-auth-library', {
        cwd: __dirname,
        stdio: 'inherit'
      });
      console.log('');
    }

    const apiEnabled = await enableIdentityToolkitAPI();
    await enableEmailPasswordProvider();

    console.log('========================================');
    console.log('Summary');
    console.log('========================================');
    console.log('');
    console.log(`✅ Identity Toolkit API: ${apiEnabled ? 'Enabled' : 'Failed'}`);
    console.log('⚠️  Email/Password Provider: Requires manual enablement');
    console.log('');
    console.log('After enabling Email/Password in the Firebase Console,');
    console.log('your app will be able to create user accounts!');
    console.log('');

    process.exit(apiEnabled ? 0 : 1);
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
