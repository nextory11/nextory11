import { useCallback, useEffect, useRef, useState } from "react";
import PanelFrameOrnaments from "./PanelFrameOrnaments";
import ReportPreview from "./ReportPreview";

function PaymentStatus({ request, result, status, onReturnToResult, onRestart }) {
  const isSuccessRoute = status === "success";
  const [serverStatus, setServerStatus] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [generationPending, setGenerationPending] = useState(false);
  const generationRequested = useRef(false);
  const generationInFlight = useRef(false);

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
    if (!isSuccessRoute) { onReturnToResult(); return undefined; }
    if (!request?.requestId || !request?.accessToken) {
      setStatusError("保存された安全なレポートアクセス情報が見つかりません。");
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
  }, [isSuccessRoute, request?.requestId, request?.accessToken, requestGeneration, onReturnToResult]);

  if (serverStatus?.report) {
    return <ReportPreview report={serverStatus.report} onReturnToResult={onReturnToResult} onRestart={onRestart} />;
  }

  const verifiedPaid = serverStatus?.paymentStatus === "paid" && serverStatus?.entitlementStatus === "active";
  const retryable = verifiedPaid && serverStatus?.generationStatus === "retryable_failed";

  return (
    <main className="app paymentExperience">
      <section className="paymentHero" aria-label="Premium Report status">
        <div className="paymentCosmos" aria-hidden="true"><div className="paymentNebula paymentNebulaLeft" /><div className="paymentNebula paymentNebulaRight" /><div className="paymentGalaxy" /><div className="paymentEarth" /><div className="paymentStarField paymentStarFieldFar" /><div className="paymentStarField paymentStarFieldNear" /></div>
        <div className={`paymentPanel ${verifiedPaid ? "isVerified" : "isVerifying"}`}>
          <PanelFrameOrnaments />
          <header className="paymentBrand"><img src="/images/logo/nextory-logo.png" alt="NEXTORY11" /><span>PERSONAL STAR REPORT</span></header>
          <div className="paymentBadge"><i aria-hidden="true" />{verifiedPaid ? "PREMIUM ACCESS VERIFIED" : "SECURE VERIFICATION"}</div>
          <div className="paymentAwakening" aria-hidden="true"><div className="paymentOrbit paymentOrbitOuter" /><div className="paymentOrbit paymentOrbitInner" /><div className="paymentCore"><span>✦</span></div></div>
          <div className="paymentCopy">
            <p className="paymentEyebrow">{verifiedPaid ? "READING YOUR PERSONAL CONSTELLATION" : "VERIFYING YOUR PAYMENT"}</p>
            <h1 className="paymentTitle">{verifiedPaid ? "あなただけの星図を読み解いています" : "安全な決済確認を行っています"}</h1>
            <p className="paymentTitleEn">{verifiedPaid ? "Your Personal Star Report Is Being Created" : "Secure Payment Verification"}</p>
            <p className="paymentLead">{verifiedPaid ? "11の回答と星の組み合わせを丁寧に読み解き、12章のパーソナルレポートへまとめています。この画面を更新しても購入権利は保持されます。" : "サーバーでStripeの決済結果を確認しています。リダイレクト画面だけで購入済みになることはありません。"}</p>
          </div>
          {result ? <div className="paymentResult"><PanelFrameOrnaments /><div className="paymentResultCopy"><span>YOUR STAR TYPE</span><strong>{result.ja ?? result.title}</strong><em>{result.en}</em></div></div> : null}
          {statusError ? <p className="paymentWarning">{statusError}</p> : null}
          <div className="paymentVerification"><PanelFrameOrnaments /><div className="paymentVerificationState"><span className="paymentVerificationIcon" aria-hidden="true">{verifiedPaid ? "✓" : "✦"}</span><div><span>{verifiedPaid ? "PREMIUM ENTITLEMENT ACTIVE" : "PAYMENT STATUS"}</span><strong>{verifiedPaid ? "決済確認済み・レポート生成中" : "安全な決済確認を継続中"}</strong></div></div>{request?.requestId ? <small>REQUEST ID&nbsp;&nbsp;{request.requestId}</small> : null}</div>
          {retryable ? <button type="button" className="reportPrimaryButton" disabled={generationPending} onClick={() => { generationRequested.current = true; requestGeneration().then((accepted) => { if (!accepted) generationRequested.current = false; }); }}>{generationPending ? "再生成を準備しています…" : "レポート生成をもう一度試す"}</button> : null}
          <div className="paymentActions">{result ? <button type="button" className="paymentSecondaryButton" onClick={onReturnToResult}>結果画面に戻る</button> : null}<button type="button" className="paymentSecondaryButton" onClick={onRestart}>もう一度診断する</button></div>
          <p className="paymentFootnote">NEXTORY11 · YOUR STORY BEGINS AMONG THE STARS</p>
        </div>
      </section>
    </main>
  );
}

export default PaymentStatus;
