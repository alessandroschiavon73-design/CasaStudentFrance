(function () {
  if (window.__CASASTUDENT_REPRESENTATIVE_PHOTOS__) return;
  window.__CASASTUDENT_REPRESENTATIVE_PHOTOS__ = true;

  const cfg = window.STUDENTBNB_CONFIG || {};
  const locale = (cfg.locale || document.documentElement.lang || "en").split("-")[0];
  const apiLanguage = ["de", "fr", "pl", "es", "it"].includes(locale) ? locale : "en";
  const cache = new Map();

  function cityNameFromSlug(slug) {
    const cities = window.STUDENTBNB_DATA?.cities || window.STUDENTBNB_CITIES || [];
    const match = cities.find((city) => [city.slug, city.id, city.key].includes(slug));
    return match?.name || decodeURIComponent(slug || "").replace(/[-_]+/g, " ");
  }

  async function representativePhoto(city, size) {
    const key = `${city}:${size}`;
    if (cache.has(key)) return cache.get(key);
    const promise = (async () => {
      const query = `${city} ${cfg.countryName || ""}`.trim();
      const endpoint = `https://${apiLanguage}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=5&prop=pageimages&pithumbsize=${size}&piprop=thumbnail&format=json&origin=*`;
      const response = await fetch(endpoint, { mode: "cors" });
      if (!response.ok) return null;
      const data = await response.json();
      const pages = Object.values(data.query?.pages || {});
      const needle = city.toLocaleLowerCase(locale);
      const page = pages.find((item) => item.thumbnail?.source && item.title?.toLocaleLowerCase(locale) === needle)
        || pages.find((item) => item.thumbnail?.source && item.title?.toLocaleLowerCase(locale).includes(needle))
        || pages.find((item) => item.thumbnail?.source);
      return page?.thumbnail?.source || null;
    })().catch(() => null);
    cache.set(key, promise);
    return promise;
  }

  async function enhanceCard(card) {
    if (!card || card.dataset.csRepresentativePhoto) return;
    const name = card.querySelector(".cs-city-card-copy strong, strong")?.textContent?.trim()
      || cityNameFromSlug(new URL(card.href, location.href).searchParams.get("city"));
    if (!name) return;
    card.dataset.csRepresentativePhoto = "loading";
    const source = await representativePhoto(name, 720);
    if (!source) {
      card.dataset.csRepresentativePhoto = "fallback";
      return;
    }
    let image = card.querySelector(".city-photo img, .cs-city-media, img");
    if (!image) {
      image = document.createElement("img");
      image.className = "cs-city-media";
      card.prepend(image);
    }
    const current = image.getAttribute("src") || "";
    if (!current || /room-|data:image\/svg/i.test(current)) image.src = source;
    image.alt = `${name}, ${cfg.countryName || ""}`.replace(/, $/, "");
    image.loading = "lazy";
    image.decoding = "async";
    card.dataset.csRepresentativePhoto = "ready";
  }

  async function enhanceHero() {
    const hero = document.querySelector(".city-hero");
    if (!hero || hero.dataset.csRepresentativePhoto) return;
    const slug = new URLSearchParams(location.search).get("city");
    if (!slug) return;
    hero.dataset.csRepresentativePhoto = "loading";
    const name = cityNameFromSlug(slug);
    const source = await representativePhoto(name, 1400);
    if (!source) {
      hero.dataset.csRepresentativePhoto = "fallback";
      return;
    }
    const background = hero.querySelector(".city-hero-bg");
    if (background) background.style.backgroundImage = `url("${source}")`;
    else hero.style.backgroundImage = `url("${source}")`;
    hero.dataset.csRepresentativePhoto = "ready";
  }

  function run() {
    document.querySelectorAll(".city-card, #city-cards a[href], .country-column a[href*='city=']").forEach(enhanceCard);
    enhanceHero();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
  setTimeout(run, 700);
  new MutationObserver(() => requestAnimationFrame(run)).observe(document.documentElement, { childList: true, subtree: true });
})();

