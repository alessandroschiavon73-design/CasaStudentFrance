window.STUDENTBNB_CONFIG = {"brandLine":"Base & Belong","countryCode":"FR","countryName":"France","locale":"fr-FR","currency":"EUR","domain":"casastudent.fr","apiBaseUrl":"/api/v1","apiEnabled":false,"analyticsEnabled":false,"routes":{"city":"ville.html","listing":"annonce.html","publish":"publier.html","request":"je-cherche.html","students":"etudiants.html","solidarity":"habitat-solidaire.html","privacy":"confidentialite.html","confirm":"confirmer-email.html"},"networkSites":[{"code":"EU","label":"Europe","flag":"🇪🇺","url":"https://casastudent.eu/"},{"code":"IT","label":"Italia","flag":"🇮🇹","url":"https://casastudent.it/"},{"code":"ES","label":"España","flag":"🇪🇸","url":"https://casastudent.es/"},{"code":"FR","label":"France","flag":"🇫🇷","url":"https://casastudent.fr/"},{"code":"DE","label":"Deutschland","flag":"🇩🇪","url":"https://casastudent.de/"},{"code":"PL","label":"Polska","flag":"🇵🇱","url":"https://casastudent.pl/"}],"ui":{"select":"Sélectionner","allCities":"Toutes les villes","allZones":"Tous les quartiers","login":"Se connecter"}};

(function () {
  const cfg = window.STUDENTBNB_CONFIG;
  const sites = cfg.networkSites;
  const ogImage = `https://${cfg.domain}/assets/img/country-map.webp`;

  function meta(key, value, content) { let element = document.head.querySelector(`meta[${key}="${value}"]`); if (!element) { element = document.createElement("meta"); element.setAttribute(key, value); document.head.appendChild(element); } element.content = content; }
  function link(rel, href, hreflang) { const selector = `link[rel="${rel}"]${hreflang ? `[hreflang="${hreflang}"]` : ""}`; let element = document.head.querySelector(selector); if (!element) { element = document.createElement("link"); element.rel = rel; if (hreflang) element.hreflang = hreflang; document.head.appendChild(element); } element.href = href; }
  function canonicalUrl() { const page = location.pathname.endsWith("/") ? "" : location.pathname.split("/").pop(); const params = new URLSearchParams(location.search); const canonicalParams = new URLSearchParams(); if (page === cfg.routes.city && params.get("city")) canonicalParams.set("city", params.get("city")); if (page === cfg.routes.listing && params.get("id")) canonicalParams.set("id", params.get("id")); const query = canonicalParams.toString(); return `https://${cfg.domain}/${page || ""}${query ? `?${query}` : ""}`; }
  function updateSeo({title = document.title, description} = {}) { const desc = description || document.head.querySelector('meta[name="description"]')?.content || "Logement étudiant en France."; const canonical = canonicalUrl(); link("canonical", canonical); meta("property", "og:title", title); meta("property", "og:description", desc); meta("property", "og:url", canonical); meta("property", "og:image", ogImage); meta("name", "twitter:title", title); meta("name", "twitter:description", desc); meta("name", "twitter:image", ogImage); }
  function addStructuredData() { let script = document.head.querySelector("#studentbnb-website-schema"); if (!script) { script = document.createElement("script"); script.id = "studentbnb-website-schema"; script.type = "application/ld+json"; document.head.appendChild(script); } script.textContent = JSON.stringify({"@context":"https://schema.org","@type":"WebSite",name:"CasaStudent",url:`https://${cfg.domain}/`,inLanguage:cfg.locale}); }
  function applyBranding() { document.title = document.title.replaceAll("CasaStudent", "CasaStudent"); const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let node; while ((node = walker.nextNode())) node.nodeValue = node.nodeValue.replaceAll("CasaStudent", "CasaStudent"); document.querySelectorAll("[aria-label]").forEach(element => element.setAttribute("aria-label", element.getAttribute("aria-label").replaceAll("CasaStudent", "CasaStudent"))); document.querySelectorAll(".brand").forEach(brand => { const labels = [...brand.children].filter(element => element.tagName === "SPAN" && !element.classList.contains("brand-icon")); const label = labels[labels.length - 1]; if (!label) return; const small = label.querySelector("small"); const smallHtml = small ? small.outerHTML : ""; label.innerHTML = `Casa<strong>Student</strong>${smallHtml}`; }); }
  function alignMap() { const map = document.querySelector(".country-market-map"); if (!map) return; map.querySelector(".market-map-top")?.remove(); map.querySelector(".market-map-note")?.remove(); const image = map.querySelector(".market-map-image"); if (image) { image.src = "assets/img/country-map.webp"; image.removeAttribute("srcset"); image.style.display = "block"; image.style.visibility = "visible"; image.style.opacity = "1"; } if (!map.querySelector(".demo-map-notice")) { const notice = document.createElement("p"); notice.className = "demo-map-notice"; notice.textContent = "Aperçu démonstratif : les annonces et profils affichés sont des exemples."; map.appendChild(notice); } }
  function apply() {
    applyBranding();
    document.querySelectorAll(".brand small").forEach(element => { element.textContent = "Base & Belong"; element.style.fontStyle = "italic"; });
    const fp = document.querySelector(".site-footer .footer-grid>div:first-child p");
    if (fp) fp.textContent = "CasaStudent est dédié au logement étudiant de moyenne et longue durée : plusieurs mois, un semestre ou une année universitaire. Il n'est pas conçu pour les courts séjours touristiques.";
    meta("name", "robots", "index,follow,max-image-preview:large"); meta("property", "og:site_name", "CasaStudent — Base & Belong"); meta("property", "og:type", "website"); meta("name", "twitter:card", "summary_large_image"); updateSeo(); addStructuredData();
    const page = location.pathname.endsWith("/") ? "" : location.pathname.split("/").pop(); if (!page || page === "index.html") sites.forEach(site => link("alternate", site.url, site.code.toLowerCase()));
    const box = document.querySelector(".footer-international .footer-country-links"); if (box) box.innerHTML = sites.map(site => `<a href="${site.url}"${site.code === cfg.countryCode ? ' aria-current="page"' : ''}><span aria-hidden="true">${site.flag}</span> ${site.label}</a>`).join("");
    alignMap();
  }
  window.StudentBnBSEO = { update: updateSeo };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
})();
(function () { if (document.querySelector("script[data-studentbnb-analytics]")) return; const script = document.createElement("script"); script.src = "assets/js/analytics.js?v=20260824"; script.defer = true; script.dataset.studentbnbAnalytics = "1"; document.head.appendChild(script); })();

(function () {
  const cfg = window.STUDENTBNB_CONFIG || {};
  const casaStudentSites = [
    { code: "EU", label: "Europe", flag: "🇪🇺", url: "https://casastudent.eu/" },
    { code: "IT", label: "Italia", flag: "🇮🇹", url: "https://casastudent.it/" },
    { code: "ES", label: "España", flag: "🇪🇸", url: "https://casastudent.es/" },
    { code: "FR", label: "France", flag: "🇫🇷", url: "https://casastudent.fr/" },
    { code: "DE", label: "Deutschland", flag: "🇩🇪", url: "https://casastudent.de/" },
    { code: "PL", label: "Polska", flag: "🇵🇱", url: "https://casastudent.pl/" }
  ];
  const studentBnBSites = [
    { code: "IT", label: "Italia", flag: "🇮🇹", url: "https://studentbnb.it/" },
    { code: "ES", label: "España", flag: "🇪🇸", url: "https://studentbnb.es/" },
    { code: "FR", label: "France", flag: "🇫🇷", url: "https://studentbnb.fr/" },
    { code: "DE", label: "Deutschland", flag: "🇩🇪", url: "https://student-bnb.de/" },
    { code: "PL", label: "Polska", flag: "🇵🇱", url: "https://studentbnb.pl/" },
    { code: "PT", label: "Portugal", flag: "🇵🇹", url: "https://studentbnb.pt/" }
  ];
  const headings = {
    it: ["Portali CasaStudent", "Portali StudentBnB"],
    es: ["Portales CasaStudent", "Portales StudentBnB"],
    fr: ["Portails CasaStudent", "Portails StudentBnB"],
    de: ["CasaStudent-Portale", "StudentBnB-Portale"],
    pl: ["Portale CasaStudent", "Portale StudentBnB"],
    pt: ["Portais CasaStudent", "Portais StudentBnB"],
    en: ["CasaStudent portals", "StudentBnB portals"]
  };

  function currentFamily() {
    const identity = `${cfg.appName || ""} ${cfg.domain || ""}`.toLowerCase();
    return identity.includes("studentbnb") || identity.includes("student-bnb.de") ? "studentbnb" : "casastudent";
  }

  function removeHeaderFaqAndContacts() {
    document.querySelectorAll(".main-nav a").forEach((link) => {
      const href = (link.getAttribute("href") || "").toLowerCase();
      if (/#(?:faq|contact|contacts|contatti|contatto|contacto)$/.test(href)) link.remove();
    });
  }

  function links(sites, family) {
    const activeFamily = currentFamily();
    return sites.map((site) => {
      const active = family === activeFamily && site.code === (cfg.countryCode || "EU");
      return `<a class="portal-country-link${active ? " is-current" : ""}" href="${site.url}"${active ? ' aria-current="page"' : ""}><span class="portal-country-flag" aria-hidden="true">${site.flag}</span><span>${site.label}</span><span class="network-open" aria-hidden="true">${active ? "✓" : "↗"}</span></a>`;
    }).join("");
  }

  function renderDualFooter() {
    const footer = document.querySelector(".footer-international");
    if (!footer) return;
    const language = (document.documentElement.lang || cfg.locale || "en").slice(0, 2).toLowerCase();
    const labels = headings[language] || headings.en;
    footer.classList.add("dual-portal-footer");
    footer.innerHTML = `
      <section class="portal-family" aria-labelledby="casastudent-network-title">
        <strong class="portal-family-title" id="casastudent-network-title">${labels[0]}</strong>
        <nav class="footer-country-links portal-country-links" aria-label="${labels[0]}">${links(casaStudentSites, "casastudent")}</nav>
      </section>
      <section class="portal-family" aria-labelledby="studentbnb-network-title">
        <strong class="portal-family-title" id="studentbnb-network-title">${labels[1]}</strong>
        <nav class="footer-country-links portal-country-links" aria-label="${labels[1]}">${links(studentBnBSites, "studentbnb")}</nav>
      </section>`;
  }

  function installStyles() {
    if (document.getElementById("dual-portal-footer-style")) return;
    const style = document.createElement("style");
    style.id = "dual-portal-footer-style";
    style.textContent = `
      .footer-international.dual-portal-footer{display:grid!important;gap:18px!important;align-items:stretch!important}
      .dual-portal-footer .portal-family{display:grid;grid-template-columns:minmax(150px,.3fr) minmax(0,1fr);gap:14px 20px;align-items:start}
      .dual-portal-footer .portal-family+.portal-family{padding-top:18px;border-top:1px solid rgba(255,255,255,.18)}
      .dual-portal-footer .portal-family-title{display:block;line-height:1.35;padding-top:9px}
      .dual-portal-footer .portal-country-links{display:flex!important;flex-wrap:wrap!important;gap:9px!important;margin:0!important}
      .dual-portal-footer .portal-country-link{display:inline-flex!important;align-items:center!important;gap:7px!important;min-height:40px;padding:8px 11px!important;border-radius:10px;text-decoration:none}
      .dual-portal-footer .portal-country-link.is-current{font-weight:800;box-shadow:inset 0 0 0 2px currentColor}
      .dual-portal-footer .portal-country-flag{font-size:20px;line-height:1}
      .dual-portal-footer .network-open{margin-left:auto;opacity:.72}
      @media(max-width:720px){
        .dual-portal-footer .portal-family{grid-template-columns:1fr;gap:8px}
        .dual-portal-footer .portal-family-title{padding-top:0}
        .dual-portal-footer .portal-country-links{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));width:100%}
        .dual-portal-footer .portal-country-link{width:100%;min-width:0}
      }
      @media(max-width:380px){.dual-portal-footer .portal-country-links{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function applyPortalNavigation() {
    removeHeaderFaqAndContacts();
    installStyles();
    renderDualFooter();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyPortalNavigation);
  else applyPortalNavigation();
})();
