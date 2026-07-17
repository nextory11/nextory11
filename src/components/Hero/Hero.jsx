function Hero({ onStart }) {
  return (
    <section className="heroV11" aria-label="NEXTORY11">
      <Background />
      <TopChrome />
      <Content onStart={onStart} />
    </section>
  );
}

function Background() {
  return (
    <div className="heroV11__background" aria-hidden="true">
      <img className="heroV11__space" src="/images/hero/space-background.png" alt="" draggable={false} />
      <img className="heroV11__brightStars" src="/images/hero/star-field-overlay-v2.png" alt="" draggable={false} />
      <img className="heroV11__sparkles" src="/images/hero/sparkles.png.png" alt="" draggable={false} />
      <img className="heroV11__nebulaLeft" src="/images/hero/left-nebula-v2.png" alt="" draggable={false} />
      <img className="heroV11__nebulaRight" src="/images/hero/left-nebula-v2.png" alt="" draggable={false} />
      <img className="heroV11__galaxyCore" src="/images/hero/right-spiral-galaxy-v2.png" alt="" draggable={false} />
      <div className="heroV11__cometLeft" />
      <div className="heroV11__comet" />
      <img className="heroV11__godRays" src="/images/hero/sunrise-rays-v2.png" alt="" draggable={false} />
      <img className="heroV11__sun" src="/images/hero/sunrise-core-v2.png" alt="" draggable={false} />
      <div className="heroV11__sunGlow" />
      <img className="heroV11__earth" src="/images/hero/earth-horizon-v2.png" alt="" draggable={false} />
      <img className="heroV11__cityLights" src="/images/hero/earth-city-lights-v2.png" alt="" draggable={false} />
      <img className="heroV11__rimLight" src="/images/hero/blue-atmospheric-rim-v2.png" alt="" draggable={false} />
      <div className="heroV11__horizonGlow" />
      <div className="heroV11__vignette" />
      <div className="heroV11__ambientGlow" />
    </div>
  );
}

function Content({ onStart }) {
  return (
    <div className="heroV11__content">
      <div className="heroV11__center">
        <Logo />

        <div className="heroV11__badge">VERSION 7&nbsp;&nbsp;COSMIC EXPERIENCE</div>

        <h1 className="heroV11__title">
          <span className="heroV11__titleLine">まだ、あなたの中には、</span>
          <span className="heroV11__titleLine">自分も知らない輝く星が眠っている。</span>
        </h1>

        <h2 className="heroV11__subtitle">Find Your Star.</h2>

        <p className="heroV11__description">
          11の質問が、あなたの可能性を映し出し、
          <br />
          まだ見ぬ才能への扉を開きます。
        </p>

        <Button onClick={onStart} />
        <Features />
        <Footer />
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="heroV11__logoWrap">
      <div className="heroV11__logoAura" />
      <div className="heroV11__logoGlow" />
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
      <span className="heroV11__buttonGlow" />
      <span className="heroV11__buttonIcon">✦</span>
      <span className="heroV11__buttonText">自分の星を見つける</span>
      <span className="heroV11__buttonArrow">→</span>
    </button>
  );
}

function TopChrome() {
  return (
    <>
      <div className="heroV11__brandPill">NEXTORY11</div>
      <div className="heroV11__controls" aria-hidden="true">
        <span className="heroV11__control">♫</span>
        <span className="heroV11__control heroV11__control--active">✦</span>
        <span className="heroV11__control">☰</span>
      </div>
    </>
  );
}

function HeroCelestialIcon({ variant }) {
  return (
    <svg className={`heroV11__celestialIcon heroV11__celestialIcon--${variant}`} viewBox="0 0 64 64" aria-hidden="true">
      <circle className="heroV11__celestialOrbit" cx="32" cy="32" r="25" />
      <circle className="heroV11__celestialOrbit heroV11__celestialOrbit--inner" cx="32" cy="32" r="19" />
      {variant === "oracle" ? (
        <>
          <path d="M32 11 37 27 53 32 37 37 32 53 27 37 11 32 27 27 32 11Z" />
          <path d="m32 23 4 9-4 9-4-9 4-9Z" />
        </>
      ) : variant === "stories" ? (
        <>
          <path d="M18 45V20c5-3 10-2 14 2 4-4 9-5 14-2v25c-5-3-10-2-14 2-4-4-9-5-14-2Z" />
          <path d="M32 22v25M23 27c3-1 5 0 7 2M41 27c-3-1-5 0-7 2" />
        </>
      ) : (
        <>
          <path d="M15 43c7-1 10-7 13-13 3-5 7-9 18-9" />
          <path d="m40 15 8 6-8 6M21 45l5-6 5 6-5 6-5-6Z" />
          <circle cx="45" cy="38" r="3" />
        </>
      )}
      <circle className="heroV11__celestialJewel" cx="11" cy="22" r="1.8" />
      <circle className="heroV11__celestialJewel" cx="51" cy="42" r="1.3" />
    </svg>
  );
}

function Features() {
  return (
    <section className="heroV11__features" aria-label="NEXTORY11 features">
      <article className="heroV11__feature">
        <PanelFrameOrnaments />
        <div className="heroV11__featureIcon"><HeroCelestialIcon variant="oracle" /></div>
        <h3 className="heroV11__featureTitle">宇宙が導く診断</h3>
        <p className="heroV11__featureText">
          あなたの本質を宇宙の視点で
          <br />
          読み解きます
        </p>
        <div className="heroV11__featureArrow">→</div>
      </article>

      <article className="heroV11__feature">
        <PanelFrameOrnaments />
        <div className="heroV11__featureIcon"><HeroCelestialIcon variant="stories" /></div>
        <h3 className="heroV11__featureTitle">11の物語</h3>
        <p className="heroV11__featureText">
          11タイプの星が持つ
          <br />
          ユニークなストーリー
        </p>
        <div className="heroV11__featureArrow">→</div>
      </article>

      <article className="heroV11__feature">
        <PanelFrameOrnaments />
        <div className="heroV11__featureIcon"><HeroCelestialIcon variant="path" /></div>
        <h3 className="heroV11__featureTitle">未来へのヒント</h3>
        <p className="heroV11__featureText">
          明日からの行動に繋がる
          <br />
          ヒントをお届けします
        </p>
        <div className="heroV11__featureArrow">→</div>
      </article>
    </section>
  );
}

function Footer() {
  return (
    <footer className="heroV11__footer">
      <div className="heroV11__footerLine" />
      <p className="heroV11__footerText">STAR DISCOVERY&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;11 QUESTIONS&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;YOUR STAR MAP</p>
      <nav className="heroV11__footerNav" aria-label="法務・サポート">
        <a href="/#/terms">利用規約</a>
        <a href="/#/privacy">プライバシー</a>
        <a href="/#/refund-policy">返金・キャンセル</a>
        <a href="/#/faq">FAQ</a>
        <a href="/#/why-nextory11">Why NEXTORY11</a>
        <a href="/#/contact">お問い合わせ</a>
      </nav>
      <p className="heroV11__copyright">© 2026 NEXTORY11 / Super Hiros. All rights reserved.</p>
    </footer>
  );
}

export default Hero;
import PanelFrameOrnaments from "../PanelFrameOrnaments";
