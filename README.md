# Wallpaper Frontend (Vue 3 + Vite)

This is a lightweight Vue 3 frontend for your Wallpaper server (Spring Boot + PostgreSQL).
It provides pages and components to browse, upload, download, search wallpapers and manage user account.

## Quick start
1. Install dependencies:
   ```
   npm install
   ```
2. Run dev server:
   ```
   npm run dev
   ```
   App will be on http://localhost:5173 (calls backend at http://localhost:8080).

## Electron
To run with Electron (optional):
```
npm run electron:dev
```
To package:
```
npm run package:electron
```

## Notes
- API endpoints are defined in `src/api.js`. Adjust `baseURL` if your backend is elsewhere.
- This scaffold focuses on UI and flows; secure production settings and styling improvements are left to you.
