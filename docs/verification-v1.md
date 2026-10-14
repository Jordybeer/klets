# Klets v1 — verificatie

De verificatie betreft de eerste React-implementatie en de gerichte correcties uit de onafhankelijke code- en ontwerpreview. Hosting en echte gebruikerstests vallen buiten deze oplevering.

## Gedrag en bouw

De catalogus bevat 160 unieke ideeën, 40 per intentie, met eerlijk gelabelde situatie/toon. Iedere aangeboden combinatie heeft zes of zeven keuzes. Tests controleren exacte filtering, cycli, geen stille filterverbreding, lege/enkele pools en cataloguswijzigingen.

De controller reserveert één snapshot per geaccepteerde tik. Tests behandelen dubbele activering, filterwijziging tijdens beweging, dubbele callbacks, onderbreking, geweigerde clipboard/opslag, onbekende opslagversies, favorieten en herstel. De onafhankelijke review vond twee timingfouten: een momentcheck die naar een pending idee sprong en een oude bewaar/kopieermelding die onder het volgende idee verscheen. Daarvoor zijn specifieke regressietests toegevoegd.

Laatste geïntegreerde controle op Node 24.19.0: `npm test` — 72/72 tests in zes bestanden geslaagd; `npm run typecheck` — exit 0; `npm run build` — exit 0. Acht regressietests kwamen erbij na de eerste geïntegreerde run van 64 tests. De nieuwe App-regressies faalden eerst op de twee bedoelde fouten en slaagden na de correcties; de zes controllerregressies volgden eveneens RED→GREEN.

Productiebundels: hoofd-JavaScript 262,77 kB (82,21 kB gzip), afzonderlijk geladen Three.js-scène 571,58 kB (144,38 kB gzip), CSS 16,30 kB (4,06 kB gzip). Dit zijn bundelgroottes, geen laad- of frameratebenchmark.

## Browsercontrole

Chromium 153, daadwerkelijke lokale app, zelf gehoste fonts en Three.js-renderer:

| Weergave | Viewport | Document | Bevinding |
| --- | --- | --- | --- |
| Desktop | 1440×900 | 1440×900 | Eerste staat en resultaat passen; geen knop kleiner dan 44×44. |
| Mobiel | 390×844 | 390×844 | Resultaat, momentcheck, favorieten/herstel en bewegingspauze gecontroleerd. |
| Compact | 320×568 | 320×568 | Compacte categoriekeuze; hoofdhandeling, tekst en acties bereikbaar. |

Geen JavaScript-paginafouten in deze batch. De hand raakt zichtbaar de buitenzijde van het broekje in het contactbeeld. De stage gebruikt een contactpunt op 150 ms en rust op 600 ms; callback-eenmaligheid is afzonderlijk getest. Screenshots bewijzen de pose en layout, geen gemeten framerate of volledige bewegingservaring.

Aanvullend: Enter activeert de hoofdknop. Echt WebGL-contextverlies via `WEBGL_lose_context` schakelt naar het geladen stilbeeld; een volgende tik geeft een nieuw resultaat en eindigt buiten de busy-staat. Een 720×450 CSS-viewport en 48 px lange resultaattekst op 320×568 geven verticale overflow met bereikbare inhoud, zonder horizontale overflow. Dit simuleert een beperkte zichtbare ruimte/tekststress; het is geen fysieke iPhone-, Safari-, OS-schaal- of echte browserzoomtest.

## Mini-audit en grenzen

De onafhankelijke code-review onderzocht selectie, snapshots, opslag, context, focus en lifecycle. De onafhankelijke Impeccable-finishreview beoordeelde de echte captures op type, materiaal, achtergrond, hiërarchie, compacte compositie en reflectie. Drie gerichte afwerkingen: actuele ontwerpdocumentatie, verwijderen van de overbodige inleidende regel boven de eerste kop, en één natuurlijker geformuleerde cataloguszin. De onafhankelijke verdictpass beoordeelde alle drie correcties als opgelost en gaf `ship` voor die correcties, zonder zichtbare regressies in de recaptures. Het mechanische Impeccable-onderzoek draaide eenmaal en gaf `[]`; visueel oordeel komt uit de afzonderlijke review.

De ontwerpkeuze was door de gebruiker gekozen en direct vanuit code gebouwd. Er bestaat geen goedgekeurde beeldcomp, gerandomiseerde conceptseed of aparte QUALITY BAR-card; die ontbreken expliciet in de provenance. Zie `docs/design/direction.md`. Een herontwerp zou de gekozen richting onnodig opnieuw openen.

Normale ondersteunende weergaven wisselen direct binnen dezelfde shell. De centrale actie en resultaatonthulling dragen de motion. Geluid is opt-in; reduced motion en pauze behouden hetzelfde resultaatpad. Geen gebruikersonderzoek of screenreader-sessie uitgevoerd. Geen automatische verzending, partneranalyse, punten of cloudopslag aanwezig.

## Assetherkomst

`public/assets/klets-stage.png` is een transparante 960×640 PNG, gerenderd uit de eigen Three.js-scène in `src/features/stage/createStage.ts` met de neutrale pose uit `timeline.ts`. De scène definieert de shorts, naden, zakken, peach-vormen, mitten, materialen, orthografische camera en schaduw; het stilbeeld en de interactieve render delen die geometrie. Geen externe foto, private partnerafbeelding of generatieve anatomie. De fallback werd als afbeelding en in de browser geïnspecteerd.

Fraunces en Nunito Sans worden uit de vastgepinde Fontsource-packages gebundeld, met hun meegeleverde licenties. Er zijn geen externe fontrequests tijdens appgebruik.

## Release

`npm run build` levert statische bestanden in `dist/`. GitHub CI is toegevoegd voor installatie, typecheck, tests en build. De bestaande PR #1 blijft de reviewplek. Er wordt geen merge, gekozen hosting of deployment geclaimd. GitHub Actions-run [38478354325](https://github.com/Jordybeer/klets/actions/runs/38478354325) voor implementatiecommit `7299deb92c705aad63faae830c0b462fb6883fa4` eindigde met `success`; de job `verify` is geslaagd. PR #1 staat klaar voor review.


## Hosting — 14 oktober 2026

Op verzoek van de gebruiker is PR #1 gepubliceerd naar `main` en Vercel-project `klets` gekoppeld aan `Jordybeer/klets`. Productiecommit: `ee5ec774c30ad09854ffb5e98122850a4f856cce`, identieke bronboom aan de eerder gecontroleerde PR-versie. Vercel bouwt met Node 24, `npm ci`, `npm run build` en uitvoermap `dist`.

Domein: [klets.jordy.beer](https://klets.jordy.beer). De projecttoewijzing is geverifieerd en de DNS-configuratie heeft `misconfigured:false` en geen conflicten. De bestaande door Vercel beheerde wildcard levert de DNS-route; er zijn geen mail- of andere domeinrecords gewijzigd. Git-deployment `dpl_EaD5tLpQGi8aapLrrWDH2uRm7W8M` is `READY`, target `production`, met het domein als alias.

De publieke HTTPS-URL gaf HTTP 200 met de verwachte app en JavaScript-bundel. Een live Chromium-smokecheck op 390×844 laadde de 3D-stage, trok een passend idee en bewaarde het; geen JavaScript-paginafouten. Deze browserharness accepteerde het interne netwerkproxy-certificaat via een lokale testoptie; zij bewijst geen onafhankelijke publieke certificaatketencontrole. De gewone HTTPS-fetch gebruikte de standaard certificaatcontrole. Er is geen productbeveiligingsinstelling verzwakt.
