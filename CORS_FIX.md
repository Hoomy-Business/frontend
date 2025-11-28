# CORS and Mixed Content Fix

## Issues Fixed

1. **CORS Errors**: Added proper CORS headers to Vite dev server
2. **Mixed Content**: Updated CSP to allow HTTP sources from local network
3. **Module Loading**: Fixed CSP to allow Vite's module system and HMR

## Changes Made

### 1. Vite Server Configuration (`vite.config.ts`)
- Added `cors: true`
- Added CORS headers:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods`
  - `Access-Control-Allow-Headers`
  - `Access-Control-Allow-Credentials`
- Configured HMR for local network access
- Added `origin: '*'` for development

### 2. Content Security Policy (`client/index.html`)
- Removed `upgrade-insecure-requests` (was forcing HTTPS)
- Added HTTP sources for local network:
  - `http://localhost:*`
  - `http://127.0.0.1:*`
  - `http://192.168.*:*`
- Added WebSocket support for HMR:
  - `ws://localhost:*`
  - `ws://192.168.*:*`
- Added `'unsafe-eval'` for Vite's module system (development only)

## Important Notes

1. **Access via HTTP, not HTTPS**: The Vite dev server runs on HTTP. Access your site via:
   - `http://192.168.1.176:5000` ✅
   - NOT `https://192.168.1.176:5000` ❌

2. **Production**: The CSP in production will be stricter. These changes are primarily for development.

3. **If still having issues**:
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Check browser console for specific errors
   - Ensure you're accessing via HTTP, not HTTPS

## Testing

After these changes:
1. Restart the dev server: `npm run dev`
2. Access via HTTP: `http://192.168.1.176:5000`
3. Check browser console - CORS errors should be gone
4. Hot Module Replacement (HMR) should work

