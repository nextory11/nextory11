import { officialTypes } from "../data/officialTypes.js";
import { toOfficialHref } from "../routing.js";
import "../styles/what-is-nextory11.css";

function TypeStar({ type, index }) {
  return (
    <div
      className="whatIs__type"
      style={{ "--type-color": type.color, "--type-x": `${type.x}%`, "--type-y": `${type.y}%` }}
      aria-label={type.name}
    >
      <span className="whatIs__typeStar" aria-hidden="true">
        <i className="whatIs__typeFlare" />
        <svg viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="27" />
          <circle className="whatIs__typeOrbit" cx="32" cy="32" r={18 + (index % 3) * 2} />
          <path d="M32 10 36 27 54 32 36 37 32 54 28 37 10 32 28 27Z" />
          <path className="whatIs__typeSecondary" d="M32 15 34 29 49 20 36 31 49 44 34 35 32 50 30 35 16 44 28 33 15 20 30 29Z" />
          <path className="whatIs__typeCore" d="M32 20 35 29 44 32 35 35 32 44 29 35 20 32 29 29Z" />
        </svg>
      </span>
      <span className="whatIs__typeName">{type.name}</span>
    </div>
  );
}

function Constellation() {
  return (
    <div className="whatIs__constellation" aria-label="NEXTORY11の11タイプ">
      <div className="whatIs__orbits" aria-hidden="true">
        <span /><span /><span /><span /><span /><span /><i /><b /><em /><strong /><small />
      </div>
      <div className="whatIs__celestialDust" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
      </div>
      <div className="whatIs__center" aria-hidden="true">
        <span className="whatIs__centerCore" />
      </div>
      <div className="whatIs__types">
        {officialTypes.map((type, index) => <TypeStar key={type.name} type={type} index={index} />)}
      </div>
    </div>
  );
}

function WhatIsNextory11() {
  return (
    <>
      <h1 className="worldsPage__srOnly">NEXTORY11とは？</h1>
      <section className="whatIsDesktop" aria-labelledby="what-is-desktop-title">
        <img
          className="whatIsDesktop__master"
          src="/official-site/images/about/nextory11-about-desktop-final.webp"
          alt=""
          width="1536"
          height="1024"
          decoding="async"
          draggable={false}
          aria-hidden="true"
        />
        <a
          className="whatIsDesktop__next"
          href={toOfficialHref("/official-preview/how-to-use")}
          aria-label="NEXTORY11の使い方を見る"
        />
        <div className="whatIsDesktop__semantics">
          <h2 id="what-is-desktop-title">NEXTORY11とは？</h2>
          <p>まだ知らない、自分の可能性を見つけるために。</p>
          <p>
            NEXTORY11は、質問への回答を通して、あなたの中にある強みや可能性を
            11のタイプから見つけていく自己分析・診断体験です。
          </p>
          <p>行動だけではなく、そのとき何を感じ、何を大切にし、どう心が動くのか。</p>
          <p>NEXTORY11は、あなた自身の内側にある「星」を探していきます。</p>
          <h2>NEXTORY11の11タイプ</h2>
          <ul>
            {officialTypes.map((type) => <li key={type.name}>{type.name}</li>)}
          </ul>
        </div>
      </section>

      <section className="whatIsMobile" aria-labelledby="what-is-mobile-title">
        <img
          className="whatIsMobile__master"
          src="/official-site/images/about/mobile/nextory11-about-mobile-final.webp"
          alt=""
          width="852"
          height="1847"
          decoding="async"
          draggable={false}
          aria-hidden="true"
        />
        <a
          className="whatIsMobile__next"
          href={toOfficialHref("/official-preview/how-to-use")}
          aria-label="NEXTORY11の使い方を見る"
        />
        <div className="whatIsMobile__semantics">
          <h2 id="what-is-mobile-title">NEXTORY11とは？</h2>
          <p>まだ知らない、自分の可能性を見つけるために。</p>
          <p>
            NEXTORY11は、質問への回答を通して、あなたの中にある強みや可能性を
            11のタイプから見つけていく自己分析・診断体験です。
          </p>
          <p>行動だけではなく、そのとき何を感じ、何を大切にし、どう心が動くのか。</p>
          <p>NEXTORY11は、あなた自身の内側にある「星」を探していきます。</p>
          <h2>NEXTORY11の11タイプ</h2>
          <ul>
            {officialTypes.map((type) => <li key={type.name}>{type.name}</li>)}
          </ul>
        </div>
      </section>

      <section className="whatIs" aria-labelledby="what-is-title">
      <div className="whatIs__stars" aria-hidden="true" />

      <div className="whatIs__brand" aria-hidden="true">
        <div className="whatIs__brandEmblem">
          <img src="/official-site/icons/emblem-1.png" alt="" draggable={false} />
        </div>
        <p>NEXTORY11</p>
        <span>— Find Your Star. —</span>
      </div>

      <div className="whatIs__layout">
        <div className="whatIs__copy">
          <h2 id="what-is-title"><span>NEXTORY11</span><span>とは？</span></h2>
          <p className="whatIs__lead">まだ知らない、自分の可能性を見つけるために。</p>
          <span className="whatIs__divider" aria-hidden="true">✦</span>

          <div className="whatIs__body">
            <p>
              NEXTORY11は、質問への回答を通して、<br />
              あなたの中にある強みや可能性を<br />
              11のタイプから見つけていく自己分析・診断体験です。
            </p>
            <p>
              行動だけではなく、そのとき何を感じ、<br />
              何を大切にし、どう心が動くのか。
            </p>
            <p>
              NEXTORY11は、あなた自身の内側にある「星」を<br />
              探していきます。
            </p>
          </div>
        </div>

        <Constellation />
      </div>

      <a
        className="whatIs__next"
        href={toOfficialHref("/official-preview/how-to-use")}
        aria-label="NEXTORY11の使い方を見る"
      >
        <span />
        <p>NEXTORY11の使い方を見る</p>
        <span />
        <svg viewBox="0 0 24 32" aria-hidden="true"><path d="M12 1v26M4 19l8 9 8-9" /></svg>
      </a>
      </section>
    </>
  );
}

export default WhatIsNextory11;
