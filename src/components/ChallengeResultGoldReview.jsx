import { useEffect, useRef, useState } from "react";
import StarReadingSection from "./StarReadingSection";
import { selectRandomMessageIndex } from "../lib/aiJuza/randomSelection";
import { challengeAiJuzaMessages } from "../data/challengeOfficialResultCopy";

const CONTENT = [
  {
    number: "01",
    title: "あなたの星の本質",
    icon: "✦",
    paragraphs: [
      "あなたは、難しいことに出会っても、「まずやってみよう」と一歩を踏み出せる人です。",
      "うまくいく保証がなくても、挑戦する中で方法を見つけ、壁にぶつかっても、簡単にはあきらめません。",
      "あなたにとって挑戦とは、誰かに勝つことではなく、昨日までの自分を少しずつ超えていくこと。",
      "その前へ進もうとする力が、あなた自身だけでなく、周りの人を動かす力にもなっていきます。",
    ],
  },
  {
    number: "02",
    title: "あなたの才能",
    icon: "↗",
    paragraphs: [
      "あなたには、「やってみよう」と決めた瞬間に、自分から一歩を踏み出せる力があります。",
      "すべての準備が整うまで待つよりも、まず動いてみる。そして、思い通りにいかなければ、そこで終わるのではなく、「じゃあ次はどうしよう」と考えて、また前へ進んでいく。",
      "この行動しながら答えを見つけていく力は、あなたの大きな才能です。",
      "そして、あなたの強さは、自分一人が前へ進めることだけではありません。あなたが本気で何かに挑戦する姿は、周りの人にも伝わります。",
      "誰かが迷っているときに最初の一歩を見せたり、止まっていた空気を動かしたり、「自分もやってみよう」と思わせたりすることがあります。",
      "もちろん、いつでも自信があるわけではないでしょう。不安になることも、失敗することもあります。",
      "それでも、不安がなくなってから動くのではなく、不安を抱えながらでも前へ進める。そこが、あなたの強さです。",
      "あなたの才能は、挑戦することだけではありません。挑戦を始め、壁を越えながら前へ進み、その姿で周りにも勇気を与えられることです。",
    ],
  },
  {
    number: "03",
    title: "あなたの恋愛・人間関係の傾向",
    icon: "♡",
    paragraphs: [
      "あなたは、人との関係でも本音で向き合うことを大切にする人です。",
      "遠慮して気持ちを隠し続けるより、「こう思っている」「こうしたい」と伝え合える関係の方が、あなたには心地よく感じられるでしょう。",
      "そして、一緒に何かへ挑戦したり、お互いの目標を応援したりしながら、共に前へ進める相手に強く惹かれるところがあります。",
      "恋愛でも友人関係でも、ただ一緒にいるだけではなく、「この人といると自分も成長できる」と感じられることが、あなたにとって大切なのかもしれません。",
      "一方で、前へ進みたい気持ちが強いときほど、自分の考えやペースを優先してしまうことがあります。あなたには「これくらいならできる」と思えることでも、相手にとっては少し時間が必要なこともあります。",
      "そんなとき、相手を急かすのではなく、「この人は今、どう感じているんだろう」と一度立ち止まってみること。",
      "それだけで、あなたの強さは「引っ張る力」だけではなく、相手と一緒に進む力へ変わっていきます。",
      "あなたは、本気で信頼した人にはとても心強い存在になれる人です。前へ進む勇気と、相手の歩幅を大切にする優しさ。その両方を持てたとき、あなたの人間関係はもっと深く、強いものになっていきます。",
    ],
  },
  {
    number: "04",
    title: "あなたの30日アクションプラン",
    icon: "✧",
    paragraphs: [
      "この30日間は、「少し気になっているけれど、まだ始めていないこと」を一つ選んでみてください。大きな目標でなくて大丈夫です。",
      "やってみたかったこと。誰かに話してみたかったこと。ずっと後回しにしていたこと。",
      "まずはその中から一つだけ選び、最初の一歩を具体的に決めて、7日以内に行動してみましょう。",
      "Challengeのあなたは、動き始めることで気持ちが前へ進みやすい人です。最初から完璧な計画を作るより、実際にやってみることで「次に何をすればいいか」が見えてくることがあります。",
      "そして、今回もう一つ意識してほしいことがあります。30日間、ただ前へ進むだけではなく、ときどき立ち止まること。",
      "「うまくいったことは何だった？」「思っていたのと違ったことは？」「次は何を変えてみよう？」",
      "週に一度、この3つだけを振り返ってみてください。失敗したことがあっても、それを「できなかった」で終わらせる必要はありません。",
      "挑戦したからこそ分かったことは、次の一歩を選ぶための大切な材料です。",
      "そして30日後、最初の日の自分と比べてみてください。結果の大きさではなく、「自分で一歩を決めて、実際に動けたか」を見てほしいのです。",
      "Challengeのあなたに必要なのは、毎回大きな挑戦をすることではありません。小さくても、自分で決めた一歩を積み重ねること。",
      "その積み重ねが、あなたを昨日までの自分より少し先へ連れていってくれます。",
    ],
  },
];


function ChallengeResultGoldReview() {
  const [selectedMessage, setSelectedMessage] = useState(
    () => selectRandomMessageIndex(challengeAiJuzaMessages),
  );
  const messageRef = useRef(null);

  useEffect(() => {
    messageRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [selectedMessage]);
  return (
    <main className="challengeGoldReview">
      <div className="challengeGoldReview__cosmos" aria-hidden="true" />
      <div className="challengeGoldReview__outerFrame" aria-hidden="true" />
      <details className="challengeReviewControls">
        <summary>REVIEW</summary>
        <div>
          {challengeAiJuzaMessages.map((_, index) => (
            <button key={index} type="button" aria-pressed={selectedMessage === index} onClick={() => setSelectedMessage(index)}>{String(index + 1).padStart(2, "0")}</button>
          ))}
        </div>
      </details>
      <header className="challengeGoldHero">
        <p className="challengeGoldHero__eyebrow">YOUR STAR TYPE</p>
        <div className="challengeGoldHero__emblem">
          <img src="/images/result-scenes/challenge/icons/emblem.png" alt="Challenge official emblem" />
        </div>
        <h1>CHALLENGE</h1>
        <p className="challengeGoldHero__ja">挑戦力タイプ</p>
        <p className="challengeGoldHero__quote">恐れは、止まる理由ではなく、進む方向を示す炎。</p>
        <span>CREATE THE FUTURE.</span>
      </header>

      <div className="challengeGoldReview__content">
        <section className="challengeJuzaGlass cosmicGlass" aria-labelledby="challenge-juza-title">
          <div className="challengeJuzaGlass__portrait">
            <img src="/images/result-scenes/challenge/characters/ai_juza_portrait.png" alt="AI JUZA" />
          </div>
          <div className="challengeJuzaGlass__body">
            <p className="cosmicGlass__eyebrow">A MESSAGE FROM AI JUZA</p>
            <h2 id="challenge-juza-title">AI JUZAからの言葉</h2>
            <div className="challengeJuzaGlass__messageShell">
              <div ref={messageRef} className="challengeJuzaGlass__message" aria-live="polite" tabIndex="0" aria-label={`AI JUZA message ${String(selectedMessage + 1).padStart(2, "0")}; scroll for full text`}>
                {challengeAiJuzaMessages[selectedMessage].split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <span className="challengeJuzaGlass__scrollHint" aria-hidden="true">全文を読む&nbsp;&nbsp;↓</span>
            </div>
          </div>
        </section>

        <StarReadingSection
          cards={CONTENT.map((section) => ({
            ...section,
            summary: section.paragraphs.slice(0, 3).join("\n"),
            fullText: section.paragraphs,
          }))}
          renderIcon={(section) => (
            <span className="starReadingPanel__icon" aria-hidden="true">{section.icon}</span>
          )}
          theme="challenge"
        />

        <section className="challengePremiumPause cosmicGlass" aria-label="Premium Report">
          <p>PREMIUM REPORT</p>
          <h2>もっと深く、あなたの星を知るために</h2>
          <p>より良いレポートをお届けするため、現在受付を一時停止しています。</p>
          <button type="button" disabled>現在、プレミアムレポートを調整中です</button>
        </section>

      </div>
      <footer className="challengeGoldReview__footer">― Find Your Star. ―</footer>
    </main>
  );
}

export default ChallengeResultGoldReview;
