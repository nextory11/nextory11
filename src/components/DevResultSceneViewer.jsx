import { useEffect, useMemo, useRef, useState } from "react";
import { resultTypes } from "../data/resultTypes.js";
import { resultScenes } from "../data/resultScenes.js";
import ResultCard from "./ResultCard.jsx";
import ResultScene from "./ResultScene.jsx";
import PremiumCard from "./PremiumCard.jsx";
import { createPreviewAnswers, cyclePreviewType, DEV_RESULT_PREVIEW_SECTIONS } from "../lib/devResultPreview.js";
import { getPaidCtaEnabled, redirectToStripeCheckout } from "../lib/stripeCheckout.js";

const SECTIONS = [
  ["full", "Full Result Scene"],
  ["header", "Header / Emblem"],
  ["juza", "AI JUZA"],
  ["insights", "Insight Cards"],
  ["premium", "Premium CTA"],
  ["scroll", "Full-page Scroll"],
];

const VIEWPORTS = ["Desktop", "Tablet", "Mobile"];

function normalizeSection(value) { return DEV_RESULT_PREVIEW_SECTIONS.includes(value) ? value : "full"; }

function updatePreviewUrl({ previewType, section, controls }) {
  const params = new URLSearchParams(window.location.search);
  params.set("devPreview", "result");
  params.set("previewType", previewType);
  params.set("section", section);
  params.set("controls", controls);
  window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}${window.location.hash}`);
}

function DevResultSceneViewer({ initialPreviewType, initialSection, initialControls, officialSlugs, officialToLegacyType }) {
  const [officialSlug, setOfficialSlug] = useState(initialPreviewType);
  const [section, setSection] = useState(normalizeSection(initialSection));
  const [controlsHidden, setControlsHidden] = useState(initialControls === "hidden");
  const [collapsed, setCollapsed] = useState(false);
  const [viewport, setViewport] = useState("Desktop");
  const [showFrames, setShowFrames] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [pauseMotion, setPauseMotion] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [backgroundOnly, setBackgroundOnly] = useState(false);
  const [hideBackground, setHideBackground] = useState(false);
  const [hideOrnaments, setHideOrnaments] = useState(false);
  const [hideJuza, setHideJuza] = useState(false);
  const [hideInsights, setHideInsights] = useState(false);
  const [hidePremium, setHidePremium] = useState(false);
  const [paidCtaEnabled, setPaidCtaEnabled] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const checkoutInFlightRef = useRef(false);

  const validSlug = officialSlugs.includes(officialSlug);
  const activeOfficialSlug = validSlug ? officialSlug : officialSlugs[0];
  const resultType = officialToLegacyType[activeOfficialSlug];
  const result = resultTypes[resultType];
  const scene = resultScenes[resultType];
  const answers = useMemo(() => createPreviewAnswers(resultType, Object.keys(resultTypes)), [resultType]);
  const invalidConfiguration = !validSlug || !result || !scene;

  useEffect(() => {
    const originalRobots = document.querySelector('meta[name="robots"]')?.getAttribute("content");
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.append(meta);
    }
    meta.content = "noindex, nofollow, noarchive";
    return () => {
      if (originalRobots == null) meta.remove();
      else meta.content = originalRobots;
    };
  }, []);

  useEffect(() => {
    updatePreviewUrl({ previewType: officialSlug, section, controls: controlsHidden ? "hidden" : "visible" });
  }, [officialSlug, section, controlsHidden]);

  useEffect(() => {
    let active = true;
    getPaidCtaEnabled().then((enabled) => {
      if (active) setPaidCtaEnabled(enabled);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName;
      if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(tag)) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setOfficialSlug(cyclePreviewType(officialSlugs, officialSlug, -1));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setOfficialSlug(cyclePreviewType(officialSlugs, officialSlug, 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [officialSlug, officialSlugs]);

  const move = (offset) => setOfficialSlug(cyclePreviewType(officialSlugs, officialSlug, offset));
  const closePreview = () => {
    const url = new URL(window.location.href);
    ["devPreview", "previewType", "section", "controls"].forEach((key) => url.searchParams.delete(key));
    window.location.assign(`${url.pathname}${url.search}${url.hash}`);
  };
  const startTestCheckout = async () => {
    if (checkoutInFlightRef.current) return;
    checkoutInFlightRef.current = true;
    setCheckoutError("");
    setCheckoutLoading(true);
    try {
      const checkoutAnswers = answers.map((answer, index) => ({
        ...answer,
        questionId: index + 1,
        answerLabel: "A",
      }));
      await redirectToStripeCheckout({ answers: checkoutAnswers, result, resultType });
    } catch {
      setCheckoutError("開発用の安全な決済セッションを開始できませんでした。");
    } finally {
      checkoutInFlightRef.current = false;
      setCheckoutLoading(false);
    }
  };

  if (invalidConfiguration) {
    return (
      <main className="devResultPreview devResultPreview--error" role="alert">
        <h1>Result Scene Preview configuration error</h1>
        <p>Unknown or incomplete preview type: <code>{initialPreviewType}</code>.</p>
        <p>Supported types: {officialSlugs.join(", ")}</p>
        <button type="button" onClick={closePreview}>Exit preview</button>
      </main>
    );
  }

  const viewerClass = [
    "devResultPreview",
    `devResultPreview--${viewport.toLowerCase()}`,
    `devResultPreview--section-${backgroundOnly ? "background" : section}`,
    showFrames && "devResultPreview--showFrames",
    showSafeArea && "devResultPreview--showSafeArea",
    showNames && "devResultPreview--showNames",
    pauseMotion && "devResultPreview--pauseMotion",
    reducedMotion && "devResultPreview--reducedMotion",
    hideBackground && "devResultPreview--hideBackground",
    hideOrnaments && "devResultPreview--hideOrnaments",
    hideJuza && "devResultPreview--hideJuza",
    hideInsights && "devResultPreview--hideInsights",
    hidePremium && "devResultPreview--hidePremium",
  ].filter(Boolean).join(" ");

  return (
    <main className={viewerClass} data-preview-type={activeOfficialSlug} data-section={section}>
      <section className="resultHero" data-star-type={resultType}>
        <ResultScene scene={scene} />
        <ResultCard answers={answers} result={result} resultType={resultType} scene={scene} />
        <PremiumCard
          checkoutError={checkoutError}
          isEnabled={paidCtaEnabled}
          isLoading={checkoutLoading}
          onClick={startTestCheckout}
          resultType={resultType}
        />
      </section>

      {!controlsHidden ? (
        <aside className={`devResultPreview__controls ${collapsed ? "is-collapsed" : ""}`} aria-label="Result Scene preview controls">
          <header>
            <div><small>DEV ONLY</small><strong>{result.en}</strong><span>{activeOfficialSlug}</span></div>
            <button type="button" onClick={() => setCollapsed((value) => !value)} aria-expanded={!collapsed}>{collapsed ? "Open" : "Collapse"}</button>
          </header>
          {!collapsed ? <>
            <label>Type<select value={activeOfficialSlug} onChange={(event) => setOfficialSlug(event.target.value)}>{officialSlugs.map((slug) => <option key={slug} value={slug}>{slug}</option>)}</select></label>
            <div className="devResultPreview__nav"><button type="button" onClick={() => move(-1)}>← Previous</button><button type="button" onClick={() => move(1)}>Next →</button></div>
            <label>Section<select value={section} onChange={(event) => setSection(normalizeSection(event.target.value))}>{SECTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            <label>Viewport<select value={viewport} onChange={(event) => setViewport(event.target.value)}>{VIEWPORTS.map((label) => <option key={label}>{label}</option>)}</select></label>
            <p className="devResultPreview__hint">Viewport labels document the review target. Resize the browser for real responsive rendering.</p>
            <div className="devResultPreview__toggles">
              {[[showFrames, setShowFrames, "Frame boundaries"], [showSafeArea, setShowSafeArea, "Safe area"], [showNames, setShowNames, "Component names"], [pauseMotion, setPauseMotion, "Pause animations"], [reducedMotion, setReducedMotion, "Reduced motion"], [backgroundOnly, setBackgroundOnly, "Background only"], [hideBackground, setHideBackground, "Hide background"], [hideOrnaments, setHideOrnaments, "Hide ornaments"], [hideJuza, setHideJuza, "Hide AI JUZA"], [hideInsights, setHideInsights, "Hide insight cards"], [hidePremium, setHidePremium, "Hide Premium CTA"]].map(([checked, setter, label]) => <label key={label}><input type="checkbox" checked={checked} onChange={(event) => setter(event.target.checked)} />{label}</label>)}
            </div>
            <div className="devResultPreview__nav"><button type="button" onClick={() => window.location.reload()}>Refresh</button><button type="button" onClick={() => setControlsHidden(true)}>Clean screenshot</button><button type="button" onClick={closePreview}>Exit</button></div>
          </> : null}
        </aside>
      ) : <button type="button" className="devResultPreview__restore" onClick={() => setControlsHidden(false)}>Show preview controls</button>}
    </main>
  );
}

export default DevResultSceneViewer;
