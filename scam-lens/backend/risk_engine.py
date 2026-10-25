import json
import os
import re
import urllib.request
from dotenv import load_dotenv
from url_analyzer import analyze_urls

load_dotenv()


def extract_urls(text: str):
    """
    Find URLs inside a message.
    """
    pattern = r"https?://[^\s]+"
    return re.findall(pattern, text)


def get_ai_summary(text: str, risk: str, score: int, indicators: list) -> str:
    """
    Optionally generate an AI summary using Gemini to explain the scam tactic in plain English.
    Gracefully returns empty string if API is unavailable.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return ""

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={api_key}"
        prompt = (
            f"You are a cybersecurity expert analyzing a potentially fraudulent message.\n"
            f"Message: \"{text}\"\n"
            f"Computed Risk: {risk} (Score {score}/100)\n"
            f"Indicators: {json.dumps([i['message'] for i in indicators])}\n"
            f"Explain in 2-3 concise sentences why this message was flagged and give one concrete precaution."
        )

        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req, timeout=6) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            candidates = res_data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "").strip()
    except Exception as e:
        print(f"AI summary unavailable: {e}")

    return ""


def analyze_message(message: str):
    """
    Analyze a message using deterministic rules and indicators.
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
        "final notice",
        "suspended",
        "immediate action"
    ]

    for word in urgency_words:
        if word in text:
            indicators.append({
                "type": "Urgency",
                "category": "Urgency",
                "severity": "high",
                "description": f"Urgency language detected: '{word}'",
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
        "username",
        "credentials"
    ]

    for word in credential_words:
        if word in text:
            indicators.append({
                "type": "Credential Request",
                "category": "Credential Request",
                "severity": "high",
                "description": f"Sensitive information mentioned: '{word}'",
                "message": f"Sensitive information mentioned: '{word}'"
            })
            score += 20

    # -----------------------------
    # FINANCIAL REQUEST
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
        "lottery",
        "won",
        "₹",
        "rs."
    ]

    for word in financial_words:
        if word in text:
            indicators.append({
                "type": "Financial Request",
                "category": "Financial Request",
                "severity": "medium",
                "description": f"Financial language detected: '{word}'",
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
        "download",
        "install",
        "apk"
    ]

    for word in action_words:
        if word in text:
            indicators.append({
                "type": "Suspicious Action",
                "category": "Suspicious Action",
                "severity": "medium",
                "description": f"User is instructed to '{word}'.",
                "message": f"User is instructed to '{word}'."
            })
            score += 10

    # -----------------------------
    # URL ANALYSIS
    # -----------------------------
    url_results = analyze_urls(message)

    for url_result in url_results:
        url_score = url_result.get("score", 0)
        score += int(url_score * 0.5)

        # Add URL warnings to indicators if high risk
        if url_result.get("risk") in ["HIGH", "MEDIUM"]:
            domain = url_result.get("domain", "Unknown domain")
            indicators.append({
                "type": "Suspicious Link",
                "category": "Suspicious Link",
                "severity": "high" if url_result.get("risk") == "HIGH" else "medium",
                "description": f"Suspicious link detected pointing to: {domain}",
                "message": f"Suspicious link detected pointing to: {domain}"
            })

    score = min(score, 100)

    urls = [result.get("url", "") for result in url_results]

    # -----------------------------
    # RISK LEVEL & GUIDANCE
    # -----------------------------
    if score >= 60:
        risk = "HIGH"
        title = "Potential scam or phishing attempt"
        explanation = (
            "Several high-risk indicators were detected. "
            "The message appears to use techniques commonly "
            "associated with social engineering or phishing."
        )
        action = (
            "Do not click links, send money, or share "
            "passwords, OTPs, or other sensitive information. "
            "Verify the request directly through an official contact number or app."
        )
    elif score >= 30:
        risk = "MEDIUM"
        title = "Suspicious message"
        explanation = (
            "The message contains multiple indicators "
            "that deserve additional verification."
        )
        action = (
            "Pause before responding. Verify the sender's identity "
            "and do not share sensitive credentials or initiate payments."
        )
    else:
        risk = "LOW"
        title = "No major warning indicators detected"
        explanation = (
            "The current analysis did not identify enough "
            "warning indicators to classify this message "
            "as highly suspicious."
        )
        action = (
            "Continue to be cautious with unexpected "
            "messages and verify important requests."
        )

    ai_summary = get_ai_summary(message, risk, score, indicators)

    return {
        "score": score,
        "risk": risk,
        "title": title,
        "explanation": explanation,
        "action": action,
        "indicator_count": len(indicators),
        "indicators": indicators,
        "urls": urls,
        "url_analysis": url_results,
        "ai_summary": ai_summary
    }
