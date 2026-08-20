import "../styles/how-to-use-nextory11.css";

const steps = [
  {
    number: "01",
    title: "質問に答える",
    copy: "11の質問に、今の自分の気持ちで答えていきます。",
    visual: "question",
  },
  {
    number: "02",
    title: "自分の星を見つける",
    copy: "あなたの回答から、11タイプの中にある自分の可能性と出会います。",
    visual: "discovery",
  },
  {
    number: "03",
    title: "AI JUZAでもっと深く知る",
    copy: "結果を眺めるだけでなく、自分の強みや内側にある可能性をさらに見つめていきます。",
    visual: "juza",
  },
  {
    number: "04",
    title: "Premium Report",
    copy: <>もっと自分を知りたい人へ。<br />あなたのための、さらに深いパーソナルレポートへ。</>,
    visual: "premium",
  },
];

function JourneySymbol({ type }) {
  return (
    <span className={`howTo__symbol howTo__symbol--${type}`} aria-hidden="true">
      <span className="howTo__symbolGlow" />
      <svg viewBox="0 0 120 120">
        <circle className="howTo__symbolOrbit howTo__symbolOrbit--outer" cx="60" cy="60" r="48" />
        <circle className="howTo__symbolOrbit howTo__symbolOrbit--inner" cx="60" cy="60" r="34" />
        <path className="howTo__symbolRay" d="M60 19 65 53 101 60 65 67 60 101 55 67 19 60 55 53Z" />
        <path className="howTo__symbolRay howTo__symbolRay--soft" d="M60 31 63 56 86 42 66 59 84 80 63 64 60 89 57 64 36 80 54 61 34 42 57 56Z" />
        <circle className="howTo__symbolCore" cx="60" cy="60" r="5" />
      </svg>
    </span>
  );
}

function HowToUseNextory11() {
  return (
    <>
      <h1 className="worldsPage__srOnly">NEXTORY11の使い方</h1>
      <section className="howToDesktop" aria-labelledby="how-to-desktop-title">
        <img
          className="howToDesktop__master"
          src="/official-site/images/how-to-use/nextory11-how-to-use-desktop-final.webp"
          alt=""
          width="1536"
          height="1024"
          draggable="false"
        />
        <a
          className="howToDesktop__cta"
          href="/diagnosis?new=1"
          aria-label="自分の星を見つける"
        />
        <div className="howToDesktop__semantics">
          <h2 id="how-to-desktop-title">NEXTORY11の使い方</h2>
          <p>約3分。あなたがするのは、今の自分に答えるだけ。</p>
          <ol>
            {steps.map((step) => (
              <li key={step.number}>STEP {step.number}：{step.title}</li>
            ))}
          </ol>
          <p>まだ知らない自分に出会う。</p>
        </div>
      </section>

      <section className="howToMobile" aria-labelledby="how-to-mobile-title">
        <img
          className="howToMobile__master"
          src="/official-site/images/how-to-use/mobile/nextory11-how-to-use-mobile-final.webp"
          alt=""
          width="853"
          height="1844"
          draggable="false"
        />
        <a
          className="howToMobile__cta"
          href="/diagnosis?new=1"
          aria-label="自分の星を見つける"
        />
        <div className="howToMobile__semantics">
          <h2 id="how-to-mobile-title">NEXTORY11の使い方</h2>
          <p>約3分。あなたがするのは、今の自分に答えるだけ。</p>
          <ol>
            {steps.map((step) => (
              <li key={step.number}>STEP {step.number}：{step.title}</li>
            ))}
          </ol>
          <p>まだ知らない自分に出会う。</p>
        </div>
      </section>

      <section className="howTo" aria-labelledby="how-to-title">
      <header className="howTo__intro">
        <h2 id="how-to-title">NEXTORY11の使い方</h2>
        <p className="howTo__message"><span>約3分。</span>あなたがするのは、今の自分に答えるだけ。</p>
        <p className="howTo__support">難しい準備や専門知識は必要ありません。<br />質問を読み、その瞬間に心に浮かんだ答えを選びながら進みます。</p>
        <span className="howTo__introStar" aria-hidden="true">✦</span>
      </header>

      <div className="howTo__universe">
        <div className="howTo__stars" aria-hidden="true" />
        <div className="howTo__journey">
          <svg className="howTo__path" viewBox="0 0 1200 520" preserveAspectRatio="none" aria-hidden="true">
            <path d="M90 285 C220 80 330 85 420 260 S635 470 755 246 975 50 1110 232" />
            <circle cx="90" cy="285" r="4" /><circle cx="420" cy="260" r="4" />
            <circle cx="755" cy="246" r="4" /><circle cx="1110" cy="232" r="4" />
          </svg>

          <ol className="howTo__steps">
            {steps.map((step) => (
              <li className={`howTo__step howTo__step--${step.visual}`} key={step.number}>
                <article>
                  <p className="howTo__stepNumber">STEP {step.number}</p>
                  <JourneySymbol type={step.visual} />
                  <h3>{step.title}</h3>
                  <p className="howTo__stepCopy">{step.copy}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>

        <div className="howTo__destination">
          <span className="howTo__destinationLight" aria-hidden="true"><i /></span>
          <p>まだ知らない自分に出会う。</p>
          <a className="howTo__cta" href="/diagnosis?new=1">
            <span>自分の星を見つける</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M14 7l5 5-5 5" /></svg>
          </a>
        </div>
      </div>
      </section>
    </>
  );
}

export default HowToUseNextory11;
