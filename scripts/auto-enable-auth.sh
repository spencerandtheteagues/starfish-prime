#!/bin/bash
# Script to automatically enable Firebase Authentication
# This uses the Firebase Management API

set -e

PROJECT_ID="eldercare-app-17d19"

echo "========================================"
echo "Auto-Enable Firebase Authentication"
echo "========================================"
echo ""

# Get OAuth token for API calls
echo "Getting access token..."
ACCESS_TOKEN=$(firebase login:ci --no-localhost 2>&1 | grep -o '".*"' | tr -d '"' || echo "")

if [ -z "$ACCESS_TOKEN" ]; then
    echo "Attempting to use gcloud for authentication..."

    # Try to install gcloud if not present
    if ! command -v gcloud &> /dev/null; then
        echo ""
        echo "❌ Neither gcloud CLI nor Firebase auth token available"
        echo ""
        echo "To enable authentication automatically, you need to either:"
        echo "1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
        echo "2. Or manually enable it in the Firebase Console"
        echo ""
        echo "Manual steps (takes 1 minute):"
        echo "1. Go to: https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"
        echo "2. Click 'Email/Password'"
        echo "3. Toggle 'Enable' to ON"
        echo "4. Click 'Save'"
        echo ""
        echo "Then:"
        echo "1. Go to: https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=$PROJECT_ID"
        echo "2. Click 'ENABLE'"
        echo ""
        exit 1
    fi

    # Try with gcloud
    echo "Enabling Identity Toolkit API..."
    gcloud services enable identitytoolkit.googleapis.com --project=$PROJECT_ID

    echo "✅ Identity Toolkit API enabled"
    echo ""
    echo "⚠️  Still need to enable Email/Password provider manually:"
    echo "   https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"
    echo ""
    echo "This setting must be enabled through the Firebase Console for security reasons."
    exit 0
fi

echo "✅ Authentication successful"
echo ""
echo "Unfortunately, Firebase does not provide an API to enable authentication providers"
echo "programmatically for security reasons."
echo ""
echo "You must enable Email/Password authentication manually:"
echo ""
echo "1. Open: https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"
echo "2. Click on 'Email/Password'"
echo "3. Toggle 'Enable' to ON"
echo "4. Click 'Save'"
echo ""
echo "And enable the Identity Toolkit API:"
echo ""
echo "1. Open: https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=$PROJECT_ID"
echo "2. Click 'ENABLE'"
echo ""

exit 1
