(function () {
  "use strict";

  const cfg = window.STUDENTBNB_CONFIG;
  const data = window.STUDENTBNB_DATA;
  const api = window.StudentBnBAPI;
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const text = (key, fallback = "") => (cfg.ui && cfg.ui[key]) || fallback || key;

  function toast(message) {
    const node = q("#toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(window.__studentbnbToast);
    window.__studentbnbToast = setTimeout(() => node.classList.remove("show"), 3200);
  }

  function formatMoney(value) {
    return new Intl.NumberFormat(cfg.locale, { style: "currency", currency: cfg.currency, maximumFractionDigits: 0 }).format(Number(value || 0));
  }

  function cityById(id) {
    return data.cities.find((city) => city.id === id || city.slug === id) || data.cities[0];
  }

  function cityLink(city) {
    return `${cfg.routes.city}?city=${encodeURIComponent(city.slug)}`;
  }

  function populateCities(select, includeAll = false) {
    if (!select) return;
    const current = select.value;
    select.innerHTML = includeAll ? `<option value="">${text("allCities")}</option>` : `<option value="">${text("select")}</option>`;
    data.cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city.id;
      option.textContent = city.name;
      select.appendChild(option);
    });
    if (current) select.value = current;
  }

  function populateDistricts(citySelect, districtSelect, includeAll = false) {
    if (!citySelect || !districtSelect) return;
    const city = cityById(citySelect.value);
    districtSelect.innerHTML = includeAll ? `<option value="">${text("allZones")}</option>` : `<option value="">${text("select")}</option>`;
    (city.districts || []).forEach((district) => {
      const option = document.createElement("option");
      option.value = district.slug;
      option.textContent = district.name;
      districtSelect.appendChild(option);
    });
  }

  function initMenu() {
    const button = q(".menu-button");
    const nav = q(".main-nav");
    if (!button || !nav) return;
    button.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function initNetwork() {
    qa("[data-network]").forEach((container) => {
      container.innerHTML = "";
      cfg.networkSites.forEach((site) => {
        const a = document.createElement("a");
        const flagCode = String(site.code || "").toLowerCase();
        a.innerHTML = `<img class="network-flag" src="assets/img/flag-${flagCode}.svg" alt=""><span>${site.label}</span><span class="network-open" aria-hidden="true">↗</span>`;
        if (site.code === cfg.countryCode) {
          a.href = "index.html";
          a.setAttribute("aria-current", "page");
          a.classList.add("network-current");
          const openMark = q(".network-open", a);
          if (openMark) openMark.textContent = "✓";
        } else if (site.url) {
          a.href = site.url;
          a.target = "_blank";
          a.rel = "noopener";
        } else {
          a.href = "#";
          a.className = "network-placeholder";
          a.setAttribute("aria-disabled", "true");
          a.title = text("domainPending");
          a.addEventListener("click", (event) => event.preventDefault());
        }
        container.appendChild(a);
      });
    });
  }

  function initAccount() {
    const modal = q("#login-modal");
    const form = q("#login-form");
    const user = api.read("user");
    qa("[data-account-label]").forEach((node) => {
      node.textContent = user && user.email_verified_at ? user.email.split("@")[0] : text("login");
    });
    qa("[data-login]").forEach((link) => link.addEventListener("click", (event) => {
      event.preventDefault();
      if (modal) modal.classList.add("active");
    }));
    qa("[data-close-modal]").forEach((button) => button.addEventListener("click", () => modal && modal.classList.remove("active")));
    if (modal) modal.addEventListener("click", (event) => { if (event.target === modal) modal.classList.remove("active"); });
    if (form) form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = new FormData(form).get("email");
      try {
        const result = await api.beginEmailVerification(email, "login", null);
        modal.classList.remove("active");
        if (result.demo) {
          location.href = `${cfg.routes.confirm}?token=${encodeURIComponent(result.token)}`;
        } else {
          toast(text("checkEmail"));
        }
      } catch (_) {
        toast(text("genericError"));
      }
    });
  }

  function initHome() {
    const form = q("#home-search");
    if (!form) return;
    populateCities(q("#home-city"));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const city = cityById(q("#home-city").value);
      const typeValue = q("#home-type") ? q("#home-type").value : "";
      const params = new URLSearchParams({ city: city.slug });
      if (typeValue) params.set("type", typeValue);
      api.track("search_submitted", { city_id: city.id, type: typeValue });
      location.href = `${cfg.routes.city}?${params.toString()}`;
    });
  }

  function listingCard(record) {
    const city = cityById(record.city_id);
    const article = document.createElement("article");
    article.className = "listing-card";
    article.dataset.city = record.city_id;
    article.dataset.type = record.type;
    article.dataset.price = record.price;
    article.innerHTML = `
      <a href="${cfg.routes.listing}?id=${encodeURIComponent(record.id)}"><img class="listing-image" src="${record.image}" alt="${record.title}"></a>
      <div class="listing-main"><div class="listing-title-row"><h3><a href="${cfg.routes.listing}?id=${encodeURIComponent(record.id)}">${record.title}</a></h3><span class="verification-badge">✓ ${text("verifiedEmail")}</span></div><div class="listing-meta"><span>⌖ ${city.name} · ${record.district_name}</span><span>▣ ${record.available_from}</span></div><div class="listing-submeta"><span>${record.arrangement}</span><span>${record.minimum_stay}</span></div></div>
      <div class="listing-price"><div class="price">${formatMoney(record.price)} <small>/${text("monthShort")}</small></div><span class="expenses-badge ${record.expenses_included ? "included" : "excluded"}">${record.expenses_included ? text("expensesIncluded") : text("expensesExcluded")}</span></div>
      <div class="listing-actions"><button class="favorite-button" type="button" aria-label="${text("favorite")}">♡</button></div>`;
    q(".favorite-button", article).addEventListener("click", (event) => {
      const button = event.currentTarget;
      button.classList.toggle("active");
      button.textContent = button.classList.contains("active") ? "♥" : "♡";
    });
    return article;
  }

  function initCityPage() {
    const list = q("#listing-results");
    if (!list) return;
    const params = new URLSearchParams(location.search);
    const selectedCity = cityById(params.get("city"));
    const citySelect = q("#filter-city");
    const zoneSelect = q("#filter-zone");
    populateCities(citySelect, true);
    citySelect.value = selectedCity.id;
    populateDistricts(citySelect, zoneSelect, true);
    q("#city-name").textContent = selectedCity.name;
    q("#city-region").textContent = selectedCity.region;
    q("#city-description").textContent = selectedCity.description;
    const hero = q("#city-hero-bg");
    if (hero) hero.style.backgroundImage = `url('${selectedCity.image}')`;
    if (params.get("type") && q("#filter-type")) q("#filter-type").value = params.get("type");

    function render() {
      const cityId = citySelect.value;
      const zone = zoneSelect.value;
      const typeValue = q("#filter-type").value;
      const maxPrice = Number(q("#filter-price").value || Infinity);
      const records = [...data.listings, ...api.read("listings", [])].filter((record) =>
        (!cityId || record.city_id === cityId) && (!zone || record.district_id === zone) && (!typeValue || record.type === typeValue) && Number(record.price) <= maxPrice
      );
      list.innerHTML = "";
      records.forEach((record) => list.appendChild(listingCard(record)));
      q("#result-count").textContent = records.length ? `${records.length} ${text("offersFound")}` : text("noOffers");
      if (!records.length) list.innerHTML = `<div class="empty-state"><h2>${text("noOffers")}</h2><p>${text("noOffersHelp")}</p><div class="empty-actions"><a class="btn btn-yellow" href="${cfg.routes.request}">${text("publishRequest")}</a></div></div>`;
    }
    citySelect.addEventListener("change", () => { populateDistricts(citySelect, zoneSelect, true); render(); });
    [zoneSelect, q("#filter-type"), q("#filter-price")].forEach((node) => node && node.addEventListener("change", render));
    render();
  }

  function initListing() {
    if (!q("#listing-detail")) return;
    const id = new URLSearchParams(location.search).get("id");
    const record = [...data.listings, ...api.read("listings", [])].find((item) => item.id === id) || data.listings[0];
    const city = cityById(record.city_id);
    q("#listing-title").textContent = record.title;
    q("#listing-place").textContent = `${city.name} · ${record.district_name}`;
    q("#listing-price").textContent = formatMoney(record.price);
    q("#listing-description").textContent = record.description;
    q("#listing-costs").textContent = record.expenses_included ? text("expensesIncludedLong") : `${text("expensesExcludedLong")} ${formatMoney(record.expenses_amount || 0)}`;
    q("#listing-availability").textContent = record.available_from;
    q("#listing-minimum").textContent = record.minimum_stay;
    q("#listing-deposit").textContent = formatMoney(record.deposit || 0);
    q("#listing-main-image").src = record.image;
    qa("[data-gallery-image]").forEach((img, index) => { img.src = record.images[index % record.images.length]; });
    q("#contact-owner").addEventListener("click", () => {
      const user = api.read("user");
      if (!user || !user.email_verified_at) {
        q("[data-login]").click();
        return;
      }
      toast(text("contactProtected"));
      api.track("owner_contact_requested", { listing_id: record.id });
    });
  }

  function formRecord(form) {
    const raw = Object.fromEntries(new FormData(form).entries());
    return {
      ...raw,
      country_code: cfg.countryCode,
      city_id: raw.city,
      district_id: raw.zone || null,
      price: raw.price ? Number(raw.price) : undefined,
      budget_max: raw.budget ? Number(raw.budget) : undefined,
      currency: cfg.currency,
      source_domain: cfg.domain,
    };
  }

  async function submitVerifiedForm(form, intent, panel) {
    if (!form.reportValidity()) return;
    const record = formRecord(form);
    const email = record.email;
    try {
      const result = await api.beginEmailVerification(email, intent, record);
      panel.classList.add("active");
      q("[data-verification-message]", panel).textContent = result.demo ? text("demoVerification") : text("checkEmail");
      const demoLink = q("[data-demo-confirm]", panel);
      if (result.demo && demoLink) {
        demoLink.href = `${cfg.routes.confirm}?token=${encodeURIComponent(result.token)}`;
        demoLink.hidden = false;
      }
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
      api.track("email_verification_started", { intent });
    } catch (_) {
      toast(text("genericError"));
    }
  }

  function initPublishForm() {
    const form = q("#publish-form");
    if (!form) return;
    const citySelect = q("#city");
    const zoneSelect = q("#zone");
    populateCities(citySelect);
    citySelect.addEventListener("change", () => populateDistricts(citySelect, zoneSelect));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitVerifiedForm(form, "publish_listing", q("#verification-panel"));
    });
  }

  function initRequestForm() {
    const form = q("#student-request-form");
    if (!form) return;
    populateCities(q("#request-city"));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitVerifiedForm(form, "publish_request", q("#verification-panel"));
    });
  }

  function initStudents() {
    const container = q("#student-results");
    if (!container) return;
    const citySelect = q("#student-filter-city");
    populateCities(citySelect, true);
    function render() {
      const cityId = citySelect.value;
      const records = [...data.studentRequests, ...api.read("student_requests", [])].filter((record) => !cityId || record.city_id === cityId);
      container.innerHTML = "";
      records.forEach((record) => {
        const city = cityById(record.city_id);
        const card = document.createElement("article");
        card.className = "simple-student-card";
        card.innerHTML = `<div class="student-card-top"><div style="display:flex;align-items:center;gap:12px"><span class="student-initial">${record.name.charAt(0)}</span><div><h2>${record.name}</h2><small>${city.name} · ${record.course}</small></div></div><span class="student-budget">≤ ${formatMoney(record.budget_max)}</span></div><div class="record-meta"><span>${record.type}</span><span>${record.available_from}</span><span>${record.languages}</span></div><p>${record.bio}</p><button class="btn btn-white" type="button" data-student-contact>${text("contactStudent")}</button>`;
        q("[data-student-contact]", card).addEventListener("click", () => {
          const user = api.read("user");
          if (!user || !user.email_verified_at) q("[data-login]").click(); else toast(text("contactProtected"));
        });
        container.appendChild(card);
      });
      q("#student-result-count").textContent = `${records.length} ${text("profilesFound")}`;
    }
    citySelect.addEventListener("change", render);
    render();
  }

  async function initConfirm() {
    const status = q("#confirmation-status");
    if (!status) return;
    const token = new URLSearchParams(location.search).get("token");
    if (!token) {
      q("#confirmation-title").textContent = text("invalidLinkTitle");
      q("#confirmation-message").textContent = text("invalidLinkMessage");
      return;
    }
    try {
      const result = await api.confirmEmail(token);
      q("#confirmation-icon").textContent = "✓";
      q("#confirmation-title").textContent = text("emailConfirmedTitle");
      q("#confirmation-message").textContent = result.published_intent ? text("emailConfirmedPublished") : text("emailConfirmedLogin");
      api.track("email_verified", { intent: result.published_intent || "login" });
    } catch (_) {
      q("#confirmation-icon").textContent = "!";
      q("#confirmation-title").textContent = text("invalidLinkTitle");
      q("#confirmation-message").textContent = text("invalidLinkMessage");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    initNetwork();
    initAccount();
    initHome();
    initCityPage();
    initListing();
    initPublishForm();
    initRequestForm();
    initStudents();
    initConfirm();
    api.track("page_view");
  });
})();
