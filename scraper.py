"""
FÖRDERLY – Scraper v5.0
========================
Erweitert v4.1 um 10 neue Felder, besseres Error-Handling,
CSV Error-Log und Skip-statt-Abort Logik.

Neue Felder:
  - antragsfrist (string)
  - hat_deadline (bool)
  - rechtsgrundlagen (array)
  - foerderquote (int 1-100)
  - bearbeitungszeit (string)
  - besonderheiten (array)
  - kontakte (array of objects)
  - zielgruppen_erweitert (array)
  - finanzierungsform_erweitert (array)
  - datenqualitaet ("vollstaendig"|"unvollstaendig"|"minimal")

Strategie: Hybrid CSS + Regex (Option 2)
Error-Handling: Skip einzelne Programme, nicht abort.
"""

import requests as req
import json, time, re, os, sys, argparse, csv
from datetime import datetime
from bs4 import BeautifulSoup

# ─── Config ───
BASE = "https://www.foerderdatenbank.de"
SEARCH = "/SiteGlobals/FDB/Forms/Suche/Expertensuche_Formular.html"
DELAY_LIST = 1.2
DELAY_DETAIL = 1.5
MAX_RETRIES = 3
TIMEOUT = (10, 25)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "de-DE,de;q=0.9,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "DNT": "1",
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

# ─── Erweiterte Branchen-Keywords (50+) ───
BRANCHE_KW = {
    # Digitalisierung
    "digitalisierung": "digitalisierung", "digital": "digitalisierung",
    "smart cities": "digitalisierung", "e-commerce": "digitalisierung",
    "industrie 4.0": "digitalisierung", "ki": "digitalisierung",
    "künstliche intelligenz": "digitalisierung", "blockchain": "digitalisierung",
    # Energie & Umwelt
    "energieeffizienz": "energie-umwelt", "erneuerbare energien": "energie-umwelt",
    "umwelt": "energie-umwelt", "naturschutz": "energie-umwelt",
    "klimaschutz": "energie-umwelt", "nachhaltigkeit": "energie-umwelt",
    "wasserstoff": "energie-umwelt", "photovoltaik": "energie-umwelt",
    "windenergie": "energie-umwelt", "bioenergie": "energie-umwelt",
    "elektromobilität": "energie-umwelt", "co2": "energie-umwelt",
    # Forschung
    "forschung": "forschung-entwicklung", "innovation": "forschung-entwicklung",
    "technologie": "forschung-entwicklung", "f&e": "forschung-entwicklung",
    "prototyp": "forschung-entwicklung", "patent": "forschung-entwicklung",
    # Gesundheit
    "gesundheit": "gesundheit-medizin", "medizin": "gesundheit-medizin",
    "pflege": "gesundheit-medizin", "pharma": "gesundheit-medizin",
    "medizintechnik": "gesundheit-medizin", "biotech": "gesundheit-medizin",
    # Handwerk
    "handwerk": "handwerk", "meister": "handwerk", "gewerk": "handwerk",
    # Handel
    "handel": "handel", "außenwirtschaft": "handel", "export": "handel",
    "einzelhandel": "handel",
    # IT
    "it": "it-software", "software": "it-software", "saas": "it-software",
    "cloud": "it-software", "cybersecurity": "it-software",
    "app": "it-software", "plattform": "it-software",
    # Kreativwirtschaft
    "kultur": "kreativwirtschaft", "kreativ": "kreativwirtschaft",
    "design": "kreativwirtschaft", "medien": "kreativwirtschaft",
    "film": "kreativwirtschaft", "musik": "kreativwirtschaft",
    # Produktion
    "produktion": "produktion-industrie", "industrie": "produktion-industrie",
    "fertigung": "produktion-industrie", "maschinenbau": "produktion-industrie",
    # Sonstige
    "existenzgründung": "branchenuebergreifend",
    "unternehmensfinanzierung": "branchenuebergreifend",
    "beratung": "branchenuebergreifend",
    "aus- & weiterbildung": "bildung", "bildung": "bildung",
    "qualifizierung": "bildung", "ausbildung": "bildung",
    "landwirtschaft": "landwirtschaft", "agrar": "landwirtschaft",
    "mobilität": "mobilitaet-logistik", "logistik": "mobilitaet-logistik",
    "tourismus": "tourismus-gastro", "gastronomie": "tourismus-gastro",
    "wohnungsbau": "bauwesen-immobilien", "bau": "bauwesen-immobilien",
    "sozial": "sozialunternehmen", "gemeinnützig": "sozialunternehmen",
}

# ─── Zielgruppen-Keywords ───
ZIELGRUPPEN_KW = {
    "frauen": ["frauen", "gründerinnen", "unternehmerinnen", "weiblich"],
    "forschung": ["wissenschaft", "hochschule", "universität", "forschung", "akadem"],
    "kultur": ["kultur", "kreativ", "kunst", "design"],
    "behinderte": ["behinder", "inklusion", "barrierefreiheit"],
    "migranten": ["migrant", "migration", "integration", "geflüchtet"],
    "jugend": ["jugend", "junge", "azubi", "ausbildung"],
    "senioren": ["senior", "nachfolge", "übernahme", "ruhestand"],
    "sozial": ["sozial", "gemeinnütz", "wohlfahrt"],
    "international": ["international", "ausland", "eu-", "europa"],
    "regional": ["regional", "strukturschwach", "ländlich"],
}

# ─── Finanzierungsform-Keywords ───
FINANZIERUNG_KW = {
    "mezzanine": ["mezzanine", "nachrangdarlehen", "nachrang"],
    "wandeldarlehen": ["wandeldarlehen", "convertible"],
    "verbundfinanzierung": ["verbund", "kofinanzierung", "kombinierte"],
    "buergschaft": ["bürgschaft", "garantie", "haftungsfreistellung"],
    "eigenkapital": ["eigenkapital", "beteiligung", "equity"],
    "tilgungszuschuss": ["tilgungszuschuss", "tilgungsfreijahre"],
    "stille_beteiligung": ["stille beteiligung", "stille gesellschaft"],
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

# ─── Error Tracking ───
error_log = []


def log(msg):
    print(f"  [{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def log_error(url, error_type, message, phase="detail"):
    """Log error für CSV-Export und optional Supabase."""
    error_log.append({
        "timestamp": datetime.now().isoformat(),
        "url": url,
        "error_type": error_type,
        "error_message": str(message)[:500],
        "phase": phase,
    })
    log(f"  ⚠️ [{error_type}] {message}")


def export_error_csv(path="data/scraper_errors.csv"):
    """Exportiert Error-Log als CSV."""
    if not error_log:
        return
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["timestamp", "url", "error_type", "error_message", "phase"])
        writer.writeheader()
        writer.writerows(error_log)
    print(f"📋 Error-Log: {len(error_log)} Fehler → {path}", flush=True)


def export_errors_supabase(sb):
    """Schreibt Error-Log in Supabase."""
    if not error_log or not sb:
        return
    try:
        rows = [{
            "url": e["url"],
            "error_type": e["error_type"],
            "error_message": e["error_message"],
            "phase": e["phase"],
        } for e in error_log[:500]]  # Max 500
        sb.table("scraper_errors").insert(rows).execute()
        log(f"📋 {len(rows)} Fehler in Supabase geschrieben")
    except Exception as e:
        log(f"⚠️ Error-Log Supabase fehlgeschlagen: {e}")


def fetch(session, url, params=None, delay=DELAY_LIST, retries=MAX_RETRIES):
    """Fetch mit Retry, Timeout, Error-Tracking. Gibt None zurück statt zu crashen."""
    time.sleep(delay)
    for attempt in range(1, retries + 1):
        try:
            r = session.get(url, params=params, timeout=TIMEOUT, allow_redirects=True)
            r.raise_for_status()
            return BeautifulSoup(r.text, "lxml")
        except req.exceptions.ConnectTimeout:
            log_error(url, "ConnectTimeout", "Server nicht erreichbar", "fetch")
        except req.exceptions.ReadTimeout:
            log_error(url, "ReadTimeout", "Server antwortet nicht", "fetch")
        except req.exceptions.ConnectionError as e:
            log_error(url, "ConnectionError", str(e), "fetch")
        except req.exceptions.HTTPError as e:
            log_error(url, "HTTPError", str(e), "fetch")
            if hasattr(e, 'response') and e.response is not None:
                if e.response.status_code == 403:
                    return None
                if e.response.status_code == 429:
                    time.sleep(30)
        except Exception as e:
            log_error(url, type(e).__name__, str(e), "fetch")
        if attempt < retries:
            time.sleep(attempt * 5)
    return None


# ═══════════════════════════════════════════
# CONNECTIVITY TEST
# ═══════════════════════════════════════════

def test_connectivity(session):
    print("\n🔍 Teste Verbindung zu foerderdatenbank.de...", flush=True)
    try:
        r = session.get(BASE, timeout=TIMEOUT, allow_redirects=True)
        if r.status_code == 200 and len(r.text) > 1000:
            print(f"  ✅ Erreichbar! Status: {r.status_code}", flush=True)
            return True
        print(f"  ⚠️ Status: {r.status_code}", flush=True)
        return r.status_code == 200
    except Exception as e:
        print(f"  ❌ {type(e).__name__}: {e}", flush=True)
        return False


# ═══════════════════════════════════════════
# PHASE 1: Collect URLs (identisch zu v4.1)
# ═══════════════════════════════════════════

def collect_all_urls(session):
    all_programmes = {}
    for land_key, land_param in BL_PARAMS.items():
        bl = BL_SHORT[land_key]
        new_in_land = 0
        dupes_in_land = 0
        page_num = 0
        consecutive_dupe_pages = 0

        print(f"\n📍 {land_key.upper()} ({bl})", flush=True)

        next_url = BASE + SEARCH
        next_params = {
            "submit": "Suchen",
            "filterCategories": "FundingProgram",
            "cl2Processes_Foerdergebiet": land_param,
        }

        while next_url:
            soup = fetch(session, next_url, next_params)
            next_params = None

            if not soup:
                log("Kein Response – überspringe Land")
                break

            cards = soup.select("div.card--fundingprogram")
            if not cards:
                cards = soup.select("div.result-item") or soup.select("article.card")
                if not cards:
                    break

            page_num += 1
            page_new = 0

            for card in cards:
                a = card.select_one("p.card--title a[href]")
                if not a:
                    a = card.select_one("a[href*='Foerderprogramm']") or card.select_one("a[href]")
                if not a:
                    continue
                href = a.get("href", "")
                if "/Foerderprogramm/" not in href and "/foerderprogramm/" not in href.lower():
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
                    all_programmes[url] = {"name": name, "meta": meta, "bundeslaender": [bl]}
                    new_in_land += 1
                    page_new += 1

            log(f"Seite {page_num}: {len(cards)} Cards, {page_new} neu | Gesamt: {len(all_programmes)}")

            if page_new == 0:
                consecutive_dupe_pages += 1
                if consecutive_dupe_pages >= 3:
                    break
            else:
                consecutive_dupe_pages = 0

            forward = soup.select_one("a.forward.button")
            if not forward:
                forward = soup.select_one("a[rel='next']")
            if forward and forward.get("href"):
                fwd_href = forward["href"]
                next_url = fwd_href if fwd_href.startswith("http") else BASE + "/" + fwd_href.lstrip("/")
            else:
                break

        print(f"  ✅ {new_in_land} neue, {dupes_in_land} Duplikate | Gesamt: {len(all_programmes)}", flush=True)

    return all_programmes


# ═══════════════════════════════════════════
# PHASE 2: Detail-Parsing v5 (10 neue Felder)
# ═══════════════════════════════════════════

def extract_antragsfrist(soup, text):
    """Extrahiert Antragsfrist aus Detail-Seite."""
    # Suche in <dt>/<dd> Paaren
    for dt in soup.select("dt"):
        label = dt.get_text(strip=True).lower()
        if "frist" in label or "antragstermin" in label or "laufzeit" in label:
            dd = dt.find_next_sibling("dd")
            if dd:
                val = dd.get_text(strip=True)
                if val:
                    # Datum im Format DD.MM.YYYY
                    m = re.search(r'(\d{1,2}\.\d{1,2}\.\d{4})', val)
                    if m:
                        return m.group(1)
                    if any(kw in val.lower() for kw in ["laufend", "fortlaufend", "jederzeit", "keine frist"]):
                        return "laufend"
                    return val[:100]
    # Regex-Fallback im Text
    m = re.search(r'(?:Antragsfrist|Frist|Stichtag)[:\s]*(\d{1,2}\.\d{1,2}\.\d{4})', text, re.I)
    if m:
        return m.group(1)
    return None


def extract_rechtsgrundlagen(soup, text):
    """Extrahiert Rechtsgrundlagen (max 2)."""
    result = []
    for dt in soup.select("dt"):
        if "rechtsgrundlage" in dt.get_text(strip=True).lower():
            dd = dt.find_next_sibling("dd")
            if dd:
                val = dd.get_text(strip=True)
                # Aufteilen wenn mehrere durch Komma/Semikolon getrennt
                parts = re.split(r'[;,]', val)
                for p in parts[:2]:
                    cleaned = p.strip()[:200]
                    if cleaned:
                        result.append(cleaned)
    if not result:
        # Regex-Fallback: suche §-Zeichen
        matches = re.findall(r'(§\s*\d+[a-zA-Z]?\s*(?:Abs\.\s*\d+)?\s*\w{2,30})', text)
        result = [m.strip() for m in matches[:2]]
    return result


def extract_foerderquote(text):
    """Extrahiert Förderquote als int (1-100)."""
    # "bis zu 80%", "max. 50%", "Zuschuss von 60%"
    m = re.search(r'(?:bis\s+(?:zu\s+)?|max\.?\s*|Zuschuss\s+(?:von\s+)?)(\d{1,3})\s*%', text, re.I)
    if m:
        val = int(m.group(1))
        if 1 <= val <= 100:
            return val
    # "50 Prozent"
    m = re.search(r'(\d{1,3})\s*Prozent', text, re.I)
    if m:
        val = int(m.group(1))
        if 1 <= val <= 100:
            return val
    return None


def extract_bearbeitungszeit(soup, text):
    """Extrahiert geschätzte Bearbeitungszeit."""
    for dt in soup.select("dt"):
        if any(kw in dt.get_text(strip=True).lower() for kw in ["bearbeitungszeit", "laufzeit", "bewilligungszeitraum"]):
            dd = dt.find_next_sibling("dd")
            if dd:
                val = dd.get_text(strip=True)
                if val and len(val) < 100:
                    return val
    # Regex: "4-6 Wochen", "ca. 3 Monate"
    m = re.search(r'(?:Bearbeitungszeit|Bewilligungszeitraum)[:\s]*(.{5,50}?)(?:\.|$)', text, re.I)
    if m:
        return m.group(1).strip()
    return None


def extract_besonderheiten(soup, text):
    """Extrahiert Besonderheiten (max 5)."""
    result = []
    # Suche nach "Besonderheiten", "Hinweise", "Wichtig"
    for heading in soup.find_all(["h3", "h4"]):
        if any(kw in heading.get_text(strip=True).lower() for kw in ["besonderheit", "hinweis", "voraussetzung", "kombination"]):
            for sib in heading.find_next_siblings():
                if sib.name in ("h2", "h3", "h4"):
                    break
                if sib.name in ("p", "li"):
                    t = sib.get_text(strip=True)
                    if t and len(t) > 10:
                        result.append(t[:200])
                if len(result) >= 5:
                    break
    # Fallback: Liste im Text
    if not result:
        for li in soup.select("ul li"):
            t = li.get_text(strip=True)
            if t and len(t) > 15 and any(kw in t.lower() for kw in ["kombin", "kumulier", "de-minimis", "beihilfe", "voraussetzung"]):
                result.append(t[:200])
            if len(result) >= 5:
                break
    return result[:5]


def extract_kontakte(soup):
    """Extrahiert Kontaktdaten."""
    kontakte = []
    # E-Mails
    for a in soup.select("a[href^='mailto:']"):
        email = a.get("href", "").replace("mailto:", "").strip()
        if email and "@" in email:
            kontakte.append({"typ": "email", "wert": email})
    # Telefon
    for a in soup.select("a[href^='tel:']"):
        tel = a.get("href", "").replace("tel:", "").strip()
        if tel:
            kontakte.append({"typ": "telefon", "wert": tel})
    # Regex-Fallback für Telefon
    if not any(k["typ"] == "telefon" for k in kontakte):
        text = soup.get_text()
        m = re.search(r'(?:Tel\.?|Telefon)[:\s]*([\d\s/\-+()]{8,20})', text)
        if m:
            kontakte.append({"typ": "telefon", "wert": m.group(1).strip()})
    # Weiterführende Links
    for dt in soup.select("dt"):
        if "weiterführende" in dt.get_text(strip=True).lower():
            dd = dt.find_next_sibling("dd")
            if dd:
                for lnk in dd.select("a[href]")[:3]:
                    href = lnk.get("href", "")
                    if href.startswith("http"):
                        kontakte.append({"typ": "link", "wert": href})
    return kontakte[:10]  # Max 10


def detect_zielgruppen(text):
    """Erkennt erweiterte Zielgruppen aus Text."""
    txt = text.lower()
    found = set()
    for gruppe, keywords in ZIELGRUPPEN_KW.items():
        for kw in keywords:
            if kw in txt:
                found.add(gruppe)
                break
    return sorted(found)


def detect_finanzierungsform(text):
    """Erkennt erweiterte Finanzierungsformen."""
    txt = text.lower()
    found = set()
    for form, keywords in FINANZIERUNG_KW.items():
        for kw in keywords:
            if kw in txt:
                found.add(form)
                break
    return sorted(found)


def assess_data_quality(prog):
    """Bewertet Datenqualität basierend auf Feldvollständigkeit."""
    score = 0
    if prog.get("beschreibung") and len(prog["beschreibung"]) > 50:
        score += 2
    if prog.get("foerdergeber"):
        score += 1
    if prog.get("url_antrag"):
        score += 1
    if prog.get("volumen_max_eur", 0) > 0:
        score += 1
    if prog.get("foerderquote") is not None:
        score += 1
    if prog.get("kontakte"):
        score += 1
    if prog.get("antragsfrist"):
        score += 1
    if prog.get("rechtsgrundlagen"):
        score += 1
    if prog.get("besonderheiten"):
        score += 1

    if score >= 7:
        return "vollstaendig"
    elif score >= 4:
        return "unvollstaendig"
    return "minimal"


def fetch_details(session, all_programmes, fast_mode=False):
    """Phase 2: Detailseiten abrufen mit v5-Feldern."""
    programmes = []
    total = len(all_programmes)
    errors = 0

    print(f"\n{'='*60}", flush=True)
    print(f"PHASE 2: {total} Detailseiten abrufen (v5)", flush=True)
    print(f"{'='*60}\n", flush=True)

    for i, (url, info) in enumerate(all_programmes.items()):
        if (i + 1) % 25 == 0 or i == 0:
            log(f"Fortschritt: {i + 1}/{total} ({errors} Fehler)")

        try:
            if fast_mode:
                prog = build_programme_from_list(url, info)
            else:
                prog = parse_detail_v5(session, url, info)

            if prog:
                programmes.append(prog)
            else:
                errors += 1
                log_error(url, "ParseFailed", "Konnte Programm nicht verarbeiten", "detail")
        except Exception as e:
            # SKIP statt ABORT – Kernfeature von v5
            errors += 1
            log_error(url, type(e).__name__, str(e), "detail")
            # Fallback: Listendaten verwenden
            try:
                prog = build_programme_from_list(url, info)
                if prog:
                    programmes.append(prog)
                    log(f"  ↪ Fallback auf Listendaten für: {info['name'][:50]}")
            except Exception:
                pass

    print(f"\n  ✅ {len(programmes)} Programme, {errors} Fehler", flush=True)
    return programmes


def build_programme_from_list(url, info):
    """Programm aus Listendaten (Fast Mode / Fallback)."""
    meta = info["meta"]
    name = info["name"]

    beschreibung_parts = []
    if meta.get("Was wird gefördert?"):
        beschreibung_parts.append(meta["Was wird gefördert?"])
    if meta.get("Wer wird gefördert?"):
        beschreibung_parts.append(meta["Wer wird gefördert?"])
    beschreibung = " | ".join(beschreibung_parts) if beschreibung_parts else None

    foerderart = "zuschuss"
    art_text = (meta.get("Förderart", "") + " " + (beschreibung or "")).lower()
    for k, v in ART_MAP.items():
        if k in art_text:
            foerderart = v
            break

    raw_text = (beschreibung or "") + " " + name

    return build_final_programme(
        name=name, url_quelle=url, beschreibung=beschreibung,
        foerdergeber=meta.get("Fördergeber"), foerderart=foerderart,
        bundeslaender=info["bundeslaender"], raw_text=raw_text,
        # v5 Felder: minimal bei Listendaten
        antragsfrist=None, rechtsgrundlagen=[], foerderquote=None,
        bearbeitungszeit=None, besonderheiten=[], kontakte=[],
    )


def parse_detail_v5(session, url, info):
    """Parse Detail-Seite mit v5 Feldern."""
    soup = fetch(session, url, delay=DELAY_DETAIL)
    if not soup:
        return build_programme_from_list(url, info)

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

    # Beschreibung
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
                if len(parts) >= 6:
                    break
            if parts:
                prog["beschreibung"] = " ".join(parts)[:800]
                break

    if not prog["beschreibung"]:
        meta = info["meta"]
        bits = []
        if meta.get("Was wird gefördert?"):
            bits.append(meta["Was wird gefördert?"])
        if meta.get("Wer wird gefördert?"):
            bits.append(meta["Wer wird gefördert?"])
        prog["beschreibung"] = " | ".join(bits) if bits else None

    # Eigenanteil
    ea_match = re.search(r'(\d{1,3})\s*%\s*(?:Eigen|eigen)', prog["beschreibung"] or "", re.I)
    if ea_match:
        prog["eigenanteil_prozent"] = int(ea_match.group(1))

    # Bundesländer
    bundeslaender = list(info["bundeslaender"])
    if foerdergebiet and "bundesweit" in foerdergebiet.lower():
        if "BUND" not in bundeslaender:
            bundeslaender.append("BUND")

    # Volltext für Keyword-Extraktion
    full_text = " ".join(filter(None, [
        foerderberechtigte, foerderbereich, prog["beschreibung"],
        prog["name"], soup.get_text()[:2000],
    ]))

    # ═══ v5: Neue Felder extrahieren ═══
    antragsfrist = extract_antragsfrist(soup, full_text)
    rechtsgrundlagen = extract_rechtsgrundlagen(soup, full_text)
    foerderquote = extract_foerderquote(full_text)
    bearbeitungszeit = extract_bearbeitungszeit(soup, full_text)
    besonderheiten = extract_besonderheiten(soup, full_text)
    kontakte = extract_kontakte(soup)

    # Beträge
    amounts = []
    for m in re.finditer(r'([\d.]+)\s*(?:EUR|Euro|€)', prog["beschreibung"] or "", re.I):
        try:
            v = int(m.group(1).replace(".", ""))
            if v > 0:
                amounts.append(v)
        except ValueError:
            pass

    result = build_final_programme(
        name=prog["name"], kurzname=prog["kurzname"],
        url_quelle=prog["url_quelle"], url_antrag=prog["url_antrag"],
        beschreibung=prog["beschreibung"], foerdergeber=prog["foerdergeber"],
        foerderart=prog["foerderart"], eigenanteil_prozent=prog["eigenanteil_prozent"],
        bundeslaender=bundeslaender, raw_text=full_text,
        antragsfrist=antragsfrist, rechtsgrundlagen=rechtsgrundlagen,
        foerderquote=foerderquote, bearbeitungszeit=bearbeitungszeit,
        besonderheiten=besonderheiten, kontakte=kontakte,
    )

    if amounts:
        result["volumen_max_eur"] = max(amounts)
        result["volumen_min_eur"] = min(amounts) if len(amounts) > 1 else 0

    return result


def build_final_programme(name, url_quelle, beschreibung, foerdergeber,
                          foerderart, bundeslaender, raw_text,
                          kurzname=None, url_antrag=None, eigenanteil_prozent=0,
                          antragsfrist=None, rechtsgrundlagen=None,
                          foerderquote=None, bearbeitungszeit=None,
                          besonderheiten=None, kontakte=None):
    """Baut finales Programm-Dict mit v5 Feldern."""
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

    # Branchen (erweitert mit 50+ Keywords)
    slugs = set()
    for kw, slug in BRANCHE_KW.items():
        if kw in txt:
            slugs.add(slug)
    if not slugs:
        slugs.add("branchenuebergreifend")

    # Beträge
    vmax, vmin = 0, 0
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

    # v5 Felder
    hat_deadline = antragsfrist is not None and antragsfrist != "laufend"
    zielgruppen = detect_zielgruppen(txt)
    finanzierungsform = detect_finanzierungsform(txt)

    prog = {
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
        "antragsfrist": antragsfrist,
        "hat_deadline": hat_deadline,
        "rechtsgrundlagen": rechtsgrundlagen or [],
        "foerderquote": foerderquote,
        "bearbeitungszeit": bearbeitungszeit,
        "besonderheiten": besonderheiten or [],
        "kontakte": kontakte or [],
        "zielgruppen_erweitert": zielgruppen,
        "finanzierungsform_erweitert": finanzierungsform,
        "aktualisiert_am": datetime.now().strftime("%Y-%m-%d"),
        "aktiv": True,
    }

    # Datenqualität bewerten
    prog["datenqualitaet"] = assess_data_quality(prog)

    return prog


# ═══════════════════════════════════════════
# PHASE 3: Export
# ═══════════════════════════════════════════

def export_to_supabase(programmes):
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("❌ SUPABASE_URL und SUPABASE_SERVICE_KEY fehlen!", flush=True)
        return False

    from supabase import create_client
    sb = create_client(url, key)
    today = datetime.now().strftime("%Y-%m-%d")

    print(f"\n📤 Schreibe {len(programmes)} Programme in Supabase (v5)...", flush=True)

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
            "hat_deadline": p.get("hat_deadline", False),
            "rechtsgrundlagen": p.get("rechtsgrundlagen", []),
            "foerderquote": p.get("foerderquote"),
            "bearbeitungszeit": p.get("bearbeitungszeit"),
            "besonderheiten": p.get("besonderheiten", []),
            "kontakte": p.get("kontakte", []),
            "zielgruppen_erweitert": p.get("zielgruppen_erweitert", []),
            "finanzierungsform_erweitert": p.get("finanzierungsform_erweitert", []),
            "datenqualitaet": p.get("datenqualitaet", "minimal"),
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
            log(f"✅ {upserted}/{len(programmes)} upserted")
        except Exception as e:
            print(f"\n  ❌ Batch-Fehler: {e}", flush=True)
            errors += len(batch)
            # Einzeln versuchen bei Batch-Fehler
            for row in batch:
                try:
                    sb.table("programme").upsert([row], on_conflict="url_quelle").execute()
                    upserted += 1
                except Exception as e2:
                    log_error(row["url_quelle"], "UpsertFailed", str(e2), "upsert")

    # Veraltete Programme deaktivieren
    try:
        scraped_urls = {p["url_quelle"] for p in programmes}
        existing = sb.table("programme").select("id, url_quelle").eq("quelle", "foerderdatenbank").eq("aktiv", True).execute()
        stale_ids = [r["id"] for r in (existing.data or []) if r["url_quelle"] not in scraped_urls]
        if stale_ids:
            for i in range(0, len(stale_ids), 100):
                sb.table("programme").update({"aktiv": False}).in_("id", stale_ids[i:i+100]).execute()
            print(f"  📴 {len(stale_ids)} Programme deaktiviert", flush=True)
    except Exception as e:
        log_error("", "StaleCheck", str(e), "upsert")

    # Error-Log in Supabase
    export_errors_supabase(sb)

    print(f"\n  ✅ Supabase: {upserted} upserted, {errors} Fehler", flush=True)
    return errors == 0


def export_to_json(programmes, path="data/foerderprogramme.json"):
    for i, p in enumerate(programmes):
        p["id"] = i + 1
    out = {"programme": programmes, "branchen": BRANCHEN, "scrape_datum": datetime.now().isoformat()}
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"💾 JSON: {len(programmes)} Programme → {path}", flush=True)


# ═══════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════

def main():
    ap = argparse.ArgumentParser(description="Förderly Scraper v5.0")
    ap.add_argument("--test", action="store_true", help="Testlauf: 5 Programme")
    ap.add_argument("--fast", action="store_true", help="Nur Listendaten")
    ap.add_argument("--json-only", action="store_true", help="Nur JSON")
    ap.add_argument("--json-backup", action="store_true", help="Zusätzlich JSON-Backup")
    ap.add_argument("--output", default="data/foerderprogramme.json")
    args = ap.parse_args()

    session = req.Session()
    session.headers.update(HEADERS)

    print(f"\n{'='*60}", flush=True)
    print(f"  FÖRDERLY SCRAPER v5.0", flush=True)
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    print(f"{'='*60}\n", flush=True)

    if not test_connectivity(session):
        print("\n❌ foerderdatenbank.de nicht erreichbar!", flush=True)
        export_error_csv()
        sys.exit(1)

    # PHASE 1
    print("\n═══ PHASE 1: URLs sammeln ═══\n", flush=True)
    all_programmes = collect_all_urls(session)
    print(f"\n📊 {len(all_programmes)} einzigartige Programme\n", flush=True)

    if args.test:
        all_programmes = dict(list(all_programmes.items())[:5])

    if not all_programmes:
        print("⚠️ Keine Programme gefunden!", flush=True)
        export_error_csv()
        sys.exit(1)

    # PHASE 2
    programmes = fetch_details(session, all_programmes, fast_mode=args.fast)

    if not programmes:
        print("⚠️ Keine Programme verarbeitet!", flush=True)
        export_error_csv()
        sys.exit(1)

    # PHASE 3
    print(f"\n═══ PHASE 3: Export ({len(programmes)} Programme) ═══\n", flush=True)
    if args.json_only:
        export_to_json(programmes, args.output)
    else:
        success = export_to_supabase(programmes)
        if args.json_backup or not success:
            export_to_json(programmes, args.output)

    # Error-Log immer exportieren
    export_error_csv()

    # Stats
    quality_stats = {"vollstaendig": 0, "unvollstaendig": 0, "minimal": 0}
    for p in programmes:
        q = p.get("datenqualitaet", "minimal")
        quality_stats[q] = quality_stats.get(q, 0) + 1

    deadline_count = sum(1 for p in programmes if p.get("hat_deadline"))

    print(f"\n📊 Datenqualität:", flush=True)
    print(f"   Vollständig: {quality_stats['vollstaendig']}", flush=True)
    print(f"   Unvollständig: {quality_stats['unvollstaendig']}", flush=True)
    print(f"   Minimal: {quality_stats['minimal']}", flush=True)
    print(f"   Mit Deadline: {deadline_count}", flush=True)
    print(f"   Fehler gesamt: {len(error_log)}", flush=True)
    print(f"\n🎉 Fertig!", flush=True)


if __name__ == "__main__":
    main()
