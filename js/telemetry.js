// URLbit.pro Style Realtime Telemetry & Click Analytics Engine
(function () {
  const COUNTRY_NAMES = {
    BD: "Bangladesh", IN: "India", PK: "Pakistan", US: "United States", GB: "United Kingdom",
    AE: "United Arab Emirates", SA: "Saudi Arabia", MY: "Malaysia", SG: "Singapore",
    CA: "Canada", DE: "Germany", FR: "France", IT: "Italy", BR: "Brazil",
    ID: "Indonesia", PH: "Philippines", NG: "Nigeria", EG: "Egypt", TR: "Turkey",
    RU: "Russia", JP: "Japan", KR: "South Korea", AU: "Australia", NP: "Nepal",
    LK: "Sri Lanka", VN: "Vietnam", TH: "Thailand", ZA: "South Africa", ES: "Spain",
    KW: "Kuwait", QA: "Qatar", OM: "Oman", BH: "Bahrain", NL: "Netherlands"
  };

  function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2 || countryCode === "XX") return "🌐";
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch (e) {
      return "🌐";
    }
  }

  function detectClientInfo() {
    const ua = navigator.userAgent || "";
    let deviceType = "Desktop";
    let os = "Windows";
    let browser = "Chrome";

    // Detect Device & OS
    if (/Android/i.test(ua)) {
      deviceType = "Mobile";
      os = "Android";
    } else if (/iPad/i.test(ua)) {
      deviceType = "Tablet";
      os = "iOS (iPad)";
    } else if (/iPhone|iPod/i.test(ua)) {
      deviceType = "Mobile";
      os = "iOS (iPhone)";
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      deviceType = "Desktop";
      os = "macOS";
    } else if (/Windows/i.test(ua)) {
      deviceType = "Desktop";
      os = "Windows";
    } else if (/Linux/i.test(ua)) {
      deviceType = "Desktop";
      os = "Linux";
    }

    // Detect Browser
    if (/Edg\//i.test(ua)) {
      browser = "Edge";
    } else if (/Chrome|CriOS/i.test(ua) && !/Edg/i.test(ua) && !/OPR/i.test(ua)) {
      browser = "Chrome";
    } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
      browser = "Safari";
    } else if (/Firefox|FxiOS/i.test(ua)) {
      browser = "Firefox";
    } else if (/OPR|Opera/i.test(ua)) {
      browser = "Opera";
    } else if (/SamsungBrowser/i.test(ua)) {
      browser = "Samsung Internet";
    }

    // Detect Referrer Source
    let referrer = "Direct";
    const ref = document.referrer;
    if (ref) {
      try {
        const h = new URL(ref).hostname.toLowerCase();
        if (h.includes("t.me") || h.includes("telegram")) referrer = "Telegram";
        else if (h.includes("facebook") || h.includes("fb.me")) referrer = "Facebook";
        else if (h.includes("youtube") || h.includes("youtu.be")) referrer = "YouTube";
        else if (h.includes("whatsapp")) referrer = "WhatsApp";
        else if (h.includes("instagram")) referrer = "Instagram";
        else if (h.includes("twitter") || h.includes("x.com")) referrer = "Twitter / X";
        else if (h.includes("google")) referrer = "Google";
        else referrer = h.replace(/^www\./, "");
      } catch (e) {
        referrer = "Web";
      }
    }

    return { deviceType, os, browser, referrer };
  }

  async function detectUserCountry() {
    const cached = sessionStorage.getItem("geo_loc_cache");
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { }
    }

    let code = "Unknown";
    let name = "Unknown Country";

    try {
      // 1. Cloudflare trace (fastest, direct on Cloudflare Pages)
      const cf = await fetch("/cdn-cgi/trace", { cache: "no-store" });
      if (cf.ok) {
        const txt = await cf.text();
        const m = txt.match(/loc=([A-Z]{2})/);
        if (m && m[1] && m[1] !== "XX") {
          code = m[1];
        }
      }
    } catch (e) { }

    if (code === "Unknown") {
      try {
        // 2. api.country.is fallback
        const r = await fetch("https://api.country.is");
        if (r.ok) {
          const d = await r.json();
          if (d && d.country) code = d.country;
        }
      } catch (e) { }
    }

    name = COUNTRY_NAMES[code] || (code !== "Unknown" ? code : "International");
    const result = {
      code: code,
      name: name,
      flag: getFlagEmoji(code)
    };

    try { sessionStorage.setItem("geo_loc_cache", JSON.stringify(result)); } catch (e) { }
    return result;
  }

  // Global telemetry function
  window.recordClickTelemetry = async function (rtdbUrl, targetId, targetType, title) {
    if (!rtdbUrl || !targetId) return;

    // Prevent rapid duplicate clicks (10s cooldown per target)
    const sessionKey = `clk_recorded_${targetType}_${targetId}`;
    const lastTime = parseInt(sessionStorage.getItem(sessionKey) || "0", 10);
    if (Date.now() - lastTime < 10000) return;
    sessionStorage.setItem(sessionKey, Date.now().toString());

    try {
      const client = detectClientInfo();
      const geo = await detectUserCountry();
      const clickId = "clk_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);

      const payload = {
        id: clickId,
        targetId: targetId,
        targetType: targetType || "short_link", // "short_link" or "campaign"
        title: title || targetId,
        timestamp: Date.now(),
        country: geo.name,
        countryCode: geo.code,
        flag: geo.flag,
        deviceType: client.deviceType,
        os: client.os,
        browser: client.browser,
        referrer: client.referrer
      };

      // Save to Firebase via SDK (if available) or REST endpoint
      if (typeof database !== "undefined" && database) {
        try {
          await database.ref(`click_logs/${clickId}`).set(payload);
        } catch (sdkErr) {
          const endpoint = `${rtdbUrl}/click_logs/${clickId}.json`;
          await fetch(endpoint, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
      } else {
        const endpoint = `${rtdbUrl}/click_logs/${clickId}.json`;
        await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
    } catch (err) {
      console.warn("Telemetry note:", err);
    }
  };

  window.telemetryHelpers = {
    getFlagEmoji,
    detectClientInfo,
    detectUserCountry
  };
})();

