# Google Drive Setup Guide

This guide explains how to set up the Google Drive integration for the AlgoRhythm Website file uploads.

## 1. Google Cloud Project Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. In the left navigation bar, go to **APIs & Services > Library**.
4. Search for "Google Drive API" and click **Enable**.

## 2. OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** (or Internal if using a Google Workspace).
3. Fill in the required details (App Name: AlgoRhythm Website, Support Email).
4. For Scopes, click **Add or Remove Scopes** and add:
   - `https://www.googleapis.com/auth/drive.file`
5. Add yourself as a Test User if your app remains in the "Testing" publishing status.

## 3. Create OAuth Credentials
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Select **Web application**.
4. Name: `AlgoRhythm Web Server`
5. Under **Authorized redirect URIs**, add your environments:
   - Localhost: `http://localhost:3000/api/google-drive/callback`
   - Production: `https://your-domain.com/api/google-drive/callback`
6. Click **Create** and note down the **Client ID** and **Client Secret**.

## 4. Environment Variables
Add the credentials to your `.env` file:
```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google-drive/callback"
```
*(Make sure `GOOGLE_REDIRECT_URI` exactly matches the environment you are testing in).*

## 5. Obtain Refresh Token
1. Start your application locally (`npm run dev`).
2. Log into the Admin Panel as a `SUPER_ADMIN` or `CONTENT_ADMIN`.
3. Open your browser and navigate to: `http://localhost:3000/api/google-drive/auth`
4. This will redirect you to Google. Select the Google account whose Drive you want to use.
5. Grant the application permissions to manage files.
6. You will be redirected back to the app, where a success page will display your **Refresh Token**.
7. Copy the Refresh Token and add it to your `.env` file:
```env
GOOGLE_REFRESH_TOKEN="your-refresh-token"
```

## 6. Deployment Requirements
- Update the `.env` variables on your production server (Vercel/Railway/etc.).
- Make sure `GOOGLE_REDIRECT_URI` is set to the production callback URL.
- No other setup is needed. The app will automatically create the `AlgoRhythm Website` folder hierarchy in your Google Drive on the first upload.

## 7. Folder Structure
The app will automatically manage the following folder structure in the authenticated Google Drive:
- `AlgoRhythm Website/`
  - `Branding/` (Public)
  - `Team/` (Public)
  - `Events/` (Public)
  - `Magazines/` (Public)
  - `Certificates/` (Private - downloadable only via server)
