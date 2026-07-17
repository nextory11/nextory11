import PanelFrameOrnaments from "./PanelFrameOrnaments";

const SECTION_KEYS = [
  "executiveSummary", "corePersonality", "hiddenStrengths", "traitInteraction",
  "decisionMakingStyle", "relationships", "careerAndTalent", "currentGrowthStage",
  "blindSpots", "growthPlan30Days", "personalRecommendations",
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

function ReportPreview({ report, onReturnToResult, onRestart }) {
  return (
    <main className="app reportApp">
      <section className="reportDelivery" aria-label="NEXTORY11 Premium Report">
        <PanelFrameOrnaments />
        <header className="reportHeader">
          <PanelFrameOrnaments />
          <div className="reportPreviewLabel">PREMIUM · PERSONAL STAR READING</div>
          <p className="reportEyebrow">NEXTORY11 PERSONAL STAR REPORT</p>
          <h1>{report.result.nameJa}</h1>
          <p className="reportEnglish">{report.result.nameEn}</p>
          <p className="reportOpening">{report.executiveSummary.summary}</p>
        </header>

        <div className="reportSections">
          {SECTION_KEYS.slice(0, 9).map((key, index) => <NarrativeSection key={key} section={report[key]} number={String(index + 1).padStart(2, "0")} />)}
          <article className="reportSection reportActionPlan">
            <PanelFrameOrnaments />
            <div className="reportSectionSeal" aria-hidden="true"><span>10</span></div>
            <h2>{report.growthPlan30Days.title}</h2>
            <p className="reportSectionSummary">{report.growthPlan30Days.summary}</p>
            <div className="reportWeeks">{report.growthPlan30Days.weeks.map((week) => (
              <section key={week.dayRange} className="reportWeek"><span>{week.dayRange}</span><h3>{week.title}</h3><ul>{week.actions.map((action) => <li key={action}>{action}</li>)}</ul><p>{week.reflection}</p></section>
            ))}</div>
          </article>
          <NarrativeSection section={report.personalRecommendations} number="11" />
          <article className="reportSection reportClosing">
            <PanelFrameOrnaments />
            <div className="reportSectionSeal" aria-hidden="true"><span>12</span></div>
            <p className="reportEyebrow">MESSAGE FROM AI JUZA</p>
            <h2>星の案内人から、あなたへ</h2>
            <blockquote>{report.aiJuzaClosingMessage}</blockquote>
          </article>
        </div>

        <p className="reportDisclosure">このレポートは自己理解と可能性の探索を支えるものであり、医療・心理・法律・金融上の診断や、将来の結果を保証するものではありません。</p>
        <div className="reportActions noPrint"><PanelFrameOrnaments /><button type="button" className="reportPrimaryButton" onClick={() => window.print()}>印刷・PDFとして保存</button><button type="button" className="reportSecondaryButton" onClick={onReturnToResult}>結果画面に戻る</button><button type="button" className="reportSecondaryButton" onClick={onRestart}>もう一度診断する</button></div>
      </section>
    </main>
  );
}

export default ReportPreview;
