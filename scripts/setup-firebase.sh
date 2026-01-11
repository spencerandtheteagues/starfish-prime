#!/bin/bash
# Firebase Setup Script for ElderCare App
# This script helps configure Firebase Authentication and Firestore

set -e

PROJECT_ID="eldercare-app-17d19"

echo "=========================================="
echo "Firebase Setup for ElderCare App"
echo "=========================================="
echo ""

echo "Project ID: $PROJECT_ID"
echo ""

# Check if user is logged in to Firebase
echo "1. Checking Firebase login status..."
if ! firebase projects:list &>/dev/null; then
  echo "❌ Not logged in to Firebase. Run 'firebase login' first."
  exit 1
fi
echo "✅ Logged in to Firebase"
echo ""

# Deploy Firestore rules
echo "2. Deploying Firestore rules..."
firebase deploy --only firestore:rules --project $PROJECT_ID
echo "✅ Firestore rules deployed"
echo ""

# Deploy Firestore indexes
echo "3. Deploying Firestore indexes..."
firebase deploy --only firestore:indexes --project $PROJECT_ID
echo "✅ Firestore indexes deployed"
echo ""

# Build and deploy Cloud Functions
echo "4. Building and deploying Cloud Functions..."
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions --project $PROJECT_ID
echo "✅ Cloud Functions deployed"
echo ""

echo "=========================================="
echo "⚠️  MANUAL STEPS REQUIRED:"
echo "=========================================="
echo ""
echo "You need to manually enable Email/Password authentication in the Firebase Console:"
echo ""
echo "1. Go to: https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"
echo "2. Click on 'Email/Password' in the Sign-in providers list"
echo "3. Enable the 'Email/Password' toggle"
echo "4. Click 'Save'"
echo ""
echo "After enabling authentication, run this script again to deploy functions."
echo ""
