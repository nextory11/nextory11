function PremiumCard({ onClick }) {
  return (
    <div className="paidBox">
      <div className="paidLabel">PREMIUM STAR MAP</div>

      <h2>AI完全レポートを作成する</h2>

      <p>
        あなたの回答をもとに、本質・才能・仕事・恋愛・人間関係・30日プランを深く読み解きます。
      </p>

      <ul className="premiumList">
        <li>あなただけの星図分析</li>
        <li>才能・仕事・恋愛の傾向</li>
        <li>人間関係のヒント</li>
        <li>30日アクションプラン</li>
      </ul>

      <button className="premiumButton" onClick={onClick}>
        980円でAI完全レポートを作成する
      </button>
    </div>
  );
}

export default PremiumCard;