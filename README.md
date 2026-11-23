# Url Hunter - Free URL Shortener, Link Generator & Monetization Network

> **Production Canonical Domain**: [https://redrectorlink.pages.dev](https://redrectorlink.pages.dev)  
> High-performance link shortener, instant 0-second redirect engine, 4-step monetized link protection, 100-step giveaway quest & lottery studio built with Firebase and hosted on Cloudflare Pages.

---

## 🚀 Key Features

1. **Free URL Shortener & Link Generator (`/`)**:
   - Shorten long URLs instantly with no account or sign up required.
   - **Direct 0-Second Redirection (`?d=<slug>`)**: Instant seamless redirection with visitor country logging.
   - **4-Step Monetized Protection (`?id=<slug>`)**: Interstitial anti-bot verification with built-in banner ads, native ads, popunders, and smartlinks.
   - **Live Visitor Telemetry**: Real-time country click analytics with national flags, device breakdown, and referrer logs stored in Firebase Realtime Database.
   - **Custom Link Title Banner**: Highlights protected destination titles with multi-language prompts (English, Bengali, Indonesian).
   - **1-Minute Rate Limiting**: Built-in client and database defense against spam submissions.

2. **SEO & LLM Search Engine Optimized**:
   - Optimized for top keywords: `url shortener`, `link shortener`, `shorten url`, `short link`, `bitly`, `tinyurl`, `free url shortener`, `acortador de url`, `persingkat link`, and more.
   - Standard `/llms.txt` and `/llms-full.txt` index files for AI crawlers (Perplexity, ChatGPT, Claude, Gemini).
   - Structured JSON-LD schema (`WebApplication`, `FAQPage`, `HowTo`).
   - Clean, canonical XML sitemap: `https://redrectorlink.pages.dev/sitemap.xml`.

3. **Admin Panel (`/ad`)**:
   - Accessed exclusively at **`/ad`** (`/admin` completely removed).
   - Protected by **Firebase Authentication** (Email & Password).
   - **Multi-Campaign Creator & Manager**:
     - Create independent campaigns with custom titles and steps (1 to 100 steps).
     - Each campaign has its own unique link (`/giveaway?c=campaignId`).
     - Click any campaign card to view its completed participants table and lottery draw.
   - **🎬 Clean Screen Recording Studio (`/ad/draw.html`)**:
     - Dedicated fullscreen video recording stage for Telegram and YouTube channels.
     - Contains NO secret admin buttons or target indicators — only a glowing slot drum and a clean spin button.
     - Plays authentic audio and confetti on draw.
   - **👑 Secret Target Winner Selection**:
     - Lock any submitted participant or type a custom Name & Phone number.
   - **Public Generated Links Manager**: View, filter, and inspect telemetry for all user-created short links.

4. **100-Step Giveaway Quest (`/giveaway`)**:
   - Dynamic steps (1 to 100 steps as configured in campaign).
   - High-yield ad integrations (Native banner, 320x50 banners, Social Bar, Popunder, Smartlink).
   - Sequential anti-cheat token validation.

---

## 🔒 Firebase Security Rules

Paste these rules in **Firebase Console** > **Realtime Database** > **Rules**:

```json
{
  "rules": {
    ".read": true,
    ".write": "auth != null",
    "links": {
      ".read": true,
      "$id": {
        ".write": "auth != null || (!data.exists() && newData.exists())",
        ".validate": "newData.hasChildren(['id', 'originalUrl']) && newData.child('originalUrl').isString() && newData.child('id').isString() && newData.child('id').val().length <= 50",
        "clicks": {
          ".write": true
        }
      }
    },
    "direct_links": {
      ".read": true,
      "$id": {
        ".write": "auth != null || (!data.exists() && newData.exists())",
        ".validate": "newData.hasChildren(['id', 'originalUrl']) && newData.child('originalUrl').isString() && newData.child('id').isString() && newData.child('id').val().length <= 50",
        "clicks": {
          ".write": true
        }
      }
    },
    "campaigns": {
      ".read": true,
      "$campaignId": {
        ".write": "auth != null",
        "clicks": {
          ".write": true
        },
        "maxStepReached": {
          ".write": "auth != null || (newData.isNumber() && newData.val() >= 1 && newData.val() <= 100 && (!data.exists() || newData.val() >= data.val()))"
        },
        "entries": {
          ".read": true,
          "$ticketId": {
            ".write": "auth != null || (!data.exists() && newData.exists())",
            ".validate": "newData.hasChildren(['id', 'name', 'phone', 'method', 'stepsCompleted', 'submittedAt']) && newData.child('name').isString() && newData.child('name').val().length <= 100 && newData.child('phone').isString() && newData.child('phone').val().length >= 8 && newData.child('phone').val().length <= 25"
          }
        }
      }
    },
    "click_logs": {
      ".read": true,
      "$clickId": {
        ".write": "auth != null || (!data.exists() && newData.exists())",
        ".validate": "newData.hasChildren(['id', 'targetId', 'targetType', 'timestamp', 'country', 'deviceType', 'os', 'browser'])"
      }
    },
    "giveaway_entries": {
      ".read": true,
      "$ticketId": {
        ".write": "auth != null || (!data.exists() && newData.exists())"
      }
    }
  }
}
```
