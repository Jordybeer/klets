# Klets — voorgestelde 3D-modelpreview

Dit is de eerste creatieve handoff van het Three.js-v2-plan. De live generator, catalogus, opslag en navigatie zijn niet vervangen. Het model is een volledig geklede, gestileerde volwassen sculptuur met één hand en lokaal vervormend broekje; een geschikt model vraagt visuele beoordeling, niet alleen groene tests.

De deterministische bron staat in `scripts/stage/model-shapes.mjs`; `build-model.mjs` exporteert GLB en een manifest met nodes, morphs, contactankers, transformwaarden en grootte. `asset.ts` valideert de contracten en ruimt gedeelde resources eenmaal op. De losse preview gebruikt deze echte GLB en continue Three.js-rendering. Hij bevat alleen voorbeeldzinnen en geen volledige inspiratiecollectie.

Reproduceren vanuit de repository:

```bash
node scripts/stage/build-model.mjs --fashion
node node_modules/vite/bin/vite.js build --config scripts/stage/preview.config.mjs
node scripts/stage/package-preview.mjs /workspace/klets-fashion.html
```

De fallback PNG wordt uit de werkelijke rustpose gerenderd. Packaging neemt die PNG, lokale Fraunces/Nunito Sans, de actuele GLB, het manifest en een gebundelde renderer op. Het resultaat bevat geen runtime externe assetrequests. De scène is een native knop; selecteerbare tekst en minder beweging blijven buiten WebGL.

Deze preview stopt beweging in rust; het latere begrensde idle-ritueel hoort bij productie-integratie. Voorkeuren en voorbeeldresultaten blijven lokaal in de geopende preview, zonder koppeling aan productopslag. Device-FPS is niet gemeten. De volledige app wordt pas volgens het v2-plan opgebouwd nadat de modelrichting concreet is beoordeeld.

## Richting na feedback: After dark

De gebruiker verwierp het lieve karakter en keurde een donkere club/editorial-richting goed. Deze preview gebruikt nu zwart leer (roughness .52, metalness 0, clearcoat .10), kleine geborstelde metalen kledingdetails, warm hoofdlicht en een rode randbelichting. De bedekte vorm en bestaande interactiecontracten blijven behouden.

Previewtokens: achtergrond #130c0e, oxblood #45171e/#271116, tekst #f1e7df, ondersteunend #c3aeaa, accent #e0b59f. Fraunces draagt het grote KLETS-woordmerk (96/88/80px), Nunito Sans de bediening; hoofdtekst blijft maximaal 24ch. Hoeken zijn 2–3px. De scène is de enige primaire actie; pauzeren blijft bereikbaar. Dit is de goedgekeurde richting voor deze modelpreview, geen registratie van een reeds omgebouwde productie-app.

De WebP-fallback wordt rechtstreeks uit dezelfde rustpose gerenderd en vervangt de grotere PNG in het inline pakket. Het pakket controleert nog steeds de totale limiet van 1 MB; het GLB-budget is met 10 KB verhoogd voor de metalen details. De nieuwe asset heeft 42.946 driehoeken en zeven meshes. Geen extra runtime requests of dependencies.


## Geklede fashion-variant

De nieuwste variant gebruikt een doorlopende, ondoorzichtige mini rok met één gevoerde zoom en een rustige paneelnaad. De bron deelt de bestaande modelpipeline; `--fashion` exporteert afzonderlijke `klets-fashion`-assets en overschrijft de eerdere shorts-assets niet. Packaging gebruikt nu deze fashion-assets. De kijker verbergt de compatibiliteitshand en gebruikt alleen een begrensde lichtcue van 600ms bij klikken; er is geen handcontact of lichaamsvervorming zichtbaar. De camera kadert de rok en benen, niet de verborgen hand.

De export blijft compatibel met het assetcontract. De huidige zichtbare scène telt 21.954 driehoeken en drie draw calls. Het inline pakket is 857.696 bytes. De rok werd aan de onderkant ruimer gemaakt nadat de eerste capture huiddoorbraak liet zien; de tweede gecombineerde desktop/390px/320px-capture toont een doorlopende bedekking. Klikken en direct onthullen bij minder beweging zijn in de sandbox geverifieerd. De productie-app is niet omgebouwd of gedeployed.
