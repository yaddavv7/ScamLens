import re
from urllib.parse import urlparse


def extract_urls(text):

    pattern = r'https?://[^\s]+'

    urls = re.findall(pattern, text)

    return urls


def analyze_url(url):

    parsed = urlparse(url)

    domain = parsed.netloc.lower()

    indicators = []


    # Check for @ symbol

    if "@" in url:

        indicators.append(
            "URL contains an @ symbol, which can sometimes be used to disguise the actual destination."
        )


    # Check domain length

    if len(domain) > 35:

        indicators.append(
            "The domain name is unusually long."
        )


    # Suspicious words

    suspicious_words = [

        "verify",
        "verification",
        "login",
        "secure",
        "account",
        "update",
        "confirm",
        "password",
        "bank"

    ]


    for word in suspicious_words:

        if word in domain:

            indicators.append(
                f"Domain contains the term '{word}'."
            )


    return {

        "url": url,

        "domain": domain,

        "indicators": indicators

    }
