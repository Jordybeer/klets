# Klets — volledige Three.js-webapp, ontwerp v2

Status: voorstel voor review, uitsluitend planning. Geen productcode, live deployment of bestaand designcontract is door dit document gewijzigd.

## Doel en uitgangspunten

Een volwassen, speelse inspiratie-app voor vrijwillige D/s tussen volwassenen. Eén herkenbaar ritueel: de geklede 3D-billen bewegen subtiel; een tik laat een hand contact maken; op dat contact verschijnt één bruikbaar idee. De bediening blijft rustig en de tekst natuurlijk Nederlands. De partner houdt ruimte voor initiatief, reageren, afstemmen en overslaan; de app beoordeelt die partner niet.

De gebruiker vroeg om een volledige Three.js-webapp, mooiere billen, minder knoppen, een coherent uitbreidbaar systeem, een grotere lijst en een plan vóór uitvoering. Aannames: de voorgestelde pruim/peach/lavendelrichting is de basis voor dit plan; het eerdere klikvoorbeeld is een richtingstudie, geen goedgekeurd eindmodel. De uitvoerder moet de nieuwe vorm daadwerkelijk laten beoordelen. De technische scheiding hieronder is mijn aanbeveling: een volledige app met een echte 3D-kern, selecteerbare HTML-tekst en native bediening.

## Architectuurkeuze

| Aanpak | Afweging | Besluit |
|---|---|---|
| React + direct Three.js | Bestaande app, data, toetsenbordbediening en browsergeschiedenis blijven bruikbaar; één renderer en één authored scène | Gekozen |
| Alle tekst, menu's en formulieren in WebGL | Meer eigen werk voor focus, selectie, schermlezers, tekstzoom en invoer; de bediening wordt onderdeel van een 3D-engine | Niet gekozen |
| React Three Fiber + extra helpers/physics | Kan complexere 3D-apps structureren, maar vereist hier een extra runtime en een rewrite van een werkende grens | Niet nodig voor deze scope |

Behoud de geïnstalleerde React/TypeScript/Vite-stack en Three.js 0.186.1; dit is een inventaris van de repository, geen claim dat dit de nieuwste versie is. Voeg voor de ene authored scène geen physics-framework toe. Three.js tekent model, hand, materiaal, licht en contactschaduw. React beheert routes, context, trekken, teksten, voorkeuren en favorieten. De renderer kiest nooit een idee.

De canvas blijft gekoppeld aan de zichtbare sceneregio van de generator. De appachtergrond loopt door als één pruimkleurig veld. Ondersteunende weergaven vervangen de generator; de scène pauzeert en wordt bij terugkeer weer opgebouwd uit dezelfde geladen resources. Er zijn geen aparte 3D-menuwerelden, camerabesturing of meerdere canvassen. Dat bespaart bediening en schermruimte.

## Ontwerpregels

- Eén duidelijke hoofdhandeling per weergave. De hoofdweergave heeft Menu, één keuzeregel, de tikknop, Kopiëren, Bewaren en Past dit nu?; de laatste drie verschijnen pas na een resultaat.
- De 3D-vorm draagt karakter; de tekst draagt de betekenis. Geen decoratieve statistieken, score, confetti of permanent filterraster.
- Basis: achtergrond #271b25, oppervlak #30232e, tekst #fff1e4, context #c7afc6, lavendel #c0a1ce, lijnen #665164 en peach #edb59d. Dit zijn UI-tokens; belichting bepaalt de zichtbare 3D-materialen afzonderlijk.
- Fraunces voor merk, resultaat en koppen; Nunito Sans voor bediening. Resultaat 28–36px normaal, 25px compact; kop 34px normaal. Basisbediening 14px, native selects 16px. Tekstcontrast minimaal 4.5:1, grote tekst 3:1.
- Een native actie heeft minimaal 44×44px effectieve klikruimte, selects minimaal 50px hoog. Checkboxlabels maken de hele instellingenrij klikbaar.
- Hoofdscherm past bij gewone tekstinstellingen op 390×844 en 320×568. Desktopdoel 1024×900. Eerst ruimte en scène verkleinen; bij grote tekst, zoom, toetsenbord of zeer lage hoogte mag inhoud scrollen. Geen clipping om non-scroll te simuleren.
- Alle vervolgweergaven delen breedte, kopstijl, terugknop, focus en primaire/secundaire acties. Lange opgeslagen lijsten gebruiken normale paginaflow.
- Korte labels: Regie / Uitdagen / Erkenning / Verlangen; Samen / Op afstand; Zacht / Speels / Direct. Interne identifiers blijven request/tease/appreciation/desire, together/remote, warm/playful/direct.

## Model en art direction

Maak één speciaal voor Klets ontworpen model: volwassen taille, vloeiende heupen, ronde maar geloofwaardige billen, aansluitende gewone korte broek, natuurlijke bovenbenen. Geen naakt, expliciete anatomie of persoonlijke referentiefoto's. De toon is volwassen en gestileerd; een verzameling opgeblazen bollen, een platte rompsnede en losse beenstompjes voldoen niet.

Het broekje krijgt één samenhangend volume, duidelijke tailleband en beenopeningen, rustige zijnaad en geloofwaardige stofspanning. Mat tot zacht satijn, zonder plastic hoogglans. De hand krijgt vijf leesbare vingers met verschillende lengtes, een losse duim, pols en eenvoudige manchet. De hand past qua schaal en richting bij de scène.

Authoring: een deterministisch offline Node-script bouwt verbonden, speciaal gevormde meshes en exporteert een GLB met Three.js' gebundelde GLTFExporter. Een kleine lokale FileReader-adapter mag uitsluitend in dit authoring-script staan indien de Node-runtime die nodig heeft. Blender is hier niet beschikbaar en wordt niet als afhankelijkheid aangenomen. GLB is het runtimeformaat; het authoring-script en een assetmanifest blijven in git reproduceerbaar. Geen gekochte/gevonden modelasset als verborgen afhankelijkheid.

Modelcontract: root KletsStage; groepen BodyRoot en HandRoot; meshes Skin, Garment, Hand en Cuff; anchors ContactTarget en PalmAnchor. +Y is boven, +Z wijst naar de camera; BodyRoot rust op (0,0,0). Garment heeft morphs press en rebound; Skin volgt dezelfde lokale randbeweging. HandRoot voert de armboog uit; de vingers hebben een voorbereide open-palm-contactpose. Een klein handskelet mag worden gebruikt als de export en cleanup daarvan aantoonbaar correct zijn. Een malformed asset valt terug op het stille beeld.

Vormacceptatie vóór materiaalpolish: zij- en achteraanzicht tonen vloeiende heup/beenovergangen; geen losse contouren, zwevende naden of open holle snedes. Rustpose en volledige handboog passen op compact mobiel. Op 150 en 175ms staan palm en oppervlak zichtbaar in contact zonder opvallende penetratie of zweven. De broek blijft bedekken tijdens vervorming. Geen rendererwissel kan deze vormacceptatie vervangen.

Camera en licht: rustige achteraanblik met een kleine hoek die volume toont; orthografisch zodat een telefoon geen vervormde proporties krijgt. Warm keylicht, zachte lavendel-fill, subtiele rand en diffuse contactschaduw. Begin zonder postprocessing of realtime shadow maps. Geen spontane camera-orbit op hover of tik.

## Choreografie en logische gebeurtenissen

| Tijd | Beweging | Appgebeurtenis |
|---|---|---|
| Rust | Maximaal 1.2° zachte heuprotatie, cyclus 6s; geen zwevende UI | Geen trekking |
| 0–40ms | Rust/kleine anticipatie | Eén resultaat met actie-ID is al gereserveerd |
| 40–150ms | Hand nadert langs één boog, palm draait naar contactanker | Nieuwe tikken worden genegeerd |
| 150ms | Contact; lokale stofcompressie | publish(actionId), exact eenmaal |
| 150–190ms | Korte beperkte druk; optioneel zacht geluid | Geen tweede selectie |
| 190–310ms | Hand trekt terug | Resultaat blijft leesbaar |
| 310–600ms | Eén gedempte terugveer | Geen extra effecten of tekstverplaatsing |
| 600ms | Exacte rustpose | finish(actionId), exact eenmaal; tik weer beschikbaar |

Gebruik elapsed time, niet opgetelde frames. Behoud de bestaande 150/600ms callbackgrens. Nieuwe lokale compressie vervangt de huidige sterke globale squash; globale schaal blijft binnen 0.98–1.02. Resultaat kan in maximaal 180ms opacity-overgang verschijnen, zonder verplaatsing. Idlebeweging pauzeert tijdens lezen na één cyclus van 6s na laden/afgeronde tik; een volgende tik start een nieuwe cyclus. Bij verborgen tab of ondersteuning stopt de frame-loop.

Reduced motion en pauze tonen direct het gereserveerde resultaat en de rustpose. Laden, falende GLB, WebGL-verlies, navigatie en unmount finaliseren een geaccepteerde actie eenmaal. Oude callbacks met een ander actie-ID worden genegeerd. Resize rendert de actuele pose, niet plotseling de rustpose. Geluid staat uit en is alleen hoorbaar bij een werkelijk gerenderd contact, nooit nodig voor het resultaat.

## Volledige schermen en states

| Weergave | Inhoud | Terugkeer en state |
|---|---|---|
| Eerste bezoek/generator | Merk + Menu, keuzeregel, scene en 'Tik voor een idee.' | Nog geen gefabriceerd huidig idee of lege kaart; tik beschikbaar tijdens assetladen |
| Generator met resultaat | Eén zin, oorspronkelijke context, Kopiëren/Bewaren, Past dit nu? | Nieuwe selectie bovenaan geldt alleen voor volgende tik; 'Voor je volgende tik' indien context afwijkt |
| Keuze | Drie native selects; 'Keuze gebruiken' en 'Annuleren' | Alle drie zijn draft; confirm past ze samen toe; annuleren/Escape/browser Terug verwerpen draft |
| Menu | Opgeslagen ideeën, geluid, beweging pauzeren, opslagstatus | Toggles gelden meteen; sluiten behoudt resultaat |
| Past dit nu? | Vastgezette zin/context, drie intentgebonden vragen, Terug naar idee, Bewaren voor later; rustige Ander idee / Eerst afstemmen / Keuze aanpassen | Geen antwoorden opslaan; afstemzin apart onthullen; waardering heeft geen opdracht-checkin |
| Opgeslagen lijst | Gewone lijst met oorspronkelijke context/tekst; rij opent detail | Leeg: 'Nog niets bewaard.' en Terug naar inspiratie |
| Opgeslagen detail | Volledige tekst/context, Kopiëren, Past dit nu?, Verwijderen | Verwijdering biedt één herstelactie die ook na navigatie beschikbaar blijft |
| Geen passend idee | 'Voor deze selectie zijn er geen ideeën.' en Keuze aanpassen | Geen crash of eindeloze animatie; bestaande tekst blijft behouden |
| 3D-fallback | Stil beeld uit hetzelfde uiteindelijke model; bij beeldfout Klets-woordmerk | Zelfde native tikknop en resultaatpad |
| Clipboard/opslagfout | Concrete melding en handmatige kopieerroute of sessiemelding | Melding bindt aan de betrokken snapshot; onbekende opgeslagen data wordt niet overschreven |

Browser Terug en Escape sluiten één ondersteuningsniveau. Het woordmerk keert naar de generator terug. Trekkingen zijn geen history-items. Focus herstelt naar de opener; na verwijderde opener naar de relevante kop. Eén live-regio kondigt een nieuw resultaat aan, geen animatieframes.

Cruciale bestaande grens: een momentcheck die wordt geopend wanneer A zichtbaar is, houdt A en diens oorspronkelijke context vast, ook als pending B tijdens navigatie wordt afgerond. Eerst B finaliseren en dan snapshotten zou deze grens veranderen en is geen fix. Ook Kopiëren/Bewaren gebruiken de zichtbare snapshot op het moment van activeren.

## Read the room en beide perspectieven

De zichtbare naam blijft 'Past dit nu?'. Mijn oordeel: nuttig als korte optionele reflectie op het concrete idee; een app kan de kamer, wens of instemming van de partner niet lezen. Geen scoring, stemmingdetector, verplicht invulformulier of automatische aanbeveling 'zij wil dit'.

Regievragen: past dit bij onze afspraken; is er nu tijd/privacy/zin; staat mijn vorige verzoek nog open? Afstemzin: 'Zin om mij even de leiding te geven?' Uitdagen/verlangen gebruiken vragen over de huidige toon en een eigen afstemzin. Erkenning: benoem ik iets echt waargenomens; kan mijn waardering op zichzelf staan; laat ik ruimte voor de eigen reactie? Geen uitvoering belonen door een inspiratieklik.

De content geeft ook ruimte voor het initiatief van de ontvanger, eigen wensen en verandering van toon. Geen extra rollenknop op het hoofdscherm. Een expliciete sub-georiënteerde verzameling kan later als context worden toegevoegd als er behoefte is; hiervoor wordt geen profielmodel gebouwd in v2.

## Catalogus v2 en gegevensbehoud

Schrijf een volledige actieve collectie van 288 ideeën: 72 per intent; iedere intent × situatie × toon heeft precies 12 eigen entries. Iedere entry heeft één situatie en één toon, zodat aantallen niet door overlappende tags worden opgeblazen. Maximaal 160 tekens, streef 35–110, één concrete boodschap per entry. Sterker volwassen power exchange, plagerige spanning, specifieke erkenning en verlangen, zonder grafische seksuele inhoud, sentimentele clichés of druk om direct te reageren.

Voorbeelden van de stem: 'Kom hier. Ik wil even je volle aandacht.' / 'Die uitdagende blik heb ik gezien.' / 'Je zei duidelijk wat je wilde. Dat waardeer ik.' / 'Als ik je straks zie, neem ik de leiding.' Situatie en toon moeten de daadwerkelijke zin beschrijven, geen willekeurige metadata.

De bestaande 160 vanilla-georiënteerde entries worden niet stilzwijgend als betekenisvolle D/s-uitbreiding gepresenteerd. De actieve v2-collectie wordt opnieuw geredigeerd; nieuwe immutable IDs hebben vorm request-v2-001 t/m request-v2-072 en overeenkomstig voor de andere intents. Oude IDs blijven gereserveerd en worden nooit voor een andere boodschap hergebruikt. Bestaande favorieten blijven hun opgeslagen tekst en selectie tonen, ook als het oude ID niet in de actieve collectie staat. Bewaar geen afhankelijke cataloguslookup om een oude favoriet te renderen.

Behoud opslagkey klets.state en schema version:1 zolang de gegevensvorm niet wijzigt. Alleen displaylabels en catalogusversie veranderen; de selectie-engine maakt al een contentsignature en vernieuwt pools na inhoudswijzigingen. Geen onnodige migratie of reset. Zowel originele als nieuwe IDs mogen favoriet zijn; dedupe blijft op ideaId. CATALOG_VERSION krijgt bij uitvoering een nieuwe datum/revisie. Controleer alle 288 teksten redactioneel, niet alleen de aantallen.

## Technische grenzen en prestatiedoelen

Dit zijn begrotingen, geen gemeten resultaten: GLB maximaal 3MB; maximaal 45.000 zichtbare triangles, 10 draw calls, texturekant maximaal 1024px; DPR maximaal 1.5. Contactanimatie streeft 60fps op de geselecteerde moderne telefoon, framewerk maximaal 33ms op de geselecteerde tragere telefoon. Leg testapparaat/browser vast; ontbrekende apparaatmetingen blijven expliciet ontbrekend bewijs.

Native bediening verschijnt zonder op het model te wachten. Three en GLB laden lazy. Slechts één renderer; één RAF-loop. Rust geeft demand-rendering na de begrensde idlecyclus; reduced motion render alleen bij resize/state/assetwijziging. Dispose geometrie, materialen, textures, environment, skeleton resources en renderer. Late assetresponses na unmount worden ook opgeruimd. WebGL-verlies schakelt naar fallback; herladen van de pagina mag herstellen, geen automatische retrylus.

## Uitvoering en uitbreiding

Bouwvolgorde: (1) model en contactacceptatie, (2) continuous renderer en lifecycle, (3) volledige shell/keuze/navigation, (4) actieve content en snapshots, (5) momentcheck/favorieten/preferences, (6) complete bounded review. De vorm moet eerst overtuigen voordat de rest daaromheen wordt gepolijst.

Later in volgorde van concrete behoefte: eigen ideeën en beter lokaal verzamelen → initiatief vanuit beide rollen → gezamenlijke afspraken/preferences als apart gegevensdomein → optionele punten/coupons → accounts/sync/integraties. Deze modules blijven buiten v2. Behoud Idea, ResultSnapshot, Preferences en Favorite als losse concepten; een scène-event wordt nooit een partnerprestatie.

## Acceptatie en bewijs

Passend resultaat binnen één tik; één reservering/contact/finish; compact hoofdscherm zonder clipping; vijf leesbare vingers en correct contact; bevestigen/annuleren alle contextvelden; context van oud idee/favoriet onveranderd; herstel over navigatie; clipboard/opslag/asset/WebGL failures werkbaar; één resultaatmelding; browser Terug/Escape en zoom/toetsenbord bruikbaar.

Gerichte tests voor de gewijzigde invariantgroepen, typecheck en build. Eén gebatchte visuele ronde op desktop/mobiel/compact met rust, contact en herstel plus alle vervolgschermen; één gegroepeerde correctie en één bevestiging. Geen screenshots beoordelen als bewijs voor frames die niet zijn getoond; geen snapshotscores als gebruikersonderzoek presenteren. Mini-audit beoordeelt vorm, bediening, content en beide-partner-agency apart.

## Bronnen en ontwerpstatus

- Lokale repo geïnspecteerd op basiscommit f210c09; bestaande stage is echte Three.js, het richtingvoorbeeld gebruikt vier PNG-poses.
- [Three.js — Loading 3D Models](https://threejs.org/manual/pages/loading-3d-models.html): runtime GLB/glTF, meshes/materials/morphs/animations.
- [Three.js — Rendering on Demand](https://threejs.org/manual/pages/rendering-on-demand.html): alleen renderen wanneer nodig; geen idleverspilling.
- [Three.js — Cleanup](https://threejs.org/manual/pages/cleanup.html): expliciete resource-disposal.
- Dit voorstel vervangt tijdens planning geen AGENTS.md, PRODUCT.md of DESIGN.md. Na richtingacceptatie past uitvoering de candy-identiteit en immediate-intent-regel in de canonical docs aan naar dit contract, inclusief token-sidecar.
