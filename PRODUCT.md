# Product: Klets

<!-- impeccable:product-schema 1 -->

Status: versie 1 geïmplementeerd op 13 oktober 2026. Dit document beschrijft het gebouwde product; gebruikersonderzoek en hostingacceptatie zijn niet vastgesteld.

## Platform

web

## Stack

React, TypeScript en Vite, met een afzonderlijke Three.js-scène. Direct ontwerpen en bouwen vanuit code is goedgekeurd. Hosting is nog niet gekozen.

## Users

De gebruiker zoekt inspiratie voor een vrijwillige volwassen D/s-relatie en kiest als Dom een passende zin. De partner ontvangt alleen een bericht dat de gebruiker zelf deelt. De app meet haar stemming, motivatie of instemming niet. Beide rollen moeten ruimte houden voor afstemmen, initiatief en overslaan.

## Product Purpose

Een speelse, snelle manier om kleine verzoekjes, plagerige aandacht, waardering en verlangen te vinden. Het doel is een bruikbaar idee binnen het moment en de gezamenlijke dynamiek. Een trekking of bewaaractie betekent niet dat een verzoek is uitgevoerd.

## Positioning

Een geklede 3D-snoepmascotte maakt één passend idee trekken een herkenbaar ritueel: aanraken, tik, terugvering, onthulling. De gebruiker kiest de context en beslist zelf over bewaren, kopiëren en delen.

## Operating Context

Gebruik op telefoon of computer, samen of op afstand. Tekst is kort, natuurlijk Nederlands, direct en speels. Kopiëren gebeurt op eigen keuze; er is geen automatische verzending of Telegram-integratie. Voorkeuren en favorieten blijven in de gebruikte browser en zijn zichtbaar voor wie die browser gebruikt.

## Capabilities and Constraints

- De catalogus bevat 160 ideeën: 40 per categorie Opdrachtje, Plagen, Waardering en Verlangen.
- Samen/Op afstand en Lief/Speels/Direct filteren de selectie. Categorieën wijzigen direct; contextwijzigingen vragen bevestigen of annuleren.
- De generator mengt passende ideeën en vermijdt directe herhaling wanneer alternatieven bestaan. Het resultaat bewaart zijn oorspronkelijke context.
- Eén geaccepteerde tik produceert één idee; tijdens herstel wordt geen nieuwe actie gestart.
- Resultaattekst kan handmatig worden gekopieerd en lokaal als favoriet worden bewaard. Favorieten kunnen worden verwijderd en een verwijdering kan worden hersteld.
- De optionele momentcheck toont reflectievragen en, waar passend, een te kopiëren afstemzin. Antwoorden worden niet ingevuld of opgeslagen.
- Voorkeuren en favorieten gebruiken versieerbare lokale opslag. Bij weigering, onleesbare of onbekende opgeslagen gegevens gaat de sessie verder zonder die gegevens stilzwijgend te overschrijven.
- Geluid staat standaard uit. De systeemvoorkeur voor minder beweging wordt gevolgd; beweging kan ook onafhankelijk worden gepauzeerd.
- De normale generator gebruikt één viewport. Lage schermen hebben een compacte categoriekeuze; bij kleine viewports en langere ondersteuning blijft scrollen mogelijk.
- Eigen ideeën, initiatief vanuit de sub, gezamenlijke voorkeuren, Good Girl Points, coupons, accounts, synchronisatie en integraties zijn latere opties en niet gebouwd.

## Brand Commitments

Speels en uitgesproken in beweging; helder en persoonlijk in tekst. De geklede billen vormen de centrale interactie. Klets is de productnaam. Peach, lavendel, zachte 3D-materialen, Fraunces en Nunito Sans vormen het gebouwde visuele systeem; zie DESIGN.md.

## Evidence on Hand

De opdracht, de gekozen visuele richting, de goedgekeurde bouw vanuit code, broncode en lokale verificatie vormen het beschikbare bewijs. Er zijn geautomatiseerde tests voor catalogus, selectie, controller, opslag, navigatie en stage-timing. Resultaten van de bouwchecks staan bij de implementatievoortgang. Er zijn geen gebruikerstests, CI-resultaten of gekozen hosting als acceptatiebewijs opgevoerd.

## Product Principles

1. Passendheid gaat vóór verrassing; variatie ontstaat binnen de gekozen context.
2. Eén hoofdhandeling per scherm; verdieping krijgt ondersteunende weergaven.
3. Beide rollen behouden ruimte voor initiatief, afstemmen en overslaan.
4. Animatie bevestigt een actie en laat de inhoud leesbaar.
5. Nieuwe functies sluiten aan op gedeelde begrippen, componenten en gegevensgrenzen.

## Accessibility & Inclusion

Bediening gebruikt echte knoppen en invoer, zichtbare focus, selecteerbare tekst en statusmeldingen. De decoratieve scène is verborgen voor hulpmiddelen; een stil beeld of tekstfallback houdt de hoofdknop bruikbaar zonder WebGL. Reduced motion, bewegingspauze en optioneel geluid houden hetzelfde resultaatpad. De scrollvrije compositie mag noodzakelijke inhoud bij zoom of kleine schermen niet onbereikbaar maken. Lokale checks zijn geen bewijs van passendheid voor iedere gebruiker of elk hulpmiddel.
