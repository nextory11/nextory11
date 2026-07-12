function ResultCard({ result }) {
  return (
    <div className="resultCard" aria-label="NEXTORY11 diagnosis result">
      <div className="resultCard__aura" aria-hidden="true" />
      <div className="resultBadge">YOUR STAR TYPE</div>
      <div className="resultIcon" aria-hidden="true">
        {result.icon}
      </div>

      <p className="resultKicker">あなたの中で目覚めた星</p>
      <h1 className="resultTitle">{result.title}</h1>
      <div className="english">{result.en}</div>
      <p className="resultLead">
        11の回答から映し出された、今のあなたを導く星の輪郭です。
      </p>

      <div className="resultGrid">
        <article className="adviceBox">
          <span className="adviceBox__number">01</span>
          <strong>あなたの星の本質</strong>
          <p>{result.essence}</p>
        </article>

        <article className="adviceBox">
          <span className="adviceBox__number">02</span>
          <strong>あなたの才能</strong>
          <p>{result.strength}</p>
        </article>

        <article className="adviceBox">
          <span className="adviceBox__number">03</span>
          <strong>今日の一歩</strong>
          <p>{result.mission}</p>
        </article>
      </div>
    </div>
  );
}

export default ResultCard;
