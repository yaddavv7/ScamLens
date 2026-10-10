import { useState } from "react";
import "./App.css";
import ScamTrail from "./components/ScamTrail";
import URLAnalysis from "./components/URLAnalysis";



function App() {

  // ------------------------------------
  // STORE USER MESSAGE
  // ------------------------------------

  const [message, setMessage] = useState("");


  // ------------------------------------
  // STORE ANALYSIS RESULT
  // ------------------------------------

  const [result, setResult] = useState(null);


  // ------------------------------------
  // STORE LOADING STATE
  // ------------------------------------

  const [loading, setLoading] = useState(false);


  // ------------------------------------
  // ANALYZE MESSAGE
  // ------------------------------------

  async function analyzeMessage() {

    // Check if message is empty

    if (!message.trim()) {

      alert("Please enter a message first.");

      return;
    }


    // Show loading state

    setLoading(true);

    setResult(null);


    try {

      // Send message to backend

      const response = await fetch(
        "http://localhost:8000/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            message: message
          })
        }
      );


      // Convert response to JSON

      const data = await response.json();


      // Store result

      setResult(data);

    }


    catch (error) {

      console.error(error);

      alert(
        "Unable to connect to ScamLens backend."
      );

    }


    // Stop loading

    setLoading(false);
  }


  // ------------------------------------
  // CLEAR EVERYTHING
  // ------------------------------------

  function clearAnalysis() {

    setMessage("");

    setResult(null);
  }


  // ------------------------------------
  // GET RISK COLOR
  // ------------------------------------

  function getRiskClass() {

    if (!result) {
      return "";
    }

    return result.risk.toLowerCase();
  }


  // ------------------------------------
  // PAGE
  // ------------------------------------

  return (

    <div className="app">


      {/* NAVBAR */}

      <nav className="navbar">

        <div className="brand">

          <span className="shield">
            🛡️
          </span>

          <span>
            ScamLens
          </span>

        </div>


        <div className="nav-text">

          AI Digital Safety

        </div>

      </nav>



      {/* MAIN */}

      <main className="container">


        {/* HERO */}

        <section className="hero">

          <div className="badge">

            AI-POWERED DIGITAL SAFETY

          </div>


          <h1>

            Don't trust it.

            <br />

            <span>
              Investigate it.
            </span>

          </h1>


          <p>

            ScamLens analyzes suspicious messages
            and explains the evidence behind the risk.

          </p>

        </section>



        {/* SCANNER */}

        <section className="scanner">


          <div className="section-title">

            <span className="icon">
              🔍
            </span>

            <div>

              <h2>
                Investigate a Message
              </h2>

              <p>
                Paste a suspicious SMS, email or message.
              </p>

            </div>

          </div>



          <textarea

            value={message}

            onChange={(event) =>
              setMessage(event.target.value)
            }

            placeholder=
              "Example: URGENT! Your account will be blocked today. Verify your OTP immediately..."

          />


          <div className="button-row">


            <button

              className="analyze-button"

              onClick={analyzeMessage}

              disabled={loading}

            >

              {loading

                ? "🔎 Investigating..."

                : "🛡️ Investigate Message"

              }

            </button>



            <button

              className="clear-button"

              onClick={clearAnalysis}

            >

              Clear

            </button>


          </div>


        </section>



        {/* RESULT */}

        {result && (

          <section className="result">


            {/* RISK HEADER */}

            <div
              className={`risk-card ${getRiskClass()}`}
            >

              <div className="risk-icon">

                {result.risk === "HIGH"
                  ? "🔴"
                  : result.risk === "MEDIUM"
                  ? "🟠"
                  : "🟢"
                }

              </div>


              <div>

                <div className="risk-label">

                  RISK LEVEL

                </div>

                <div className="risk-value">

                  {result.risk}

                </div>

              </div>

            </div>



            {/* TITLE */}

            <div className="result-heading">

              <h2>
                {result.title}
              </h2>

              <p>
                {result.explanation}
              </p>

            </div>



            {/* EVIDENCE */}

            <div className="evidence-section">

              <div className="section-header">

                <span>
                  🔍
                </span>

                <h3>
                  Evidence Detected
                </h3>

                <span className="count">

                  {result.indicator_count}

                </span>

              </div>


              <div className="evidence-grid">


                {result.indicators.map(
                  (indicator, index) => (

                    <div
                      className="evidence-card"
                      key={index}
                    >

                      <div className="evidence-icon">
                        ⚠️
                      </div>

                      <div>

                        <strong>
                          {indicator.type}
                        </strong>

                        <p>
                          {indicator.description}
                        </p>

                      </div>

                    </div>

                  )
                )}


              </div>

            </div>


            <ScamTrail result={result} />
            <URLAnalysis urls={result.urls} />


            {/* ACTION */}

            <div className="action-section">

              <div className="action-icon">
                🛡️
              </div>

              <div>

                <h3>
                  What should you do?
                </h3>

                <p>
                  {result.action}
                </p>

              </div>

            </div>


          </section>

        )}



        {/* FEATURES */}

        <section className="features">


          <div className="feature">

            <div>
              📸
            </div>

            <h3>
              Screenshot Analysis
            </h3>

            <p>
              Analyze suspicious screenshots
              using OCR.
            </p>

          </div>



          <div className="feature">

            <div>
              🔗
            </div>

            <h3>
              Link Investigation
            </h3>

            <p>
              Inspect suspicious links
              and domains.
            </p>

          </div>



          <div className="feature">

            <div>
              🧠
            </div>

            <h3>
              Explainable AI
            </h3>

            <p>
              Understand exactly why
              something looks suspicious.
            </p>

          </div>


        </section>


      </main>

    </div>
  );
}


export default App;
