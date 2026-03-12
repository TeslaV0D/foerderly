"""
FÖRDERFINDER – Scraper v2.0
============================
Scrapt foerderdatenbank.de und erzeugt data/foerderprogramme.json

Installation:
    pip install requests beautifulsoup4 lxml

Verwendung:
    python scraper.py --test                     # Testlauf: Bayern, 5 Programme
    python scraper.py --land bayern --max 50     # Nur Bayern, max 50
    python scraper.py                            # Alle Laender, max 200
    python scraper.py --alle                     # Alles (dauert ~30min)
"""

import requests, json, time, re, os, sys, hashlib, argparse
from datetime import datetime
from bs4 import BeautifulSoup

BASE = "https://www.foerderdatenbank.de"
SEARCH = "/SiteGlobals/FDB/Forms/Suche/Expertensuche_Formular.html"
DELAY = 1.5

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "de-DE,de;q=0.9",
}

BL_PARAMS = {
    "bundesweit": "_bundesweit", "baden-wuerttemberg": "baden_wuerttemberg",
    "bayern": "bayern", "berlin": "berlin", "brandenburg": "brandenburg",
    "bremen": "bremen", "hamburg": "hamburg", "hessen": "hessen",
    "mecklenburg-vorpommern": "mecklenburg_vorpommern", "niedersachsen": "de_ni",
    "nordrhein-westfalen": "nordrhein_westfalen", "rheinland-pfalz": "rheinland_pfalz",
    "saarland": "saarland", "sachsen": "sachsen", "sachsen-anhalt": "de_st",
    "schleswig-holstein": "schleswig_holstein", "thueringen": "thueringen",
}

BL_SHORT = {
    "bundesweit": "BUND", "baden-wuerttemberg": "BW", "bayern": "BY",
    "berlin": "BE", "brandenburg": "BB", "bremen": "HB", "hamburg": "HH",
    "hessen": "HE", "mecklenburg-vorpommern": "MV", "niedersachsen": "NI",
    "nordrhein-westfalen": "NW", "rheinland-pfalz": "RP", "saarland": "SL",
    "sachsen": "SN", "sachsen-anhalt": "ST", "schleswig-holstein": "SH",
    "thueringen": "TH",
}

ART_MAP = {"zuschuss":"zuschuss","darlehen":"kredit","kredit":"kredit",
           "buergschaft":"buergschaft","beteiligung":"beteiligung",
           "garantie":"buergschaft","sonstige":"zuschuss"}

BRANCHE_KW = {
    "digitalisierung":"digitalisierung", "energieeffizienz":"energie-umwelt",
    "erneuerbare energien":"energie-umwelt", "forschung":"forschung-entwicklung",
    "innovation":"forschung-entwicklung", "gesundheit":"gesundheit-medizin",
    "soziales":"gesundheit-medizin", "handwerk":"handwerk", "handel":"handel",
    "außenwirtschaft":"handel", "existenzgründung":"branchenuebergreifend",
    "unternehmensfinanzierung":"branchenuebergreifend", "beratung":"branchenuebergreifend",
    "aus- & weiterbildung":"bildung", "kultur":"kreativwirtschaft",
    "landwirtschaft":"landwirtschaft", "mobilität":"mobilitaet-logistik",
    "umwelt":"energie-umwelt", "naturschutz":"energie-umwelt",
    "wohnungsbau":"bauwesen-immobilien", "smart cities":"digitalisierung",
}

BRANCHEN = [
    {"id":1,"name":"Digitalisierung","slug":"digitalisierung"},
    {"id":2,"name":"Energie & Umwelt","slug":"energie-umwelt"},
    {"id":3,"name":"Forschung & Entwicklung","slug":"forschung-entwicklung"},
    {"id":4,"name":"Gesundheit & Medizin","slug":"gesundheit-medizin"},
    {"id":5,"name":"Handwerk","slug":"handwerk"},
    {"id":6,"name":"Handel","slug":"handel"},
    {"id":7,"name":"IT & Software","slug":"it-software"},
    {"id":8,"name":"Kreativwirtschaft","slug":"kreativwirtschaft"},
    {"id":9,"name":"Landwirtschaft","slug":"landwirtschaft"},
    {"id":10,"name":"Mobilität & Logistik","slug":"mobilitaet-logistik"},
    {"id":11,"name":"Produktion & Industrie","slug":"produktion-industrie"},
    {"id":12,"name":"Sozialunternehmen","slug":"sozialunternehmen"},
    {"id":13,"name":"Tourismus & Gastro","slug":"tourismus-gastro"},
    {"id":14,"name":"Bildung","slug":"bildung"},
    {"id":15,"name":"Bauwesen & Immobilien","slug":"bauwesen-immobilien"},
    {"id":16,"name":"Branchenübergreifend","slug":"branchenuebergreifend"},
]
B_MAP = {b["slug"]: b for b in BRANCHEN}


def log(msg):
    print(f"  [{datetime.now().strftime('%H:%M:%S')}] {msg}")


def fetch(session, url, params=None):
    time.sleep(DELAY)
    try:
        r = session.get(url, params=params, timeout=30)
        r.raise_for_status()
        return BeautifulSoup(r.text, "lxml")
    except Exception as e:
        log(f"FEHLER: {e}")
        return None


def scrape_list(session, land_key, max_pages=10):
    """Ergebnisliste scrapen, gibt [(url, name, meta_dict)] zurück."""
    results = []
    seen = set()

    for page in range(1, max_pages + 1):
        params = {
            "submit": "Suchen",
            "filterCategories": "FundingProgram",
            "cl2Processes_Foerdergebiet": BL_PARAMS[land_key],
        }
        if page > 1:
            params["pageNo"] = page - 1

        log(f"Seite {page} für {land_key}...")
        soup = fetch(session, BASE + SEARCH, params)
        if not soup:
            break

        cards = soup.select("div.card--fundingprogram")
        if not cards:
            log("Keine Ergebnisse mehr.")
            break

        for card in cards:
            a = card.select_one("p.card--title a[href]")
            if not a:
                continue
            href = a.get("href", "")
            if "/Foerderprogramm/" not in href:
                continue

            url = href if href.startswith("http") else BASE + "/" + href.lstrip("/")
            if url in seen:
                continue
            seen.add(url)

            name = a.get_text(strip=True)
            meta = {}
            for dt in card.select("dt"):
                dd = dt.find_next_sibling("dd")
                if dd:
                    meta[dt.get_text(strip=True).rstrip(":")] = dd.get_text(strip=True)

            results.append((url, name, meta))

        log(f"  {len(cards)} Karten, {len(results)} unique")

        if not soup.select_one("a.forward.button"):
            break

    return results


def parse_detail(session, url, name, meta, land_key):
    """Detailseite parsen, gibt dict zurück."""
    soup = fetch(session, url)
    if not soup:
        return None

    prog = {
        "name": name, "kurzname": None, "url_quelle": url, "url_antrag": None,
        "foerdergeber": None, "foerderart": "zuschuss", "foerdergebiet": None,
        "foerderberechtigte": None, "foerderbereich": None, "beschreibung": None,
        "volumen_min_eur": 0, "volumen_max_eur": 0, "eigenanteil_prozent": 0,
    }

    # dt/dd Metadaten
    for dt in soup.select("dt"):
        dd = dt.find_next_sibling("dd")
        if not dd:
            continue
        label = dt.get_text(strip=True).rstrip(":").lower()
        value = dd.get_text(strip=True)

        if "förderart" in label:
            for k, v in ART_MAP.items():
                if k in value.lower():
                    prog["foerderart"] = v
                    break

        elif "fördergebiet" in label:
            prog["foerdergebiet"] = value

        elif "förderberechtigte" in label:
            prog["foerderberechtigte"] = value

        elif "förderbereich" in label:
            prog["foerderbereich"] = value

        elif "fördergeber" in label:
            link = dd.select_one("a")
            prog["foerdergeber"] = link.get_text(strip=True) if link else value

        elif "weiterführende" in label:
            for lnk in dd.select("a[href]"):
                h = lnk.get("href", "")
                t = lnk.get_text(strip=True).lower()
                if any(x in t for x in ["antrag","bewerb","portal","online"]) or \
                   any(x in h for x in ["antrag","kfw.de","bafa.de","exist.de"]):
                    if h.startswith("http"):
                        prog["url_antrag"] = h
                        break

    # Beschreibung
    for tag_text in ["Kurztext", "Volltext"]:
        h3 = soup.find("h3", string=re.compile(tag_text, re.I))
        if h3:
            parts = []
            for sib in h3.find_next_siblings():
                if sib.name in ("h2", "h3"):
                    break
                if sib.name == "p":
                    parts.append(sib.get_text(strip=True))
                if len(parts) >= 3:
                    break
            if parts:
                prog["beschreibung"] = " ".join(parts)[:500]
                break

    if not prog["beschreibung"]:
        bits = []
        if meta.get("Was wird gefördert?"):
            bits.append(f"Förderbereich: {meta['Was wird gefördert?']}.")
        if meta.get("Wer wird gefördert?"):
            bits.append(f"Berechtigt: {meta['Wer wird gefördert?']}.")
        prog["beschreibung"] = " ".join(bits) or "Keine Beschreibung verfügbar."

    # Bundesland
    bl = BL_SHORT.get(land_key, "BUND")
    bundeslaender = [bl]
    if prog["foerdergebiet"] and "bundesweit" in prog["foerdergebiet"].lower():
        if "BUND" not in bundeslaender:
            bundeslaender.append("BUND")

    # Phasen ableiten
    txt = f"{prog['foerderberechtigte'] or ''} {prog['foerderbereich'] or ''} {prog['beschreibung'] or ''}".lower()
    phasen = set()
    if any(k in txt for k in ["existenzgründ","gründer","gründung","startup","start-up"]):
        phasen.update(["ideation","gruendung"])
    if any(k in txt for k in ["jung","bis 5 jahre","bis 3 jahre"]):
        phasen.add("fruehphase")
    if any(k in txt for k in ["mittelstand","kmu","unternehmen","betrieb"]):
        phasen.update(["fruehphase","wachstum"])
    if any(k in txt for k in ["investition","modernisierung"]):
        phasen.update(["wachstum","etabliert"])
    if not phasen:
        phasen = {"fruehphase","wachstum"}

    # Größen ableiten
    groessen = set()
    if any(k in txt for k in ["existenzgründ","gründer","freiberuf","solo"]):
        groessen.add("solo")
    if any(k in txt for k in ["kleinst","mikro"]):
        groessen.update(["solo","mikro"])
    if any(k in txt for k in ["klein","kmu"]):
        groessen.update(["mikro","klein"])
    if any(k in txt for k in ["mittel","kmu"]):
        groessen.add("mittel")
    if not groessen:
        groessen = {"mikro","klein","mittel"}

    # Branchen ableiten
    slugs = set()
    for kw, slug in BRANCHE_KW.items():
        if kw in txt:
            slugs.add(slug)
    if not slugs:
        slugs.add("branchenuebergreifend")

    # Volumen extrahieren
    vmax = 0
    for m in re.finditer(r'(\d[\d.]*)\s*(?:EUR|Euro|€)', prog["beschreibung"] or "", re.I):
        try:
            v = int(m.group(1).replace(".", ""))
            if v > vmax:
                vmax = v
        except ValueError:
            pass

    return {
        **prog,
        "bundeslaender": bundeslaender,
        "phasen": sorted(phasen),
        "groessen": sorted(groessen),
        "branchen": [B_MAP[s] for s in sorted(slugs) if s in B_MAP],
        "volumen_max_eur": vmax,
        "status": "aktiv",
        "antragsfrist": None,
        "aktualisiert_am": datetime.now().strftime("%Y-%m-%d"),
        "aktiv": True,
    }


def run_scraper(laender, max_per_land, max_total):
    session = requests.Session()
    session.headers.update(HEADERS)
    programmes = []
    seen_urls = set()
    errors = 0

    print(f"\n{'='*60}")
    print(f"FÖRDERFINDER SCRAPER v2.0")
    print(f"{'='*60}")
    print(f"Länder: {len(laender)} | Max/Land: {max_per_land} | Max gesamt: {max_total}")
    print(f"{'='*60}\n")

    for land in laender:
        if len(programmes) >= max_total:
            print(f"\n⚠️  Limit ({max_total}) erreicht.")
            break

        print(f"\n📍 {land.upper()}")
        print("─" * 40)

        pages_needed = (max_per_land // 10) + 1
        entries = scrape_list(session, land, max_pages=pages_needed)
        entries = entries[:max_per_land]

        remaining = max_total - len(programmes)
        entries = entries[:remaining]

        count = 0
        for url, name, meta in entries:
            if url in seen_urls:
                continue
            seen_urls.add(url)

            prog = parse_detail(session, url, name, meta, land)
            if prog:
                programmes.append(prog)
                count += 1
            else:
                errors += 1

        print(f"  ✅ {count} Programme von {land}")

    print(f"\n{'='*60}")
    print(f"FERTIG: {len(programmes)} Programme | {errors} Fehler")
    print(f"{'='*60}\n")

    return programmes


def export(programmes, path="data/foerderprogramme.json"):
    for i, p in enumerate(programmes):
        p["id"] = i + 1
        # Felder aufräumen die nicht in die App gehören
        for key in ["foerdergebiet", "foerderberechtigte", "foerderbereich"]:
            p.pop(key, None)

    out = {
        "programme": programmes,
        "branchen": BRANCHEN,
        "scrape_datum": datetime.now().isoformat(),
    }

    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"✅ {len(programmes)} Programme → {path}")
    print(f"\n💡 Starte die App mit: npm run dev\n")


def main():
    ap = argparse.ArgumentParser(description="FörderFinder Scraper v2.0")
    ap.add_argument("--test", action="store_true", help="Testlauf: Bayern, 5 Programme")
    ap.add_argument("--land", type=str, help="Nur ein Bundesland (z.B. bayern)")
    ap.add_argument("--max", type=int, default=200, help="Max Programme gesamt (default: 200)")
    ap.add_argument("--max-per-land", type=int, default=20, help="Max pro Land (default: 20)")
    ap.add_argument("--alle", action="store_true", help="Alles scrapen")
    ap.add_argument("--output", default="data/foerderprogramme.json")
    args = ap.parse_args()

    if args.test:
        print("🧪 TESTLAUF\n")
        progs = run_scraper(["bayern"], max_per_land=5, max_total=5)
    elif args.alle:
        progs = run_scraper(list(BL_PARAMS.keys()), max_per_land=100, max_total=2000)
    elif args.land:
        if args.land not in BL_PARAMS:
            print(f"❌ Unbekannt: {args.land}\n   Verfügbar: {', '.join(BL_PARAMS.keys())}")
            sys.exit(1)
        progs = run_scraper([args.land], max_per_land=args.max_per_land, max_total=args.max)
    else:
        progs = run_scraper(list(BL_PARAMS.keys()), max_per_land=args.max_per_land, max_total=args.max)

    if progs:
        export(progs, args.output)
    else:
        print("⚠️  Keine Programme gescrapt. Internet prüfen.")


if __name__ == "__main__":
    main()
