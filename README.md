# ProteinKompass

Eine vollständig statische Website für eine Komplexe Leistung (KoL). Sie berechnet einen transparenten Protein-Orientierungswert für Jugendliche von 10 bis 19 Jahren, filtert Lebensmittel nach Ernährungsform und verwaltet die Daten lokal im Browser.

## Funktionen

- Berechnung: `Körpergewicht × Grundbedarf (g/kg) + Körpergewicht × Sport-Zuschlag (g/kg)`.
- Getrennte Anzeige von allgemeinem Bedarf und möglichem Mehrbedarf durch Sport.
- 18 Start-Einträge mit Proteinwert je 100 g, Portionsgröße, Kategorie, Ernährungsform und Quellenhinweis.
- Vorschlagskarten rechnen die gezeigte Menge jeweils nach. Gerichte erscheinen ausschließlich als ganze Portionen, Eier/Brot als ganze Stückzahl; Lebensmittel mit Gramm-Logik werden auf 5 g aufgerundet.
- Datenbank-Suche und Filter sowie lokaler Admin-Bereich für Einträge und Rechenregeln.
- Responsives, dunkles Glass-Design; keine Frameworks, kein Server und keine personenbezogenen Daten.

## Fachliche Grundlage und Grenzen

Die Standard-Grundwerte sind für dieses Lernwerkzeug auf **0,9 g/kg Körpergewicht/Tag** für 10–19 Jahre gesetzt. Die DGE nennt 0,9 g/kg für 10–<15 Jahre sowie bei 15–<19 Jahren 0,9 g/kg für Jungen und 0,8 g/kg für Mädchen. Da der Rechner kein Geschlecht abfragt, verwendet er die einheitliche, dokumentierte 0,9-g/kg-Orientierung. Die Werte gelten für Normalgewicht. Die Sport-Zuschläge (0 / 0,05 / 0,10 / 0,20 g/kg) sind keine DGE-Empfehlung, sondern im Admin-Bereich sichtbar als pädagogische Modellannahme konfigurierbar.

Die Einzel-Lebensmittelwerte sind typische, gerundete Werte pro 100 g nach dem [Bundeslebensmittelschlüssel (BLS) des Max Rubner-Instituts](https://www.mri.bund.de/de/institute/ernaehrungsverhalten/forschungsbereiche/bundeslebensmittelschluessel-bls/). Die drei Mahlzeiten sind bewusst als Rezeptur-Schätzungen gekennzeichnet; ihre Proteinsumme wird stets aus `Protein je 100 g × Portionsgewicht / 100` berechnet. Markenprodukte und Rezepte können abweichen.

Quellen:

- [DGE: Referenzwerte Protein](https://www.dge.de/wissenschaft/referenzwerte/protein/)
- [Max Rubner-Institut: Bundeslebensmittelschlüssel](https://www.mri.bund.de/de/institute/ernaehrungsverhalten/forschungsbereiche/bundeslebensmittelschluessel-bls/)

Bei Krankheit, Essstörung, Untergewicht, besonderem Trainingsziel oder veganer Ernährung mit Unsicherheiten gehört die individuelle Beratung in ärztliche bzw. qualifizierte ernährungsfachliche Hände.

## Projektstruktur

```text
Proteinkalkulator_/
├── index.html   # Inhalte, Formulare und Seitenstruktur
├── styles.css   # responsives Glass-Design
├── app.js       # Datenmodell, Berechnung, Vorschläge, localStorage-Admin
└── README.md    # Dokumentation und Veröffentlichung
```

## Lokal starten und prüfen

`index.html` im Browser öffnen. Es ist kein Build-Schritt nötig. Für die KoL-Dokumentation sind besonders das Datenmodell `defaultFoods`, `defaultRules`, die Funktion `calculate()` und die Funktion `amountForTarget()` in `app.js` relevant.

### Manuelle Prüffälle

| Eingabe | Erwarteter Rechenweg | Ergebnis |
|---|---:|---:|
| 15 Jahre, 55 kg, kein Sport | 55 × 0,9 + 55 × 0 | 49,5 g |
| 15 Jahre, 55 kg, mittel | 55 × 0,9 + 55 × 0,1 | 55,0 g |
| 12 Jahre, 40 kg, intensiv | 40 × 0,9 + 40 × 0,2 | 44,0 g |

Prüfe zusätzlich: veganer Filter blendet Ei, Milchprodukte, Fleisch und Fisch aus; ein Gericht wird im Vorschlag als 1, 2, … Portionen gezeigt; ein Ei wird nur als ganze Stückzahl gezeigt.

## Kostenlos mit GitHub Pages veröffentlichen

1. Auf GitHub ein neues öffentliches Repository anlegen, zum Beispiel `proteinkompass`.
2. Diese vier Dateien in das Hauptverzeichnis des Repositories hochladen und committen.
3. Im Repository **Settings → Pages** öffnen.
4. Unter **Build and deployment** bei *Source* `Deploy from a branch` wählen. Branch `main` und Ordner `/(root)` auswählen, dann speichern.
5. Nach kurzer Zeit zeigt GitHub dort die öffentliche Adresse an, meist `https://DEIN-NAME.github.io/proteinkompass/`.

Weil die Anwendung nur HTML, CSS und JavaScript verwendet, funktioniert sie direkt auf GitHub Pages. Admin-Änderungen sind absichtlich nur lokal im jeweiligen Browser gespeichert und werden nicht in das GitHub-Repository hochgeladen.
