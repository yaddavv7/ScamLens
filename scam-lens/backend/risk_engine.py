import re
from url_analyzer import analyze_urls


def extract_urls(text):
    """
    Find URLs inside a message.
    """

    pattern = r"https?://[^\s]+"

    return re.findall(pattern, text)


def analyze_message(message):
    """
    Analyze a message using deterministic rules.
    """

    text = message.lower()

    indicators = []
    score = 0

    # -----------------------------
    # URGENCY
    # -----------------------------

    urgency_words = [
        "urgent",
        "immediately",
        "act now",
        "right now",
        "last warning",
        "within 24 hours",
        "today",
        "expires today",
        "account will be blocked",
        "final notice"
    ]

    for word in urgency_words:

        if word in text:

            indicators.append({
                "category": "Urgency",
                "severity": "high",
                "message": f"Urgency language detected: '{word}'"
            })

            score += 15


    # -----------------------------
    # CREDENTIAL REQUEST
    # -----------------------------

    credential_words = [
        "otp",
        "password",
        "pin",
        "cvv",
        "verification code",
        "security code",
        "login",
        "username"
    ]

    for word in credential_words:

        if word in text:

            indicators.append({
                "category": "Credential Request",
                "severity": "high",
                "message": f"Sensitive information mentioned: '{word}'"
            })

            score += 20


    # -----------------------------
    # MONEY
    # -----------------------------

    financial_words = [
        "payment",
        "pay",
        "transfer",
        "send money",
        "refund",
        "prize",
        "reward",
        "cash",
        "₹",
        "rs."
    ]

    for word in financial_words:

        if word in text:

            indicators.append({
                "category": "Financial Request",
                "severity": "medium",
                "message": f"Financial language detected: '{word}'"
            })

            score += 10


    # -----------------------------
    # SUSPICIOUS ACTION
    # -----------------------------

    action_words = [
        "click",
        "verify",
        "confirm",
        "update",
        "login",
        "open the link",
        "download"
    ]

    for word in action_words:

        if word in text:

            indicators.append({
                "category": "Suspicious Action",
                "severity": "medium",
                "message": f"User is instructed to '{word}'."
            })

            score += 10


    # -----------------------------
    # URL ANALYSIS
    # -----------------------------

    url_results = analyze_urls(message)
    # ------------------------------------------------------
# ADD URL RISK
# ------------------------------------------------------

    for url_result in url_results:

        url_score = url_result["score"]

        # Add a portion of URL risk
        # to the overall message score

        score += int(url_score * 0.5)
    score = min(score, 100)

    urls = []

    for result in url_results:

       urls.append(
        result["url"]
    )



    # -----------------------------
    # CAP SCORE
    # -----------------------------

    score = min(score, 100)


    # -----------------------------
    # RISK LEVEL
    # -----------------------------

    if score >= 60:

        risk = "HIGH"

    elif score >= 30:

        risk = "MEDIUM"

    else:

        risk = "LOW"


    return {
        "score": score,
        "risk": risk,
        "indicators": indicators,
        "urls": urls,
        "url_analysis": url_results
    }
