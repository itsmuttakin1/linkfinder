# LinkFinder - Monetized Link Generator, 100-Step Giveaway Quest & Lottery Hub

A high-performance link monetization and 100-Step Giveaway platform built with Firebase, designed for deployment on **Cloudflare Pages**.

---

## 🚀 Key Features

1. **Admin Panel (`/ad`)**:
   - Accessed at **`/ad`** (renamed from `/admin`).
   - Protected by **Firebase Authentication** (Email & Password).
   - **Tab 1: Campaign & Lottery Hub**:
     - **Campaign Builder**: Customize quest title, steps count (1 to 100 steps), and timer.
     - **Promotional Post Caption Generator**: Ready-to-copy Bengali post formatted for Telegram/Facebook channels with instant 1-click copy.
     - **👑 Admin Special Secret Winner System**: Lock any registered participant OR enter a custom Name & bKash/Nagad number to secretly win the live draw without viewers knowing!
     - **Live Slot Machine Lottery**: Realistic spinning reel with synthesized audio and confetti burst.
     - **Fast-Forward Test**: Direct 1-click test to jump straight to Step 100 form.
     - **Participant Data Table**: View, search, and manage all submitted users.
   - **Tab 2: Short Links Manager**: Create and manage 4-step monetized redirect links with analytics.

2. **100-Step Giveaway Quest (`/giveaway`)**:
   - 100 sequential steps with real-time countdown timer and progress indicator.
   - Heavy ads placed on every step (Native banner, 320x50 banners, Social Bar, Popunder, Smartlink).
   - **Anti-Cheat & Anti-Skip Protection**: Cryptographic sequential step token in memory. Users cannot skip steps by modifying URL or storage. Reloading restarts the quest at Step 1.
   - **Step 100 Unlock**: Unlocks the official participant submission form for Full Name and bKash / Nagad number. Generates a unique digital Lottery Ticket ID.

3. **Public Monetized Link Generator (`/`)**:
   - Public visitors can generate short links directly from homepage.
   - Enforces a 1-link-per-minute rate limit with live cooldown timer.

4. **Anti-AdBlocker & Anti-DNS Blocker**:
   - Blocks access until AdGuard DNS, NextDNS, Brave Shield, or ad block extensions are disabled.

---

## 🔒 Firebase Security Rules

Paste these rules in **Firebase Console** > **Realtime Database** > **Rules**:

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
    "giveaway_entries": {
      ".read": "auth != null",
      "$ticketId": {
        ".write": "auth != null || (!data.exists() && newData.exists())",
        ".validate": "newData.hasChildren(['id', 'name', 'phone'])",
        "id": {
          ".validate": "newData.isString() && newData.val() === $ticketId"
        },
        "name": {
          ".validate": "newData.isString() && newData.val().length >= 2 && newData.val().length <= 100"
        },
        "phone": {
          ".validate": "newData.isString() && newData.val().length >= 10 && newData.val().length <= 20"
        },
        "method": {
          ".validate": "newData.isString()"
        },
        "stepsCompleted": {
          ".validate": "newData.isNumber()"
        },
        "submittedAt": {
          ".validate": "newData.isNumber()"
        },
        "status": {
          ".validate": "newData.isString()"
        },
        "$other": {
          ".validate": false
        }
      }
    },
    "giveaway_winner": {
      ".read": true,
      ".write": "auth != null"
    },
    "$other": {
      ".read": false,
      ".write": "auth != null"
    }
  }
}
```
