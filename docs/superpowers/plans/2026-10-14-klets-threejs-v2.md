# Klets Three.js v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bouw de complete volwassen Klets-ervaring met een speciaal gevormd gekleed 3D-model, continue tikanimatie, eenvoudige bediening en 288 contextpassende ideeën.

**Architecture:** React beheert betekenis, navigatie en state; direct Three.js tekent één authored scène. De bestaande reservering/publicatie/finish-controller en snapshot/opslaggrenzen blijven leidend. Een deterministisch offline script produceert één GLB; runtime laadt het lazy en blijft bij falen bruikbaar met een stil beeld.

**Tech Stack:** Bestaande React 19.3.0, TypeScript 7.0.2, Vite 8.3.4, Three.js 0.186.1, Vitest 5.0.4; versies zijn geïnventariseerd, geen upgradeopdracht. Geen R3F, physics of backend toevoegen.

**Spec:** `docs/superpowers/specs/2026-10-14-klets-threejs-v2-design.md`

**Status:** uitvoerbaar voorstel voor review; productimplementatie nog niet gestart. Parallelle expertinput is verwerkt, niet alle adviezen blind overgenomen. Spec en plan zijn op verzoek samen opgesteld; dit is geen uitvoeringstoestemming.

## Global Constraints

- Eén accepted draw reserveert eenmaal; contact 150ms, settle 600ms; stale IDs hebben geen effect.
- Volwassen, volledig geklede figuur en vijfvingerhand; geen persoonlijk beeldmateriaal.
- request/tease/appreciation/desire, together/remote en warm/playful/direct blijven identifiers.
- Drie contextvelden zijn één confirmed draft; annuleren/back/Escape verwerpen draft.
- Displayed-at-click snapshot A blijft A wanneer pending B tijdens navigatie afloopt.
- 288 actieve ideeën, 72 per intent, 12 per intent/situatie/toon, maximaal 160 tekens.
- Favorieten renderen hun eigen immutable tekst/context; oude IDs niet hergebruiken.
- Behoud klets.state/schema version:1; geen datavormwijziging of onnodige migratie.
- GLB ≤3MB, ≤45k triangles, ≤10 draw calls, texturekant ≤1024px, DPR ≤1.5: doelen, pas gemeten na uitvoering.
- Ordinary generator past op 390×844 en 320×568; zoom/lage hoogte mag scrollen; target ≥44×44px.
- Geluid uit; reduced motion/pauze/fallback veranderen geen getrokken idee.
- Geen accounts, punten, sync, messaging, rollenprofielen of andere later-modules.

## Review Focus

1. Actie start terwijl asset nog laadt of WebGL wegvalt: reserve/publish/finish exact eenmaal en native bediening blijft werken (taak 2).
2. Gebruiker opent momentcheck van zichtbare A vóór 150ms van B: check/copy/save blijven op A; B wordt hoogstens eenmaal afgerond (taak 4).
3. Context draft verandert alle velden en browser Terug/Escape volgt: oud resultaat en opgeslagen context blijven intact (taak 3).
4. Oude favorieten, onbekende/kapotte opgeslagen data en geblokkeerde clipboard: geen datareset of verkeerde succesmelding (taak 5).
5. Resize/tekstzoom/mobiel adresbalk tijdens contact: actuele pose, handpad en bediening blijven bereikbaar (taak 2 en visuele taak 6).

## Bestandsoverzicht en grenzen

| Unit | Nieuwe/gewijzigde bestanden | Verantwoordelijkheid |
|---|---|---|
| Authoring | `scripts/stage/build-model.mjs`, `scripts/stage/model-shapes.mjs`, `public/assets/klets-stage-v2.glb`, `public/assets/klets-stage-v2.manifest.json`, `public/assets/klets-stage-v2.png` | Reproduceerbaar model, morphs, anchors en fallback; geen cataloguskennis |
| Runtime stage | `src/features/stage/asset.ts`, `sceneTypes.ts`, `renderScheduler.ts`; wijzigen `createStage.ts`, `PlayStage.tsx`, `timeline.ts`, `stage.css` | Laden/valideren, actuele pose, RAF/disposal en native stageknop |
| Shell | `src/app/navigation.ts`, `MenuView.tsx`; wijzigen `App.tsx`, `SupportView.tsx`, `src/styles/{tokens,base,components,layout}.css` | Routes/history/focus, gedeelde tokens en menu |
| Selectie/resultaat | wijzigen `ContextPanel.tsx`, `GeneratorView.tsx`, `Result.tsx`, `model.ts`, `useGenerator.ts` | Unified draft, labels, resultaatcontext en snapshotacties |
| Catalogus | wijzigen `catalog.ts`, `catalog.test.ts`; `docs/content/klets-v2-editorial.md` | 288 actieve geredigeerde entries en redactioneel bewijs |
| Ondersteuning | `SavedIdeaDetail.tsx`; wijzigen `SavedIdeas.tsx`, `RoomCheck.tsx`, `useGenerator.ts` | Saved detail, globale undo en specifieke reflectie |
| Canonical context | wijzigen `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json` na uitvoering | Eén actuele wereld, gedrag en tokencontract |

Geen generieke eventbus, tweede controller, nieuwe storage-service of routeframework. Bestaande `selection.ts`/storage-adapter alleen wijzigen bij een aantoonbare incompatibiliteit, niet als onderdeel van een opschoonronde.

## Task 1 — Het nieuwe model en contact bewijzen

**Files:** authoringbestanden en vijf assetbestanden hierboven; create `src/features/stage/asset.test.ts`, `src/features/stage/asset.ts` en `src/features/stage/sceneTypes.ts`.

**Interfaces:** `loadStageAsset(url: string): Promise<StageAsset>`; `validateStageAsset(root: THREE.Object3D): StageAsset`; `disposeStageAsset(asset: StageAsset): void`. `StageAsset` bevat `root`, `bodyRoot`, `handRoot`, `garment`, `skin`, `palmAnchor`, `contactTarget`, `pressIndex`, `reboundIndex`; exacte typen staan in `sceneTypes.ts`: groepen/anchors Object3D, garment/skin Mesh<BufferGeometry,Material|Material[]>.

- [ ] Schrijf assetcontracttests: alle vereiste nodes en beide morphs aanwezig; ontbrekend Garment/ContactTarget/press geeft een getypeerde loadfailure; dispose is idempotent en deelt materiaalresources niet dubbel.
- [ ] Run `npm test -- src/features/stage/asset.test.ts`; nieuwe contracttests falen vóór implementatie.
- [ ] Maak `build-model.mjs` met exports uit `model-shapes.mjs`; Node/Three GLTFExporter, uitsluitend lokale authoring-polyfill indien nodig; meshes met verbonden speciaal gevormde contouren, geen verzameling sphere-primitives. Manifest bevat node/morphnamen, units/axes, generatorversie, grootte, triangle-count en herkomst.
- [ ] Bouw het fully-clothed model met BodyRoot/HandRoot, coherent broekje, afzonderlijke vijfvingerhand, named anchors en lokale press/rebound-morphs; implementeer validator/disposer.
- [ ] Exporteer GLB met `node scripts/stage/build-model.mjs`; run de contracttests. Binary-export is reproduceerbaar vanuit de ingecheckte bron; assets passen de begroting.
- [ ] Render in de werkelijke Three-scène rust + 150/175ms contact + terugtrekpose op mobiel/desktop. Beoordeel silhouette, vijf vingers, polshoek, palmcontact, bedekking en handpad. Eén vormcorrectiebatch. Genereer de PNG-fallback uit de geaccepteerde rustpose; geen placeholdermodel publiceren.
- [ ] Laat deze concrete model-/bewegingspreview beoordelen voordat daarop de hele app wordt afgewerkt. Dit is de enige creatieve tussenhandoff; vorm kan onafhankelijk van UI worden verworpen. Assetvoorwaarden eerst oplossen, materiaalpolish daarna.
- [ ] Commit `feat: author Klets v2 stage asset` met bron, asset, manifest en contracttest.

## Task 2 — Continue stage, timing en lifecycle integreren

**Files:** runtime stagebestanden uit overzicht; create `renderScheduler.test.ts`, `PlayStage.test.tsx`; extend `timeline.test.ts`.

**Interfaces:** behoud `PlayStage` props/actioncallbacks. `StagePose` behoudt bestaande velden voor compatibiliteit en voegt `garmentPress: number`, `garmentRebound: number`, `wristRotation: number` toe. `samplePose(elapsedMs:number,reduced:boolean):StagePose`. `createStage(canvas:HTMLCanvasElement,asset:StageAsset):StageRuntime`, met `resize(width:number,height:number):void`, `render(pose:StagePose):void`, `dispose():void`. `createRenderScheduler(options:{render(time:number):void;requestFrame:typeof requestAnimationFrame;cancelFrame:typeof cancelAnimationFrame}):{start():void;stop():void;invalidate():void;dispose():void}` heeft maximaal één scheduled frame.

- [ ] Extend timingtests: advance naar 700ms geeft eenmaal contact+finish; stale ID blijft bij generator genegeerd; reduced/finalize/rest exact; press heeft peak rond 150–190 en is nul op 600; globale schalen blijven 0.98–1.02.
- [ ] Schrijf scheduler/lifecycletests met fake renderer en fake loaders: één RAF; assetfailure/late-load-after-unmount dispose; contextloss finalize eenmaal; resize tijdens actie rendert actuele pose; pauze/reduced-motion finaliseren; native knop werkt tijdens laden.
- [ ] Run `npm test -- src/features/stage`; nieuwe scenario's moeten vóór implementatie falen.
- [ ] Laad GLB lazy, valideer vóór zichtbaar wisselen, implementeer renderer/anchors/morphs en `samplePose` volgens spec. Houd publicatie bij `createActionTimeline`, selectie bij `useGenerator`. Gebruik elapsed time, actuele pose-ref bij resize en behoud native button.
- [ ] Implementeer bounded idlecyclus (6s, maximaal 1.2°) en daarna demand-render; 600ms actieframe-loop; stop hidden/support/reduced. Cap DPR 1.5. Maak scènekleur en licht los van UI-tokeneindwaarden; geen kostbare postprocessing.
- [ ] Maak alle cleanup-/failurepaden idempotent inclusief late assets; canvasloss blijft fallback tot pagina-herstart. Geluid blijft opt-in/rendered-contact-only.
- [ ] Run gerichte tests, `npm run typecheck` en `npm run build`. Inspecteer rest/contact bij werkelijk gerenderde GLB; de assetfase telt als model-QA, geen nieuwe losse stijlronde.
- [ ] Commit `feat: integrate continuous Klets stage and resilient lifecycle`.

## Task 3 — Volledige app-shell en unified selectie

**Files:** shell/styles uit overzicht; wijzigen ContextPanel/GeneratorView/Result/model; extend `App.test.tsx` en `generator.test.tsx`; create `navigation.test.ts`.

**Interfaces:** routes `generator | selection | menu | room-check | saved | saved-detail`; support entries blijven gekoppeld aan returnTo/opener. `ContextPanel({selection:Selection,onConfirm(selection:Selection):void,onCancel():void})` behoudt API maar toont alle drie native selects. `MenuView` ontvangt favoritesCount/persistence/preferences, onSaved en onFeedback. Existing `confirmContext(selection)` is de enige toepassing van een confirmed draft.

- [ ] Test één samenvattingsknop, drie conceptvelden, confirm van alle velden, cancel/Escape/popstate verwerpen, bestaande resultcontext onveranderd. Test support returnTo, dubbele Menu-open geen extra history-entry en focusrestore met verdwenen opener.
- [ ] Run `npm test -- src/app/App.test.tsx src/app/navigation.test.ts src/features/inspiration/generator.test.tsx`; nieuwe gedragstests falen.
- [ ] Integreer navigation helpers zonder bestaande history-state van de host te overschrijven; voeg menu/saved-detail-routes toe. Drie selects beheren draft lokaal; opener/back/browsergedrag volgt spec. Geen categorieknoppenrij of afzonderlijke intentroute meer.
- [ ] Update displaylabels en tokens naar de volledige gekozen wereld; verwijder oude brand-note. Eén resultaatkolom, shared support shell, selecteerbare tekst en native acties. Eerste bezoek heeft nog geen kopieer/save/check; contextafwijking toont 'Voor je volgende tik'.
- [ ] Maak responsive stijl voor 390×844/320×568; geen fixed hoogte/clipping die zoom blokkeert. De stage blijft de hoofdhandeling; middelste figuur schaalt vóór belangrijke tekst/targets.
- [ ] Run gerichte tests en typecheck; uiterlijk wordt in taak 6 één keer volledig gecontroleerd.
- [ ] Commit `feat: unify Klets navigation and selection`.

## Task 4 — Catalogus en snapshotacties

**Files:** catalogusbestanden/redactioneel record; wijzigen useGenerator/model/Result indien nodig; extend catalog.test.ts/generator.test.tsx/storage.test.ts.

**Interfaces:** behoud `Idea`, `ResultSnapshot`, `Favorite`, `eligibleIdeas`, `reserveIdea`; nieuwe actieve IDs `<intent>-v2-001..072`. Resultactie-API voeg gericht `copySnapshot(snapshot:ResultSnapshot):Promise<CopyOutcome>` toe; `CopyOutcome = { ok: boolean; message: string }`; `copyCurrent()` delegeert met current-at-click en bindt zijn status aan dat actie-ID. Saved detail houdt een lokale kopieerstatus voor zijn eigen snapshot; een late uitkomst mag een andere weergave niet wijzigen. `saveSnapshot(snapshot)` blijft bestaan. Bestaande catalogussignature is poolversieautoriteit.

- [ ] Update test voor 288 entries / 72 per intent / 12 per cel, unieke IDs/tekst, één situatie / één toon / maximaal 160 tekens. Test oude favoriet met retired ID houdt eigen tekst; contentwijziging vernieuwt pool zonder favorietenreset.
- [ ] Extend actiontest: A zichtbaar, B pending vóór 150ms, roomcheck/save/copy geactiveerd → snapshot A, B finaliseert eenmaal, geen stale succesmelding bij B; bij zichtbare B snapshot B. Directe dubbele tik reserveert eenmaal.
- [ ] Run `npm test -- src/features/inspiration/catalog.test.ts src/features/inspiration/generator.test.tsx src/features/preferences/storage.test.ts`; nieuwe catalogusverwachting faalt.
- [ ] Schrijf 288 nieuwe actieve entries, gebalanceerd 12 per cel, IDs expliciet/stabiel; behoud oude IDs als retired, hergebruik ze niet. Update catalogusversie bij uitvoeringsdatum. Geen copywijziging van bestaande favoriete snapshots.
- [ ] Redigeer alle 288 entries op natuurlijke zin, intentverschil, daadwerkelijk volwassen D/s, correcte remote/together-tagging, handelingsruimte van beide partners, geen clichés of grafische inhoud. Noteer coverage en verworpen dubbels in redactioneel record; automatische teltokens alleen bewijzen geen kwaliteit.
- [ ] Maak copySnapshot/saveSnapshot onveranderlijk vanaf de klik en notices snapshotgebonden; behoud oorspronkelijke selectie. Laat selection.ts signatures en storageversion ongemoeid als gerichte tests passen.
- [ ] Run genoemde tests; bekijk langste resultaatzin binnen responsivebudget in taak 6.
- [ ] Commit `feat: add balanced adult Klets v2 inspiration catalog`.

## Task 5 — Momentcheck, bewaardetail, undo en voorkeuren

**Files:** RoomCheck/SavedIdeas/SavedIdeaDetail/useGenerator/App/MenuView; create `supportFlows.test.tsx`; extend storage.test.ts.

**Interfaces:** `SavedIdeaDetail({snapshot:Favorite,onCopy():Promise<CopyOutcome>,onCheck():void,onRemove():void})`; `RoomCheck` ontvangt immutable route.snapshot. `useGenerator` exposeert `undoAvailable:boolean`, `removedLabel:string|null` naast bestaande removeFavorite/undoRemoval; beide komen uit controllerstate zodat view-unmount undo niet verwijdert. Eén deletebuffer, vervangen bij volgende delete; gewist bij undo. Geen extra opgeslagen schemafield nodig.

- [ ] Test bewaren snapshot A terwijl draw B loopt, duplicate save doet geen write, delete→menu→saved→undo herstelt oorspronkelijke positie, detail met oud ID, waardering zonder opdracht-checkin, check → selection cancel behoudt snapshot.
- [ ] Test geblokkeerde clipboard geeft handmatige selectie, geblokkeerde opslag geeft sessiestatus, malformed/unknownversion data blijft onaangeroerd, voorkeurtoggles blijven behouden na terugkeer.
- [ ] Run `npm test -- src/features/inspiration/supportFlows.test.tsx src/features/preferences/storage.test.ts`; nieuwe undo/detailvragen falen.
- [ ] Bouw overzicht/detail/emptystates; verplaats de zichtbaarheid van undo uit SavedIdeas-localstate naar controller. Toon opslagtekst op basis van persistence, met de browser als opslagplek.
- [ ] Bouw drie specifieke reflectievragen per intent en natuurlijke afstemzin; appreciation zonder checkin. Geen antwoorden/score/gedragsregistratie. Ander idee keert naar de generator en activeert pas na terugkeer; contextwijziging trekt zelf niets.
- [ ] Run gerichte tests en typecheck; commit `feat: complete reflection and saved idea flows`.

## Task 6 — Volledige review, canonical systeem en oplevering

**Files:** canonicalcontext uit overzicht; deterministic fallback indien asset later is gewijzigd; review evidence uitsluitend in de genegeerde directory `.impeccable/review/`.

- [ ] Run `npm test`, `npm run typecheck`, `npm run build` eenmaal voor de geïntegreerde branch. Update verouderde tests naar het expliciete nieuwe gedrag; verwijder geen snapshot/race/storageinvariant om green te halen.
- [ ] Eén gebatchte browserinspectie op 1024×900, 390×844 en 320×568: generatorfirst/result/longesttext, selection/menu/check/checkin/saved/detail/empty/fallback; keyboard/back, zoom 200%, deniedstorage, assetfail en hidden-tab. Leg rust/contact 150ms / druk 175ms / terugtrekken 310ms vast met settled UI.
- [ ] Meet assetbytes/triangles/drawcalls/DPR; meet fps op een vastgelegde fysieke telefoon indien beschikbaar. Record budgetoverschrijding of ontbrekend apparaatbewijs eerlijk; emulatie bewijst schermlayout, geen iOS-GPUbewijs.
- [ ] Mini-audit: (a) volwassen herkenbare vorm en contact, (b) rustige bediening en native focus, (c) leesbaarheid/non-scrollbereikbaarheid, (d) passende contextcontent en handelingsruimte van beide partners. Eén materiaalfixbatch; alleen geraakte checks en captures herhalen. Stop bij opgeloste findings, geen nieuwe decoratiehunt.
- [ ] Eén fresh onafhankelijke branchreview met originele brief, spec, relevante code en daadwerkelijke screenshots. Review geen frames die ontbreken; beoordeel alle materiële fixes. Geen extra broadtestloops zonder nieuwe failure/codewijziging.
- [ ] Werk AGENTS/PRODUCT/DESIGN + tokenbearing `.impeccable/design.json` bij naar de daadwerkelijke bouw: vervang de candy-wereld en immediate-intent-regel, registreer 288 actieve entries en één bevestigde selectie. Documenteer tech/copy/motion/rendererstate; geen specaannames als bewezen bevindingen.
- [ ] Commit `docs: record Klets v2 design and verification`. Open een reviewbare PR vanaf featurebranch; geen merge/productiedeploy binnen deze planningopdracht. Na uitvoering volg expliciete integratieautoriteit uit die sessie.

## Parallelle uitvoering en regressiegrenzen

Eerder gevraagde expertagents blijven nuttig: model/renderer expert en contenteditor kunnen op gescheiden files tegelijk werken zodra modelcontract vaststaat; root beheert shell/routes/controller. Eén integrator wijzigt App/useGenerator zodat geen conflict in snapshot/history/undo. Een onafhankelijke reviewer beoordeelt het geheel na integratie. Geen agent voor elk bestand of elke microcorrectie.

De task1-vormpreview is de belangrijkste creatieve beslisgrens. Bij vormafwijzing vervang alleen model/materiaal/choreografie; blijf uit controller/storage. Bij UI-fix niet opnieuw de 288 teksten hergenereren. Bij catalogusfix niet opnieuw de rendererarchitectuur wisselen. Elke taskcommit heeft een zelfstandig verifieerbaar resultaat, geen halfafgemaakte productiebranch.

## Zelfreview van dit plan

Alle specgebieden hebben een task: model 1; timing/lifecycle/budget 2+6; shell/routes/selectie 3; content/snapshots 4; reflectie/storage/undo 5; canonical docs/complete audit 6. IDs, timings, assetnamen en stategrenzen zijn consistent. Bestaande AGENTS-voorschriften die dit voorstel vervangt blijven tijdens planning ongewijzigd. Native DOM is een expliciete architectuurkeuze, geen stilzwijgende full-canvas-belofte. Geen scopes voor later zijn in de v2-taken verplaatst.
