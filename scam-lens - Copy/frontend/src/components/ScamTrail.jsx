function ScamTrail({ result }) {

  if (!result) {
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
            <strong>Message Received</strong>
            <p>
              Suspicious content submitted for investigation.
            </p>
          </div>
        </div>


        <div className="trail-line"></div>


        {result.indicators.map((indicator, index) => (

          <div key={index}>

            <div className="trail-step">

              <div className="trail-icon">
                ⚠️
              </div>

              <div className="trail-content">

                <strong>
                  {indicator.type}
                </strong>

                <p>
                  {indicator.description}
                </p>

              </div>

            </div>

            {index < result.indicators.length - 1 && (
              <div className="trail-line"></div>
            )}

          </div>

        ))}


        <div className="trail-line"></div>


        <div className="trail-step">

          <div className="trail-icon">
            🚨
          </div>

          <div className="trail-content">

            <strong>
              Risk Assessment
            </strong>

            <p>
              ScamLens classified this message as{" "}
              <b>{result.risk}</b> risk.
            </p>

          </div>

        </div>


        <div className="trail-line"></div>


        <div className="trail-step">

          <div className="trail-icon">
            🛡️
          </div>

          <div className="trail-content">

            <strong>
              Recommended Action
            </strong>

            <p>
              {result.action}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ScamTrail;
