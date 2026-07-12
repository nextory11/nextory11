function ReportPreview({ report, onReturnToResult, onRestart }) {
  return (
    <main className="app reportApp">
      <section className="reportDelivery" aria-label="Development report preview">
        <header className="reportHeader">
          <div className="reportPreviewLabel">{report.previewLabel}</div>
          <p className="reportEyebrow">NEXTORY11 PERSONAL STAR REPORT</p>
          <h1>{report.result.ja}</h1>
          <p className="reportEnglish">{report.result.en}</p>
          <p className="reportRequestId">REQUEST ID: {report.requestId}</p>
        </header>

        <div className="reportSections">
          {report.sections.map((section, index) => (
            <article className="reportSection" key={section.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{section.title}</h2>
              {section.body ? <p>{section.body}</p> : null}
              {section.items ? (
                <ul>
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        <p className="reportDisclosure">
          この画面はUX確認用のローカルモックです。Stripeの支払い検証やOpenAIによる最終生成は行っていません。
        </p>

        <div className="reportActions noPrint">
          <button type="button" className="reportPrimaryButton" onClick={() => window.print()}>
            印刷・PDFとして保存
          </button>
          <button type="button" className="reportSecondaryButton" onClick={onReturnToResult}>
            結果画面に戻る
          </button>
          <button type="button" className="reportSecondaryButton" onClick={onRestart}>
            もう一度診断する
          </button>
        </div>
      </section>
    </main>
  );
}

export default ReportPreview;
