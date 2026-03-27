"""
FÖRDERLY – Scraper v5.2
========================
Aufbauend auf v5.1. Neue Features:

v5.2 Changes:
  1. description_short (max 300 Zeichen, Smart-Cut bei Satzende)
  2. description_full (KEINE Zeichenlimits mehr)
  3. Kurztext-Sektion von foerderdatenbank.de wird separat gescrapt
  4. Upsert schreibt description_short + description_full in DB
  5. Schedule: 1x pro Woche (Dienstag)

Bestehende v5.1 Fixes bleiben erhalten.
"""

import requests as req
import json, time, re, os, sys, argparse, csv
from datetime import datetime
from bs4 import BeautifulSoup

# ─── Config (Fix 1: Delays erhöht) ───
BASE = "https://www.foerderdatenbank.de"
SEARCH = "/SiteGlobals/FDB/Forms/Suche/Expertensuche_Formular.html"
DELAY_LIST = 2.0       # war 1.2
DELAY_DETAIL = 2.5     # war 1.5
MAX_RETRIES = 4        # war 3
TIMEOUT = (10, 45)     # Read-Timeout war 25, jetzt 45

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
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

# ─── Erweiterte Branchen-Keywords ───
BRANCHE_KW = {
    "digitalisierung": "digitalisierung", "digital": "digitalisierung",
    "smart cities": "digitalisierung", "e-commerce": "digitalisierung",
    "industrie 4.0": "digitalisierung", "ki": "digitalisierung",
    "künstliche intelligenz": "digitalisierung", "blockchain": "digitalisierung",
    "energieeffizienz": "energie-umwelt", "erneuerbare energien": "energie-umwelt",
    "umwelt": "energie-umwelt", "naturschutz": "energie-umwelt",
    "klimaschutz": "energie-umwelt", "nachhaltigkeit": "energie-umwelt",
    "wasserstoff": "energie-umwelt", "photovoltaik": "energie-umwelt",
    "windenergie": "energie-umwelt", "bioenergie": "energie-umwelt",
    "elektromobilität": "energie-umwelt", "co2": "energie-umwelt",
    "forschung": "forschung-entwicklung", "innovation": "forschung-entwicklung",
    "technologie": "forschung-entwicklung", "f&e": "forschung-entwicklung",
    "prototyp": "forschung-entwicklung", "patent": "forschung-entwicklung",
    "gesundheit": "gesundheit-medizin", "medizin": "gesundheit-medizin",
    "pflege": "gesundheit-medizin", "pharma": "gesundheit-medizin",
    "medizintechnik": "gesundheit-medizin", "biotech": "gesundheit-medizin",
    "handwerk": "handwerk", "meister": "handwerk", "gewerk": "handwerk",
    "handel": "handel", "außenwirtschaft": "handel", "export": "handel",
    "einzelhandel": "handel",
    "it": "it-software", "software": "it-software", "saas": "it-software",
    "cloud": "it-software", "cybersecurity": "it-software",
    "app": "it-software", "plattform": "it-software",
    "kultur": "kreativwirtschaft", "kreativ": "kreativwirtschaft",
    "design": "kreativwirtschaft", "medien": "kreativwirtschaft",
    "film": "kreativwirtschaft", "musik": "kreativwirtschaft",
    "produktion": "produktion-industrie", "industrie": "produktion-industrie",
    "fertigung": "produktion-industrie", "maschinenbau": "produktion-industrie",
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
    error_log.append({
        "timestamp": datetime.now().isoformat(),
        "url": url,
        "error_type": error_type,
        "error_message": str(message)[:500],
        "phase": phase,
    })
    log(f"  ⚠️ [{error_type}] {str(message)[:100]}")


def export_error_csv(path="data/scraper_errors.csv"):
    if not error_log:
        return
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["timestamp", "url", "error_type", "error_message", "phase"])
        writer.writeheader()
        writer.writerows(error_log)
    print(f"📋 Error-Log: {len(error_log)} Fehler → {path}", flush=True)


def export_errors_supabase(sb):
    if not error_log or not sb:
        return
    try:
        rows = [{
            "url": e["url"],
            "error_type": e["error_type"],
            "error_message": e["error_message"],
            "phase": e["phase"],
        } for e in error_log[:500]]
        sb.table("scraper_errors").insert(rows).execute()
        log(f"📋 {len(rows)} Fehler in Supabase geschrieben")
    except Exception as e:
        log(f"⚠️ Error-Log Supabase fehlgeschlagen: {e}")


# ═══════════════════════════════════════════
# Fix 2: Exponential Backoff + Rate-Limit-Handling
# ═══════════════════════════════════════════

def fetch(session, url, params=None, delay=DELAY_LIST, retries=MAX_RETRIES):
    """Fetch mit Exponential Backoff, Rate-Limit-Handling, 403-Skip."""
    time.sleep(delay)
    for attempt in range(1, retries + 1):
        try:
            r = session.get(url, params=params, timeout=TIMEOUT, allow_redirects=True)
            r.raise_for_status()
            return BeautifulSoup(r.text, "lxml")

        except req.exceptions.HTTPError as e:
            status = e.response.status_code if hasattr(e, 'response') and e.response is not None else 0
            log_error(url, f"HTTP{status}", str(e)[:200], "fetch")

            # Fix 2: 403 → Skip sofort, kein Retry (Server will nicht)
            if status == 403:
                log(f"  ↪ 403 Forbidden – überspringe URL")
                return None

            # Fix 2: 429 → Rate-Limit, lange Pause vor Retry
            if status == 429:
                wait_time = 60 * attempt  # 60s, 120s, 180s...
                log(f"  ↪ 429 Rate-Limit – warte {wait_time}s")
                time.sleep(wait_time)
                continue

        except req.exceptions.ConnectTimeout:
            log_error(url, "ConnectTimeout", f"Attempt {attempt}/{retries}", "fetch")
        except req.exceptions.ReadTimeout:
            log_error(url, "ReadTimeout", f"Attempt {attempt}/{retries}", "fetch")
        except req.exceptions.ConnectionError as e:
            log_error(url, "ConnectionError", str(e)[:200], "fetch")
        except Exception as e:
            log_error(url, type(e).__name__, str(e)[:200], "fetch")

        # Fix 2: Exponential Backoff
        if attempt < retries:
            backoff = min(5 * (2 ** (attempt - 1)), 120)  # 5s, 10s, 20s, max 120s
            log(f"  ↪ Retry {attempt}/{retries} in {backoff}s")
            time.sleep(backoff)

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
# PHASE 1: Collect URLs
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
            soup = fetch(session, next_url, next_params, delay=DELAY_LIST)
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
# Fix 3: extract_antragsfrist() – erweiterte Keywords
# ═══════════════════════════════════════════

def extract_antragsfrist(soup, text):
    """Extrahiert Antragsfrist. Fix 3: Mehr Keywords, Fulltext-Regex überall."""
    try:
        # Erweiterte Keywords für <dt> Labels
        frist_keywords = [
            "frist", "antragsfrist", "antragstermin", "bewerbungsfrist",
            "bewilligungsfrist", "stichtag", "einreichungsfrist",
            "abgabefrist", "deadline", "termin", "bewerbungsschluss",
            "antragsschluss", "einsendeschluss",
        ]

        laufend_keywords = [
            "laufend", "fortlaufend", "jederzeit", "keine frist",
            "ohne frist", "unbefristet", "dauerhaft", "permanent",
            "bis auf weiteres", "zeitlich unbegrenzt",
        ]

        # 1. Suche in <dt>/<dd> Paaren
        for dt in soup.select("dt"):
            label = dt.get_text(strip=True).lower().rstrip(":")
            if any(kw in label for kw in frist_keywords):
                dd = dt.find_next_sibling("dd")
                if dd:
                    val = dd.get_text(strip=True)
                    if val:
                        # Datum DD.MM.YYYY
                        m = re.search(r'(\d{1,2}\.\d{1,2}\.\d{4})', val)
                        if m:
                            return m.group(1)
                        # Laufend-Keywords
                        if any(kw in val.lower() for kw in laufend_keywords):
                            return "laufend"
                        return val[:100]

        # 2. Regex-Fallback im GESAMTEN Text (nicht nur am Anfang)
        frist_patterns = [
            r'(?:Antragsfrist|Antragsschluss|Bewerbungsfrist|Stichtag|Einreichungsfrist|Abgabefrist)[:\s]*(\d{1,2}\.\d{1,2}\.\d{4})',
            r'(?:bis|zum)\s+(\d{1,2}\.\d{1,2}\.\d{4})\s+(?:einzureichen|beantragt|eingereicht)',
            r'Frist[:\s]*(\d{1,2}\.\d{1,2}\.\d{4})',
        ]
        for pattern in frist_patterns:
            m = re.search(pattern, text, re.I)
            if m:
                return m.group(1)

        # 3. Laufend-Check im Volltext
        text_lower = text.lower()
        if any(kw in text_lower for kw in ["anträge können jederzeit", "laufend möglich", "fortlaufend gestellt"]):
            return "laufend"

        return None
    except Exception as e:
        log_error("", "ExtractAntragsfrist", str(e), "extract")
        return None


# ═══════════════════════════════════════════
# Fix 4: extract_rechtsgrundlagen() – erweiterte Keywords
# ═══════════════════════════════════════════

def extract_rechtsgrundlagen(soup, text):
    """Extrahiert Rechtsgrundlagen (max 2). Fix 4: Mehr Keywords, Fallback-Regex."""
    try:
        result = []
        rg_keywords = [
            "rechtsgrundlage", "rechtliche grundlage", "gesetzliche grundlage",
            "basis", "verordnung", "richtlinie", "rechtsbasis", "grundlage",
            "rechtsquelle", "förderrichtlinie", "verwaltungsvorschrift",
        ]

        for dt in soup.select("dt"):
            label = dt.get_text(strip=True).lower().rstrip(":")
            if any(kw in label for kw in rg_keywords):
                dd = dt.find_next_sibling("dd")
                if dd:
                    val = dd.get_text(strip=True)
                    parts = re.split(r'[;,]', val)
                    for p in parts[:2]:
                        cleaned = p.strip()[:200]
                        if cleaned and len(cleaned) > 3:
                            result.append(cleaned)

        # Fallback-Regex: typische Patterns im Text
        if not result:
            patterns = [
                r'((?:KfW|BAFA|EU|ERP|ESF|EFRE|GAK)\s*[-–]?\s*(?:Förder)?[Rr]ichtlinie[^\.,;]{0,80})',
                r'(§\s*\d+[a-zA-Z]?\s*(?:Abs\.\s*\d+)?\s*\w{2,40})',
                r'((?:Verordnung|Richtlinie|Verwaltungsvorschrift)\s+(?:\((?:EU|EG)\)\s*)?\w[^\.,;]{5,80})',
                r'(Bundesgesetzblatt[^\.,;]{5,80})',
            ]
            for pattern in patterns:
                matches = re.findall(pattern, text)
                for m in matches[:2]:
                    cleaned = m.strip()[:200]
                    if cleaned and cleaned not in result:
                        result.append(cleaned)
                if len(result) >= 2:
                    break

        return result[:2]
    except Exception as e:
        log_error("", "ExtractRechtsgrundlagen", str(e), "extract")
        return []


# ═══════════════════════════════════════════
# Fix 5: extract_foerderquote() – mehr Patterns
# ═══════════════════════════════════════════

def extract_foerderquote(text):
    """Extrahiert Förderquote als int (1-100). Fix 5: Mehr Patterns."""
    try:
        patterns = [
            r'(?:Förder(?:quote|satz|anteil))[:\s]*(?:bis\s+(?:zu\s+)?)?(\d{1,3})\s*(?:%|Prozent)',
            r'(?:bis\s+(?:zu\s+)?|max\.?\s*|maximal\s+)(\d{1,3})\s*(?:%|Prozent)\s*(?:der|Zuschuss|Förderung|Quote)',
            r'(?:Zuschuss|Förderung)\s+(?:von\s+)?(?:bis\s+(?:zu\s+)?)?(\d{1,3})\s*(?:%|Prozent)',
            r'(\d{1,3})\s*(?:%|Prozent)\s*(?:der\s+(?:förderfähigen|zuwendungsfähigen)\s+(?:Kosten|Ausgaben))',
            r'(?:bis\s+(?:zu\s+)?|max\.?\s*)(\d{1,3})\s*%',
            r'Quote[:\s]*(\d{1,3})\s*%',
            r'(\d{1,3})\s*Prozent\s*(?:Zuschuss|Förderung)',
        ]

        for pattern in patterns:
            m = re.search(pattern, text, re.I)
            if m:
                val = int(m.group(1))
                if 1 <= val <= 100:
                    return val

        return None
    except Exception as e:
        log_error("", "ExtractFoerderquote", str(e), "extract")
        return None


# ═══════════════════════════════════════════
# Fix 6: extract_bearbeitungszeit() – mehr Keywords
# ═══════════════════════════════════════════

def extract_bearbeitungszeit(soup, text):
    """Extrahiert Bearbeitungszeit. Fix 6: Mehr Keywords, Fallback-Regex."""
    try:
        zeit_keywords = [
            "bearbeitungszeit", "bearbeitungsdauer", "laufzeit",
            "bewilligungszeitraum", "dauer", "förderdauer",
            "projektlaufzeit", "förderzeitraum", "durchführungszeitraum",
        ]

        for dt in soup.select("dt"):
            label = dt.get_text(strip=True).lower().rstrip(":")
            if any(kw in label for kw in zeit_keywords):
                dd = dt.find_next_sibling("dd")
                if dd:
                    val = dd.get_text(strip=True)
                    if val and 3 < len(val) < 100:
                        return val

        # Regex-Fallback im Text
        zeit_patterns = [
            r'(?:Bearbeitungszeit|Bearbeitungsdauer|Bewilligungszeitraum|Förderdauer|Projektlaufzeit)[:\s]*(.{5,60}?)(?:\.|$|\n)',
            r'(?:Dauer|Laufzeit)[:\s]*(?:bis\s+(?:zu\s+)?)?((?:\d+[-–]\d+\s+(?:Wochen|Monate|Jahre))|(?:ca\.?\s*\d+\s+(?:Wochen|Monate|Jahre))|(?:max\.?\s*\d+\s+(?:Wochen|Monate|Jahre)))',
        ]
        for pattern in zeit_patterns:
            m = re.search(pattern, text, re.I)
            if m:
                val = m.group(1).strip()
                if val and 3 < len(val) < 80:
                    return val

        return None
    except Exception as e:
        log_error("", "ExtractBearbeitungszeit", str(e), "extract")
        return None


# ═══════════════════════════════════════════
# Fix 7: extract_besonderheiten() – Inline-Text-Erkennung
# ═══════════════════════════════════════════

def extract_besonderheiten(soup, text):
    """Extrahiert Besonderheiten (max 5). Fix 7: Auch inline Text erkennen."""
    try:
        result = []

        heading_keywords = [
            "besonderheit", "hinweis", "wichtig", "voraussetzung",
            "bedingung", "kombination", "kumulierung", "ergänzung",
            "anmerkung", "sonstiges", "zusätzlich",
        ]

        # 1. Suche nach Headings
        for heading in soup.find_all(["h2", "h3", "h4", "h5"]):
            h_text = heading.get_text(strip=True).lower()
            if any(kw in h_text for kw in heading_keywords):
                for sib in heading.find_next_siblings():
                    if sib.name in ("h2", "h3", "h4"):
                        break
                    if sib.name in ("p", "li"):
                        t = sib.get_text(strip=True)
                        if t and len(t) > 10:
                            result.append(t[:200])
                    if len(result) >= 5:
                        break

        # 2. Fallback: <li> mit bestimmten Keywords
        if not result:
            inline_keywords = [
                "kombin", "kumulier", "de-minimis", "de minimis", "beihilfe",
                "voraussetzung", "bedingung", "kofinanzier", "eigenanteil",
                "nicht rückzahlbar", "rückzahlbar", "mindest",
            ]
            for li in soup.select("ul li, ol li"):
                t = li.get_text(strip=True)
                if t and len(t) > 12:
                    t_lower = t.lower()
                    if any(kw in t_lower for kw in inline_keywords):
                        result.append(t[:200])
                if len(result) >= 5:
                    break

        # 3. Fallback: Sätze im Text mit Keywords
        if not result:
            sentences = re.split(r'[.!]\s+', text)
            for s in sentences:
                s_lower = s.lower()
                if any(kw in s_lower for kw in ["de-minimis", "kumulier", "kombin", "kofinanzier"]):
                    cleaned = s.strip()[:200]
                    if cleaned and len(cleaned) > 15:
                        result.append(cleaned)
                if len(result) >= 5:
                    break

        return result[:5]
    except Exception as e:
        log_error("", "ExtractBesonderheiten", str(e), "extract")
        return []


# ═══════════════════════════════════════════
# Fix 8: extract_kontakte() – Plain-Text Email+Tel
# ═══════════════════════════════════════════

def extract_kontakte(soup):
    """Extrahiert Kontaktdaten. Fix 8: Plain-Text Email+Tel Regex."""
    try:
        kontakte = []
        seen = set()

        # E-Mails aus <a href="mailto:">
        for a in soup.select("a[href^='mailto:']"):
            email = a.get("href", "").replace("mailto:", "").strip().split("?")[0]
            if email and "@" in email and email not in seen:
                kontakte.append({"typ": "email", "wert": email})
                seen.add(email)

        # Fix 8: E-Mails als Plain-Text im HTML
        text = soup.get_text(" ", strip=True)
        email_pattern = r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'
        for m in re.finditer(email_pattern, text):
            email = m.group(0).strip().rstrip(".")
            if email not in seen and len(email) < 80:
                kontakte.append({"typ": "email", "wert": email})
                seen.add(email)

        # Telefon aus <a href="tel:">
        for a in soup.select("a[href^='tel:']"):
            tel = a.get("href", "").replace("tel:", "").strip()
            if tel and tel not in seen:
                kontakte.append({"typ": "telefon", "wert": tel})
                seen.add(tel)

        # Fix 8: Telefonnummern als Plain-Text (verschiedene Formate)
        tel_patterns = [
            r'(?:Tel\.?|Telefon|Fon|Phone|Ruf)[:\s]*([\d\s/\-+()]{8,25})',
            r'(\+49[\s\-./]?\(?\d{2,5}\)?[\s\-./]?\d{3,8}[\s\-./]?\d{0,5})',
            r'(\(0\d{2,5}\)\s*[\d\s\-/]{5,15})',
            r'(0\d{2,4}[\s/\-]\d{3,8}[\s\-]?\d{0,5})',
        ]
        for pattern in tel_patterns:
            for m in re.finditer(pattern, text):
                tel = m.group(1).strip()
                # Normalisieren: nur Ziffern+Sonderzeichen
                tel_clean = re.sub(r'[^\d+\-/() ]', '', tel).strip()
                if tel_clean and len(tel_clean) >= 8 and tel_clean not in seen:
                    kontakte.append({"typ": "telefon", "wert": tel_clean})
                    seen.add(tel_clean)
                    break  # Nur erste Telefonnummer pro Pattern

        # Weiterführende Links aus <dt>/<dd>
        for dt in soup.select("dt"):
            label = dt.get_text(strip=True).lower()
            if any(kw in label for kw in ["weiterführende", "weitere information", "link"]):
                dd = dt.find_next_sibling("dd")
                if dd:
                    for lnk in dd.select("a[href]")[:3]:
                        href = lnk.get("href", "")
                        if href.startswith("http") and href not in seen:
                            kontakte.append({"typ": "link", "wert": href})
                            seen.add(href)

        return kontakte[:10]
    except Exception as e:
        log_error("", "ExtractKontakte", str(e), "extract")
        return []


def detect_zielgruppen(text):
    try:
        txt = text.lower()
        found = set()
        for gruppe, keywords in ZIELGRUPPEN_KW.items():
            for kw in keywords:
                if kw in txt:
                    found.add(gruppe)
                    break
        return sorted(found)
    except:
        return []


def smart_cut(text, max_chars=300):
    """v5.2: Intelligenter Cut bei Satzende, max max_chars Zeichen."""
    if not text:
        return None
    if len(text) <= max_chars:
        return text
    # Finde letzten Satzende-Punkt vor max_chars
    truncated = text[:max_chars]
    last_dot = truncated.rfind('.')
    last_excl = truncated.rfind('!')
    last_quest = truncated.rfind('?')
    best_cut = max(last_dot, last_excl, last_quest)
    if best_cut > 50:  # Mindestens 50 Zeichen, sonst zu kurz
        return text[:best_cut + 1]
    # Fallback: Cut bei letztem Leerzeichen + Ellipsis
    last_space = truncated.rfind(' ')
    if last_space > 50:
        return text[:last_space] + '...'
    return truncated + '...'


def detect_finanzierungsform(text):
    try:
        txt = text.lower()
        found = set()
        for form, keywords in FINANZIERUNG_KW.items():
            for kw in keywords:
                if kw in txt:
                    found.add(form)
                    break
        return sorted(found)
    except:
        return []


def assess_data_quality(prog):
    try:
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
    except:
        return "minimal"


# ═══════════════════════════════════════════
# PHASE 2: Detail-Parsing v5.1
# ═══════════════════════════════════════════

def fetch_details(session, all_programmes, fast_mode=False):
    programmes = []
    total = len(all_programmes)
    errors = 0

    print(f"\n{'='*60}", flush=True)
    print(f"PHASE 2: {total} Detailseiten abrufen (v5.2)", flush=True)
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
            # Fix 11: SKIP statt ABORT
            errors += 1
            log_error(url, type(e).__name__, str(e), "detail")
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
        antragsfrist=None, rechtsgrundlagen=[], foerderquote=None,
        bearbeitungszeit=None, besonderheiten=[], kontakte=[],
    )


def parse_detail_v5(session, url, info):
    """Parse Detail-Seite mit v5.1 Fixes."""
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

    # Fix 11: Try-Except um dt/dd Parsing
    try:
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
    except Exception as e:
        log_error(url, "DTDDParsing", str(e), "detail")

    # v5.2: Dual-Text Strategy – description_short + description_full (KEINE Limits)
    try:
        kurztext_parts = []
        volltext_parts = []

        # Separate Kurztext-Sektion scrapen
        h3_kurz = soup.find("h3", string=re.compile("Kurztext", re.I))
        if h3_kurz:
            for sib in h3_kurz.find_next_siblings():
                if sib.name in ("h2", "h3"):
                    break
                if sib.name == "p":
                    t = sib.get_text(strip=True)
                    if t:
                        kurztext_parts.append(t)

        # Volltext-Sektion scrapen (KEINE Zeichenlimits)
        h3_voll = soup.find("h3", string=re.compile("Volltext", re.I))
        if h3_voll:
            for sib in h3_voll.find_next_siblings():
                if sib.name in ("h2", "h3"):
                    break
                if sib.name in ("p", "li"):
                    t = sib.get_text(strip=True)
                    if t:
                        volltext_parts.append(t)

        # description_full: Alles, keine Limits
        if volltext_parts:
            prog["description_full"] = " ".join(volltext_parts)
        elif kurztext_parts:
            prog["description_full"] = " ".join(kurztext_parts)

        # description_short: Kurztext-Sektion oder Smart-Cut aus Volltext
        if kurztext_parts:
            short_text = " ".join(kurztext_parts)
            prog["description_short"] = smart_cut(short_text, 300)
        elif prog.get("description_full"):
            prog["description_short"] = smart_cut(prog["description_full"], 300)

        # beschreibung: Backward-compatible, Kurztext + Volltext
        if kurztext_parts or volltext_parts:
            combined = " ".join(kurztext_parts + volltext_parts)
            prog["beschreibung"] = combined  # Keine Limits mehr
        else:
            meta = info["meta"]
            bits = []
            if meta.get("Was wird gefördert?"):
                bits.append(meta["Was wird gefördert?"])
            if meta.get("Wer wird gefördert?"):
                bits.append(meta["Wer wird gefördert?"])
            fallback = " | ".join(bits) if bits else None
            prog["beschreibung"] = fallback
            prog["description_full"] = fallback
            prog["description_short"] = smart_cut(fallback, 300) if fallback else None
    except Exception as e:
        log_error(url, "BeschreibungParsing", str(e), "detail")

    # Eigenanteil
    try:
        ea_match = re.search(r'(\d{1,3})\s*%\s*(?:Eigen|eigen)', prog["beschreibung"] or "", re.I)
        if ea_match:
            prog["eigenanteil_prozent"] = int(ea_match.group(1))
    except:
        pass

    # Bundesländer
    bundeslaender = list(info["bundeslaender"])
    if foerdergebiet and "bundesweit" in foerdergebiet.lower():
        if "BUND" not in bundeslaender:
            bundeslaender.append("BUND")

    # Fix 10: full_text auf 5000 Zeichen erhöht
    full_text = " ".join(filter(None, [
        foerderberechtigte, foerderbereich, prog["beschreibung"],
        prog["name"], soup.get_text()[:5000],  # war 2000
    ]))

    # ═══ v5.1: Neue Felder mit Try-Except (Fix 11) ═══
    antragsfrist = extract_antragsfrist(soup, full_text)
    rechtsgrundlagen = extract_rechtsgrundlagen(soup, full_text)
    foerderquote = extract_foerderquote(full_text)
    bearbeitungszeit = extract_bearbeitungszeit(soup, full_text)
    besonderheiten = extract_besonderheiten(soup, full_text)
    kontakte = extract_kontakte(soup)

    # Beträge
    amounts = []
    try:
        for m in re.finditer(r'([\d.]+)\s*(?:EUR|Euro|€)', prog["beschreibung"] or "", re.I):
            try:
                v = int(m.group(1).replace(".", ""))
                if v > 0:
                    amounts.append(v)
            except ValueError:
                pass
    except:
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
        description_short=prog.get("description_short"),
        description_full=prog.get("description_full"),
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
                          besonderheiten=None, kontakte=None,
                          description_short=None, description_full=None):
    """Baut finales Programm-Dict mit v5.2 Feldern (description_short/full)."""
    txt = raw_text.lower()

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

    slugs = set()
    for kw, slug in BRANCHE_KW.items():
        if kw in txt:
            slugs.add(slug)
    if not slugs:
        slugs.add("branchenuebergreifend")

    vmax, vmin = 0, 0
    amounts = []
    try:
        for m in re.finditer(r'([\d.]+)\s*(?:EUR|Euro|€)', beschreibung or "", re.I):
            try:
                v = int(m.group(1).replace(".", ""))
                if v > 0:
                    amounts.append(v)
            except ValueError:
                pass
    except:
        pass
    if amounts:
        vmax = max(amounts)
        vmin = min(amounts) if len(amounts) > 1 else 0

    hat_deadline = antragsfrist is not None and antragsfrist != "laufend"
    zielgruppen = detect_zielgruppen(txt)
    finanzierungsform = detect_finanzierungsform(txt)

    prog = {
        "name": name,
        "kurzname": kurzname,
        "beschreibung": beschreibung,
        "description_short": description_short or smart_cut(beschreibung, 300),
        "description_full": description_full or beschreibung,
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

    print(f"\n📤 Schreibe {len(programmes)} Programme in Supabase (v5.2)...", flush=True)

    BATCH = 50
    upserted = 0
    errors = 0

    for i in range(0, len(programmes), BATCH):
        batch = programmes[i:i + BATCH]
        rows = [{
            "name": p["name"],
            "kurzname": p.get("kurzname"),
            "beschreibung": p.get("beschreibung"),
            "description_short": p.get("description_short"),
            "description_full": p.get("description_full"),
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
            for row in rows:
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

    # Fix 12: Error-Log in Supabase
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
    ap = argparse.ArgumentParser(description="Förderly Scraper v5.1")
    ap.add_argument("--test", action="store_true", help="Testlauf: 5 Programme")
    ap.add_argument("--fast", action="store_true", help="Nur Listendaten")
    ap.add_argument("--json-only", action="store_true", help="Nur JSON")
    ap.add_argument("--json-backup", action="store_true", help="Zusätzlich JSON-Backup")
    ap.add_argument("--output", default="data/foerderprogramme.json")
    args = ap.parse_args()

    session = req.Session()
    session.headers.update(HEADERS)

    print(f"\n{'='*60}", flush=True)
    print(f"  FÖRDERLY SCRAPER v5.2", flush=True)
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    print(f"{'='*60}\n", flush=True)

    if not test_connectivity(session):
        print("\n❌ foerderdatenbank.de nicht erreichbar!", flush=True)
        export_error_csv()
        sys.exit(1)

    print("\n═══ PHASE 1: URLs sammeln ═══\n", flush=True)
    all_programmes = collect_all_urls(session)
    print(f"\n📊 {len(all_programmes)} einzigartige Programme\n", flush=True)

    if args.test:
        all_programmes = dict(list(all_programmes.items())[:5])

    if not all_programmes:
        print("⚠️ Keine Programme gefunden!", flush=True)
        export_error_csv()
        sys.exit(1)

    programmes = fetch_details(session, all_programmes, fast_mode=args.fast)

    if not programmes:
        print("⚠️ Keine Programme verarbeitet!", flush=True)
        export_error_csv()
        sys.exit(1)

    print(f"\n═══ PHASE 3: Export ({len(programmes)} Programme) ═══\n", flush=True)
    if args.json_only:
        export_to_json(programmes, args.output)
    else:
        success = export_to_supabase(programmes)
        if args.json_backup or not success:
            export_to_json(programmes, args.output)

    export_error_csv()

    # Stats
    quality_stats = {"vollstaendig": 0, "unvollstaendig": 0, "minimal": 0}
    for p in programmes:
        q = p.get("datenqualitaet", "minimal")
        quality_stats[q] = quality_stats.get(q, 0) + 1

    deadline_count = sum(1 for p in programmes if p.get("hat_deadline"))
    kontakte_count = sum(1 for p in programmes if p.get("kontakte"))
    frist_count = sum(1 for p in programmes if p.get("antragsfrist"))

    print(f"\n📊 Statistiken:", flush=True)
    print(f"   Vollständig: {quality_stats['vollstaendig']}", flush=True)
    print(f"   Unvollständig: {quality_stats['unvollstaendig']}", flush=True)
    print(f"   Minimal: {quality_stats['minimal']}", flush=True)
    print(f"   Mit Deadline: {deadline_count}", flush=True)
    print(f"   Mit Antragsfrist: {frist_count}", flush=True)
    print(f"   Mit Kontakten: {kontakte_count}", flush=True)
    print(f"   Fehler gesamt: {len(error_log)}", flush=True)
    print(f"\n🎉 Fertig!", flush=True)


if __name__ == "__main__":
    main()
