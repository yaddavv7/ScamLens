from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# Create FastAPI application
app = FastAPI(
    title="ScamLens API",
    description="AI-powered scam investigation assistant",
    version="1.0.0"
)


# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Data model for /analyze
class MessageRequest(BaseModel):
    message: str


# Home
@app.get("/")
def home():
    return {
        "message": "ScamLens API is running"
    }


# Health check
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# Analyze message
@app.post("/analyze")
def analyze(request: MessageRequest):

    message = request.message.lower()

    indicators = []


    # Check urgency
    urgency_words = [
        "urgent",
        "immediately",
        "right now",
        "act now",
        "last warning",
        "today",
        "within 24 hours",
        "account will be blocked"
    ]

    for word in urgency_words:
        if word in message:
            indicators.append({
                "type": "Urgency",
                "description": f"Urgency language detected: '{word}'"
            })


    # Check OTP
    otp_words = [
        "otp",
        "one time password",
        "verification code",
        "security code"
    ]

    for word in otp_words:
        if word in message:
            indicators.append({
                "type": "Credential Request",
                "description": f"Sensitive verification information requested: '{word}'"
            })


    # Check password
    password_words = [
        "password",
        "login password",
        "account password"
    ]

    for word in password_words:
        if word in message:
            indicators.append({
                "type": "Credential Request",
                "description": "Password-related information is being requested."
            })


    # Check money
    money_words = [
        "payment",
        "pay",
        "transfer money",
        "send money",
        "₹",
        "rs.",
        "refund"
    ]

    for word in money_words:
        if word in message:
            indicators.append({
                "type": "Financial Request",
                "description": "The message contains a financial request."
            })


    # Check suspicious actions
    action_words = [
        "click",
        "verify",
        "login",
        "update your account",
        "confirm your account"
    ]

    for word in action_words:
        if word in message:
            indicators.append({
                "type": "Suspicious Action",
                "description": f"User is asked to '{word}'."
            })


    # Calculate risk
    indicator_count = len(indicators)


    if indicator_count >= 4:

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
            "Verify the request through an official channel."
        )


    elif indicator_count >= 2:

        risk = "MEDIUM"

        title = "Suspicious message"

        explanation = (
            "The message contains multiple indicators "
            "that deserve additional verification."
        )

        action = (
            "Pause before responding. Verify the sender "
            "and request independently."
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


    # Return result
    return {
        "risk": risk,
        "title": title,
        "explanation": explanation,
        "indicator_count": indicator_count,
        "indicators": indicators,
        "action": action
    }

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):

    # Read uploaded image
    image_bytes = await file.read()

    return {
        "filename": file.filename,
        "message": "Image received successfully",
        "size": len(image_bytes)
    }
