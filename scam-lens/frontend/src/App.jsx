import { useState, useRef } from "react";
import "./App.css";
import ScamTrail from "./components/ScamTrail";
import URLAnalysis from "./components/URLAnalysis";

const SAMPLE_MESSAGES = [
  {
    label: "🏦 Bank Phishing",
    text: "URGENT! Your State Bank account will be blocked today due to pending KYC. Click here to verify your details immediately: http://secure-kyc-verify-bank.com/login and submit your OTP."
  },
  {
    label: "🎁 Prize Scam",
    text: "Congratulations! You won ₹25,00,000 cash in the Diwali Lottery. To claim your reward, pay the ₹499 transfer processing fee now: https://win-lottery-claim-now.xyz/pay"
  },
  {
    label: "⚠️ Password Alert",
    text: "Your account password was updated from an unknown device. If this was not you, confirm your identity and login password within 24 hours: https://acc-security-alert.net/reset"
  },
  {
    label: "✅ Normal Message",
    text: "Hi Alex, hope you are having a wonderful weekend. Let's catch up over coffee this Tuesday around 4 PM at the library."
  }
];

function App() {
  const [mode, setMode] = useState("text"); // "text" | "image"
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Handle image file selection
  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setError("");
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  // Analyze text message
  async function analyzeMessage() {
    if (!message.trim()) {
      setError("Please enter or paste a message to investigate.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: message })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to ScamLens backend. Please ensure the backend server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }

  // Analyze screenshot image
  async function analyzeImage() {
    if (!imageFile) {
      setError("Please select or drop an image screenshot first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch("http://localhost:8000/analyze-image", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Unable to analyze image. Please ensure the backend server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }

  // Clear all states
  function clearAnalysis() {
    setMessage("");
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function getRiskClass() {
    if (!result || !result.risk) return "";
    return result.risk.toLowerCase();
  }

  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="brand">
          <span className="shield">🛡️</span>
          <span>ScamLens</span>
        </div>
        <div className="nav-text">AI Digital Safety & Threat Intelligence</div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="container">
        {/* HERO */}
        <section className="hero">
          <div className="badge">AI-POWERED DIGITAL FORENSICS</div>
          <h1>
            Don't trust it.<br />
            <span>Investigate it.</span>
          </h1>
          <p>
            ScamLens analyzes suspicious messages, screenshots, and URLs with explainable AI to detect fraud before it harms you.
          </p>
        </section>

        {/* SCANNER */}
        <section className="scanner">
          <div className="section-title">
            <span className="icon">🔍</span>
            <div>
              <h2>Investigate Threats</h2>
              <p>Analyze text messages, phishing emails, or upload a suspicious screenshot.</p>
            </div>
          </div>

          {/* MODE SELECTOR */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              type="button"
              onClick={() => { setMode("text"); setError(""); }}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: mode === "text" ? "1px solid #3b82f6" : "1px solid #334155",
                background: mode === "text" ? "rgba(59, 130, 246, 0.2)" : "#0f172a",
                color: mode === "text" ? "#60a5fa" : "#94a3b8",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              💬 Text / SMS Message
            </button>
            <button
              type="button"
              onClick={() => { setMode("image"); setError(""); }}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: mode === "image" ? "1px solid #3b82f6" : "1px solid #334155",
                background: mode === "image" ? "rgba(59, 130, 246, 0.2)" : "#0f172a",
                color: mode === "image" ? "#60a5fa" : "#94a3b8",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              📸 Screenshot OCR
            </button>
          </div>

          {/* TEXT MODE */}
          {mode === "text" && (
            <>
              {/* SAMPLES */}
              <div style={{ marginBottom: "14px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                  Try a quick example:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {SAMPLE_MESSAGES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMessage(sample.text);
                        setError("");
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "#1e293b",
                        border: "1px solid #334155",
                        color: "#cbd5e1",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Example: URGENT! Your account will be blocked today. Click http://verify-bank.com immediately..."
                rows={5}
              />
            </>
          )}

          {/* IMAGE MODE */}
          {mode === "image" && (
            <div style={{ marginBottom: "20px" }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #334155",
                  borderRadius: "16px",
                  padding: "30px",
                  textAlign: "center",
                  background: "#020617",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease"
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: "none" }}
                />
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>🖼️</div>
                <div style={{ fontWeight: "600", color: "#f8fafc", marginBottom: "6px" }}>
                  {imageFile ? imageFile.name : "Click to select or drop a screenshot"}
                </div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  Supports PNG, JPG, WebP. ScamLens will extract and inspect text automatically.
                </div>
              </div>

              {imagePreview && (
                <div style={{ marginTop: "15px", textAlign: "center", position: "relative" }}>
                  <img
                    src={imagePreview}
                    alt="Uploaded screenshot"
                    style={{
                      maxHeight: "220px",
                      maxWidth: "100%",
                      borderRadius: "12px",
                      border: "1px solid #334155"
                    }}
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      style={{
                        marginTop: "8px",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        background: "#334155",
                        border: "none",
                        color: "#cbd5e1",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      Remove Screenshot
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{ padding: "12px", marginTop: "15px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: "14px" }}>
              ⚠️ {error}
            </div>
          )}

          <div className="button-row">
            <button
              className="analyze-button"
              onClick={mode === "text" ? analyzeMessage : analyzeImage}
              disabled={loading}
            >
              {loading ? "🔎 Analyzing Threat..." : mode === "text" ? "🛡️ Investigate Message" : "🔍 Scan Screenshot OCR"}
            </button>
            <button className="clear-button" onClick={clearAnalysis} disabled={loading}>
              Clear
            </button>
          </div>
        </section>

        {/* RESULT */}
        {result && (
          <section className="result">
            {/* RISK HEADER */}
            <div className={`risk-card ${getRiskClass()}`}>
              <div className="risk-icon">
                {result.risk === "HIGH" ? "🔴" : result.risk === "MEDIUM" ? "🟠" : "🟢"}
              </div>
              <div style={{ flex: 1 }}>
                <div className="risk-label">COMPOSITE THREAT ASSESSMENT</div>
                <div className="risk-value">
                  {result.risk} RISK {result.score !== undefined ? `(${result.score}/100)` : ""}
                </div>
              </div>
            </div>

            {/* EXTRACTED OCR TEXT IF IMAGE */}
            {result.extracted_text && (
              <div style={{ marginTop: "20px", padding: "18px", background: "#020617", border: "1px solid #1e293b", borderRadius: "14px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#60a5fa", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                  📸 Extracted Text via Vision OCR:
                </div>
                <div style={{ color: "#e2e8f0", fontSize: "14px", fontStyle: "italic", whiteSpace: "pre-wrap", background: "#0f172a", padding: "12px", borderRadius: "8px" }}>
                  "{result.extracted_text}"
                </div>
              </div>
            )}

            {/* AI SUMMARY IF AVAILABLE */}
            {result.ai_summary && (
              <div style={{ marginTop: "20px", padding: "18px", background: "rgba(14, 165, 233, 0.08)", border: "1px solid rgba(14, 165, 233, 0.25)", borderRadius: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                  <span>🧠</span> AI Cyber-Analyst Insight:
                </div>
                <p style={{ margin: 0, color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                  {result.ai_summary}
                </p>
              </div>
            )}

            {/* HEADING */}
            <div className="result-heading">
              <h2>{result.title || "Threat Assessment Report"}</h2>
              <p>{result.explanation || "Analysis completed on submitted indicators."}</p>
            </div>

            {/* EVIDENCE SECTION */}
            <div className="evidence-section">
              <div className="section-header">
                <span>🔍</span>
                <h3>Evidence Detected</h3>
                <span className="count">{result.indicator_count || (result.indicators ? result.indicators.length : 0)}</span>
              </div>

              {result.indicators && result.indicators.length > 0 ? (
                <div className="evidence-grid">
                  {result.indicators.map((indicator, index) => (
                    <div className="evidence-card" key={index}>
                      <div className="evidence-icon">⚠️</div>
                      <div>
                        <strong>{indicator.type || indicator.category || "Indicator"}</strong>
                        <p>{indicator.description || indicator.message || ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "16px", color: "#94a3b8", fontStyle: "italic" }}>
                  No high-risk keywords or deceptive patterns were triggered.
                </div>
              )}
            </div>

            {/* INVESTIGATION TRAIL */}
            <ScamTrail result={result} />

            {/* URL ANALYSIS */}
            <URLAnalysis urls={result.url_analysis && result.url_analysis.length > 0 ? result.url_analysis : result.urls} />

            {/* ACTION GUIDANCE */}
            {result.action && (
              <div className="action-section">
                <div className="action-icon">🛡️</div>
                <div>
                  <h3>What should you do?</h3>
                  <p>{result.action}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* FEATURES FOOTER */}
        <section className="features">
          <div className="feature">
            <div>📸</div>
            <h3>Screenshot Analysis</h3>
            <p>Upload screenshots of suspicious chats, alerts, and SMS messages with automatic text extraction.</p>
          </div>
          <div className="feature">
            <div>🔗</div>
            <h3>Link Investigation</h3>
            <p>Deep-inspect suspicious URLs, domains, deceptive subdomains, and malicious IP hosts.</p>
          </div>
          <div className="feature">
            <div>🧠</div>
            <h3>Explainable AI</h3>
            <p>Understand the precise psychology, urgency tactics, and technical indicators behind the risk.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
