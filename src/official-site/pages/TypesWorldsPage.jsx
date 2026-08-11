import { useState } from "react";
import { officialTypes } from "../data/officialTypes.js";
import { DIAGNOSIS_PATH, toOfficialHref } from "../routing.js";

const WORLD_IMAGE = "/official-site/images/types/nextory11-11-worlds-desktop-final-approved-v2.webp";
const MOBILE_WORLD_IMAGE = "/official-site/images/types/mobile/nextory11-11-worlds-mobile-final-approved.webp";
const officialOrder = ["Challenge", "Explorer", "Harmony", "Visionary", "Creator", "Guardian", "Luminary", "Pioneer", "Evolver", "Empath", "Intuitive"];
const worldTypes = officialOrder.map((name) => officialTypes.find((type) => type.name === name));
const desktopPositions = [
  [49.2, 45], [39, 48], [32.8, 55], [31, 64.4], [36.6, 71.1], [43.9, 75.5],
  [53.8, 75.5], [61.4, 71], [67.3, 64.6], [66.1, 55], [59.3, 48],
];
const mobilePositions = [[49.94,36.23],[29.78,37.96],[19.93,46.15],[20.4,54.88],[27.67,62.04],[41.27,67.79],[59.2,67.73],[72.45,61.82],[79.84,54.61],[79.72,46.1],[71.04,37.96]];
const mobileGlowInsets = [7.2,8.5,9.4,11.3,7.2,9,9,10,9.5,8,7.5];
const desktopLabelCorrections = [
  { name: "Pioneer", description: "開拓と挑戦の世界", left: 68.2, top: 74.8 },
  { name: "Evolver", description: "進化と変容の世界", left: 75, top: 64.4 },
  { name: "Empath", description: "共感と癒しの世界", left: 73.4, top: 52.5 },
  { name: "Intuitive", description: "直感と導きの世界", left: 66.2, top: 43.1 },
];

function TypesWorldsPage() {
  const [activePortal, setActivePortal] = useState("");

  return (
    <main className="worldsPage" aria-labelledby="worlds-page-title">
      <h1 id="worlds-page-title" className="worldsPage__srOnly">11のタイプ</h1>
      <div className="worldsPage__canvas">
        <picture>
          <source media="(max-width: 767px), (min-width: 768px) and (max-width: 1099px) and (orientation: portrait), (max-height: 600px) and (orientation: landscape)" srcSet={MOBILE_WORLD_IMAGE} />
          <img className="worldsPage__master" src={WORLD_IMAGE} alt="11 WORLDS — 11のタイプ" draggable="false" />
        </picture>
        <nav className="worldsPage__portals" aria-label="11のタイプの世界">
          {worldTypes.map((type, index) => {
            const slug = type.name.toLowerCase();
            const [left, top] = desktopPositions[index];
            const [mobileLeft, mobileTop] = mobilePositions[index];
            return (
              <a
                key={type.name}
                className={`worldsPage__portal${activePortal === slug ? " worldsPage__portal--active" : ""}`}
                href={toOfficialHref(`/official-preview/types/${slug}`)}
                aria-label={`${type.name}の世界を見る`}
                onPointerDown={() => setActivePortal(slug)}
                style={{ "--planet-color": type.color, "--planet-left": `${left}%`, "--planet-top": `${top}%`, "--mobile-left": `${mobileLeft}%`, "--mobile-top": `${mobileTop}%`, "--mobile-glow-inset": `${mobileGlowInsets[index]}%`, "--crop-x": `${(left - 2.5) / .95}%`, "--crop-y": `${(top - 1.667) / .96666}%`, "--mobile-crop-x": `${(mobileLeft - 6.5) / .87}%`, "--mobile-crop-y": `${(mobileTop - 3.007) / .93986}%` }}
              >
                <span className="worldsPage__planetCrop" aria-hidden="true"><span className="worldsPage__planetImage" /></span>
                <span className="worldsPage__portalName">{type.name}</span>
              </a>
            );
          })}
        </nav>
        <div className="worldsPage__desktopLabelCorrections" aria-hidden="true">
          {desktopLabelCorrections.map((label) => (
            <span key={label.name} style={{ left: `${label.left}%`, top: `${label.top}%` }}>
              <strong>{label.name}</strong><small>{label.description}</small>
            </span>
          ))}
        </div>
        <a className="worldsPage__diagnosisCta" href={DIAGNOSIS_PATH} aria-label="NEXTORY11を診断する" />
      </div>
    </main>
  );
}

export default TypesWorldsPage;
