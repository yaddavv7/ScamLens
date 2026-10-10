function URLAnalysis({ urls }) {

  if (!urls || urls.length === 0) {
    return null;
  }

  return (

    <div className="url-analysis">

      <div className="url-title">

        🔗 Link Investigation

      </div>


      {urls.map((item, index) => (

        <div
          className="url-card"
          key={index}
        >

          <div className="url-label">
            Detected URL
          </div>

          <div className="url-value">
            {item.url}
          </div>


          <div className="url-label">
            Domain
          </div>

          <div className="domain-value">
            {item.domain}
          </div>


          {item.indicators.length > 0 && (

            <div className="url-warnings">

              {item.indicators.map(
                (warning, warningIndex) => (

                  <div
                    key={warningIndex}
                    className="url-warning"
                  >

                    ⚠️ {warning}

                  </div>

                )
              )}

            </div>

          )}

        </div>

      ))}

    </div>

  );
}

export default URLAnalysis;
