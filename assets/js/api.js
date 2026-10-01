(function () {
  "use strict";
  const cfg = window.STUDENTBNB_CONFIG || {};
  const prefix = `studentbnb:${cfg.countryCode}:`;
  const SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  let clientPromise;

  function read(key, fallback = null) {
    try { const v = localStorage.getItem(prefix + key); return v ? JSON.parse(v) : fallback; }
    catch (_) { return fallback; }
  }
  function write(key, value) { localStorage.setItem(prefix + key, JSON.stringify(value)); }

  function loadSdk() {
    if (window.supabase?.createClient) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const old = document.querySelector('script[data-casastudent-supabase-sdk]');
      if (old) { old.addEventListener("load", resolve, {once:true}); old.addEventListener("error", reject, {once:true}); return; }
      const s = document.createElement("script");
      s.src = SDK_URL; s.async = true; s.dataset.casastudentSupabaseSdk = "1";
      s.onload = resolve; s.onerror = () => reject(new Error("supabase_sdk_load_failed"));
      document.head.appendChild(s);
    });
  }

  async function getClient() {
    if (!clientPromise) clientPromise = (async () => {
      await loadSdk();
      const c = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      window.StudentBnBSupabase = c;
      return c;
    })();
    return clientPromise;
  }

  function cleanPublicRecord(record) {
    const copy = {...(record || {})};
    ["email","phone","whatsapp","telegram","contact_email","contact_phone","contact_whatsapp","contact_telegram"].forEach(k => delete copy[k]);
    return copy;
  }
  function parseLegacy(text) {
    if (!text) return {};
    try { const p = JSON.parse(text); return p?.casastudentLegacy && p.payload ? p.payload : {}; }
    catch (_) { return {}; }
  }
  function listingType(value) {
    const v = String(value || "").toLowerCase();
    if (/bed|posto letto|lit|bett|łóż|lozko|cama/.test(v)) return "bed";
    if (/room|stanza|chambre|zimmer|pok[oó]j|quarto/.test(v)) return "room";
    if (/studio|monolocale/.test(v)) return "studio";
    if (/apartment|appart|wohnung|mieszkanie|apartamento/.test(v)) return "apartment";
    return "other";
  }
  function citySlugFromRecord(record) {
    const id = String(record?.city_id || "");
    const cities = window.STUDENTBNB_DATA?.cities || [];
    const c = cities.find(x => String(x.id) === id || x.slug === id || x.name === id);
    if (c?.slug) return c.slug;
    return id.replace(new RegExp("^" + String(cfg.countryCode || "").toLowerCase() + "-"), "");
  }
  async function resolveCityId(c, record) {
    const slug = citySlugFromRecord(record);
    const {data, error} = await c.from("cities").select("id,slug").eq("country_code", cfg.countryCode).eq("slug", slug).single();
    if (error) throw error;
    return data.id;
  }
  async function getSession(c) {
    const {data} = await c.auth.getSession();
    if (data?.session) return data.session;
    const code = new URLSearchParams(location.search).get("code");
    if (code) {
      const exchanged = await c.auth.exchangeCodeForSession(code);
      if (exchanged.error) throw exchanged.error;
      return exchanged.data.session;
    }
    return null;
  }

  async function beginEmailVerification(email, intent, pendingRecord) {
    const c = await getClient();
    const pending = {email, intent, pendingRecord, createdAt:new Date().toISOString()};
    write("pending_verification", pending);
    const redirect = new URL(cfg.routes?.confirm || "index.html", location.href);
    redirect.searchParams.set("token","supabase");
    const {error} = await c.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirect.toString(), shouldCreateUser: true }
    });
    if (error) throw error;
    return {status:"pending", demo:false};
  }

  async function publishPending(c, session, pending) {
    if (!pending?.intent || !pending?.pendingRecord) return null;
    const r = pending.pendingRecord;
    const city_id = await resolveCityId(c, r);
    if (pending.intent === "publish_listing") {
      const payload = {
        country_code: cfg.countryCode,
        city_id, district_id: null,
        publisher_user_id: session.user.id,
        title: r.title || [r.type, r.zone, citySlugFromRecord(r)].filter(Boolean).join(" · "),
        description: JSON.stringify({casastudentLegacy:1,payload:cleanPublicRecord(r)}),
        listing_type: listingType(r.type),
        arrangement: r.arrangement || null,
        price: Number(r.price || 0),
        currency: cfg.currency || "EUR",
        expenses_included: /^(1|true|yes|si|sì|oui|ja|tak)$/i.test(String(r.expenses_included || r.expensesIncluded || "")),
        expenses_amount: r.expenses_amount ? Number(r.expenses_amount) : null,
        deposit: r.deposit ? Number(r.deposit) : null,
        available_from: r.available_from || r.availableFrom || null,
        available_to: r.available_to || r.availableTo || null,
        minimum_stay_months: r.minimum_stay_months ? Number(r.minimum_stay_months) : null,
        contact_name: r.name || r.contact_name || null,
        contact_phone: r.phone || r.contact_phone || null,
        contact_email: r.email || session.user.email || null,
        contact_whatsapp: r.whatsapp || null,
        contact_telegram: r.telegram || null,
        status: "published",
        published_at: new Date().toISOString()
      };
      const {error} = await c.from("listings").insert(payload);
      if (error) throw error;
      return "publish_listing";
    }
    if (pending.intent === "publish_request") {
      const payload = {
        country_code: cfg.countryCode,
        city_id, district_id: null,
        user_id: session.user.id,
        title: r.title || `${r.name || "Student"} · ${r.type || "housing"}`,
        description: JSON.stringify({casastudentLegacy:1,payload:cleanPublicRecord(r)}),
        accommodation_type: r.type || null,
        budget_max: r.budget_max != null ? Number(r.budget_max) : (r.budget != null ? Number(r.budget) : null),
        currency: cfg.currency || "EUR",
        available_from: r.available_from || r.availableFrom || null,
        available_to: r.available_to || r.availableTo || null,
        contact_phone: r.phone || r.contact_phone || null,
        contact_email: r.email || session.user.email || null,
        contact_whatsapp: r.whatsapp || null,
        contact_telegram: r.telegram || null,
        status: "published",
        published_at: new Date().toISOString()
      };
      const {error} = await c.from("student_requests").insert(payload);
      if (error) throw error;
      return "publish_request";
    }
    return null;
  }

  async function confirmEmail() {
    const c = await getClient();
    const session = await getSession(c);
    if (!session?.user) throw new Error("no_session");
    const user = {id:session.user.id,email:session.user.email,email_verified_at:new Date().toISOString(),country_code:cfg.countryCode};
    write("user", user);
    const pending = read("pending_verification");
    const published_intent = await publishPending(c, session, pending);
    localStorage.removeItem(prefix + "pending_verification");
    await syncRemote(true);
    return {status:"verified",user,published_intent,demo:false};
  }

  async function syncRemote(reload=false) {
    const c = await getClient();
    const [cr, lr, rr] = await Promise.all([
      c.from("cities").select("id,slug,name").eq("country_code",cfg.countryCode).eq("active",true),
      c.from("public_listings").select("*").eq("country_code",cfg.countryCode).eq("status","published").order("created_at",{ascending:false}),
      c.from("public_student_requests").select("*").eq("country_code",cfg.countryCode).eq("status","published").order("created_at",{ascending:false})
    ]);
    if (cr.error) throw cr.error;
    if (lr.error) throw lr.error;
    if (rr.error) throw rr.error;
    const localCities = window.STUDENTBNB_DATA?.cities || [];
    const cityByDbId = new Map((cr.data || []).map(dbCity => {
      const local = localCities.find(city => city.slug === dbCity.slug);
      return [dbCity.id, local || {id:dbCity.slug,slug:dbCity.slug,name:dbCity.name}];
    }));
    const listings=(lr.data||[]).map(row=>{
      const legacy=parseLegacy(row.description);
      const city=cityByDbId.get(row.city_id);
      return {...legacy,id:row.id,country_code:row.country_code,city_id:city?.id || legacy.city_id || row.city_id,city_slug:city?.slug || legacy.city_slug || legacy.citySlug,price:Number(row.price||0),currency:row.currency,status:row.status,is_demo:false,_remote:true};
    });
    const requests=(rr.data||[]).map(row=>{
      const legacy=parseLegacy(row.description);
      const city=cityByDbId.get(row.city_id);
      return {...legacy,id:row.id,country_code:row.country_code,city_id:city?.id || legacy.city_id || row.city_id,city_slug:city?.slug || legacy.city_slug || legacy.citySlug,budget_max:Number(row.budget_max||0),currency:row.currency,status:row.status,is_demo:false,_remote:true};
    });
    const before=JSON.stringify([read("listings",[]),read("student_requests",[])]);
    write("listings",listings); write("student_requests",requests);
    const after=JSON.stringify([listings,requests]);
    if(reload && before!==after && !sessionStorage.getItem("casastudent_remote_synced")){
      sessionStorage.setItem("casastudent_remote_synced","1");
      if(document.querySelector("#listing-results,#student-results,[data-listing-results]")) location.reload();
    }
  }

  async function track(eventName, properties={}) {
    try {
      const c=await getClient();
      await c.from("analytics_events").insert({
        country_code:cfg.countryCode,event_name:eventName,path:location.pathname,
        anonymous_session_id: sessionStorage.getItem("casastudent_session_id") || null,
        properties_json:properties,occurred_at:new Date().toISOString()
      });
    } catch (_) {}
  }

  getClient().then(async c => {
    const session=await getSession(c).catch(()=>null);
    if(session?.user) write("user",{id:session.user.id,email:session.user.email,email_verified_at:new Date().toISOString(),country_code:cfg.countryCode});
    await syncRemote(true).catch(console.warn);
    document.documentElement.dataset.casastudentDatabase="connected";
  }).catch(()=>{document.documentElement.dataset.casastudentDatabase="error";});

  window.StudentBnBAPI={beginEmailVerification,confirmEmail,track,read,write,syncRemote};
})();