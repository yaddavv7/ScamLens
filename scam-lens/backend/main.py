from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from risk_engine import analyze_message
from image_analyzer import extract_text_from_image

# Create FastAPI application
app = FastAPI(
    title="ScamLens API",
    description="AI-powered scam investigation assistant",
    version="1.0.0"
)

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Data model for /analyze
class MessageRequest(BaseModel):
    message: str


# Home endpoint
@app.get("/")
def home():
    return {
        "status": "online",
        "message": "ScamLens API is running",
        "endpoints": ["/analyze", "/analyze-image", "/health"]
    }


# Health check
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# Analyze text message
@app.post("/analyze")
def analyze(request: MessageRequest):
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    result = analyze_message(request.message)
    return result


# Analyze screenshot/image
@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    # Read uploaded image bytes
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Extract text from the image
    extracted_text = extract_text_from_image(image_bytes, file.filename or "")

    if not extracted_text:
        return {
            "filename": file.filename,
            "extracted_text": "",
            "message": "No readable text could be extracted from this image. Try pasting the message text directly.",
            "risk": "LOW",
            "score": 0,
            "title": "No text detected in screenshot",
            "explanation": "ScamLens could not detect any readable text, SMS, or link in the uploaded image.",
            "action": "Ensure the screenshot is clear and in focus, or copy and paste the message into the text investigator.",
            "indicator_count": 0,
            "indicators": [],
            "urls": [],
            "url_analysis": []
        }

    # Run full scam analysis on the extracted text
    analysis = analyze_message(extracted_text)
    analysis["filename"] = file.filename
    analysis["extracted_text"] = extracted_text

    return analysis
