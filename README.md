# Code Wars Blog Platform

## Google OAuth Setup

To enable Google OAuth functionality, you need to:

1. Create a Google OAuth 2.0 Client ID in the [Google Cloud Console](https://console.cloud.google.com/)
2. Add your client ID to the `.env` file:
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
   ```
3. Make sure to add your domain (e.g., http://localhost:5173) to the authorized JavaScript origins in the Google Cloud Console

## Development

To run the application locally:

```bash
npm install
npm run dev
```

The application will be available at http://localhost:5173

## Google Sign-In Implementation Details

This application uses Google Identity Services for authentication, which provides ID tokens (JWT) instead of access tokens. This is the recommended approach for frontend authentication.

Key implementation details:
- Uses Google Identity Services library for proper ID token generation
- Validates token type to ensure it's a JWT (starts with "ey") not an access token (starts with "ya29")
- Implements proper error handling for token validation
- Uses One Tap UX for seamless authentication when available

## Troubleshooting

### Cross-Origin-Opener-Policy Issues

If you encounter "Cross-Origin-Opener-Policy policy would block the window.closed call" errors:

1. Ensure you're using the latest version of `@react-oauth/google`:
   ```bash
   npm update @react-oauth/google
   ```

2. The application is configured to use the redirect flow (`flow: 'auth-code'`) which avoids popup-related COOP issues.

3. If issues persist, you may need to adjust your server's COOP headers:
   ```javascript
   // In your server configuration
   app.use((req, res, next) => {
     res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
     next();
   });
   ```

### Google Sign-In Not Working

If Google Sign-In is not working:

1. Verify that `VITE_GOOGLE_CLIENT_ID` is correctly set in your `.env` file
2. Check that the client ID is properly configured in Google Cloud Console
3. Ensure that http://localhost:5173 is added to authorized JavaScript origins
4. Check browser console for error messages
5. Verify that you're receiving an ID token (starts with "ey") and not an access token (starts with "ya29")