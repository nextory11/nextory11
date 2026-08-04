import PanelFrameOrnaments from "./PanelFrameOrnaments";
import { resolveResultTypeDisplay } from "../data/resultTypes";

const SECTION_KEYS = [
  "executiveSummary", "corePersonality", "hiddenStrengths", "traitInteraction",
  "decisionMakingStyle", "relationships", "careerAndTalent", "currentGrowthStage",
  "blindSpots", "personalRecommendations", "growthPlan30Days",
];

function NarrativeSection({ section, number }) {
  return (
    <article className="reportSection">
      <PanelFrameOrnaments />
      <div className="reportSectionSeal" aria-hidden="true"><span>{number}</span></div>
      <h2>{section.title}</h2>
      <p className="reportSectionSummary">{section.summary}</p>
      <div className="reportSectionBody">{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      <ul className="reportKeyPoints">{section.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul>
      <p className="reportReflection"><strong>星の問い</strong>{section.reflectionQuestion}</p>
    </article>
  );
}

function PurchaseRecord({ record, resultName }) {
  return (
    <section className="purchaseRecord" aria-label="購入記録">
      <h2>購入記録</h2>
      <dl>
        <div><dt>販売事業者</dt><dd>TATSUMI DINING INC. / NEXTORY11</dd></div>
        <div><dt>商品</dt><dd>NEXTORY11 プレミアムレポート</dd></div>
        <div><dt>金額</dt><dd>980円（日本円／JPY）</dd></div>
        <div><dt>決済状況</dt><dd>支払済み</dd></div>
        <div><dt>提供状況</dt><dd>提供済み</dd></div>
        {record?.purchaseDate ? <div><dt>購入日時</dt><dd>{new Date(record.purchaseDate).toLocaleString("ja-JP")}</dd></div> : null}
        {record?.requestId ? <div><dt>参照番号</dt><dd>{record.requestId}</dd></div> : null}
        {(resultName ?? record?.resultName) ? <div><dt>診断タイプ</dt><dd>{resultName ?? record?.resultName}</dd></div> : null}
      </dl>
      <p><a href="/#/commercial-disclosure">販売条件</a> · <a href="/#/refund-policy">返金方針</a> · <a href="/#/contact">お問い合わせ</a></p>
      <button type="button" className="paymentSecondaryButton noPrint" onClick={() => window.print()}>購入記録を印刷・PDF保存</button>
    </section>
  );
}

function ReportPreview({ report, purchaseRecord, onReturnToResult, onRestart }) {
  const resultDisplay = resolveResultTypeDisplay(report.result.type, report.result);
  return (
    <main className="app reportApp">
      <section className="reportDelivery" aria-label="NEXTORY11 Premium Report">
        <PanelFrameOrnaments />
        <header className="reportHeader">
          <PanelFrameOrnaments />
          <div className="reportPreviewLabel">PREMIUM · PERSONAL STAR READING</div>
          <p className="reportEyebrow">NEXTORY11 PERSONAL STAR REPORT</p>
          <h1>{resultDisplay.ja}</h1>
          <p className="reportEnglish">{resultDisplay.en}</p>
          <p className="reportOpening">{report.executiveSummary.summary}</p>
        </header>

        <div className="reportSections">
          {SECTION_KEYS.slice(0, 9).map((key, index) => <NarrativeSection key={key} section={report[key]} number={String(index + 1).padStart(2, "0")} />)}
          <NarrativeSection section={report.personalRecommendations} number="10" />
          <article className="reportSection reportActionPlan">
            <PanelFrameOrnaments />
            <div className="reportSectionSeal" aria-hidden="true"><span>11</span></div>
            <h2>{report.growthPlan30Days.title}</h2>
            <p className="reportSectionSummary">{report.growthPlan30Days.summary}</p>
            <div className="reportWeeks">
              {(report.growthPlan30Days.actions ?? report.growthPlan30Days.weeks ?? []).map((item) => (
                <section key={item.timing ?? item.dayRange} className="reportWeek">
                  <span>{item.timing ?? item.dayRange}</span>
                  <h3>{item.title}</h3>
                  {item.action ? <p>{item.action}</p> : <ul>{item.actions.map((action) => <li key={action}>{action}</li>)}</ul>}
                  <p>{item.purpose ?? item.reflection}</p>
                </section>
              ))}
            </div>
          </article>
          <article className="reportSection reportClosing">
            <PanelFrameOrnaments />
            <div className="reportSectionSeal" aria-hidden="true"><span>12</span></div>
            <p className="reportEyebrow">MESSAGE FROM AI JUZA</p>
            <h2>星の案内人から、あなたへ</h2>
            <blockquote>{report.aiJuzaClosingMessage}</blockquote>
          </article>
        </div>

        <p className="reportDisclosure">このレポートは自己理解と可能性の探索を支えるものであり、医療・心理・法律・金融上の診断や、将来の結果を保証するものではありません。</p>
        <PurchaseRecord record={purchaseRecord} resultName={resultDisplay.ja} />
        <div className="reportActions noPrint"><PanelFrameOrnaments /><button type="button" className="reportPrimaryButton" onClick={() => window.print()}>印刷・PDFとして保存</button><button type="button" className="reportSecondaryButton" onClick={onReturnToResult}>結果画面に戻る</button><button type="button" className="reportSecondaryButton" onClick={onRestart}>もう一度診断する</button></div>
      </section>
    </main>
  );
}

export default ReportPreview;
