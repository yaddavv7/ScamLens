function ScamTrail({ result }) {
  if (!result || !result.indicators || result.indicators.length === 0) {
    return null;
  }

  return (
    <div className="scam-trail">
      <div className="trail-title">
        🔎 Investigation Trail
      </div>

      <div className="trail">
        <div className="trail-step">
          <div className="trail-icon">
            📱
          </div>
          <div className="trail-content">
            <strong>Suspicious Content Ingested</strong>
            <p>
              Message or screenshot submitted for multi-vector threat inspection.
            </p>
          </div>
        </div>

        <div className="trail-line"></div>

        {result.indicators.map((indicator, index) => {
          const title = indicator.type || indicator.category || "Threat Indicator";
          const desc = indicator.description || indicator.message || "Potential suspicious pattern detected.";

          return (
            <div key={index}>
              <div className="trail-step">
                <div className="trail-icon">
                  ⚠️
                </div>
                <div className="trail-content">
                  <strong>{title}</strong>
                  <p>{desc}</p>
                </div>
              </div>
              <div className="trail-line"></div>
            </div>
          );
        })}

        <div className="trail-step">
          <div className="trail-icon">
            🚨
          </div>
          <div className="trail-content">
            <strong>Risk Assessment Engine</strong>
            <p>
              ScamLens computed a composite risk level of{" "}
              <b style={{ color: result.risk === "HIGH" ? "#f87171" : result.risk === "MEDIUM" ? "#fbbf24" : "#4ade80" }}>
                {result.risk}
              </b>
              {result.score !== undefined ? ` (Score: ${result.score}/100)` : ""}.
            </p>
          </div>
        </div>

        {result.action && (
          <>
            <div className="trail-line"></div>
            <div className="trail-step">
              <div className="trail-icon">
                🛡️
              </div>
              <div className="trail-content">
                <strong>Recommended Protection Action</strong>
                <p>{result.action}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ScamTrail;
