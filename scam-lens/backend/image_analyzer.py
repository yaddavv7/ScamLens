import base64
import io
import json
import os
import urllib.request
from dotenv import load_dotenv
from PIL import Image

load_dotenv()


def image_to_base64(image_bytes: bytes) -> str:
    """
    Convert uploaded image bytes into a Base64 string.
    """
    return base64.b64encode(image_bytes).decode("utf-8")


def extract_text_with_tesseract(image_bytes: bytes) -> str:
    """
    Attempt OCR using pytesseract if available.
    """
    try:
        import pytesseract
        img = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(img)
        if text and text.strip():
            return text.strip()
    except Exception:
        pass
    return ""


def extract_text_with_gemini(image_bytes: bytes, filename: str = "") -> str:
    """
    Attempt OCR and text extraction using Gemini Vision API.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return ""

    try:
        b64 = image_to_base64(image_bytes)
        ext = os.path.splitext(filename)[1].lower() if filename else ".png"
        mime_type = "image/png"
        if ext in [".jpg", ".jpeg"]:
            mime_type = "image/jpeg"
        elif ext == ".webp":
            mime_type = "image/webp"

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={api_key}"
        payload = {
            "contents": [{
                "parts": [
                    {"inline_data": {"mime_type": mime_type, "data": b64}},
                    {"text": "Extract all text, messages, phone numbers, links, and transaction details from this screenshot verbatim. Do not add commentary or explanations. Just output the extracted text."}
                ]
            }]
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req, timeout=12) as response:
            result = json.loads(response.read().decode("utf-8"))
            candidates = result.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "").strip()
    except Exception as e:
        print(f"Gemini OCR error: {e}")

    return ""


def extract_text_from_image(image_bytes: bytes, filename: str = "") -> str:
    """
    Extract readable text from image bytes using OCR (Tesseract or Gemini Vision).
    """
    # 1. Try Tesseract first (local)
    text = extract_text_with_tesseract(image_bytes)
    if text:
        return text

    # 2. Try Gemini Vision API (multimodal cloud OCR)
    text = extract_text_with_gemini(image_bytes, filename)
    if text:
        return text

    return ""
