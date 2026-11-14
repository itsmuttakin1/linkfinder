# LinkFinder - Monetized Link Generator, 100-Step Giveaway Quest & Lottery Hub

A high-performance link monetization and 100-Step Giveaway platform built with Firebase, designed for deployment on **Cloudflare Pages**.

---

## 🚀 Key Features

1. **Admin Panel (`/ad`)**:
   - Accessed exclusively at **`/ad`** (`/admin` completely deleted).
   - Protected by **Firebase Authentication** (Email & Password).
   - **Multi-Campaign Creator & Manager**:
     - Create independent campaigns with custom titles and steps (1 to 100 steps).
     - Each campaign has its own unique link (`/giveaway?c=campaignId`).
     - Click any campaign card to view its completed participants table and lottery draw!
   - **🎬 Clean Screen Recording Studio (`/ad/draw.html`)**:
     - Dedicated fullscreen video recording stage for your Telegram/YouTube channel.
     - Contains NO secret admin buttons or target indicators — only a glowing slot drum and a clean spin button.
     - Plays authentic audio and confetti on draw.
   - **👑 Secret Target Winner Selection**:
     - Lock any submitted participant or type a custom Name & Phone number. The draw looks 100% natural and random to video viewers!
   - **Anti-Duplicate Submission Protection**:
     - Once a user completes the quest and submits, their submission is permanently locked in their browser and verified against duplicate phone numbers.
     - Copying and pasting the URL will NOT allow re-submitting!
   - **Promotional Post Caption Generator**: 1-click ready Bengali caption for Telegram channels.

2. **100-Step Giveaway Quest (`/giveaway`)**:
   - Dynamic steps (1 to 100 steps as set in the campaign).
   - Heavy ads placed on every step (Native banner, 320x50 banners, Social Bar, Popunder, Smartlink).
   - Anti-Cheat & Anti-Skip sequential token verification.

3. **Public Monetized Link Generator (`/`)**:
   - 1-link-per-minute rate limit.

4. **Anti-AdBlocker & Anti-DNS Blocker**:
   - Blocks access until AdGuard DNS, NextDNS, Brave Shield, or ad block extensions are disabled.

---

## 🔒 Firebase Security Rules

Paste these rules in **Firebase Console** > **Realtime Database** > **Rules**:

```json
{
  "rules": {
    ".read": true,
    ".write": "auth != null",
    "links": {
      "$id": {
        ".write": "auth != null || (!data.exists() && newData.exists()) || (data.exists() && newData.exists() && newData.child('originalUrl').val() === data.child('originalUrl').val())"
      }
    },
    "campaigns": {
      "$campaignId": {
        "entries": {
          "$ticketId": {
            ".write": "!data.exists() && newData.exists()"
          }
        }
      }
    },
    "giveaway_entries": {
      "$ticketId": {
        ".write": "!data.exists() && newData.exists()"
      }
    }
  }
}
```

