import "../styles/why-nextory11.css";

const assetRoot = "/official-site/images/section-04";
const circleArtworkVersion = "edge-cleanup-1";
const introArtworkVersion = "intro-edge-cleanup-1";

function WhyNextory11() {
  return (
    <section className="why" aria-labelledby="why-title">
      <h1 className="worldsPage__srOnly">なぜ、NEXTORY11なのか。</h1>
      <div className="why__semantic">
        <h2 id="why-title">なぜ、NEXTORY11なのか。</h2>
        <p>自分のことは、自分がいちばん知っている。そう思っていた。</p>
        <p>でも、ふとした選択や、心が動いた瞬間には、まだ自分でも気づいていない自分がいる。</p>
        <p>NEXTORY11は、あなたを決めつけるための診断ではありません。</p>
        <p>まだ知らない自分と出会うための、小さなきっかけです。</p>
        <p>あなたの中には、まだ見ぬ星が眠っている。</p>
        <ol>
          <li>DISCOVER — 気づく。こんな自分もいたんだ。</li>
          <li>SURPRISE — 意外性を楽しむ。自分ではこうだと思っていたのに。</li>
          <li>POSSIBILITY — その先を想像する。だったら、こんなこともできるかもしれない。</li>
        </ol>
        <p>答えを決めるためではなく、新しい可能性を見つけるために。</p>
        <p>― Find Your Star. ―</p>
      </div>

      <div className="why__desktop" aria-hidden="true">
        <img
          src={`${assetRoot}/section04-master-original.png`}
          alt=""
          width="1536"
          height="1024"
          decoding="async"
        />
      </div>

      <div className="why__sliced" aria-hidden="true">
        <div className="why__sliceIntroFrame">
          <img className="why__slice why__slice--intro" src={`${assetRoot}/slice-01-intro.png?v=${introArtworkVersion}`} alt="" width="500" height="880" decoding="async" />
        </div>
        <img className="why__slice why__slice--message" src={`${assetRoot}/slice-01-message.png`} alt="" width="780" height="65" loading="lazy" decoding="async" />
        <img className="why__slice why__slice--scene" src={`${assetRoot}/slice-02-discover.png?v=${circleArtworkVersion}`} alt="" width="325" height="535" loading="lazy" decoding="async" />
        <img className="why__slice why__slice--scene" src={`${assetRoot}/slice-03-surprise.png?v=${circleArtworkVersion}`} alt="" width="335" height="535" loading="lazy" decoding="async" />
        <img className="why__slice why__slice--scene" src={`${assetRoot}/slice-04-possibility.png?v=${circleArtworkVersion}`} alt="" width="345" height="535" loading="lazy" decoding="async" />
        <img className="why__slice why__slice--conclusion" src={`${assetRoot}/slice-05-conclusion.png?v=${circleArtworkVersion}`} alt="" width="575" height="205" loading="lazy" decoding="async" />
        <div className="why__sliceEarth">
          <img src={`${assetRoot}/slice-06-earth.png`} alt="" width="1536" height="94" loading="lazy" decoding="async" />
        </div>
      </div>
    </section>
  );
}

export default WhyNextory11;
