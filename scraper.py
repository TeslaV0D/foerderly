"""
FÖRDERLY – Scraper v4.0
========================
Scrapt foerderdatenbank.de und schreibt direkt in Supabase.

Strategie:
  Phase 1: Alle Bundesländer durchgehen, URLs sammeln (mit Deduplizierung)
  Phase 2: Alle einzigartigen Detail-Seiten abrufen
  Phase 3: In Supabase upserten

Stoppt automatisch pro Land wenn:
  - Keine neuen Ergebnisse mehr kommen (Duplikate = fertig)
  - Leere Seite kommt

Installation:
    pip install requests beautifulsoup4 lxml supabase

Verwendung:
    python scraper.py --test          # Testlauf: 5 Programme
    python scraper.py                 # Alles scrapen
    python scraper.py --json-only     # Nur JSON, kein Supabase
    python scraper.py --fast          # Nur Listendaten, keine Detailseiten
"""

import requests as req
import json, time, re, os, sys, argparse
from datetime import datetime
from bs4 import BeautifulSoup

# ─── Config ───
BASE = "https://www.foerderdatenbank.de"
SEARCH = "/SiteGlobals/FDB/Forms/Suche/Expertensuche_Formular.html"
DELAY_LIST = 1.2   # Delay zwischen Listenseiten
DELAY_DETAIL = 1.5 # Delay zwischen Detailseiten

HEADERS = {
    "User-Agent": "Foerderly-Bot/4.0 (+https://foerderly.com)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "de-DE,de;q=0.9",
}

BL_PARAMS = {
    "bundesweit": "_bundesweit",
    "baden-wuerttemberg": "baden_wuerttemberg",
    "bayern": "bayern",
    "berlin": "berlin",
    "brandenburg": "brandenburg",
    "bremen": "bremen",
    "hamburg": "hamburg",
    "hessen": "hessen",
    "mecklenburg-vorpommern": "mecklenburg_vorpommern",
    "niedersachsen": "de_ni",
    "nordrhein-westfalen": "nordrhein_westfalen",
    "rheinland-pfalz": "rheinland_pfalz",
    "saarland": "saarland",
    "sachsen": "sachsen",
    "sachsen-anhalt": "de_st",
    "schleswig-holstein": "schleswig_holstein",
    "thueringen": "thueringen",
}

BL_SHORT = {
    "bundesweit": "BUND", "baden-wuerttemberg": "BW", "bayern": "BY",
    "berlin": "BE", "brandenburg": "BB", "bremen": "HB", "hamburg": "HH",
    "hessen": "HE", "mecklenburg-vorpommern": "MV", "niedersachsen": "NI",
    "nordrhein-westfalen": "NW", "rheinland-pfalz": "RP", "saarland": "SL",
    "sachsen": "SN", "sachsen-anhalt": "ST", "schleswig-holstein": "SH",
    "thueringen": "TH",
}

ART_MAP = {
    "zuschuss": "zuschuss", "darlehen": "kredit", "kredit": "kredit",
    "bürgschaft": "buergschaft", "buergschaft": "buergschaft",
    "beteiligung": "beteiligung", "garantie": "buergschaft",
}

BRANCHE_KW = {
    "digitalisierung": "digitalisierung", "energieeffizienz": "energie-umwelt",
    "erneuerbare energien": "energie-umwelt", "forschung": "forschung-entwicklung",
    "innovation": "forschung-entwicklung", "gesundheit": "gesundheit-medizin",
    "soziales": "gesundheit-medizin", "handwerk": "handwerk", "handel": "handel",
    "außenwirtschaft": "handel", "existenzgründung": "branchenuebergreifend",
    "unternehmensfinanzierung": "branchenuebergreifend", "beratung": "branchenuebergreifend",
    "aus- & weiterbildung": "bildung", "kultur": "kreativwirtschaft",
    "landwirtschaft": "landwirtschaft", "mobilität": "mobilitaet-logistik",
    "umwelt": "energie-umwelt", "naturschutz": "energie-umwelt",
    "wohnungsbau": "bauwesen-immobilien", "smart cities": "digitalisierung",
    "it": "it-software", "software": "it-software", "digital": "digitalisierung",
    "technologie": "forschung-entwicklung", "tourismus": "tourismus-gastro",
    "gastronomie": "tourismus-gastro",
}

BRANCHEN = [
    {"id": 1, "name": "Digitalisierung", "slug": "digitalisierung"},
    {"id": 2, "name": "Energie & Umwelt", "slug": "energie-umwelt"},
    {"id": 3, "name": "Forschung & Entwicklung", "slug": "forschung-entwicklung"},
    {"id": 4, "name": "Gesundheit & Medizin", "slug": "gesundheit-medizin"},
    {"id": 5, "name": "Handwerk", "slug": "handwerk"},
    {"id": 6, "name": "Handel", "slug": "handel"},
    {"id": 7, "name": "IT & Software", "slug": "it-software"},
    {"id": 8, "name": "Kreativwirtschaft", "slug": "kreativwirtschaft"},
    {"id": 9, "name": "Landwirtschaft", "slug": "landwirtschaft"},
    {"id": 10, "name": "Mobilität & Logistik", "slug": "mobilitaet-logistik"},
    {"id": 11, "name": "Produktion & Industrie", "slug": "produktion-industrie"},
    {"id": 12, "name": "Sozialunternehmen", "slug": "sozialunternehmen"},
    {"id": 13, "name": "Tourismus & Gastro", "slug": "tourismus-gastro"},
    {"id": 14, "name": "Bildung", "slug": "bildung"},
    {"id": 15, "name": "Bauwesen & Immobilien", "slug": "bauwesen-immobilien"},
    {"id": 16, "name": "Branchenübergreifend", "slug": "branchenuebergreifend"},
]
B_MAP = {b["slug"]: b for b in BRANCHEN}


def log(msg):
    print(f"  [{datetime.now().strftime('%H:%M:%S')}] {msg}")


def fetch(session, url, params=None, delay=DELAY_LIST):
    time.sleep(delay)
    try:
        r = session.get(url, params=params, timeout=30)
        r.raise_for_status()
        return BeautifulSoup(r.text, "lxml")
    except Exception as e:
        log(f"FEHLER: {e}")
        return None


# ═══════════════════════════════════════════
# PHASE 1: Collect all unique programme URLs
# ═══════════════════════════════════════════

def collect_all_urls(session):
    """
    Scrapt alle Bundesländer und sammelt einzigartige Programme-URLs.
    Folgt dem Forward-Button für korrekte Paginierung.
    Stoppt pro Land sobald nur noch Duplikate kommen.
    """
    all_programmes = {}  # url → {name, meta, bundeslaender}
    
    for land_key, land_param in BL_PARAMS.items():
        bl = BL_SHORT[land_key]
        new_in_land = 0
        dupes_in_land = 0
        page_num = 0
        consecutive_dupe_pages = 0
        
        print(f"\n📍 {land_key.upper()} ({bl})")
        print("─" * 40)
        
        # First page URL with params
        next_url = BASE + SEARCH
        next_params = {
            "submit": "Suchen",
            "filterCategories": "FundingProgram",
            "cl2Processes_Foerdergebiet": land_param,
        }
        
        while next_url:
            soup = fetch(session, next_url, next_params)
            next_params = None  # Only use params for first request
            
            if not soup:
                break
            
            cards = soup.select("div.card--fundingprogram")
            if not cards:
                log("Keine Ergebnisse mehr.")
                break
            
            page_num += 1
            page_new = 0
            
            for card in cards:
                a = card.select_one("p.card--title a[href]")
                if not a:
                    continue
                href = a.get("href", "")
                if "/Foerderprogramm/" not in href:
                    continue
                
                url = href if href.startswith("http") else BASE + "/" + href.lstrip("/")
                name = a.get_text(strip=True)
                
                meta = {}
                for dt in card.select("dt"):
                    dd = dt.find_next_sibling("dd")
                    if dd:
                        meta[dt.get_text(strip=True).rstrip(":")] = dd.get_text(strip=True)
                
                if url in all_programmes:
                    if bl not in all_programmes[url]["bundeslaender"]:
                        all_programmes[url]["bundeslaender"].append(bl)
                    dupes_in_land += 1
                else:
                    all_programmes[url] = {
                        "name": name,
                        "meta": meta,
                        "bundeslaender": [bl],
                    }
                    new_in_land += 1
                    page_new += 1
            
            # Stop condition: if entire page was duplicates
            if page_new == 0:
                consecutive_dupe_pages += 1
                if consecutive_dupe_pages >= 3:
                    log(f"3 Seiten nur Duplikate → nächstes Land")
                    break
            else:
                consecutive_dupe_pages = 0
            
            # Progress log
            if page_num % 20 == 0:
                log(f"Seite {page_num} | {new_in_land} neu, {dupes_in_land} Duplikate | Gesamt: {len(all_programmes)}")
            
            # Find forward/next button and follow its href
            forward = soup.select_one("a.forward.button")
            if forward and forward.get("href"):
                fwd_href = forward["href"]
                if fwd_href.startswith("http"):
                    next_url = fwd_href
                else:
                    # Ensure proper joining with slash
                    next_url = BASE + "/" + fwd_href.lstrip("/")
            else:
                log(f"Letzte Seite erreicht (Seite {page_num}).")
                break
        
        print(f"  ✅ {new_in_land} neue, {dupes_in_land} Duplikate ({page_num} Seiten) | Gesamt: {len(all_programmes)}")
    
    return all_programmes


# ═══════════════════════════════════════════
# PHASE 2: Fetch detail pages
# ═══════════════════════════════════════════

def fetch_details(session, all_programmes, fast_mode=False):
    """Fetch detail pages for all programmes."""
    programmes = []
    total = len(all_programmes)
    errors = 0
    
    print(f"\n{'='*60}")
    print(f"PHASE 2: {total} Detailseiten abrufen")
    if fast_mode:
        print("⚡ FAST MODE: Nur Listendaten, keine Detailseiten")
    print(f"{'='*60}\n")
    
    for i, (url, info) in enumerate(all_programmes.items()):
        if (i + 1) % 50 == 0 or i == 0:
            log(f"Fortschritt: {i + 1}/{total}")
        
        if fast_mode:
            # Use only list data
            prog = build_programme_from_list(url, info)
        else:
            # Fetch detail page
            prog = parse_detail(session, url, info)
        
        if prog:
            programmes.append(prog)
        else:
            errors += 1
    
    print(f"\n  ✅ {len(programmes)} Programme verarbeitet, {errors} Fehler")
    return programmes


def build_programme_from_list(url, info):
    """Build a programme entry from list-only data (fast mode)."""
    meta = info["meta"]
    name = info["name"]
    
    beschreibung_parts = []
    if meta.get("Was wird gefördert?"):
        beschreibung_parts.append(meta["Was wird gefördert?"])
    if meta.get("Wer wird gefördert?"):
        beschreibung_parts.append(meta["Wer wird gefördert?"])
    beschreibung = " | ".join(beschreibung_parts) if beschreibung_parts else None
    
    # Determine foerderart from meta
    foerderart = "zuschuss"
    art_text = (meta.get("Förderart", "") + " " + (beschreibung or "")).lower()
    for k, v in ART_MAP.items():
        if k in art_text:
            foerderart = v
            break
    
    return build_final_programme(
        name=name, url_quelle=url, beschreibung=beschreibung,
        foerdergeber=meta.get("Fördergeber"), foerderart=foerderart,
        bundeslaender=info["bundeslaender"],
        raw_text=(beschreibung or "") + " " + name,
    )


def parse_detail(session, url, info):
    """Parse a detail page for full programme information."""
    soup = fetch(session, url, delay=DELAY_DETAIL)
    if not soup:
        return build_programme_from_list(url, info)  # Fallback to list data
    
    prog = {
        "url_quelle": url,
        "name": info["name"],
        "kurzname": None,
        "url_antrag": None,
        "foerdergeber": None,
        "foerderart": "zuschuss",
        "beschreibung": None,
        "volumen_min_eur": 0,
        "volumen_max_eur": 0,
        "eigenanteil_prozent": 0,
    }
    
    foerdergebiet = None
    foerderberechtigte = None
    foerderbereich = None
    
    # Parse dt/dd metadata
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
            foerdergebiet = value
        elif "förderberechtigte" in label:
            foerderberechtigte = value
        elif "förderbereich" in label:
            foerderbereich = value
        elif "fördergeber" in label:
            link = dd.select_one("a")
            prog["foerdergeber"] = link.get_text(strip=True) if link else value
        elif "weiterführende" in label:
            for lnk in dd.select("a[href]"):
                h = lnk.get("href", "")
                t = lnk.get_text(strip=True).lower()
                if any(x in t for x in ["antrag", "bewerb", "portal", "online"]) or \
                   any(x in h for x in ["antrag", "kfw.de", "bafa.de", "exist.de"]):
                    if h.startswith("http"):
                        prog["url_antrag"] = h
                        break
    
    # Beschreibung from detail page
    for tag_text in ["Kurztext", "Volltext"]:
        h3 = soup.find("h3", string=re.compile(tag_text, re.I))
        if h3:
            parts = []
            for sib in h3.find_next_siblings():
                if sib.name in ("h2", "h3"):
                    break
                if sib.name == "p":
                    t = sib.get_text(strip=True)
                    if t:
                        parts.append(t)
                if len(parts) >= 4:
                    break
            if parts:
                prog["beschreibung"] = " ".join(parts)[:600]
                break
    
    # Fallback description
    if not prog["beschreibung"]:
        meta = info["meta"]
        bits = []
        if meta.get("Was wird gefördert?"):
            bits.append(meta["Was wird gefördert?"])
        if meta.get("Wer wird gefördert?"):
            bits.append(meta["Wer wird gefördert?"])
        prog["beschreibung"] = " | ".join(bits) if bits else None
    
    # Eigenanteil from description
    ea_match = re.search(r'(\d{1,3})\s*%\s*(?:Eigen|eigen)', prog["beschreibung"] or "", re.I)
    if ea_match:
        prog["eigenanteil_prozent"] = int(ea_match.group(1))
    
    # Bundeslaender: from phase 1 + check foerdergebiet
    bundeslaender = list(info["bundeslaender"])
    if foerdergebiet and "bundesweit" in foerdergebiet.lower():
        if "BUND" not in bundeslaender:
            bundeslaender.append("BUND")
    
    raw_text = " ".join(filter(None, [
        foerderberechtigte, foerderbereich, prog["beschreibung"], prog["name"]
    ]))
    
    result = build_final_programme(
        name=prog["name"], kurzname=prog["kurzname"],
        url_quelle=prog["url_quelle"], url_antrag=prog["url_antrag"],
        beschreibung=prog["beschreibung"], foerdergeber=prog["foerdergeber"],
        foerderart=prog["foerderart"], eigenanteil_prozent=prog["eigenanteil_prozent"],
        bundeslaender=bundeslaender, raw_text=raw_text,
    )
    
    # Override volumes if found in detail
    amounts = []
    for m in re.finditer(r'([\d.]+)\s*(?:EUR|Euro|€)', prog["beschreibung"] or "", re.I):
        try:
            v = int(m.group(1).replace(".", ""))
            if v > 0:
                amounts.append(v)
        except ValueError:
            pass
    if amounts:
        result["volumen_max_eur"] = max(amounts)
        result["volumen_min_eur"] = min(amounts) if len(amounts) > 1 else 0
    
    return result


def build_final_programme(name, url_quelle, beschreibung, foerdergeber,
                          foerderart, bundeslaender, raw_text,
                          kurzname=None, url_antrag=None, eigenanteil_prozent=0):
    """Build the final programme dict with derived fields."""
    txt = raw_text.lower()
    
    # Phasen
    phasen = set()
    if any(k in txt for k in ["existenzgründ", "gründer", "gründung", "startup", "start-up"]):
        phasen.update(["ideation", "gruendung"])
    if any(k in txt for k in ["jung", "bis 5 jahre", "bis 3 jahre"]):
        phasen.add("fruehphase")
    if any(k in txt for k in ["mittelstand", "kmu", "unternehmen", "betrieb"]):
        phasen.update(["fruehphase", "wachstum"])
    if any(k in txt for k in ["investition", "modernisierung", "erweiterung"]):
        phasen.update(["wachstum", "etabliert"])
    if not phasen:
        phasen = {"fruehphase", "wachstum"}
    
    # Größen
    groessen = set()
    if any(k in txt for k in ["existenzgründ", "gründer", "freiberuf", "solo", "einzelunternehm"]):
        groessen.add("solo")
    if any(k in txt for k in ["kleinst", "mikro"]):
        groessen.update(["solo", "mikro"])
    if any(k in txt for k in ["klein", "kmu"]):
        groessen.update(["mikro", "klein"])
    if any(k in txt for k in ["mittel", "kmu"]):
        groessen.add("mittel")
    if not groessen:
        groessen = {"mikro", "klein", "mittel"}
    
    # Branchen
    slugs = set()
    for kw, slug in BRANCHE_KW.items():
        if kw in txt:
            slugs.add(slug)
    if not slugs:
        slugs.add("branchenuebergreifend")
    
    # Volumes from description
    vmax = 0
    vmin = 0
    amounts = []
    for m in re.finditer(r'([\d.]+)\s*(?:EUR|Euro|€)', beschreibung or "", re.I):
        try:
            v = int(m.group(1).replace(".", ""))
            if v > 0:
                amounts.append(v)
        except ValueError:
            pass
    if amounts:
        vmax = max(amounts)
        vmin = min(amounts) if len(amounts) > 1 else 0
    
    return {
        "name": name,
        "kurzname": kurzname,
        "beschreibung": beschreibung,
        "foerdergeber": foerdergeber,
        "foerderart": foerderart,
        "volumen_min_eur": vmin,
        "volumen_max_eur": vmax,
        "eigenanteil_prozent": eigenanteil_prozent,
        "url_antrag": url_antrag,
        "url_quelle": url_quelle,
        "quelle": "foerderdatenbank",
        "bundeslaender": sorted(set(bundeslaender)),
        "phasen": sorted(phasen),
        "groessen": sorted(groessen),
        "branchen": [B_MAP[s] for s in sorted(slugs) if s in B_MAP],
        "status": "aktiv",
        "antragsfrist": None,
        "aktualisiert_am": datetime.now().strftime("%Y-%m-%d"),
        "aktiv": True,
    }


# ═══════════════════════════════════════════
# PHASE 3: Export
# ═══════════════════════════════════════════

def export_to_supabase(programmes):
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("❌ SUPABASE_URL und SUPABASE_SERVICE_KEY fehlen!")
        return False

    from supabase import create_client
    sb = create_client(url, key)
    today = datetime.now().strftime("%Y-%m-%d")

    print(f"\n📤 Schreibe {len(programmes)} Programme in Supabase...")

    BATCH = 50
    upserted = 0
    errors = 0

    for i in range(0, len(programmes), BATCH):
        batch = programmes[i:i + BATCH]
        rows = [{
            "name": p["name"],
            "kurzname": p.get("kurzname"),
            "beschreibung": p.get("beschreibung"),
            "foerdergeber": p.get("foerdergeber"),
            "foerderart": p.get("foerderart", "zuschuss"),
            "volumen_min_eur": p.get("volumen_min_eur", 0),
            "volumen_max_eur": p.get("volumen_max_eur", 0),
            "eigenanteil_prozent": p.get("eigenanteil_prozent", 0),
            "status": "aktiv",
            "antragsfrist": p.get("antragsfrist"),
            "url_antrag": p.get("url_antrag"),
            "url_quelle": p["url_quelle"],
            "quelle": "foerderdatenbank",
            "bundeslaender": p.get("bundeslaender", []),
            "phasen": p.get("phasen", []),
            "groessen": p.get("groessen", []),
            "branchen": p.get("branchen", []),
            "aktiv": True,
            "aktualisiert_am": today,
        } for p in batch]

        try:
            sb.table("programme").upsert(rows, on_conflict="url_quelle", ignore_duplicates=False).execute()
            upserted += len(batch)
            print(f"  ✅ {upserted}/{len(programmes)}", end="\r")
        except Exception as e:
            print(f"\n  ❌ Batch-Fehler: {e}")
            errors += len(batch)

    # Deactivate stale programmes
    print(f"\n\n🔄 Markiere veraltete Programme als inaktiv...")
    try:
        scraped_urls = {p["url_quelle"] for p in programmes}
        existing = sb.table("programme").select("id, url_quelle").eq("quelle", "foerderdatenbank").eq("aktiv", True).execute()
        stale_ids = [r["id"] for r in (existing.data or []) if r["url_quelle"] not in scraped_urls]
        if stale_ids:
            for i in range(0, len(stale_ids), 100):
                sb.table("programme").update({"aktiv": False}).in_("id", stale_ids[i:i+100]).execute()
            print(f"  📴 {len(stale_ids)} Programme deaktiviert")
        else:
            print(f"  ✅ Keine veralteten Programme")
    except Exception as e:
        print(f"  ⚠️ Fehler: {e}")

    print(f"\n{'='*60}")
    print(f"  ✅ Supabase: {upserted} upserted, {errors} Fehler")
    print(f"{'='*60}\n")
    return errors == 0


def export_to_json(programmes, path="data/foerderprogramme.json"):
    for i, p in enumerate(programmes):
        p["id"] = i + 1
    out = {"programme": programmes, "branchen": BRANCHEN, "scrape_datum": datetime.now().isoformat()}
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"💾 JSON: {len(programmes)} Programme → {path}")


# ═══════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════

def main():
    ap = argparse.ArgumentParser(description="Förderly Scraper v4.0")
    ap.add_argument("--test", action="store_true", help="Testlauf: Bayern, 5 Programme")
    ap.add_argument("--fast", action="store_true", help="Nur Listendaten, keine Detailseiten")
    ap.add_argument("--json-only", action="store_true", help="Nur JSON, kein Supabase")
    ap.add_argument("--json-backup", action="store_true", help="Zusätzlich JSON-Backup")
    ap.add_argument("--alle", action="store_true", help="Alle Länder (default)")
    ap.add_argument("--output", default="data/foerderprogramme.json")
    args = ap.parse_args()

    session = req.Session()
    session.headers.update(HEADERS)

    print(f"\n{'='*60}")
    print(f"  FÖRDERLY SCRAPER v4.0")
    print(f"{'='*60}\n")

    # PHASE 1: Collect URLs
    print("═══ PHASE 1: Programme-URLs sammeln ═══\n")
    all_programmes = collect_all_urls(session)
    print(f"\n📊 {len(all_programmes)} einzigartige Programme gefunden\n")

    if args.test:
        # Limit to 5 for testing
        items = dict(list(all_programmes.items())[:5])
        all_programmes = items

    if not all_programmes:
        print("⚠️ Keine Programme gefunden!")
        sys.exit(1)

    # PHASE 2: Fetch details
    print("═══ PHASE 2: Details abrufen ═══\n")
    programmes = fetch_details(session, all_programmes, fast_mode=args.fast)

    if not programmes:
        print("⚠️ Keine Programme verarbeitet!")
        sys.exit(1)

    # PHASE 3: Export
    print(f"\n═══ PHASE 3: Export ({len(programmes)} Programme) ═══\n")
    if args.json_only:
        export_to_json(programmes, args.output)
    else:
        success = export_to_supabase(programmes)
        if args.json_backup or not success:
            export_to_json(programmes, args.output)

    print("🎉 Fertig!")


if __name__ == "__main__":
    main()
