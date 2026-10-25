function URLAnalysis({ urls }) {
  if (!urls || urls.length === 0) {
    return null;
  }

  return (
    <div className="url-analysis">
      <div className="url-title">
        🔗 Link & Domain Investigation
      </div>

      {urls.map((item, index) => {
        // Handle both string URLs and full URL analysis objects
        const isObject = typeof item === "object" && item !== null;
        const urlStr = isObject ? item.url : item;
        const domainStr = isObject ? item.domain : "";
        const riskLevel = isObject ? item.risk : "";
        const riskScore = isObject ? item.score : null;
        const indicators = isObject && Array.isArray(item.indicators) ? item.indicators : [];

        return (
          <div className="url-card" key={index} style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="url-label">Detected URL</div>
              {riskLevel && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    backgroundColor:
                      riskLevel === "HIGH"
                        ? "rgba(239, 68, 68, 0.2)"
                        : riskLevel === "MEDIUM"
                        ? "rgba(245, 158, 11, 0.2)"
                        : "rgba(34, 197, 94, 0.2)",
                    color:
                      riskLevel === "HIGH"
                        ? "#f87171"
                        : riskLevel === "MEDIUM"
                        ? "#fbbf24"
                        : "#4ade80"
                  }}
                >
                  {riskLevel} RISK {riskScore !== null ? `(${riskScore}/100)` : ""}
                </span>
              )}
            </div>

            <div className="url-value">{urlStr}</div>

            {domainStr && (
              <>
                <div className="url-label">Resolved Host / Domain</div>
                <div className="domain-value">{domainStr}</div>
              </>
            )}

            {indicators.length > 0 && (
              <div className="url-warnings">
                <div className="url-label" style={{ marginBottom: "6px" }}>
                  Flagged URL Characteristics
                </div>
                {indicators.map((warning, warningIndex) => {
                  const messageText =
                    typeof warning === "string"
                      ? warning
                      : warning?.message || warning?.description || "Suspicious URL property";
                  const category = warning?.category ? `[${warning.category}] ` : "";

                  return (
                    <div key={warningIndex} className="url-warning">
                      ⚠️ {category}{messageText}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default URLAnalysis;
