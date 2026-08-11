import { useEffect, useRef, useState } from "react";
import { DIAGNOSIS_PATH, isPreviewPath, toOfficialHref, toPreviewRoute } from "../routing.js";

const navigationItems = [
  ["TOP", "/official-preview"],
  ["NEXTORY11とは？", "/official-preview/about"],
  ["NEXTORY11の使い方", "/official-preview/how-to-use"],
  ["11のタイプ", "/official-preview/types"],
  ["なぜ、NEXTORY11なのか。", "/official-preview/why-nextory11"],
  ["PHILOSOPHY", "/official-preview/philosophy"],
];

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}

function OfficialSiteShell({ children, pageTitle, pageKey, seo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const triggerRef = useRef(null);
  const drawerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const warpTimerRef = useRef(null);
  const currentPath = toPreviewRoute();
  const isTypeWorldPage = /^\/official-preview\/types\/[a-z-]+$/.test(currentPath);
  const returnHref = isTypeWorldPage ? "/official-preview/types" : "/official-preview";
  const returnLabel = isTypeWorldPage ? "11タイプ" : "TOP";
  const returnAriaLabel = isTypeWorldPage ? "11タイプ一覧へ戻る" : "TOPページへ戻る";

  const cancelScheduledClose = () => {
    window.clearTimeout(closeTimerRef.current);
  };

  const hasFineHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const scheduleClose = () => {
    cancelScheduledClose();
    if (hasFineHover()) {
      closeTimerRef.current = window.setTimeout(() => setIsOpen(false), 340);
    }
  };

  useEffect(() => {
    document.title = seo.title;
    upsertMeta('meta[name="description"]', { name: "description", content: seo.description });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: isPreviewPath() ? "noindex, nofollow, noarchive" : "index, follow",
    });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: seo.title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: seo.description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: seo.canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: seo.imageUrl });
    upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: "ja_JP" });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "NEXTORY11" });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: seo.title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: seo.description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: seo.imageUrl });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = seo.canonicalUrl;

    let structuredData = document.head.querySelector("#official-site-structured-data");
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.id = "official-site-structured-data";
      structuredData.type = "application/ld+json";
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: seo.title,
      description: seo.description,
      url: seo.canonicalUrl,
      inLanguage: "ja-JP",
      isPartOf: {
        "@type": "WebSite",
        name: "NEXTORY11",
        url: new URL("/", seo.canonicalUrl).href,
      },
    });
    window.scrollTo(0, 0);
    const frame = window.requestAnimationFrame(() => setIsEntering(false));
    return () => window.cancelAnimationFrame(frame);
  }, [pageTitle, seo]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => () => {
    cancelScheduledClose();
    window.clearTimeout(warpTimerRef.current);
  }, []);

  const handleOfficialNavigation = (event) => {
    if (isWarping || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest("a");
    if (!anchor || anchor.target || anchor.hasAttribute("download")) return;

    const destination = new URL(anchor.href, window.location.href);
    if (destination.origin !== window.location.origin) return;
    if (destination.pathname === DIAGNOSIS_PATH) return;
    if (!toPreviewRoute(destination.pathname).startsWith("/official-preview")) return;
    if (`${destination.pathname}${destination.search}${destination.hash}` === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;

    event.preventDefault();
    setIsOpen(false);
    setIsWarping(true);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const width = window.innerWidth;
    const duration = reducedMotion ? 70 : width <= 767 ? 260 : width <= 1099 ? 300 : 320;
    warpTimerRef.current = window.setTimeout(() => window.location.assign(destination.href), duration);
  };

  return (
    <div
      className={`officialSite officialSite--${pageKey}${isWarping ? " officialSite--warping" : ""}${isEntering ? " officialSite--entering" : ""}`}
      onClickCapture={handleOfficialNavigation}
    >
      <div className="officialSite__world">
      {currentPath !== "/official-preview" && (
        <a className="officialTopLink" href={toOfficialHref(returnHref)} aria-label={returnAriaLabel}>
          <span aria-hidden="true">←</span> {returnLabel}
        </a>
      )}
      <button
        ref={triggerRef}
        className="officialMenu__trigger"
        type="button"
        aria-label="メニューを開く"
        aria-expanded={isOpen}
        aria-controls="official-navigation"
        onClick={() => setIsOpen((open) => (hasFineHover() ? true : !open))}
        onMouseEnter={() => {
          cancelScheduledClose();
          if (hasFineHover()) setIsOpen(true);
        }}
        onMouseLeave={scheduleClose}
      >
        <span>MENU</span>
        <span className="officialMenu__triggerIcon" aria-hidden="true"><i /><i /><i /></span>
      </button>

      {children}

      <div className={`officialMenu${isOpen ? " officialMenu--open" : ""}`} aria-hidden={!isOpen}>
        <button
          className="officialMenu__backdrop"
          type="button"
          aria-label="メニューを閉じる"
          tabIndex={-1}
          onClick={() => setIsOpen(false)}
        />
        <aside
          id="official-navigation"
          ref={drawerRef}
          className="officialMenu__drawer"
          aria-label="Official Website navigation"
          aria-modal="false"
          role="dialog"
          onMouseEnter={() => {
            cancelScheduledClose();
          }}
          onMouseLeave={scheduleClose}
        >
          <div className="officialMenu__heading">
            <span>NEXTORY11</span>
            <button type="button" aria-label="メニューを閉じる" onClick={() => setIsOpen(false)}>
              <i aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Official Website pages">
            <ul>
              {navigationItems.map(([label, href]) => (
                <li key={href}>
                  <a href={toOfficialHref(href)} aria-current={currentPath === href ? "page" : undefined}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <a className="officialMenu__cta" href={DIAGNOSIS_PATH}>
            <span>自分の星を見つける</span><span aria-hidden="true">→</span>
          </a>
          <p className="officialMenu__signature">― Find Your Star. ―</p>
        </aside>
      </div>
      </div>

      <div className="officialWarp" aria-hidden="true">
        <span className="officialWarp__core" />
        <span className="officialWarp__streaks" />
      </div>
    </div>
  );
}

export default OfficialSiteShell;
