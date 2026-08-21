import "../styles/philosophy-page.css";

function PhilosophyPage() {
  return (
    <main className="philosophyPage" aria-labelledby="philosophy-page-title">
      <div className="philosophyPage__desktopMaster" aria-hidden="true">
        <img
          src="/official-site/images/philosophy/nextory11-philosophy-desktop-final.webp"
          alt=""
          width="1397"
          height="1126"
          decoding="async"
          draggable={false}
        />
        <span className="philosophyPage__bakedNavMask" aria-hidden="true" />
      </div>

      <div className="philosophyPage__mobileMaster">
        <img
          src="/official-site/images/philosophy/mobile/nextory11-philosophy-mobile-final.webp"
          alt=""
          width="853"
          height="1844"
          decoding="async"
          draggable={false}
          aria-hidden="true"
        />
        <span className="philosophyPage__bakedNavMask" aria-hidden="true" />
        <button
          className="philosophyPage__mobileBackToTop"
          type="button"
          aria-label="ページ上部へ戻る"
          onClick={() => window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          })}
        />
      </div>

      <div className="philosophyPage__semantics">
        <h1 id="philosophy-page-title">PHILOSOPHY — 私たちの想い</h1>
        <p>まだ、あなたの中には、自分も知らない輝く星が眠っている。</p>
        <p>― Find Your Star. ―</p>
        <p>
          NEXTORY11は、あなたを決めつけるための診断ではありません。
          11の問いを通して、心の奥にある価値観や可能性を映し出し、
          あなた自身が「自分の星」に気づくためのきっかけをつくる体験です。
        </p>
        <section aria-labelledby="philosophy-values-title">
          <h2 id="philosophy-values-title">私たちが大切にしていること</h2>
          <article>
            <h3>あなたを信じる</h3>
            <p>あなたの中には、まだ見ぬ可能性があると私たちは信じています。</p>
          </article>
          <article>
            <h3>本質を映し出す</h3>
            <p>表面的な性格ではなく、心の奥にある本当の価値観や強みを映し出します。</p>
          </article>
          <article>
            <h3>未来をひらく</h3>
            <p>診断結果はゴールではなく、これからの選択や行動を後押しするヒントです。</p>
          </article>
          <article>
            <h3>多様性を尊重する</h3>
            <p>11のタイプは優劣ではなく、それぞれが輝く星。すべての個性に価値があります。</p>
          </article>
        </section>
        <p>
          私たちは、あなたの「物語の主人公」は、あなた自身だと信じています。
          NEXTORY11が、その物語を照らし、あなたらしく輝く未来への一歩となりますように。
        </p>
        <p>― Find Your Star. ―</p>
      </div>
    </main>
  );
}

export default PhilosophyPage;
