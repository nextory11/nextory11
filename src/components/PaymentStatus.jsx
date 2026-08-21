import { useCallback, useEffect, useRef, useState } from "react";
import PanelFrameOrnaments from "./PanelFrameOrnaments";
import ReportPreview from "./ReportPreview";
import { recoverCheckoutSnapshot } from "../lib/stripeCheckout";
import { resolveResultTypeDisplay } from "../data/resultTypes";

function PaymentStatus({ request: initialRequest, result: initialResult, status, onReturnToResult, onCheckoutIncomplete, onRestart, onReturnToTop }) {
  const isSuccessRoute = status === "success";
  const [request, setRequest] = useState(initialRequest);
  const [result, setResult] = useState(initialResult);
  const [serverStatus, setServerStatus] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [generationPending, setGenerationPending] = useState(false);
  const resultDisplay = result ? resolveResultTypeDisplay(result.type, result) : null;
  const generationRequested = useRef(false);
  const generationInFlight = useRef(false);
  const recoveryAttempted = useRef(false);
  const checkoutIncompleteHandled = useRef(false);

  useEffect(() => {
    if (!isSuccessRoute || recoveryAttempted.current) return;
    const url = new URL(window.location.href);
    const checkoutSessionId = url.searchParams.get("session_id");
    if (!checkoutSessionId && request?.requestId && request?.accessToken) return;
    recoveryAttempted.current = true;
    window.history.replaceState({}, "", "/payment-success");
    if (!checkoutSessionId) {
      setStatusError("購入情報を自動で復元できませんでした。再度お支払いいただく必要はありません。サポートへお問い合わせください。");
      return;
    }
    setRequest(null);
    setResult(null);
    setServerStatus(null);
    setStatusError("");
    recoverCheckoutSnapshot(checkoutSessionId)
      .then((snapshot) => {
        setRequest(snapshot);
        setResult(snapshot.result);
      })
      .catch((error) => {
        if (error.message === "checkout_not_paid") {
          checkoutIncompleteHandled.current = true;
          onCheckoutIncomplete();
          return;
        }
        setStatusError("購入情報を自動で復元できませんでした。再度お支払いいただく必要はありません。サポートへお問い合わせください。");
      });
  }, [isSuccessRoute, request?.requestId, request?.accessToken, onCheckoutIncomplete]);

  const requestGeneration = useCallback(async () => {
    if (!request?.requestId || !request?.accessToken || generationInFlight.current) return false;
    generationInFlight.current = true;
    setGenerationPending(true);
    setStatusError("");
    try {
      const response = await fetch(`/api/reports/${encodeURIComponent(request.requestId)}/generate`, {
        method: "POST", headers: { Authorization: `Bearer ${request.accessToken}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok && response.status !== 409) throw new Error(payload.error || "generation_failed");
      return true;
    } catch {
      setStatusError("星図レポートの生成を完了できませんでした。購入権利は保持されています。もう一度お試しください。");
      return false;
    } finally {
      generationInFlight.current = false;
      setGenerationPending(false);
    }
  }, [request?.requestId, request?.accessToken]);

  useEffect(() => {
    if (!isSuccessRoute) {
      if (!checkoutIncompleteHandled.current) {
        checkoutIncompleteHandled.current = true;
        onCheckoutIncomplete();
      }
      return undefined;
    }
    if (!request?.requestId || !request?.accessToken) {
      return undefined;
    }
    let active = true;
    let timer;
    async function poll() {
      try {
        const response = await fetch(`/api/reports/${encodeURIComponent(request.requestId)}/status`, {
          cache: "no-store", headers: { Authorization: `Bearer ${request.accessToken}` },
        });
        if (!response.ok) throw new Error("status_unavailable");
        const payload = await response.json();
        if (!active) return;
        setServerStatus(payload);
        if (payload.paymentStatus === "paid" && payload.entitlementStatus === "active" &&
            ["blocked", "queued"].includes(payload.generationStatus) && !generationRequested.current) {
          generationRequested.current = true;
          requestGeneration().then((accepted) => {
            if (!accepted) generationRequested.current = false;
          });
        }
        if (!payload.report) timer = window.setTimeout(poll, 2000);
      } catch {
        if (!active) return;
        setStatusError("決済・生成状況を確認できません。購入権利は失われません。しばらくしてから再度お試しください。");
        timer = window.setTimeout(poll, 4000);
      }
    }
    poll();
    return () => { active = false; window.clearTimeout(timer); };
  }, [isSuccessRoute, request?.requestId, request?.accessToken, requestGeneration, onCheckoutIncomplete]);

  if (serverStatus?.report) {
    return (
      <ReportPreview
        report={serverStatus.report}
        purchaseRecord={{
          requestId: request?.requestId,
          purchaseDate: serverStatus?.paidAt ?? serverStatus?.createdAt,
          resultName: resultDisplay?.ja,
        }}
        onReturnToResult={onReturnToResult}
        onRestart={onRestart}
        onReturnToTop={onReturnToTop}
      />
    );
  }

  const verifiedPaid = serverStatus?.paymentStatus === "paid" && serverStatus?.entitlementStatus === "active";
  const retryable = verifiedPaid && serverStatus?.generationStatus === "retryable_failed";
  const purchaseDate = serverStatus?.paidAt ?? serverStatus?.createdAt;
  const recoveryUnavailable = Boolean(statusError) && !request?.accessToken;

  return (
    <main className="app paymentExperience">
      <section className="paymentHero" aria-label="Premium Report status">
        <div className="paymentCosmos" aria-hidden="true"><div className="paymentNebula paymentNebulaLeft" /><div className="paymentNebula paymentNebulaRight" /><div className="paymentGalaxy" /><div className="paymentEarth" /><div className="paymentStarField paymentStarFieldFar" /><div className="paymentStarField paymentStarFieldNear" /></div>
        <div className={`paymentPanel ${verifiedPaid ? "isVerified" : "isVerifying"} ${recoveryUnavailable ? "hasRecoveryError" : ""}`}>
          <PanelFrameOrnaments />
          <header className="paymentBrand"><img src="/images/logo/nextory-logo.png" alt="NEXTORY11" /><span>PERSONAL STAR REPORT</span></header>
          <div className="paymentBadge"><i aria-hidden="true" />{verifiedPaid ? "PREMIUM ACCESS VERIFIED" : recoveryUnavailable ? "RECOVERY SUPPORT REQUIRED" : "SECURE VERIFICATION"}</div>
          <div className="paymentAwakening" aria-hidden="true"><div className="paymentOrbit paymentOrbitOuter" /><div className="paymentOrbit paymentOrbitInner" /><div className="paymentCore"><span>✦</span></div></div>
          <div className="paymentCopy">
            <p className="paymentEyebrow">{verifiedPaid ? "READING YOUR PERSONAL CONSTELLATION" : recoveryUnavailable ? "PURCHASE RECOVERY NEEDS SUPPORT" : "VERIFYING YOUR PAYMENT"}</p>
            <h1 className="paymentTitle">{verifiedPaid ? "あなただけの星図を読み解いています" : recoveryUnavailable ? "購入情報を自動で復元できませんでした" : "安全な決済確認を行っています"}</h1>
            <p className="paymentTitleEn">{verifiedPaid ? "Your Personal Star Report Is Being Created" : recoveryUnavailable ? "Your Existing Purchase Will Not Be Charged Again" : "Secure Payment Verification"}</p>
            <p className="paymentLead">{verifiedPaid ? "11の回答と星の組み合わせを丁寧に読み解き、12章のパーソナルレポートへまとめています。この画面を更新しても購入権利は保持されます。" : recoveryUnavailable ? "再度お支払いいただく必要はありません。下記のサポート窓口へお問い合わせください。" : "サーバーでStripeの決済結果を確認しています。リダイレクト画面だけで購入済みになることはありません。"}</p>
          </div>
          {result ? <div className="paymentResult"><PanelFrameOrnaments /><div className="paymentResultCopy"><span>YOUR STAR TYPE</span><strong>{resultDisplay.ja}</strong><em>{resultDisplay.en}</em></div></div> : null}
          {statusError ? <p className="paymentWarning">{statusError}<br /><a href="mailto:support@nextory11.com">support@nextory11.com</a></p> : null}
          <div className="paymentVerification"><PanelFrameOrnaments /><div className="paymentVerificationState"><span className="paymentVerificationIcon" aria-hidden="true">{verifiedPaid ? "✓" : recoveryUnavailable ? "!" : "✦"}</span><div><span>{verifiedPaid ? "PREMIUM ENTITLEMENT ACTIVE" : recoveryUnavailable ? "RECOVERY STATUS" : "PAYMENT STATUS"}</span><strong>{verifiedPaid ? "決済確認済み・レポート生成中" : recoveryUnavailable ? "サポートによる確認が必要です" : "安全な決済確認を継続中"}</strong></div></div>{request?.requestId ? <small>REQUEST ID&nbsp;&nbsp;{request.requestId}</small> : null}</div>
          {verifiedPaid ? (
            <section className="purchaseRecord" aria-label="購入記録">
              <h2>購入記録</h2>
              <dl>
                <div><dt>販売事業者</dt><dd>TATSUMI DINING INC. / NEXTORY11</dd></div>
                <div><dt>商品</dt><dd>NEXTORY11 プレミアムレポート</dd></div>
                <div><dt>金額</dt><dd>980円（日本円／JPY）</dd></div>
                <div><dt>決済状況</dt><dd>支払済み</dd></div>
                <div><dt>提供状況</dt><dd>{serverStatus?.report ? "提供済み" : "生成中"}</dd></div>
                {purchaseDate ? <div><dt>購入日時</dt><dd>{new Date(purchaseDate).toLocaleString("ja-JP")}</dd></div> : null}
                {request?.requestId ? <div><dt>参照番号</dt><dd>{request.requestId}</dd></div> : null}
                {result ? <div><dt>診断タイプ</dt><dd>{resultDisplay.ja}</dd></div> : null}
              </dl>
              <p><a href="/#/commercial-disclosure">販売条件</a> · <a href="/#/refund-policy">返金方針</a> · <a href="/#/contact">お問い合わせ</a></p>
              <button type="button" className="paymentSecondaryButton" onClick={() => window.print()}>購入記録を印刷・PDF保存</button>
            </section>
          ) : null}
          {retryable ? <button type="button" className="reportPrimaryButton" disabled={generationPending} onClick={() => { generationRequested.current = true; requestGeneration().then((accepted) => { if (!accepted) generationRequested.current = false; }); }}>{generationPending ? "再生成を準備しています…" : "レポート生成をもう一度試す"}</button> : null}
          <div className="paymentActions">{result ? <button type="button" className="paymentSecondaryButton" onClick={onReturnToResult}>結果画面に戻る</button> : null}<button type="button" className="paymentSecondaryButton" onClick={onRestart}>もう一度診断する</button><button type="button" className="paymentSecondaryButton" onClick={onReturnToTop}>TOPへ戻る</button></div>
          <p className="paymentFootnote">NEXTORY11 · YOUR STORY BEGINS AMONG THE STARS</p>
        </div>
      </section>
    </main>
  );
}

export default PaymentStatus;
