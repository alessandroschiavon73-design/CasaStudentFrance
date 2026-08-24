STUDENTBNB FRANCE - DB READY 1.2
============================================================

Pacchetto statico localizzato sulla stessa logica grafica delle versioni italiana e spagnola.

CONTENUTO
- 10 pagine HTML responsive: home, città, annuncio, pubblicazione, ricerca, studenti, alloggio solidale, privacy, conferma email e 404.
- Dati demo separati con countryCode = FR e valuta = EUR.
- Contratto dati comune in database-contract.json.
- Procedura di pubblicazione predisposta per registrazione/verifica email.
- Footer europeo centralizzato in assets/js/config.js.
- Cartina nazionale con città universitarie cliccabili; per la Francia, illustrazione con monumenti rappresentativi coordinata al portale italiano.
- Elenco esteso dei quartieri per tutte le otto città, derivato dallo snapshot geografico incluso e pronto per la tabella districts del database comune.
- Bandiere SVG locali e collegamenti attivi tra i sei domini della rete.
- Statistiche first-party predisposte verso POST /api/v1/events, disattivate per impostazione predefinita.

COLLEGAMENTO AL BACKEND COMUNE
1. Impostare apiEnabled: true in assets/js/config.js.
2. Configurare apiBaseUrl se l'API non è esposta dallo stesso dominio.
3. Implementare gli endpoint indicati in database-contract.json.
4. Il backend deve ignorare il countryCode inviato dal browser quando non coerente con il dominio e applicare il filtro server-side.
5. Pubblicare gli annunci solo dopo email_verified_at e moderazione.

VERIFICA EMAIL
- In modalità demo il link viene simulato nel browser e i dati restano nel localStorage del dispositivo.
- In modalità API il frontend chiama /auth/email/start e /auth/email/confirm.
- Usare token monouso salvati solo come hash, con scadenza breve e rate limiting.

RETE STUDENTBNB
- Italia: https://studentbnb.it/
- Spagna: https://studentbnb.es/
- Portogallo: sospeso (nessun dominio ufficiale attivo)
- Francia: https://studentbnb.fr/
- Germania: https://student-bnb.de/
- Polonia: https://studentbnb.pl/

I collegamenti tra i siti nazionali sono centralizzati in networkSites dentro assets/js/config.js.

PRIMA DELLA PUBBLICAZIONE
- Completare i dati del titolare/responsabile nella pagina privacy.
- Decidere fornitori email, hosting, analytics e tempi di conservazione.
- Verificare normativa locale su locazioni, contenuti degli annunci, discriminazione, consumatori e identificazione degli inserzionisti.
- Sostituire i dati demo con API reali; controllare HTTPS, DNS, canonical, sitemap e Search Console.
- Eseguire test desktop, tablet e mobile sul dominio definitivo.

La pagina privacy è una bozza operativa e non sostituisce una revisione legale locale.
