# Klets

Klets is een React-webapp voor korte, passende inspiratie binnen een vrijwillige volwassen D/s-dynamiek. Een geklede 3D-mascotte geeft één idee per tik; situatie, toon en categorie bepalen de selectie. Versie 1 bevat 160 ideeën, handmatig kopiëren, lokale favorieten en een optionele momentcheck.

## Lokaal draaien

Gebruik Node.js 22.12 of hoger.

```bash
npm ci
npm run dev
```

Open de URL die Vite toont. Geluid staat standaard uit; minder beweging volgt de systeemvoorkeur en kan in de app worden gepauzeerd. Voorkeuren en favorieten blijven op het apparaat, met een sessiefallback als lokale opslag niet bruikbaar is.

## Controleren en bouwen

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

`build` controleert TypeScript en schrijft de productiebuild naar `dist/`. `preview` toont die build lokaal. Hosting is nog niet gekozen; deze opdrachten publiceren niets.

## Bronstructuur

- `src/app/`: shell, ondersteunende weergaven, browsergeschiedenis en focusherstel.
- `src/features/inspiration/`: catalogus, gegevensmodel, selectie, generatorcontroller, resultaat, context, momentcheck en favorieten.
- `src/features/preferences/`: gecontroleerde lokale opslag met sessiefallback.
- `src/features/stage/`: Three.js-scène, zelfstandige timing, optioneel geluid en fallback.
- `src/styles/`: gedeelde tokens, basis, layout en componenten. Fontsource bundelt Fraunces en Nunito Sans lokaal.

Inhoud, selectie, scène en opslag hebben afzonderlijke verantwoordelijkheden. De controller reserveert en publiceert het resultaat eenmaal; de scène kent de teksten niet. Kopiëren en bewaren gebruiken dezelfde tekstsnapshot.

## Documentatie

- [Productregels en huidige mogelijkheden](PRODUCT.md)
- [Gebouwd visueel systeem](DESIGN.md)
- [Vastgelegde ontwerprichting en herkomst](docs/design/direction.md)
- [Designsidecar](.impeccable/design.json)
- [Oorspronkelijke ontwerpblueprint](docs/superpowers/specs/2026-10-13-klets-design.md)
- [Schematische schermen](docs/design/blueprint.html)
- [Implementatieplan](docs/superpowers/plans/2026-10-13-klets-v1.md)
- [Implementatievoortgang](docs/implementation-progress.md)
- [Verificatieresultaten en grenzen](docs/verification-v1.md)

De blueprint en schematische schermen bewaren de ontwerpbeslissingen vóór de bouw. PRODUCT.md, DESIGN.md en de broncode beschrijven de huidige implementatie. Latere modules zoals eigen ideeën, punten, coupons of integraties zijn geen onderdeel van versie 1.
