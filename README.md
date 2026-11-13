# LinkFinder - Monetized Link Generator & Multi-Step Verification

A modern, high-performance link monetization and protection platform built with Firebase and ready for deployment on **Cloudflare Pages**.

## 🚀 Features

1. **Admin Panel (`/admin`)**:
   - Protected by **Firebase Authentication** (Email & Password).
   - Generates monetized links with custom slugs or auto-generated 6-character short IDs.
   - Saves to **Firebase Realtime Database**.
   - One-click copy shareable link.
   - Real-time link management, clicks tracking, and deletion.

2. **2-Step Verification Flow (`/?id=xyz`)**:
   - **Step 1**:
     - 10-second security countdown with animated circular progress indicator.
     - "Continue to Step 2" button remains locked until timer ends.
     - Clicking "Continue" triggers 1 popunder / Smartlink ad and transitions to Step 2.
   - **Step 2**:
     - 10-second final countdown timer.
     - "Get Destination Link" button unlocks after timer.
     - Requires 2 popunder / Smartlink ad interactions before instantly redirecting the user to the destination URL.

3. **Anti-Reload Protection**:
   - Reloading or refreshing at any point in Step 2 immediately resets the verification process back to Step 1.

4. **Anti-AdBlocker & Anti-DNS Blocker**:
   - Real-time detection of browser adblock extensions (uBlock Origin, AdBlock Plus, Brave Shield) and DNS-level blockers (AdGuard DNS, NextDNS, Pi-hole).
   - Shows an unclosable fullscreen modal requiring the user to disable their ad blocker / private DNS and refresh to proceed.

5. **Integrated Ad Placements**:
   - Popunder: `ahuramazda.org`
   - Smartlink: `asiaso.org`
   - Native Banner: `brijmohan.org`
   - Social Bar: `brijmohan.org`
   - 320x50 Banners: `brijmohan.org`

---

## 🔑 Firebase Admin Account Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select project **`itsmuttakin-adf2b`**.
3. Under **Build** > **Authentication** > **Sign-in method**, make sure **Email/Password** is enabled.
4. Under the **Users** tab, click **Add User** and create your admin email and password.
5. In **Realtime Database** > **Rules**, ensure your database rules allow read/write:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   *(Or restrict write to authenticated users: `".write": "auth != null"`)*.
6. Visit `https://your-domain.com/admin` and sign in with your email & password.

---

## 🔒 Firebase Security Rules (Hacking & Tamper Protection)

To prevent anyone from overwriting, tampering with, or deleting existing links in your Firebase Realtime Database, apply the rules from `database.rules.json`:

1. Go to **Firebase Console** > **Realtime Database** > **Rules** tab.
2. Replace all existing content with:
```json
{
  "rules": {
    "links": {
      ".read": true,
      "$id": {
        ".write": "auth != null || (!data.exists() && newData.exists()) || (data.exists() && newData.exists() && newData.child('originalUrl').val() === data.child('originalUrl').val())",
        ".validate": "newData.hasChildren(['id', 'originalUrl'])",
        "id": {
          ".validate": "newData.isString() && newData.val() === $id && newData.val().length >= 3 && newData.val().length <= 64"
        },
        "originalUrl": {
          ".validate": "newData.isString() && (newData.val().beginsWith('https://') || newData.val().beginsWith('http://')) && newData.val().length <= 2048"
        },
        "clicks": {
          ".validate": "newData.isNumber() && (!data.exists() || newData.val() >= data.val())"
        },
        "createdAt": {
          ".validate": "!data.exists() || newData.val() === data.val()"
        },
        "createdBy": {
          ".validate": "!data.exists() || newData.val() === data.val()"
        },
        "$other": {
          ".validate": false
        }
      }
    },
    "$other": {
      ".read": false,
      ".write": "auth != null"
    }
  }
}
```
3. Click **Publish**.

This ensures:
- Anyone can read links for verification.
- Public users can only CREATE a brand-new link or increment clicks.
- **Nobody can delete, overwrite, or hijack other people's existing links.**
- Authenticated admins (`/admin`) retain full management capabilities.

---

## 🌐 Deploy to Cloudflare Pages via GitHub

1. Connect this repository `https://github.com/itsmuttakin1/linkfinder` to **Cloudflare Pages**.
2. **Build Settings**:
   - Framework preset: `None`
   - Build command: *(leave empty)*
   - Build output directory: `.` *(root)*
3. Click **Deploy Site**.

