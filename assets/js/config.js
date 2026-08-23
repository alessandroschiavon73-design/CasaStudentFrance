window.STUDENTBNB_CONFIG = {
  brandLine: "Base & Belong",
  countryCode: "FR", countryName: "France", locale: "fr-FR", currency: "EUR", domain: "studentbnb.fr",
  apiBaseUrl: "/api/v1", apiEnabled: false, analyticsEnabled: false,
  routes: { city:"ville.html", listing:"annonce.html", publish:"publier.html", request:"je-cherche.html", students:"etudiants.html", solidarity:"habitat-solidaire.html", privacy:"confidentialite.html", confirm:"confirmer-email.html" },
  networkSites: [
    {code:"IT",label:"Italia",flag:"🇮🇹",url:"https://studentbnb.it/"},
    {code:"ES",label:"España",flag:"🇪🇸",url:"https://studentbnb.es/"},
    {code:"PT",label:"Portugal",flag:"🇵🇹",url:"https://studentbnb.pt/"},
    {code:"FR",label:"France",flag:"🇫🇷",url:"https://studentbnb.fr/"},
    {code:"DE",label:"Deutschland",flag:"🇩🇪",url:"https://student-bnb.de/"},
    {code:"PL",label:"Polska",flag:"🇵🇱",url:"https://studentbnb.pl/"}
  ],
  ui: {
    select:"Sélectionner", allCities:"Toutes les villes", allZones:"Tous les quartiers", domainPending:"Domaine allemand à définir",
    checkEmail:"Consultez votre email pour terminer la vérification.", demoVerification:"Mode démonstration : utilisez le bouton ci-dessous pour simuler le lien reçu par email.", genericError:"L'opération n'a pas pu être terminée.", login:"Se connecter", verifiedEmail:"Email vérifié", monthShort:"mois", expensesIncluded:"Charges comprises", expensesExcluded:"Charges en plus", expensesIncludedLong:"Charges comprises dans le loyer.", expensesExcludedLong:"Charges estimées en supplément :", favorite:"Ajouter aux favoris", offersFound:"offres trouvées", noOffers:"Aucune offre compatible pour le moment", noOffersHelp:"Publiez votre recherche pour être contacté par des propriétaires.", publishRequest:"Publier ma recherche", contactProtected:"Demande enregistrée. Les contacts sont protégés pour les utilisateurs vérifiés.", contactStudent:"Contacter l'étudiant", profilesFound:"profils trouvés", invalidLinkTitle:"Lien invalide ou expiré", invalidLinkMessage:"Demandez un nouveau lien de vérification puis réessayez.", emailConfirmedTitle:"Email confirmé", emailConfirmedPublished:"L'élément a été enregistré et attend la modération avant publication.", emailConfirmedLogin:"Le compte est vérifié sur cet appareil."
  }
};

(function(){
 const cfg=window.STUDENTBNB_CONFIG, sites=cfg.networkSites;
 function meta(k,v,c){let e=document.head.querySelector(`meta[${k}="${v}"]`);if(!e){e=document.createElement("meta");e.setAttribute(k,v);document.head.appendChild(e)}e.content=c}
 function link(rel,href,lang){let s=`link[rel="${rel}"]${lang?`[hreflang="${lang}"]`:""}`,e=document.head.querySelector(s);if(!e){e=document.createElement("link");e.rel=rel;if(lang)e.hreflang=lang;document.head.appendChild(e)}e.href=href}
 function apply(){
  document.querySelectorAll(".brand small").forEach(e=>{e.textContent="Base & Belong";e.style.fontStyle="italic"});
  const p=location.pathname.endsWith("/")?"":location.pathname.split("/").pop(), u=`https://${cfg.domain}/${p||""}`; link("canonical",u); meta("name","robots","index,follow,max-image-preview:large"); meta("property","og:site_name","StudentBnB — Base & Belong"); meta("property","og:title",document.title); meta("property","og:description",document.head.querySelector('meta[name="description"]')?.content||"Logement étudiant en Europe."); meta("property","og:url",u); meta("name","twitter:card","summary_large_image");
  if(!p||p==="index.html"){sites.forEach(s=>link("alternate",s.url,s.code.toLowerCase()));link("alternate","https://studentbnb.eu/","x-default")}
  const b=document.querySelector(".footer-international .footer-country-links");if(b)b.innerHTML=sites.map(s=>`<a href="${s.url}"${s.code===cfg.countryCode?' aria-current="page"':' target="_blank" rel="noopener"'}><span aria-hidden="true">${s.flag}</span> ${s.label}</a>`).join("")+'<a href="https://studentbnb.eu/" target="_blank" rel="noopener">🇪🇺 Europe</a>';
  const i=document.querySelector(".footer-international");if(i&&!i.querySelector(".europe-contact")){const x=document.createElement("p");x.className="europe-contact";x.innerHTML='<a href="mailto:contact@studentbnb.eu">contact@studentbnb.eu</a> · <em>Base & Belong</em>';i.appendChild(x)}
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply);else apply();
})();
