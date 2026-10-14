# Klets — voorgestelde 3D-modelpreview

Dit is de eerste creatieve handoff van het Three.js-v2-plan. De live generator, catalogus, opslag en navigatie zijn niet vervangen. Het model is een volledig geklede, gestileerde volwassen sculptuur met één hand en lokaal vervormend broekje; een geschikt model vraagt visuele beoordeling, niet alleen groene tests.

De deterministische bron staat in `scripts/stage/model-shapes.mjs`; `build-model.mjs` exporteert GLB en een manifest met nodes, morphs, contactankers, transformwaarden en grootte. `asset.ts` valideert de contracten en ruimt gedeelde resources eenmaal op. De losse preview gebruikt deze echte GLB en continue Three.js-rendering. Hij bevat alleen voorbeeldzinnen en geen volledige inspiratiecollectie.

Reproduceren vanuit de repository:

```bash
node scripts/stage/build-model.mjs
node node_modules/vite/bin/vite.js build --config scripts/stage/preview.config.mjs
node scripts/stage/package-preview.mjs /workspace/klets-stage-v2.html
```

De fallback PNG wordt uit de werkelijke rustpose gerenderd. Packaging neemt die PNG, lokale Fraunces/Nunito Sans, de actuele GLB, het manifest en een gebundelde renderer op. Het resultaat bevat geen runtime externe assetrequests. De scène is een native knop; selecteerbare tekst en minder beweging blijven buiten WebGL.

Deze preview stopt beweging in rust; het latere begrensde idle-ritueel hoort bij productie-integratie. Voorkeuren en voorbeeldresultaten blijven lokaal in de geopende preview, zonder koppeling aan productopslag. Device-FPS is niet gemeten. De volledige app wordt pas volgens het v2-plan opgebouwd nadat de modelrichting concreet is beoordeeld.
