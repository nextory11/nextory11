import { useState } from "react";
import { generateDevelopmentReport } from "../lib/mockReportGenerator.js";
import ReportPreview from "./ReportPreview.jsx";

function PaymentStatus({ request, result, status, onReturnToResult, onRestart }) {
  const isSuccess = status === "success";
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);

  async function handleGeneratePreview() {
    if (!request?.requestId || !request?.answers?.length) {
      return;
    }

    setIsGenerating(true);
    const report = await generateDevelopmentReport(request);
    setPreviewReport(report);
    setIsGenerating(false);
  }

  if (previewReport) {
    return (
      <ReportPreview
        report={previewReport}
        onReturnToResult={onReturnToResult}
        onRestart={onRestart}
      />
    );
  }

  return (
    <main className="app">
      <section className="paymentHero" aria-label="Payment status">
        <div className="paymentPanel">
          <div className="paymentBadge">
            {isSuccess ? "PAYMENT COMPLETE" : "CHECKOUT CANCELED"}
          </div>

          <div className="paymentIcon" aria-hidden="true">
            {isSuccess ? "✦" : "↺"}
          </div>

          <h1 className="paymentTitle">
            {isSuccess ? "決済が完了しました" : "決済はキャンセルされました"}
          </h1>

          <p className="paymentLead">
            {isSuccess
              ? "お支払いが完了しました。Personal Star Report を準備しています。この開発ビルドでは、最終版の有料レポートが配信済みであるとは表示しません。"
              : "診断結果はこの端末に一時保存されています。結果画面に戻って、いつでもレポート購入を再開できます。"}
          </p>

          {result ? (
            <div className="paymentResult">
              <span>STAR TYPE</span>
              <strong>{result.ja ?? result.title}</strong>
              <em>{result.en}</em>
            </div>
          ) : null}

          {isSuccess ? (
            <div className="paymentPreparation">
              <span>DEVELOPMENT REPORT PREPARATION</span>
              <p>
                保存された診断データを使い、UX確認用のモックレポートを生成できます。実際のStripe支払い検証やOpenAI APIは使用しません。
              </p>
              {request?.requestId ? (
                <small>REQUEST ID: {request.requestId}</small>
              ) : (
                <p className="paymentWarning">保存された診断データが見つかりません。</p>
              )}
            </div>
          ) : null}

          <div className="paymentActions">
            {isSuccess && request?.requestId ? (
              <button
                type="button"
                className="paymentPrimaryButton"
                disabled={isGenerating}
                onClick={handleGeneratePreview}
              >
                {isGenerating ? "開発プレビューを準備中…" : "開発プレビューを生成する"}
              </button>
            ) : null}

            {isSuccess && result ? (
              <button
                type="button"
                className="paymentSecondaryButton"
                onClick={onReturnToResult}
              >
                結果画面に戻る
              </button>
            ) : null}

            {!isSuccess && result ? (
              <button
                type="button"
                className="paymentPrimaryButton"
                onClick={onReturnToResult}
              >
                結果画面に戻る
              </button>
            ) : null}

            <button type="button" className="paymentSecondaryButton" onClick={onRestart}>
              もう一度診断する
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PaymentStatus;
