import { useEffect, useLayoutEffect, useRef, useState } from "react";

const PREMIUM_PREVIEW_FRAMES = {
  challenger: "/images/result-scenes/challenge/overlays/premium_preview_frame.png",
  creator: "/images/result-scenes/creator/overlays/premium_preview_frame.png",
  adaptability: "/images/result-scenes/evolver/overlays/premium_preview_frame.png",
  explorer: "/images/result-scenes/explorer/overlays/premium_preview_frame.png",
  persistence: "/images/result-scenes/guardian/overlays/premium_preview_frame.png",
  thinker: "/images/result-scenes/harmonizer/overlays/premium_preview_frame.png",
  intuition: "/images/result-scenes/intuitive/overlays/premium_preview_frame.png",
  expression: "/images/result-scenes/light-bringer/overlays/premium_preview_frame.png",
  action: "/images/result-scenes/pioneer/overlays/premium_preview_frame.png",
  leader: "/images/result-scenes/visionary/overlays/premium_preview_frame.png",
};

const PREMIUM_BENEFITS = [
  {
    icon: "✦",
    title: "あなただけの星図分析",
    detail: "オリジナル星図で本質を解き明かす",
  },
  {
    icon: "◇",
    title: "才能・仕事・適職のヒント",
    detail: "あなたの光る才能と最適な道を提示",
  },
  {
    icon: "♡",
    title: "恋愛・人間関係の傾向",
    detail: "心のつながりと未来の流れを読む",
  },
  {
    icon: "✧",
    title: "30日アクションプラン",
    detail: "今日から人生を動かす具体的な一歩",
  },
];

const PURCHASE_REASSURANCE = "決済は完了していません。料金は請求されていません。";

const normalizeDisplayMessage = (message) => (
  typeof message === "string" ? message.replace(/\s+/g, "") : ""
);

function PremiumReportLabel() {
  return (
    <span className="paidLabel">
      <span className="paidLabel__copy">
        <span className="paidLabel__primary">あなたの星の詳細レポート</span>
        <span className="paidLabel__secondary">YOUR STAR REPORT</span>
      </span>
    </span>
  );
}

function PremiumCard({ checkoutError, isEnabled, isLoading, onClick, resultType }) {
  const reportRef = useRef(null);
  const confirmationCheckboxRef = useRef(null);
  const confirmationHighlightTimerRef = useRef(null);
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);
  const [showConfirmationHighlight, setShowConfirmationHighlight] = useState(false);
  const previewFrame = PREMIUM_PREVIEW_FRAMES[resultType];
  const showCheckoutError = checkoutError
    && normalizeDisplayMessage(checkoutError) !== normalizeDisplayMessage(PURCHASE_REASSURANCE);
  const buttonLabel = isLoading
    ? "Stripe Checkoutへ移動中"
    : isEnabled
      ? "980円のプレミアムレポートを購入する"
      : "現在、プレミアムレポートを調整中です";

  useLayoutEffect(() => {
    const report = reportRef.current;
    if (!report) return undefined;

    let animationFrame = 0;
    const centerReport = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const rect = report.getBoundingClientRect();
        const currentShift = Number.parseFloat(
          getComputedStyle(report).getPropertyValue("--premium-center-shift"),
        ) || 0;
        const nextShift = currentShift + (window.innerWidth / 2 - (rect.left + rect.width / 2));
        report.style.setProperty("--premium-center-shift", `${nextShift}px`);
      });
    };

    centerReport();
    window.addEventListener("resize", centerReport);

    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(centerReport);
    observer?.observe(report);
    if (report.parentElement) observer?.observe(report.parentElement);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", centerReport);
      observer?.disconnect();
    };
  }, [resultType]);

  useEffect(() => () => {
    if (confirmationHighlightTimerRef.current) {
      window.clearTimeout(confirmationHighlightTimerRef.current);
    }
  }, []);

  const requestPurchaseConfirmation = () => {
    setShowConfirmationHighlight(true);
    confirmationCheckboxRef.current?.focus({ preventScroll: true });

    if (confirmationHighlightTimerRef.current) {
      window.clearTimeout(confirmationHighlightTimerRef.current);
    }
    confirmationHighlightTimerRef.current = window.setTimeout(() => {
      setShowConfirmationHighlight(false);
    }, 1400);
  };

  const handlePurchaseClick = () => {
    if (!isEnabled || isLoading) return;
    if (!purchaseConfirmed) {
      requestPurchaseConfirmation();
      return;
    }
    onClick();
  };

  return (
    <section
      ref={reportRef}
      className="paidBox premiumReport"
      data-premium-type={resultType}
      aria-label="あなたの星の詳細レポート"
    >
      <span className="premiumReport__outerFrame" aria-hidden="true">
        <i className="premiumReport__corner premiumReport__corner--tl" />
        <i className="premiumReport__corner premiumReport__corner--tr" />
        <i className="premiumReport__corner premiumReport__corner--bl" />
        <i className="premiumReport__corner premiumReport__corner--br" />
        <i className="premiumReport__gem premiumReport__gem--top" />
        <i className="premiumReport__gem premiumReport__gem--bottom" />
      </span>
      <span className="premiumReport__glass" aria-hidden="true" />

      <PremiumReportLabel />

      <h2 className="premiumTitle">
        あなたの内なる星の声を、
        <br />
        もっと深く読み解く
      </h2>

      <div className="premiumPrice" aria-label="価格 980円">
        <strong>¥980</strong>
      </div>

      <p className="premiumDescription">
        11の回答から、あなたの本質・才能・仕事・恋愛・人間関係・未来への可能性を
        <br />
        さらに詳しく分析する、980円のプレミアムレポートを準備しています。
      </p>

      <ul className="premiumList" aria-label="プレミアムレポートに含まれる内容">
        {PREMIUM_BENEFITS.map((benefit) => (
          <li key={benefit.title}>
            <span className="premiumList__icon" aria-hidden="true">{benefit.icon}</span>
            <span className="premiumList__copy">
              <strong>{benefit.title}</strong>
              <small>{benefit.detail}</small>
            </span>
          </li>
        ))}
      </ul>

      <div className="premiumCtaPanel">
        {isEnabled ? (
          <div className="premiumPurchaseSummary" aria-label="購入内容の最終確認">
            <h3>購入内容の最終確認</h3>
            <dl>
              <div><dt>商品</dt><dd>NEXTORY11 プレミアムレポート</dd></div>
              <div><dt>価格</dt><dd>980円（日本円／JPY）</dd></div>
              <div><dt>支払方法</dt><dd>クレジットカード決済（Stripe）</dd></div>
              <div><dt>提供時期</dt><dd>決済確認後、購入者専用画面で表示</dd></div>
              <div><dt>購入形態</dt><dd>1回限り（定期購入ではありません）</dd></div>
            </dl>
            <p><a href="/#/commercial-disclosure">特定商取引法に基づく表記</a> · <a href="/#/terms">利用規約</a> · <a href="/#/refund-policy">返金・キャンセル</a> · <a href="/#/privacy">プライバシー</a></p>
            <label
              className={`premiumPurchaseConsent${showConfirmationHighlight ? " premiumPurchaseConsent--highlight" : ""}`}
            >
              <input
                ref={confirmationCheckboxRef}
                type="checkbox"
                checked={purchaseConfirmed}
                onChange={(event) => {
                  setPurchaseConfirmed(event.target.checked);
                  setShowConfirmationHighlight(false);
                }}
              />
              <span>商品内容、価格、提供条件、返金方針を確認しました。</span>
            </label>
            {!purchaseConfirmed ? (
              <p className="premiumConfirmationNotice" role="status">
                購入する前に、上のチェックボックスにチェックを入れてください。
              </p>
            ) : null}
          </div>
        ) : null}
        <div
          className={`premiumButtonFrame${previewFrame ? " premiumButtonFrame--asset" : ""}`}
          style={previewFrame ? { "--premium-preview-frame": `url("${previewFrame}")` } : undefined}
        >
          <span className="premiumButtonFrame__sigil" aria-hidden="true" />
          <span className="premiumButtonFrame__perimeter" aria-hidden="true" />
          <i className="premiumButtonFrame__corner premiumButtonFrame__corner--tl" aria-hidden="true" />
          <i className="premiumButtonFrame__corner premiumButtonFrame__corner--tr" aria-hidden="true" />
          <i className="premiumButtonFrame__corner premiumButtonFrame__corner--bl" aria-hidden="true" />
          <i className="premiumButtonFrame__corner premiumButtonFrame__corner--br" aria-hidden="true" />
          <i className="premiumButtonFrame__ornament premiumButtonFrame__ornament--top" aria-hidden="true" />
          <i className="premiumButtonFrame__ornament premiumButtonFrame__ornament--bottom" aria-hidden="true" />
          <button
            type="button"
            className="premiumButton"
            disabled={!isEnabled || isLoading}
            aria-disabled={!isEnabled || isLoading}
            data-purchase-disabled={!purchaseConfirmed || undefined}
            onClick={handlePurchaseClick}
          >
            <span className="premiumButton__label">{buttonLabel}</span>
            <span className="premiumButton__arrow" aria-hidden="true">→</span>
          </button>
          {isEnabled ? (
            <div className="premiumPurchaseReassurance" role="note">
              <span>決済は完了していません。</span>
              <span>料金は請求されていません。</span>
            </div>
          ) : null}
        </div>
      </div>

      {showCheckoutError ? (
        <p className="premiumError" role="alert">
          {checkoutError}
        </p>
      ) : null}
    </section>
  );
}

export default PremiumCard;
