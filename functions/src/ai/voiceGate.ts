/**
 * Voice Gate - Verify senior voice before logging/reporting
 * Per integration package:
 * - Allow responses even if voice unverified (don't block conversation)
 * - Forbid logging/reporting if voice is unverified (privacy protection)
 * - Log only verified senior speech
 */
export function verifySeniorVoice(metadata: any): boolean {
  // Check for explicit verification flag from client
  if (metadata && metadata.isVerifiedSenior !== undefined) {
    return metadata.isVerifiedSenior;
  }

  // Check for voice channel indicator (vs text input)
  if (metadata && metadata.inputChannel === 'voice') {
    // In production, would check voice biometric match here
    // For now, trust voice channel if explicitly marked
    if (metadata.voiceBiometricMatch !== undefined) {
      return metadata.voiceBiometricMatch;
    }
  }

  // Check for user authentication context
  if (metadata && metadata.authenticatedUserId && metadata.userRole === 'senior') {
    // If user is authenticated as senior, trust it
    // (but still log the unverified status for auditing)
    console.log('Voice verification: Authenticated senior user (no biometric check)');
    return true;
  }

  // Conservative default: Allow conversation but mark as unverified
  // This means we'll respond to the senior but won't log the conversation
  console.log('Voice verification: Unverified - will respond but not log');
  return false; // Changed to false for stricter privacy - only log verified speech
}
