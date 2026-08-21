(function () {
  "use strict";

  const cfg = window.STUDENTBNB_CONFIG;
  const storagePrefix = `studentbnb:${cfg.countryCode}:`;

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${cfg.apiBaseUrl}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
  }

  function read(key, fallback = null) {
    try {
      const value = localStorage.getItem(storagePrefix + key);
      return value ? JSON.parse(value) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(storagePrefix + key, JSON.stringify(value));
  }

  function createId(prefix) {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  async function beginEmailVerification(email, intent, pendingRecord) {
    if (cfg.apiEnabled) {
      return apiRequest("/auth/email/start", {
        method: "POST",
        body: JSON.stringify({
          email,
          intent,
          country_code: cfg.countryCode,
          locale: cfg.locale,
          return_url: `${location.origin}${location.pathname.replace(/[^/]+$/, "")}${cfg.routes.confirm}`,
          pending_record: pendingRecord,
        }),
      });
    }
    const token = createId("verify");
    write(`verification:${token}`, { email, intent, pendingRecord, createdAt: new Date().toISOString() });
    return { status: "pending", demo: true, token, expires_in_seconds: 3600 };
  }

  async function confirmEmail(token) {
    if (cfg.apiEnabled) {
      return apiRequest("/auth/email/confirm", { method: "POST", body: JSON.stringify({ token }) });
    }
    const pending = read(`verification:${token}`);
    if (!pending) throw new Error("invalid_or_expired_token");
    const user = {
      id: createId("user"),
      email: pending.email,
      email_verified_at: new Date().toISOString(),
      country_code: cfg.countryCode,
    };
    write("user", user);
    if (pending.intent === "publish_listing") {
      const listings = read("listings", []);
      const record = { ...pending.pendingRecord, id: createId("listing"), publisher_user_id: user.id, status: "pending_review", created_at: new Date().toISOString() };
      listings.unshift(record);
      write("listings", listings);
    }
    if (pending.intent === "publish_request") {
      const requests = read("student_requests", []);
      const record = { ...pending.pendingRecord, id: createId("request"), user_id: user.id, status: "pending_review", created_at: new Date().toISOString() };
      requests.unshift(record);
      write("student_requests", requests);
    }
    localStorage.removeItem(storagePrefix + `verification:${token}`);
    return { status: "verified", user, published_intent: pending.intent, demo: true };
  }

  async function track(eventName, properties = {}) {
    const payload = {
      event_name: eventName,
      country_code: cfg.countryCode,
      locale: cfg.locale,
      path: location.pathname,
      occurred_at: new Date().toISOString(),
      properties,
    };
    if (cfg.apiEnabled && cfg.analyticsEnabled) {
      try {
        await apiRequest("/events", { method: "POST", body: JSON.stringify(payload) });
      } catch (_) {
        // Analytics must never block the user flow.
      }
    }
  }

  window.StudentBnBAPI = { apiRequest, beginEmailVerification, confirmEmail, track, read, write };
})();
