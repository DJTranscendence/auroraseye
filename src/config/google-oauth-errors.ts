export const GOOGLE_OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_not_configured:
    'Google sign-in is not set up on this server yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
  google_denied: 'Google sign-in was cancelled.',
  google_invalid: 'Google sign-in could not be completed. Try again.',
  google_state: 'Sign-in session expired. Please try Google sign-in again.',
  google_no_id_token: 'Google did not return an identity token. Try again.',
  google_no_email: 'Your Google account has no email on file, so we cannot create a site login.',
  google_email_unverified: 'Please verify your email with Google before using it to sign in.',
  google_token: 'Could not verify Google sign-in. Try again.',
};
