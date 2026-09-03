(function(){if(window.__STUDENTBNB_ANALYTICS_LOADED__)return;window.__STUDENTBNB_ANALYTICS_LOADED__=true;const cfg=window.STUDENTBNB_CONFIG||{},code=cfg.countryCode||'EU',key=`studentbnb:stats:${code}:v1`,sessionKey=`studentbnb:session:${code}:v1`,path=(location.pathname.split('/').pop()||'index.html').toLowerCase(),isStats=path==='stats.html',empty=()=>({version:1,country:code,pageViews:0,sessions:0,ctaClicks:0,internalClicks:0,outboundClicks:0,pages:{},firstSeen:null,lastSeen:null});function read(){try{return{...empty(),...(JSON.parse(localStorage.getItem(key)||'{}'))}}catch(_){return empty()}}function write(s){try{localStorage.setItem(key,JSON.stringify(s))}catch(_){}}function update(fn){const s=read();fn(s);s.lastSeen=new Date().toISOString();if(!s.firstSeen)s.firstSeen=s.lastSeen;write(s);window.StudentBnBStats=s;return s}if(!isStats){update(s=>{s.pageViews++;s.pages[path]=(s.pages[path]||0)+1;if(!sessionStorage.getItem(sessionKey)){s.sessions++;try{sessionStorage.setItem(sessionKey,'1')}catch(_){}}});addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href]');if(!a)return;update(s=>{const h=a.getAttribute('href')||'';if(a.classList.contains('header-cta')||a.classList.contains('btn')||a.classList.contains('publish-choice'))s.ctaClicks++;if(/^https?:/i.test(h)&&!h.includes(location.hostname))s.outboundClicks++;else if(h&&!h.startsWith('#')&&!h.startsWith('mailto:')&&!h.startsWith('tel:'))s.internalClicks++})},{passive:true});setTimeout(()=>{try{window.StudentBnBAPI?.track?.('page_view',{page:path,local:true})}catch(_){}},600)}else window.StudentBnBStats=read();function link(){const label={IT:'Statistiche',ES:'Estadísticas',FR:'Statistiques',DE:'Statistiken',PL:'Statystyki',PT:'Estatísticas'}[code]||'Statistics',box=document.querySelector('.footer-bottom')||document.querySelector('.footer-international');if(box&&!box.querySelector('[data-stats-link]')){const a=document.createElement('a');a.href='stats.html';a.dataset.statsLink='1';a.textContent=label;a.style.cssText='color:inherit;text-decoration:underline;margin-left:12px';box.appendChild(a)}}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',link);else link()})();
(function(){if(document.querySelector('script[data-city-visuals]'))return;const s=document.createElement('script');s.src='assets/js/city-visuals.js?v=20260828';s.defer=true;s.dataset.cityVisuals='1';document.head.appendChild(s)})();
(function(){if(document.querySelector('script[data-representative-photos]'))return;const s=document.createElement('script');s.src='assets/js/representative-photos.js?v=20260828';s.defer=true;s.dataset.representativePhotos='1';document.head.appendChild(s)})();

(function(){
  if(window.__CASASTUDENT_PUBLIC_CLEANUP__) return;
  window.__CASASTUDENT_PUBLIC_CLEANUP__=true;
  const normalize=s=>(s||'').trim().toLowerCase().replace(/\s+/g,' ');
  function fixBrand(){
    document.querySelectorAll('.brand').forEach(brand=>{
      const labels=[...brand.children].filter(el=>el.tagName==='SPAN'&&!el.classList.contains('brand-icon'));
      const label=labels[labels.length-1]; if(!label)return;
      const small=label.querySelector('small'); const smallHtml=small?small.outerHTML:'';
      label.innerHTML=`Casa<strong>Student</strong>${smallHtml}`;
    });
  }
  function cleanFooterLinks(){
    const banned=new Set(['faq','domande frequenti','preguntas frecuentes','questions fréquentes','häufige fragen','häufig gestellte fragen','kontakt','contact','contatti','contactos','contato']);
    document.querySelectorAll('.site-footer .footer-links a').forEach(a=>{if(banned.has(normalize(a.textContent)))a.remove();});
  }
  function removeTechNotes(){
    const rx=/(countrycode|backend europeo|database europea|base de données européenne|europäische datenbank|europejska baza danych|base de dados europeia|nota sul prototipo|nota del prototipo|note sur le prototype|hinweis zum prototyp|uwaga.{0,20}prototyp|nota sobre o protótipo)/i;
    document.querySelectorAll('p,small,.note,.hint,.helper-text').forEach(el=>{if(rx.test(el.textContent||''))el.remove();});
  }
  function ensurePortugal(){
    let nav=document.querySelector('#casastudent-network-title')?.closest('.portal-family')?.querySelector('.portal-country-links');
    if(!nav) nav=document.querySelector('.footer-international [data-network]');
    if(!nav||nav.querySelector('a[href*="casastudent.pt"]'))return;
    const a=document.createElement('a'); a.href='https://casastudent.pt/'; a.className=nav.classList.contains('portal-country-links')?'portal-country-link':'';
    a.innerHTML='<span class="portal-country-flag" aria-hidden="true">🇵🇹</span><span>Portugal</span><span class="network-open" aria-hidden="true">↗</span>';
    nav.appendChild(a);
  }
  function run(){fixBrand();cleanFooterLinks();removeTechNotes();ensurePortugal();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  setTimeout(run,250);setTimeout(run,1000);
})();
