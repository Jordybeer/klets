---
name: Klets
description: Speelse 3D-interactie met rustige, passende inspiratie
---

<!-- SEED: selected candy-like direction; proposed system rules pending review. Extract implemented tokens once the app exists. -->

# Design System: Klets

## Overview

**Creative North Star: "Een speels ritueel voor twee"**

De gekozen wereld heeft zachte 3D-snoepvormen en een tastbaar, veerkrachtig middelpunt. De interface eromheen maakt de boodschap en de keuzes makkelijk leesbaar. Humor zit in de bewegende mascotte, de toon blijft volwassen en natuurlijk.

Het systeem heeft drie lagen: een blijvende, rustige bedieningslaag; één expressief object; en ondersteunende weergaven voor verdieping. Iedere toekomstige functie gebruikt diezelfde lagen en dezelfde betekenis van kleur, selectie, bevestiging en terugkeer.

**Key Characteristics:**
- Tastbare centrale interactie.
- Duidelijke hiërarchie en ruime tekst.
- Herkenbare ondersteunende patronen.
- Speelse motion met een vast moment van resultaat.

## Colors

Peach en lavendel zijn gekozen richtingkleuren. De onderstaande waarden in de blueprint zijn voorstellen voor de bouw, nog geen geëxtraheerde of goedgekeurde implementatietokens.

- Warme crème: hoofdachtergrond.
- Peach: materiaal van de mascotte en warme accenten.
- Lavendel: broekje en zacht geselecteerde oppervlakken.
- Diepe pruim: tekst, nadruk en focus.
- Functionele kleuren worden later per betekenis gecontroleerd; momentchecks gebruiken geen toestemmingsscore.

## Typography

Een warme displayletter voor een korte kop en de inspiratie; een rustige sans-serif voor bediening en uitleg. Fraunces en Nunito Sans zijn kandidaatfamilies. De wireframe gebruikt lokaal beschikbare systeemletters en toont structuur, geen definitieve letterkwaliteit.

**The Readable Message Rule.** Een idee blijft tekst, selecteerbaar en toegankelijk; het verschijnt niet uitsluitend in canvas of een afbeelding.

## Layout

Compacte bediening, herkenbaar middelpunt, gereserveerde ruimte voor de boodschap. De hoofdweergave blijft één viewport bij standaardtekst en gangbare apparaten. Op lage schermen wordt de categoriebediening compacter voordat het centrale object verder krimpt; tekst en hitboxes blijven bereikbaar. Ondersteunende weergaven vervangen de hoofdinhoud binnen dezelfde shell en behouden terugkeer en toestand. Beweging kan worden gepauzeerd en dezelfde hoofdhandeling blijft bruikbaar.

## Elevation & Depth

Diepte hoort bij het 3D-object en bij tijdelijk bovenliggende weergaven. De kerninhoud staat rustig op de achtergrond. Contactschaduw verankert het object; beweging beïnvloedt de schaduw zonder het hele scherm te laten schudden.

## Shapes

Zachte, volle vormen voor het object en afgeronde controles. Vorm onderscheidt bediening en decoratie: bruikbare elementen hebben een consistente hitbox, focus en staat. Een pillvorm dient een korte selectie of filter; grotere informatie gebruikt gewone tekst en een rustig oppervlak.

## Do's and Don'ts

### Do:
- Gebruik één herkenbare bewegingsgrammatica voor nieuwe onderdelen.
- Behoud de gekozen materiaalwereld wanneer functies uitbreiden.
- Maak geselecteerd, gefocust en bezig afzonderlijk herkenbaar.
- Geef ieder nieuw onderdeel een duidelijke terugkeer naar de kernhandeling.

### Don'ts:
- Voeg geen tweede visuele wereld toe voor punten, afspraken of een bibliotheek.
- Gebruik kleur of animatie niet als bewijs van de stemming of instemming van de partner.
- Maak de boodschap niet afhankelijk van een geslaagde 3D-render of hoorbaar geluid.
- Verstop noodzakelijke inhoud niet met overflow om de scrollvrije eis te halen.
