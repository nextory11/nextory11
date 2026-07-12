function PremiumCard({ checkoutError, isEnabled, isLoading, onClick }) {
  return (
    <section className="paidBox" aria-label="Your Star Report preview">
      <div className="paidLabel">YOUR STAR REPORT</div>

      <h2 className="premiumTitle">
        あなただけの星を、
        <br />
        もっと深く読み解く
      </h2>

      <p className="premiumDescription">
        11の回答から、あなたの本質・才能・仕事・恋愛・人間関係・未来への可能性を
        さらに詳しく分析する、980円のプレミアムレポートを準備しています。
      </p>

      <div className="premiumPrice" aria-label="価格 980円">
        <strong>¥980</strong>
      </div>

      <ul className="premiumList">
        <li>
          <span>✦</span>
          あなただけの星図分析
        </li>
        <li>
          <span>✧</span>
          才能・仕事・適職のヒント
        </li>
        <li>
          <span>✦</span>
          恋愛・人間関係の傾向
        </li>
        <li>
          <span>✧</span>
          30日アクションプラン
        </li>
      </ul>

      <div className="premiumCtaPanel">
        <p>
          {isEnabled
            ? "Stripe Checkoutで安全に決済します。決済完了後、専用ページへ移動します。"
            : "現在はプライベートプレビュー中です。有料レポートの購入は、本番の配信基盤が整うまで停止しています。"}
        </p>

        <button
          type="button"
          className="premiumButton"
          disabled={!isEnabled || isLoading}
          onClick={onClick}
        >
          {isLoading
            ? "Stripe Checkoutへ移動中"
            : isEnabled
              ? "今すぐレポートを受け取る"
              : "プライベートプレビュー中"}
        </button>
      </div>

      {checkoutError ? (
        <p className="premiumError" role="alert">
          {checkoutError}
        </p>
      ) : null}
    </section>
  );
}

export default PremiumCard;
