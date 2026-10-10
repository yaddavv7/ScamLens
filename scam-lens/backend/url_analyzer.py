import re
import ipaddress

from urllib.parse import urlparse
from urllib.parse import unquote


# ==========================================================
# URL EXTRACTION
# ==========================================================

def extract_urls(text: str):

    """
    Extract HTTP/HTTPS URLs from text.
    """

    pattern = r"https?://[^\s<>'\"]+"

    matches = re.findall(pattern, text)

    # Remove common punctuation attached to URLs
    cleaned_urls = []

    for url in matches:

        url = url.rstrip(".,!?;:)")

        cleaned_urls.append(url)

    return list(dict.fromkeys(cleaned_urls))


# ==========================================================
# URL ANALYSIS
# ==========================================================

def analyze_url(url: str):

    """
    Analyze the structure of a URL.

    This function does NOT visit the URL.
    """

    indicators = []

    score = 0

    # ------------------------------------------------------
    # BASIC PARSING
    # ------------------------------------------------------

    try:

        parsed = urlparse(url)

    except Exception:

        return {
            "url": url,
            "valid": False,
            "score": 100,
            "risk": "HIGH",
            "domain": None,
            "indicators": [
                {
                    "category": "Invalid URL",
                    "severity": "high",
                    "message": "The URL could not be parsed safely."
                }
            ]
        }


    # ------------------------------------------------------
    # SCHEME
    # ------------------------------------------------------

    scheme = parsed.scheme.lower()

    if scheme not in ["http", "https"]:

        indicators.append({
            "category": "Unsafe Scheme",
            "severity": "high",
            "message": f"Unexpected URL scheme: {scheme}"
        })

        score += 30


    # ------------------------------------------------------
    # DOMAIN
    # ------------------------------------------------------

    domain = parsed.hostname

    if not domain:

        indicators.append({
            "category": "Invalid Domain",
            "severity": "high",
            "message": "No valid domain could be extracted."
        })

        score += 40

        return build_result(
            url,
            False,
            None,
            score,
            indicators
        )


    domain = domain.lower()


    # ------------------------------------------------------
    # IP ADDRESS CHECK
    # ------------------------------------------------------

    try:

        ip = ipaddress.ip_address(domain)

        indicators.append({
            "category": "IP Address",
            "severity": "medium",
            "message": "The link uses an IP address instead of a normal domain."
        })

        score += 20

        if ip.is_private:

            indicators.append({
                "category": "Private IP",
                "severity": "high",
                "message": "The URL points to a private IP address."
            })

            score += 40

    except ValueError:

        # Normal domain — nothing to do
        pass


    # ------------------------------------------------------
    # URL LENGTH
    # ------------------------------------------------------

    if len(url) > 120:

        indicators.append({
            "category": "Long URL",
            "severity": "medium",
            "message": "The URL is unusually long."
        })

        score += 10


    # ------------------------------------------------------
    # SUBDOMAIN CHECK
    # ------------------------------------------------------

    parts = domain.split(".")

    if len(parts) >= 4:

        indicators.append({
            "category": "Complex Domain",
            "severity": "medium",
            "message": "The domain contains several subdomain levels."
        })

        score += 10


    # ------------------------------------------------------
    # HYPHEN CHECK
    # ------------------------------------------------------

    if "-" in domain:

        indicators.append({
            "category": "Hyphenated Domain",
            "severity": "low",
            "message": "The domain contains hyphens."
        })

        score += 5


    # ------------------------------------------------------
    # SUSPICIOUS KEYWORDS
    # ------------------------------------------------------

    suspicious_terms = [

        "verify",
        "verification",
        "secure",
        "security",
        "login",
        "signin",
        "account",
        "update",
        "confirm",
        "wallet",
        "bank",
        "payment",
        "refund",
        "reward",
        "prize",
        "kyc",
        "password",
        "otp"

    ]


    matched_terms = []

    for term in suspicious_terms:

        if term in domain:

            matched_terms.append(term)


    if matched_terms:

        indicators.append({
            "category": "Suspicious Domain Terms",
            "severity": "medium",
            "message":
                "The domain contains security or financial terms: "
                + ", ".join(matched_terms)
        })

        score += min(
            len(matched_terms) * 10,
            30
        )


    # ------------------------------------------------------
    # USERINFO / @ CHECK
    # ------------------------------------------------------

    if "@" in url:

        indicators.append({
            "category": "URL Obfuscation",
            "severity": "high",
            "message":
                "The URL contains an @ character, which can obscure the actual destination."
        })

        score += 30


    # ------------------------------------------------------
    # ENCODED CHARACTERS
    # ------------------------------------------------------

    decoded_url = unquote(url)

    if decoded_url != url:

        indicators.append({
            "category": "Encoded URL",
            "severity": "medium",
            "message":
                "The URL contains encoded characters."
        })

        score += 10


    # ------------------------------------------------------
    # EXCESSIVE QUERY PARAMETERS
    # ------------------------------------------------------

    if parsed.query:

        parameters = parsed.query.split("&")

        if len(parameters) >= 5:

            indicators.append({
                "category": "Complex Query",
                "severity": "low",
                "message":
                    "The URL contains many query parameters."
            })

            score += 5


    # ------------------------------------------------------
    # SUSPICIOUS FILE EXTENSIONS
    # ------------------------------------------------------

    suspicious_extensions = [

        ".exe",
        ".scr",
        ".bat",
        ".cmd",
        ".msi",
        ".apk",
        ".zip"

    ]


    path_lower = parsed.path.lower()

    for extension in suspicious_extensions:

        if path_lower.endswith(extension):

            indicators.append({
                "category": "Executable Download",
                "severity": "high",
                "message":
                    f"The URL appears to point to a '{extension}' file."
            })

            score += 35


    # ------------------------------------------------------
    # HTTPS
    # ------------------------------------------------------

    if scheme == "http":

        indicators.append({
            "category": "No HTTPS",
            "severity": "medium",
            "message":
                "The link does not use HTTPS."
        })

        score += 15


    # ------------------------------------------------------
    # FINAL SCORE
    # ------------------------------------------------------

    score = min(score, 100)


    # ------------------------------------------------------
    # RISK
    # ------------------------------------------------------

    if score >= 60:

        risk = "HIGH"

    elif score >= 30:

        risk = "MEDIUM"

    else:

        risk = "LOW"


    return build_result(
        url,
        True,
        domain,
        score,
        indicators,
        scheme
    )


# ==========================================================
# RESULT BUILDER
# ==========================================================

def build_result(
    url,
    valid,
    domain,
    score,
    indicators,
    scheme=None
):

    return {

        "url": url,

        "valid": valid,

        "domain": domain,

        "scheme": scheme,

        "score": min(score, 100),

        "risk":
            "HIGH"
            if score >= 60
            else "MEDIUM"
            if score >= 30
            else "LOW",

        "indicator_count":
            len(indicators),

        "indicators":
            indicators

    }


# ==========================================================
# ANALYZE ALL URLS
# ==========================================================

def analyze_urls(text: str):

    urls = extract_urls(text)

    results = []

    for url in urls:

        results.append(
            analyze_url(url)
        )

    return results
