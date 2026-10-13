---
name: Klets
description: Speelse 3D-interactie met rustige, passende inspiratie
colors:
  background: "#fff1e8"
  surface: "#fffaf6"
  ink: "#44283f"
  muted: "#765866"
  peach: "#f4b7a7"
  lavender: "#b8a2e8"
  lavender-soft: "#e9def5"
  lavender-strong: "#6e4b9d"
  line: "#d9c9ce"
  primary-hover: "#60405b"
  secondary-hover: "#dccbeb"
  scene-peach: "#ed9b7d"
  scene-lavender: "#9873d2"
  scene-trim: "#ad91e4"
  scene-stitch: "#d5c0f4"
  scene-seam: "#8763bf"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(24px, 2.6vw, 31px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-.025em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "38px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-.03em"
  body:
    fontFamily: "Nunito Sans, ui-sans-serif, sans-serif"
    fontSize: "16px"
    fontWeight: 400
  label:
    fontFamily: "Nunito Sans, ui-sans-serif, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.5
rounded:
  text: "8px"
  choice: "12px"
  control: "24px"
  stage: "28px"
  switch: "20px"
  circle: "50%"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 22px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.lavender-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 22px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover}"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.circle}"
    padding: "10px"
    width: "44px"
  intent-selected:
    backgroundColor: "{colors.lavender-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  choice-selected:
    backgroundColor: "{colors.lavender-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.choice}"
    padding: "12px 16px"
  check-in:
    backgroundColor: "{colors.lavender-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.choice}"
    padding: "16px"
  text-navigation:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.text}"
    padding: "8px 12px"
---

# Design System: Klets

## Overview

**Creative North Star: "Een speels ritueel voor twee"**

De zachte 3D-snoepmascotte is het tastbare middelpunt. De warme achtergrond en rustige bediening laten het idee leesbaar blijven. Humor zit in de beweging; de tekst blijft kort, volwassen en natuurlijk.

Nieuwe functies gebruiken dezelfde kleuren, letters, selectie- en terugkeerpatronen. De expressieve scène blijft gescheiden van de betekenis van het bericht.

**Key Characteristics:**
- Tastbare, geklede mascotte met zachte materialen.
- Rustige tekst naast een expressieve interactie.
- Dezelfde keuzes en terugkeer op ruime en lage schermen.
- Beweging en geluid blijven onder eigen controle.

Deze registratie beschrijft de implementatie van 13 oktober 2026. De CSS-tokens staan in `src/styles/tokens.css`; componenten, layout en scène bepalen de overige waarden. De sidecar bevat aanvullende motion, breekpunten en zelfstandige voorbeelden.

## Colors

Peach geeft warmte aan het materiaal; lavendel verbindt de mascotte met de bediening. Donkere pruim draagt de tekst.

### Primary

- **Lavendel-sterk:** focus, de merkpunt, selectie-indicatoren en ingeschakelde schakelaars.
- **Lavendel en zacht lavendel:** selectieranden, geselecteerde vlakken en secundaire acties. Gebruik donkere tekst op deze lichte vlakken.

### Secondary

- **Peach:** warm materiaalpalet. De scène heeft eigen peach- en lavendeltokens voor het verlichte object; de UI-kleuren worden niet rechtstreeks als zichtbaar 3D-eindresultaat geïnterpreteerd.
- **Scènerand, stiksel en naad:** lichte bies, lichtere stiksels en donkere broeknaad binnen hetzelfde materiaal.

### Neutral

- **Warme crème:** achtergrond van de volledige app.
- **Licht oppervlak:** hovervlakken en lichte tekst op de primaire knop.
- **Pruim en gedempte pruim:** hoofdtekst respectievelijk context en toelichting.
- **Lijn:** rustige scheiding en ongekozen controles.
- **Hoverkleuren:** donkerder pruim voor primaire acties, voller zacht lavendel voor secundaire acties.

**The Selectie Rule.** Selectie gebruikt een licht lavendelvlak, een lavendelrand en herkenbare tekst of een indicator; kleur draagt de staat nooit alleen.

## Typography

**Display Font:** Fraunces, met Georgia en serif als fallback.
**Body Font:** Nunito Sans, met ui-sans-serif en sans-serif als fallback.

De letters zijn lokaal gebundeld via Fontsource. Fraunces geeft de boodschap karakter; Nunito Sans houdt bediening en uitleg rustig.

- **Display:** de resultaatzin, begrensd tot 27ch; op mobiel en lage schermen wordt de maat aangepast (24–27px).
- **Headline:** titel van ondersteunende weergaven; kleiner op mobiel en lage schermen (30–34px).
- **Body:** basistekst; ondersteunende uitleg gebruikt ook 15px met 1.5 regelafstand.
- **Label:** gewone actieknoppen; context en korte toelichting gebruiken 11–14px.
- **Merk:** Fraunces (600, 45px, .9 regelafstand); compactere shellvarianten gebruiken 39px of 32px.

**The Leesbare boodschap Rule.** Een idee blijft selecteerbare HTML-tekst; de scène toont geen noodzakelijke inhoud.

## Layout

De shell centreert een kolom met een maximum van 1120px. De generator is maximaal 520px breed; ondersteuning 540px. Desktoppadding is 24px 48px 16px; tot 600px breed wordt dat 16px 20px 12px. De vaste shellhoogte gebruikt de dynamische viewport; ondersteuning mag langer worden.

De generator reserveert afzonderlijke rijen voor context, categorie, scène, resultaat en acties. De normale scène kan tot 300px hoog worden, boven 950px schermhoogte tot 340px. Een lage layout verkleint eerst de ruimte; onder 700px hoogte vervangt één categorieknop het tweekolomsraster. Onder 620px blijft 164px beschikbaar voor de scène. Onder 540px hoogte of 300px breedte wordt de shellhoogte automatisch, zodat inhoud bereikbaar blijft. Kleine schermen behouden de belangrijkste hitboxes (minimaal 44px hoog).

Gebruik de bestaande schaal voor tussenruimte. Ondersteunende weergaven vervangen de generator binnen dezelfde shell en behouden een terugknop en focusherstel. Langere lijsten blijven gewone leesbare inhoud, geen extra dashboard op het generatorscherm.

## Elevation & Depth

De interface is grotendeels vlak: lichte vlakken en dunne lijnen groeperen informatie. De 3D-mascotte levert de diepte met zachte belichting en een diffuse contactschaduw. Het schuifknopje heeft een kleine schaduw (0 2px 4px #44283f20). Voeg bij gewone panelen dezelfde rustige vlakverdeling toe.

## Shapes

Actie- en categorieknoppen gebruiken zachte, afgeronde uiteinden. Keuzevelden en de afstemzin hebben kleinere hoeken; pictogramknoppen zijn rond. Het 3D-object blijft een geklede snoepachtige sculptuur met een korte broek, zachte naden en één gestileerde hand. De klikbare scène heeft een eigen afgerond focusvlak.

## Components

### Buttons

Primaire acties gebruiken pruim met lichte tekst; secundaire acties zacht lavendel met pruim. Ze delen een minimale hoogte (44px), padding en lettergewicht. Hover wisselt het vlak; indrukken verschuift een actieknop beperkt (1px). Pictogramknoppen zijn 44px breed. Tekstacties hebben een eigen rustige hoverkleur.

Toetsenbordfocus krijgt een lavendel-sterke lijn (3px, 4px offset); radiokeuzes gebruiken 3px offset en de scène 1px. Een onbeschikbare gewone knop wordt gedempt; de scène behoudt focus en gebruikt `aria-disabled` tijdens een trekking.

### Chips

Categorieën staan in een raster met twee kolommen. De geselecteerde keuze gebruikt een zacht vlak, een rand, zwaardere tekst en een puntindicator. Op lage schermen toont één compacte knop de categorie en opent dezelfde keuzes. De categorie wijzigt direct de volgende trekking.

### Inputs / Fields

Situatie en toon zijn echte radiokeuzes in afgeronde labels. De situatie staat in twee kolommen, de toon in een verticale lijst met korte uitleg. Alleen bevestigen past de context aan. Instellingen gebruiken echte checkboxes met een visuele schakelaar (44×26px); de omringende rij is de ruime klikzone. Focus blijft zichtbaar op de visuele controle.

### Cards / Containers

Ondersteuning heeft een titel, uitleg en terugkeer binnen de shell. De momentcheck gebruikt een tekstquote en vragen met dunne scheidingslijnen. Een afstemzin krijgt een zacht lavendelvlak en gewone selecteerbare tekst. Favorieten staan in een lijst met tekst, oorspronkelijke context en een verwijderknop.

### Navigation

Merk, terugknop, instellingen en opgeslagen ideeën vormen de navigatie. Ondersteuning gebruikt de browsergeschiedenis; bij terugkeer gaat focus naar de opener of de weergavetitel. Maak nieuwe navigatie herkenbaar met hetzelfde tekst- of pictogrampatroon.

### PlayStage en resultaat

De decoratieve canvas staat binnen een echte knop. Bij ontbreken van WebGL blijft een stil beeld bruikbaar, met een tekstfallback als dat beeld ontbreekt. Eén geaccepteerde tik heeft één actie-ID. Contact publiceert eenmaal na 150ms; herstel eindigt na 600ms. De hand nadert vanaf 40ms, trekt na 190ms terug en de vervorming veert gedempt uit. Rustbeweging is een kleine rotatie met een cyclus van 6 seconden.

Het resultaat verschijnt met een opacity-overgang (180ms, 90ms vertraging), zonder tekstverplaatsing. Bedieningswissels duren 150–160ms met de gedeelde ease-out. Reduced motion en pauzeren geven direct resultaat zonder reis- of veerbeweging. Ondersteuning, verborgen tab en verlies van WebGL ronden een lopende actie af; een optioneel geluid is nooit nodig voor publicatie. Geluid staat standaard uit.

**The Eén tik Rule.** Motion bevestigt één actie; extra input tijdens herstel produceert geen tweede idee.

## Do's and Don'ts

### Do:
- Gebruik de bestaande tokens en dezelfde knoppen voor nieuwe functies.
- Toon selectie met vorm en tekst, en geef toetsenbordfocus een zichtbare lijn.
- Behoud leesbare resultaattekst, ook zonder 3D, beweging of geluid.
- Gebruik de compacte categoriekeuze op lage schermen en laat extra inhoud bereikbaar blijven.

### Don't:
- Voeg geen tweede visuele wereld toe voor opgeslagen ideeën of toekomstige modules.
- Gebruik kleur of beweging niet als bewijs van stemming, instemming of uitvoering.
- Maak de boodschap niet afhankelijk van een geslaagde 3D-render of hoorbaar geluid.
- Verstop noodzakelijke inhoud niet met overflow om de scrollvrije compositie te behouden.
