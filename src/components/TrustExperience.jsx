import { FAQ_ITEMS, LEGAL_PAGES, SUPPORT_EMAIL } from "../data/trustContent.js";
import TrustFooter from "./TrustFooter.jsx";

function Frame({ children, className = "" }) {
  return <section className={`trustFrame ${className}`}>{children}</section>;
}

function Header({ eyebrow, title, lead }) {
  return (
    <header className="trustHero">
      <a className="trustHero__back" href="/#/" aria-label="NEXTORY11のトップへ戻る">← TOP</a>
      <p className="trustHero__eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="trustHero__lead">{lead}</p>
      <div className="trustHero__star" aria-hidden="true">✦</div>
    </header>
  );
}

function LegalPage({ page }) {
  const content = LEGAL_PAGES[page];
  return (
    <>
      <Header {...content} />
      <Frame className="trustDocument">
        {content.incomplete ? <p className="trustContact__notice" role="status">公開禁止：事業者情報のプレースホルダーが残っています。</p> : null}
        <p className="trustDocument__updated">最終更新日：2026年7月27日</p>
        {content.sections.map(([heading, paragraphs]) => (
          <section className="trustDocument__section" key={heading}>
            <h2>{heading}</h2>
            {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
      </Frame>
    </>
  );
}

function FAQPage() {
  return (
    <>
      <Header eyebrow="QUESTIONS & ANSWERS" title="よくあるご質問" lead="診断、AI JUZA、Premium Report、データの扱いについてお答えします。" />
      <section className="trustFaq" aria-label="よくあるご質問の回答">
        {FAQ_ITEMS.map(([question, answer], index) => (
          <details className="trustFaq__item" key={question}>
            <summary><span className="trustFaq__number">{String(index + 1).padStart(2, "0")}</span><span>{question}</span><span className="trustFaq__mark" aria-hidden="true">＋</span></summary>
            <div className="trustFaq__answer"><p>{answer}</p></div>
          </details>
        ))}
      </section>
    </>
  );
}

function WhyPage() {
  return (
    <>
      <Header eyebrow="OUR PHILOSOPHY" title="Why NEXTORY11" lead="答えを決めるためではなく、まだ見えていない可能性に光を当てるために。" />
      <div className="trustStory">
        <Frame><p className="trustStory__kicker">Every person carries an undiscovered star.</p><h2>人には、まだ言葉になっていない可能性がある。</h2><p>誰かと比べて優れているかではなく、自分の中にどんな力があり、どんな未来を選びたいのか。NEXTORY11は、その静かな問いと向き合う時間をつくるために生まれました。</p></Frame>
        <Frame><h2>正しい生き方は、一つではない。</h2><p>11のタイプは、人を閉じ込めるラベルではありません。同じ結果でも、経験や環境によって現れ方は異なります。診断は結論ではなく、自分らしい選択肢を見つける入口です。</p></Frame>
        <Frame><h2>未来を当てるのではなく、未来を選ぶ。</h2><p>NEXTORY11が目指すのは予言ではありません。過去の回答から見える傾向を手がかりに、今の自分を理解し、次の一歩を自分で選べるようにすることです。</p></Frame>
        <Frame><h2>AI JUZAは、隣を歩く。</h2><p>AI JUZAは、人間の判断や専門家の役割を置き換えません。「こうしなさい」と命じる存在でもありません。見落としていた強みや可能性をそっと照らし、最後の選択をあなたに返す星の案内人です。</p></Frame>
        <blockquote className="trustStory__quote">あなたは完成していない。<br />だからこそ、次の自分に出会える。</blockquote>
      </div>
    </>
  );
}

function ContactPage() {
  const available = Boolean(SUPPORT_EMAIL);
  return (
    <>
      <Header eyebrow="CONTACT" title="お問い合わせ" lead="診断、Premium Report、決済に関するご相談を承ります。" />
      <Frame className="trustContact">
        <div className="trustContact__icon" aria-hidden="true">✦</div>
        <h2>NEXTORY11 Support</h2>
        {available ? <><p>下記のサポート窓口へご連絡ください。</p><a className="trustContact__button" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a><p>電話（自動受付）：+1 778-803-7077</p></> : <><p>現在、公開用サポート窓口を最終準備しています。正式な連絡先は公開前にこのページへ掲載します。</p><p className="trustContact__notice" role="status">運営者向け：公開用サポート窓口の設定が必要です。</p></>}
        <p className="trustContact__note">カード番号、APIキー、パスワードなどの秘密情報は送らないでください。決済のお問い合わせには、Stripeの領収書に記載された参照情報をご用意ください。</p>
      </Frame>
    </>
  );
}

export default function TrustExperience({ page }) {
  return (
    <main className="trustPage">
      <div className="trustPage__sky" aria-hidden="true"><span /><span /><span /></div>
      <div className="trustPage__content">
        {page === "faq" ? <FAQPage /> : page === "why" ? <WhyPage /> : page === "contact" ? <ContactPage /> : <LegalPage page={page} />}
        <TrustFooter compact />
      </div>
    </main>
  );
}
