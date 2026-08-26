(function () {
  "use strict";

  const cfg = window.STUDENTBNB_CONFIG;
  const storagePrefix = `studentbnb:${cfg.countryCode}:`;

  (function curateDistrictsForStudents() {
    const data = window.STUDENTBNB_DATA;
    if (!data || !Array.isArray(data.cities)) return;
    const listings = Array.isArray(data.listings) ? data.listings : [];
    const normalize = value => String(value || "").toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    data.cities.forEach(city => {
      if (!Array.isArray(city.districts) || city.districts.length <= 22) return;
      city.districtsAll = city.districts.slice();
      const referenced = new Set();
      listings.forEach(listing => {
        const listingCity = listing.city_id || listing.cityId || listing.city || listing.city_slug || listing.citySlug;
        if (listingCity && ![city.id, city.slug, city.name].map(normalize).includes(normalize(listingCity))) return;
        [listing.district_id, listing.districtId, listing.district, listing.zone].filter(Boolean).forEach(value => referenced.add(normalize(value)));
      });

      const target = city.districts.length > 100 ? 20 : city.districts.length > 45 ? 18 : 16;
      const scored = city.districts.map((district, index) => {
        const name = district && typeof district === "object" ? district.name : String(district);
        const id = district && typeof district === "object" ? district.id : name;
        const n = normalize(name);
        let score = 0;
        if (referenced.has(normalize(id)) || referenced.has(n)) score += 100;
        if (/(centre|centro|univers|campus|student|quartier latin|sorbonne|cite universitaire|republique|bastille|marais|montparnasse|montmartre|belleville|latin)/i.test(n)) score += 18;
        if (/\d/.test(name)) score -= 12;
        if (/\b(i|ii|iii|iv|v|vi|vii|viii|ix|x)\b/i.test(name)) score -= 10;
        if ((name.match(/[-–/]/g) || []).length > 1) score -= 5;
        if (name.length > 30) score -= 4;
        if (/^(cite |hameau |ilot |lotissement )/i.test(n)) score -= 4;
        return { district, index, score };
      });

      city.districts = scored.sort((a,b) => b.score - a.score || a.index - b.index).slice(0,target).sort((a,b) => a.index - b.index).map(item => item.district);
    });
  })();

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

  function write(key, value) { localStorage.setItem(storagePrefix + key, JSON.stringify(value)); }
  function createId(prefix) { if (crypto && crypto.randomUUID) return crypto.randomUUID(); return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`; }

  async function beginEmailVerification(email, intent, pendingRecord) {
    if (cfg.apiEnabled) {
      return apiRequest("/auth/email/start", { method: "POST", body: JSON.stringify({ email, intent, country_code: cfg.countryCode, locale: cfg.locale, return_url: `${location.origin}${location.pathname.replace(/[^/]+$/, "")}${cfg.routes.confirm}`, pending_record: pendingRecord }) });
    }
    const token = createId("verify");
    write(`verification:${token}`, { email, intent, pendingRecord, createdAt: new Date().toISOString() });
    return { status: "pending", demo: true, token, expires_in_seconds: 3600 };
  }

  async function confirmEmail(token) {
    if (cfg.apiEnabled) return apiRequest("/auth/email/confirm", { method: "POST", body: JSON.stringify({ token }) });
    const pending = read(`verification:${token}`);
    if (!pending) throw new Error("invalid_or_expired_token");
    const user = { id: createId("user"), email: pending.email, email_verified_at: new Date().toISOString(), country_code: cfg.countryCode };
    write("user", user);
    if (pending.intent === "publish_listing") { const listings = read("listings", []); listings.unshift({ ...pending.pendingRecord, id: createId("listing"), publisher_user_id: user.id, status: "pending_review", created_at: new Date().toISOString() }); write("listings", listings); }
    if (pending.intent === "publish_request") { const requests = read("student_requests", []); requests.unshift({ ...pending.pendingRecord, id: createId("request"), user_id: user.id, status: "pending_review", created_at: new Date().toISOString() }); write("student_requests", requests); }
    localStorage.removeItem(storagePrefix + `verification:${token}`);
    return { status: "verified", user, published_intent: pending.intent, demo: true };
  }

  async function track(eventName, properties = {}) {
    const payload = { event_name: eventName, country_code: cfg.countryCode, locale: cfg.locale, path: location.pathname, occurred_at: new Date().toISOString(), properties };
    if (cfg.apiEnabled && cfg.analyticsEnabled) { try { await apiRequest("/events", { method: "POST", body: JSON.stringify(payload) }); } catch (_) {} }
  }

  window.StudentBnBAPI = { apiRequest, beginEmailVerification, confirmEmail, track, read, write };
})();
