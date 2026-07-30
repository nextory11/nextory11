import PanelFrameOrnaments from "../PanelFrameOrnaments";

function Hero({ onStart }) {
  return (
    <section className="heroV11" aria-label="NEXTORY11">
      <Background />

      <div className="heroV11__artifact">
        <img
          className="heroV11__frame01"
          src="/images/hero/frame.png"
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        <div className="heroV11__frame01Mobile" aria-hidden="true" />

        <div className="heroV11__content">
          <div className="heroV11__center">
            <div className="heroV11__opening">
              <Logo />

              <h1 className="heroV11__title">
                <span className="heroV11__titleLine">まだ、あなたの中には、</span>
                <span className="heroV11__titleLine">自分も知らない輝く星が眠っている。</span>
              </h1>

              <h2 className="heroV11__subtitle">Find Your Star.</h2>

              <Button onClick={onStart} />
            </div>

            <Features />
            <JuzaGuide />
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
}

function Background() {
  return (
    <div className="heroV11__background" aria-hidden="true">
      <img
        className="heroV11__backgroundMaster"
        src="/images/hero/background_master.png"
        alt=""
        draggable={false}
      />
    </div>
  );
}

function Logo() {
  return (
    <div className="heroV11__logoWrap">
      <div className="heroV11__logoAura" />
      <img
        src="/images/logo/nextory-logo.png"
        alt="NEXTORY11"
        className="heroV11__logo"
        draggable={false}
      />
    </div>
  );
}

function Button({ onClick }) {
  return (
    <button
      type="button"
      className="heroV11__button"
      onClick={onClick}
      aria-label="診断を始める"
    >
      <PanelFrameOrnaments />
      <span className="heroV11__buttonGlow" aria-hidden="true" />
      <span className="heroV11__buttonText">自分の星を見つける</span>
    </button>
  );
}

function HeroCelestialIcon({ variant }) {
  return (
    <svg
      className={`heroV11__celestialIcon heroV11__celestialIcon--${variant}`}
      viewBox="0 0 80 80"
      aria-hidden="true"
    >
      {variant === "essence" ? (
        <>
          <circle className="heroV11__instrumentDial" cx="40" cy="40" r="29" />
          <ellipse cx="40" cy="40" rx="27" ry="14" />
          <ellipse cx="40" cy="40" rx="14" ry="27" transform="rotate(34 40 40)" />
          <ellipse cx="40" cy="40" rx="14" ry="27" transform="rotate(-34 40 40)" />
          <path d="M40 11v7M40 62v7M11 40h7M62 40h7" />
          <circle className="heroV11__instrumentHub" cx="40" cy="40" r="8" />
          <path className="heroV11__starCore" d="M40 27 43 37 53 40 43 43 40 53 37 43 27 40 37 37Z" />
        </>
      ) : variant === "atlas" ? (
        <>
          <path className="heroV11__atlasPage" d="M13 22c10-5 19-4 27 2v40c-8-6-17-7-27-2Z" />
          <path className="heroV11__atlasPage" d="M67 22c-10-5-19-4-27 2v40c8-6 17-7 27-2Z" />
          <path d="M40 24v40M18 53l9-13 10 7 8-16 10 7 8-9" />
          <g className="heroV11__atlasStars">
            <circle cx="18" cy="53" r="2" /><circle cx="22" cy="29" r="1.5" />
            <circle cx="27" cy="40" r="2" /><circle cx="31" cy="58" r="1.4" />
            <circle cx="37" cy="47" r="2" /><circle cx="45" cy="31" r="1.8" />
            <circle cx="50" cy="55" r="1.5" /><circle cx="55" cy="38" r="2" />
            <circle cx="59" cy="25" r="1.4" /><circle cx="63" cy="29" r="2" />
            <circle cx="64" cy="55" r="1.5" />
          </g>
        </>
      ) : (
        <>
          <path className="heroV11__horizonGlow" d="M10 58c9-12 19-18 30-18s21 6 30 18" />
          <path d="M10 62h60M18 55c7-6 14-9 22-9s15 3 22 9" />
          <path d="M40 15v22" />
          <path className="heroV11__northStar" d="M40 8 43 17 52 20 43 23 40 32 37 23 28 20 37 17Z" />
          <circle className="heroV11__horizonOrbit" cx="40" cy="20" r="14" />
        </>
      )}
    </svg>
  );
}

const features = [
  {
    variant: "essence",
    title: "あなたの星の本質",
    description: "11の問いを通して、今のあなたに強く輝く力を読み解きます。",
  },
  {
    variant: "atlas",
    title: "11の星の世界",
    description: "異なる11の可能性から、あなたを導く星の物語が始まります。",
  },
  {
    variant: "horizon",
    title: "次の一歩への灯",
    description: "診断結果を未来への答えではなく、新しい選択を照らす光として届けます。",
  },
];

function Features() {
  return (
    <section className="heroV11__features" aria-label="NEXTORY11で出会うもの">
      {features.map(({ variant, title, description }) => (
        <article className="heroV11__feature" key={variant}>
          <img
            className="heroV11__frame02"
            src="/images/hero/frame02.png"
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <div className="heroV11__featureIcon">
            <HeroCelestialIcon variant={variant} />
          </div>
          <h3 className="heroV11__featureTitle">{title}</h3>
          <p className="heroV11__featureText">{description}</p>
        </article>
      ))}
    </section>
  );
}

function JuzaGuide() {
  return (
    <aside className="heroV11__guide" aria-label="AI JUZAからの案内">
      <span className="heroV11__guideStar" aria-hidden="true">
        <HeroCelestialIcon variant="essence" />
      </span>
      <p className="heroV11__guideText">
        <span className="heroV11__guideName">AI JUZA</span>
        <span>「あなたの答えを決めつけるためではなく、</span>
        <span>その奥にある可能性を一緒に見つけるために、私はこの旅に寄り添います。」</span>
      </p>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="heroV11__footer">
      <nav className="heroV11__footerNav" aria-label="法務・サポート">
        <a href="/#/terms">利用規約</a>
        <a href="/#/privacy">プライバシー</a>
        <a href="/#/refund-policy">返金・キャンセル</a>
        <a href="/#/commercial-disclosure">特定商取引法に基づく表記</a>
        <a href="/#/operator">運営者情報</a>
        <a href="/#/faq">FAQ</a>
        <a href="/#/why-nextory11">Why NEXTORY11</a>
        <a href="/#/contact">お問い合わせ</a>
      </nav>
      <p className="heroV11__copyright">© 2026 NEXTORY11. All rights reserved.</p>
    </footer>
  );
}

export default Hero;
