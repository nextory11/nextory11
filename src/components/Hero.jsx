function Hero({ onStart }) {
  return (
    <section className="hero">
      <div className="brandMark">✦</div>
      <div className="brand">NEXTORY11</div>
      <div className="badge">v3.0 Galaxy Edition</div>

      <h1>
        まだ、あなたの中には、
        <br />
        自分も知らない輝く星が眠っている。
      </h1>

      <p>
        <strong>Find Your Star.</strong>
        <br />
        11の質問が、あなたの可能性を映し出し、
        まだ見ぬ才能への扉を開きます。
      </p>

      <button className="startButton" onClick={onStart}>
        ✨ 自分の星を見つける
      </button>

      <div className="heroNote">
        Star Discovery｜11 Questions｜Your Star Map
      </div>
    </section>
  );
}

export default Hero;