function ResultCard({ result }) {
  return (
    <>
      <div className="resultIcon">{result.icon}</div>

      <h1>{result.title}</h1>

      <div className="english">
        {result.en}
      </div>

      <div className="adviceBox">
        <strong>あなたの星の本質</strong>
        <br />
        {result.essence}
      </div>

      <div className="adviceBox">
        <strong>あなたの才能</strong>
        <br />
        {result.strength}
      </div>

      <div className="adviceBox">
        <strong>今日の一歩</strong>
        <br />
        {result.mission}
      </div>
    </>
  );
}

export default ResultCard;