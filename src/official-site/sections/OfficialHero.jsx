const featureCards = [
  {
    icon: "star",
    title: "あなたの星の本質",
    body: "11の問いを通して、今のあなたに強く輝く力を読み解きます。",
  },
  {
    icon: "orbit",
    title: "11の星の世界",
    body: "異なる11の可能性から、あなたを導く星の物語が始まります。",
  },
  {
    icon: "horizon",
    title: "次の一歩への灯",
    body: "診断結果を未来への答えではなく、新しい選択を照らす光として届けます。",
  },
];

const mobileLivingUniverseStars = [
  { x: "7%", y: "9%", duration: "7.7s", delay: "-2.1s", drift: "18s" },
  { x: "91%", y: "12%", duration: "9.1s", delay: "-6.4s", drift: "24s", feature: true, tone: "violet" },
  { x: "12%", y: "20%", duration: "6.3s", delay: "-3.8s", drift: "21s" },
  { x: "94%", y: "29%", duration: "11s", delay: "-8.2s", drift: "27s" },
  { x: "5%", y: "36%", duration: "8.4s", delay: "-5.5s", drift: "23s", feature: true, tone: "blue" },
  { x: "89%", y: "41%", duration: "5.9s", delay: "-1.7s", drift: "19s" },
  { x: "16%", y: "45%", duration: "10.2s", delay: "-7.1s", drift: "29s" },
  { x: "82%", y: "48%", duration: "7.1s", delay: "-4.6s", drift: "17s", feature: true },
  { x: "6%", y: "55%", duration: "9.8s", delay: "-2.9s", drift: "26s" },
  { x: "93%", y: "61%", duration: "6.8s", delay: "-5.2s", drift: "22s" },
  { x: "11%", y: "69%", duration: "11.6s", delay: "-9.3s", drift: "30s", feature: true, tone: "violet" },
  { x: "87%", y: "73%", duration: "8.1s", delay: "-3.3s", drift: "25s" },
  { x: "4%", y: "78%", duration: "5.4s", delay: "-1.2s", drift: "20s" },
  { x: "95%", y: "82%", duration: "10.7s", delay: "-7.8s", drift: "28s", feature: true, tone: "blue" },
  { x: "14%", y: "88%", duration: "7.4s", delay: "-4.1s", drift: "16s" },
  { x: "86%", y: "91%", duration: "9.4s", delay: "-6.7s", drift: "24s" },
  { x: "8%", y: "95%", duration: "6.1s", delay: "-2.5s", drift: "19s" },
  { x: "92%", y: "97%", duration: "10.9s", delay: "-8.7s", drift: "27s" },
];

const desktopLivingUniverseStars = [
  { x: "3%", y: "8%", duration: "8.6s", delay: "-3.2s", drift: "25s" },
  { x: "14%", y: "13%", duration: "11.3s", delay: "-7.6s", drift: "31s", feature: true, tone: "blue" },
  { x: "87%", y: "10%", duration: "7.2s", delay: "-1.9s", drift: "22s" },
  { x: "96%", y: "18%", duration: "9.7s", delay: "-6.1s", drift: "28s", feature: true, tone: "violet" },
  { x: "6%", y: "25%", duration: "6.4s", delay: "-4.4s", drift: "21s" },
  { x: "29%", y: "28%", duration: "10.8s", delay: "-8.7s", drift: "33s" },
  { x: "71%", y: "25%", duration: "8.1s", delay: "-2.7s", drift: "26s", feature: true },
  { x: "92%", y: "31%", duration: "12.1s", delay: "-9.8s", drift: "35s" },
  { x: "2%", y: "39%", duration: "7.8s", delay: "-5.3s", drift: "24s", feature: true, tone: "violet" },
  { x: "18%", y: "43%", duration: "9.2s", delay: "-1.4s", drift: "29s" },
  { x: "82%", y: "40%", duration: "6.9s", delay: "-4.9s", drift: "23s" },
  { x: "98%", y: "48%", duration: "11.7s", delay: "-8.1s", drift: "34s", feature: true, tone: "blue" },
  { x: "5%", y: "57%", duration: "8.9s", delay: "-6.8s", drift: "27s" },
  { x: "32%", y: "55%", duration: "10.1s", delay: "-2.2s", drift: "30s" },
  { x: "67%", y: "58%", duration: "7.5s", delay: "-5.7s", drift: "25s" },
  { x: "94%", y: "64%", duration: "9.9s", delay: "-7.3s", drift: "32s" },
  { x: "3%", y: "72%", duration: "6.7s", delay: "-3.9s", drift: "22s" },
  { x: "25%", y: "76%", duration: "11.1s", delay: "-9.1s", drift: "36s", feature: true },
  { x: "76%", y: "74%", duration: "8.3s", delay: "-1.6s", drift: "28s" },
  { x: "97%", y: "82%", duration: "10.5s", delay: "-6.5s", drift: "31s" },
  { x: "9%", y: "91%", duration: "7.1s", delay: "-4.7s", drift: "24s" },
  { x: "89%", y: "94%", duration: "12.4s", delay: "-10.2s", drift: "35s" },
];

function LivingUniverseOverlay({ stars, variant }) {
  return (
    <div className={`officialHero__livingUniverse officialHero__livingUniverse--${variant}`}>
      {stars.map((star, index) => (
        <span
          className={`officialHero__livingStar${star.feature ? " officialHero__livingStar--feature" : ""}${star.tone ? ` officialHero__livingStar--${star.tone}` : ""}`}
          key={`${star.x}-${star.y}`}
          style={{
            "--star-x": star.x,
            "--star-y": star.y,
            "--star-duration": star.duration,
            "--star-delay": star.delay,
            "--star-drift": star.drift,
            "--star-drift-x": index % 2 === 0 ? "2px" : "-2px",
          }}
        />
      ))}
      <span className={`officialHero__livingMeteor officialHero__livingMeteor--${variant}`} />
    </div>
  );
}

function FeatureIcon({ variant }) {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <circle className="officialFeatureIcon__halo" cx="36" cy="36" r="32" />
      <circle className="officialFeatureIcon__orbit" cx="36" cy="36" r="27" />
      <circle className="officialFeatureIcon__orbit officialFeatureIcon__orbit--inner" cx="36" cy="36" r="21" />
      {variant === "star" && (
        <>
          <path className="officialFeatureIcon__radiance" d="M36 9 40.5 29.5 63 36 40.5 42.5 36 63 31.5 42.5 9 36 31.5 29.5Z" />
          <path className="officialFeatureIcon__radiance officialFeatureIcon__radiance--secondary" d="M36 17 40 32 55 36 40 40 36 55 32 40 17 36 32 32Z" transform="rotate(45 36 36)" />
          <path className="officialFeatureIcon__facet" d="M36 20 43 36 36 52 29 36Z" />
          <circle className="officialFeatureIcon__core" cx="36" cy="36" r="4" />
        </>
      )}
      {variant === "orbit" && (
        <>
          <ellipse className="officialFeatureIcon__ellipse" cx="36" cy="36" rx="27" ry="10" transform="rotate(-12 36 36)" />
          <ellipse className="officialFeatureIcon__ellipse" cx="36" cy="36" rx="12" ry="27" transform="rotate(42 36 36)" />
          <ellipse className="officialFeatureIcon__ellipse officialFeatureIcon__ellipse--soft" cx="36" cy="36" rx="25" ry="15" transform="rotate(58 36 36)" />
          <circle className="officialFeatureIcon__core" cx="36" cy="36" r="4.5" />
          <circle className="officialFeatureIcon__point" cx="58" cy="29" r="2.6" />
          <circle className="officialFeatureIcon__point officialFeatureIcon__point--small" cx="18" cy="48" r="1.5" />
          <circle className="officialFeatureIcon__point officialFeatureIcon__point--tiny" cx="12" cy="34" r="0.8" />
          <circle className="officialFeatureIcon__point officialFeatureIcon__point--tiny" cx="19" cy="22" r="0.8" />
          <circle className="officialFeatureIcon__point officialFeatureIcon__point--tiny" cx="29" cy="12" r="0.8" />
          <circle className="officialFeatureIcon__point officialFeatureIcon__point--tiny" cx="43" cy="13" r="0.8" />
          <circle className="officialFeatureIcon__point officialFeatureIcon__point--tiny" cx="54" cy="19" r="0.8" />
          <circle className="officialFeatureIcon__point officialFeatureIcon__point--tiny" cx="61" cy="42" r="0.8" />
          <circle className="officialFeatureIcon__point officialFeatureIcon__point--tiny" cx="52" cy="54" r="0.8" />
          <circle className="officialFeatureIcon__point officialFeatureIcon__point--tiny" cx="38" cy="61" r="0.8" />
          <circle className="officialFeatureIcon__point officialFeatureIcon__point--tiny" cx="25" cy="58" r="0.8" />
        </>
      )}
      {variant === "horizon" && (
        <>
          <path className="officialFeatureIcon__horizon" d="M10 51c8-11 16.5-16.5 26-16.5S54 40 62 51M14 55h44" />
          <path className="officialFeatureIcon__ray" d="M36 8v24M23 32l7 5M49 32l-7 5" />
          <path className="officialFeatureIcon__radiance" d="M36 11 39 21 49 24 39 27 36 37 33 27 23 24 33 21Z" />
          <circle className="officialFeatureIcon__core" cx="36" cy="24" r="2.6" />
        </>
      )}
    </svg>
  );
}

function OfficialHero() {
  return (
    <section className="officialHero" aria-labelledby="official-hero-title">
      <div className="officialHero__stage">
        <div className="officialHero__scene" aria-hidden="true">
          <span className="officialHero__cosmicGlow officialHero__cosmicGlow--blue" />
          <span className="officialHero__cosmicGlow officialHero__cosmicGlow--red" />
          <span className="officialHero__stars" />
        </div>

        <div className="officialHero__content">
          <div className="officialHero__emblem" aria-hidden="true">
            <img src="/official-site/icons/emblem-1.png" alt="" draggable={false} />
          </div>

          <h1 id="official-hero-title">NEXTORY11</h1>

          <p className="officialHero__message">
            <span>まだ、あなたの中には、</span>
            <span>自分も知らない輝く星が眠っている。</span>
          </p>

          <p className="officialHero__signature" lang="en">— Find Your Star. —</p>

          <a className="officialHero__cta" href="/diagnosis?new=1">
            <span>自分の星を見つける</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h13M14 7l5 5-5 5" />
            </svg>
          </a>
        </div>

        <div className="officialHero__scroll" aria-hidden="true"><span /></div>
      </div>

      <section className="officialHero__support" aria-label="NEXTORY11で出会うもの">
        <div className="officialHero__experienceMaster" aria-hidden="true">
          <img
            className="officialHero__experienceMasterDesktop"
            src="/official-site/images/experience/nextory11-experience-master.webp"
            alt=""
            width="1536"
            height="1024"
            draggable={false}
          />
          <div className="officialHero__experienceSlices">
            <img
              className="officialHero__experienceMobileMaster"
              src="/official-site/images/experience/nextory11-experience-mobile-master.webp"
              alt=""
              width="450"
              height="2421"
              draggable={false}
            />
            <img src="/official-site/images/experience/slices/title.webp" alt="" draggable={false} />
            <img src="/official-site/images/experience/slices/card-01.webp" alt="" draggable={false} />
            <img src="/official-site/images/experience/slices/card-02.webp" alt="" draggable={false} />
            <img src="/official-site/images/experience/slices/card-03.webp" alt="" draggable={false} />
          </div>
          <LivingUniverseOverlay stars={desktopLivingUniverseStars} variant="desktop" />
        </div>

        <div
          className="officialHero__experienceMobileBackground"
          aria-hidden="true"
        >
          <img
            src="/official-site/images/experience/mobile/nextory11-experience-mobile-final.webp"
            alt=""
            width="853"
            height="1844"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <LivingUniverseOverlay stars={mobileLivingUniverseStars} variant="mobile" />
        </div>

        <div className="officialHero__experienceSemantics">
          <h2>THE NEXTORY11 EXPERIENCE</h2>
          <p>あなたの星が、ここから動き出す。</p>
          {featureCards.map((card) => (
            <article className="officialHero__card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>

        <div className="officialHero__experienceMobileSemantics">
          <h2>THE NEXTORY11 EXPERIENCE</h2>
          <p>あなたの星が、ここから動き出す。</p>
          <article>
            <h3>01 あなたの星の本質</h3>
            <p>11の問いを通して、今のあなたに強く輝く力を読み解きます。</p>
          </article>
          <article>
            <h3>02 11の星の世界</h3>
            <p>異なる11の可能性から、あなたを導く星の物語が始まります。</p>
          </article>
          <article>
            <h3>03 次の一歩への灯</h3>
            <p>星が示す道を未来へつなぎ、あなただけの物語を現実に変えていきます。</p>
          </article>
        </div>
      </section>
    </section>
  );
}

export default OfficialHero;
