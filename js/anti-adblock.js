/**
 * Advanced Anti-AdBlocker & Anti-DNS Blocker Detection
 * Detects:
 *  - AdBlock extensions (uBlock Origin, AdBlock Plus, AdBlock, Ghostery, Brave Shield, etc.)
 *  - DNS-based AdBlockers (AdGuard DNS, NextDNS, Pi-hole, Private DNS)
 *  - Script blockers & cosmetic filters
 */

(function () {
  let isBlocked = false;
  let modalInjected = false;

  // Create & Inject Modal UI
  function showAdBlockModal() {
    isBlocked = true;
    window.isAdBlockActive = true;
    document.body.style.overflow = "hidden";

    if (document.getElementById("anti-adblock-overlay")) {
      document.getElementById("anti-adblock-overlay").style.display = "flex";
      return;
    }

    const overlay = document.createElement("div");
    overlay.id = "anti-adblock-overlay";
    overlay.setAttribute("style", `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-sizing: border-box;
    `);

    overlay.innerHTML = `
      <div style="
        background: #1e293b;
        border: 2px solid #ef4444;
        border-radius: 20px;
        max-width: 480px;
        width: 100%;
        padding: 32px 24px;
        text-align: center;
        color: #f8fafc;
        box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.35);
        animation: adbPopIn 0.3s ease-out;
      ">
        <div style="
          width: 72px;
          height: 72px;
          margin: 0 auto 18px;
          background: rgba(239, 68, 68, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
        ">
          🚫
        </div>

        <h2 style="font-size: 22px; font-weight: 700; margin: 0 0 10px; color: #ef4444;">
          AdBlock / Private DNS Detected!
        </h2>
        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 14px; color: #fca5a5;">
          এডব্লকার বা প্রাইভেট DNS বন্ধ করুন
        </h3>

        <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 16px;">
          আমাদের লিংকটি পেতে হলে আপনার ব্রাউজারের <strong>Ad Blocker</strong>, <strong>Brave Shield</strong> অথবা মোবাইল/রাউটারের <strong>Private DNS (AdGuard / NextDNS)</strong> সাময়িক বন্ধ করতে হবে।
        </p>

        <div style="background: #0f172a; border-radius: 12px; padding: 12px; margin-bottom: 22px; text-align: left; font-size: 13px; color: #cbd5e1;">
          <div style="font-weight: 600; margin-bottom: 6px; color: #e2e8f0;">👉 কীভাবে অফ করবেন:</div>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.5;">
            <li>AdBlocker এক্সটেনশন Pause / Disable করুন।</li>
            <li>Brave ব্রাউজারে 'Shields Down' করুন।</li>
            <li>Android Settings &gt; Private DNS &gt; 'Off' বা 'Automatic' করুন।</li>
          </ul>
        </div>

        <button id="adb-refresh-btn" style="
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #ffffff;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          box-shadow: 0 10px 20px rgba(239, 68, 68, 0.4);
          transition: all 0.2s ease;
        " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
          🔄 Refresh Page (অফ করে রিলোড দিন)
        </button>
      </div>

      <style>
        @keyframes adbPopIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(overlay);
    modalInjected = true;

    document.getElementById("adb-refresh-btn").addEventListener("click", function () {
      window.location.reload();
    });
  }

  // 1. Bait Element Test (detects extension cosmetic filters)
  function testBaitElement() {
    return new Promise((resolve) => {
      const bait = document.createElement("div");
      bait.setAttribute(
        "class",
        "pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links ad-banner ad-unit adzone ad-placement adsbox ads-holder"
      );
      bait.setAttribute(
        "style",
        "position: absolute !important; top: -9999px !important; left: -9999px !important; width: 1px !important; height: 1px !important; pointer-events: none !important;"
      );
      document.body.appendChild(bait);

      setTimeout(() => {
        const isHidden =
          bait.offsetParent === null ||
          bait.offsetHeight === 0 ||
          bait.offsetLeft === 0 ||
          bait.offsetTop === 0 ||
          bait.offsetWidth === 0 ||
          bait.clientHeight === 0 ||
          bait.clientWidth === 0 ||
          window.getComputedStyle(bait).display === "none" ||
          window.getComputedStyle(bait).visibility === "hidden";

        bait.remove();
        resolve(isHidden);
      }, 150);
    });
  }

  // 2. DNS / Network Block Test (detects DNS AdBlockers like AdGuard DNS, NextDNS, PiHole)
  async function testDnsBlock() {
    const testEndpoints = [
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
      "https://securepubads.g.doubleclick.net/tag/js/gpt.js",
      "https://brijmohan.org/21/2554a2b86dafe41a9ee8b56d028af985"
    ];

    for (const url of testEndpoints) {
      try {
        await fetch(new Request(url, { method: "HEAD", mode: "no-cors", cache: "no-store" }));
      } catch (err) {
        // Network error / connection refused / DNS failed = adblock / dns block!
        return true;
      }
    }
    return false;
  }

  // 3. Script bait injection test
  function testScriptBait() {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      script.async = true;
      script.onerror = () => {
        resolve(true); // Blocked
      };
      script.onload = () => {
        resolve(false);
      };
      document.head.appendChild(script);
      setTimeout(() => resolve(false), 800);
    });
  }

  // Comprehensive check
  async function runAdBlockCheck() {
    const [baitBlocked, dnsBlocked] = await Promise.all([
      testBaitElement(),
      testDnsBlock()
    ]);

    if (baitBlocked || dnsBlocked) {
      showAdBlockModal();
      return true;
    }
    return false;
  }

  window.checkAdBlock = runAdBlockCheck;

  // Run on page load and periodically
  window.addEventListener("DOMContentLoaded", () => {
    runAdBlockCheck();
    // Continuous monitoring
    setInterval(() => {
      if (isBlocked) {
        document.body.style.overflow = "hidden";
        const overlay = document.getElementById("anti-adblock-overlay");
        if (overlay) overlay.style.display = "flex";
      } else {
        runAdBlockCheck();
      }
    }, 2500);
  });
})();
