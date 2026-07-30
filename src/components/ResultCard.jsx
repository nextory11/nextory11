import { useEffect, useMemo, useState } from "react";
import { createAiJuzaReading } from "../lib/aiJuza";
import PanelFrameOrnaments from "./PanelFrameOrnaments";

function CelestialTraitIcon({ index, type }) {
  const motifs = {
    action: <path d="M12 20 18 9l3 7 3-4 4 8M20 25v-6M17 22l3 3 3-3" />,
    creator: <path d="M11 22c5-1 6-9 11-11 2-1 4 1 3 3-2 5-10 5-11 11m8-14 3-3m-1 0 3 3" />,
    intuition: <path d="M9 18c5-8 13-8 18 0-5 8-13 8-18 0Zm11-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />,
    thinker: <path d="M8 18c4-6 8-6 12 0s8 6 12 0c-4-6-8-6-12 0s-8 6-12 0Z" />,
    empathy: <path d="M20 28S9 22 9 14c0-6 8-7 11-1 3-6 11-5 11 1 0 8-11 14-11 14Z" />,
    expression: <path d="M20 7v22M9 18h22M12 10l16 16M28 10 12 26M20 11l4 7-4 7-4-7 4-7Z" />,
    explorer: <path d="M20 7 24 16 33 20 24 24 20 33 16 24 7 20 16 16 20 7Zm0 9-3 7 7-3-4-4Z" />,
    challenger: <path d="M20 31c-7-3-9-8-6-14 2 3 4 2 4-2 0-4 3-7 5-9 1 6 7 8 5 16-1 5-4 8-8 9Zm0-4c4-2 4-6 1-9-1 3-5 5-1 9Z" />,
    leader: <path d="M8 22c6-10 18-10 24 0M12 26c4-6 12-6 16 0M20 8v20M16 12l4-4 4 4" />,
    persistence: <path d="M20 7 30 11v8c0 7-4 11-10 14-6-3-10-7-10-14v-8l10-4Zm-4 13 3 3 6-7" />,
    adaptability: <path d="M20 31V14m0 4-7-5m7 8 8-6m-8 9-5 4m5-14c-3 0-5-2-5-5 3 0 5 2 5 5Zm0 0c3 0 5-2 5-5-3 0-5 2-5 5Z" />,
  };
  const roleMotifs = [
    <path key="core" className="adviceBox__roleMotif" d="M20 10 23 17 30 20 23 23 20 30 17 23 10 20 17 17 20 10Zm0 6 2 4-2 4-2-4 2-4Z" />,
    <path key="talent" className="adviceBox__roleMotif" d="M12 26 17 13l3 6 4-10 4 10 4-4-3 13-9 3-8-5Zm8-7 4 3 4-3" />,
    <path key="step" className="adviceBox__roleMotif" d="M11 29h18V14H17v15m3-7h9m-4-4 4 4-4 4M14 32h18" />,
  ];

  return (
    <span className="adviceBox__icon" aria-hidden="true">
      <svg viewBox="0 0 40 40" focusable="false">
        <circle cx="20" cy="20" r="16" />
        <circle className="adviceBox__orbit" cx="20" cy="20" r="13" />
        <g className="adviceBox__typeSigil">{motifs[type] ?? motifs.explorer}</g>
        {roleMotifs[index]}
        <circle className="adviceBox__star" cx={index === 0 ? 8 : index === 1 ? 30 : 12} cy={index === 0 ? 12 : index === 1 ? 10 : 30} r="1.4" />
      </svg>
    </span>
  );
}

function ResultCard({ answers, result, resultType, scene, questionBankContext = null }) {
  const isChallenge = resultType === "challenger";
  const isCreator = resultType === "creator";
  const isIntuitive = resultType === "intuition";
  const isHarmonizer = resultType === "thinker";
  const isPioneer = resultType === "action";
  const isVisionary = resultType === "leader";
  const architecturalFrames = {
    empathy: {
      folder: "empath",
      emblem: "emblem.png",
    },
    adaptability: {
      folder: "evolver",
      emblem: "emblem.png",
    },
    expression: {
      folder: "light-bringer",
      emblem: "emblem.png",
      insightFrame: "frame02.png",
    },
    persistence: {
      folder: "guardian",
      emblem: "Guardian_Emblem.png",
      insightFrame: "frame03.png",
    },
    explorer: {
      folder: "explorer",
      emblem: "emblem.png",
      insightFrame: "frame02.png",
    },
    intuition: {
      folder: "intuitive",
      emblem: "emblem.png",
      insightFrame: "frame02.png",
    },
    thinker: {
      folder: "harmonizer",
      emblem: "emblem.png",
      insightFrame: "frame02.png",
    },
    action: {
      folder: "pioneer",
      emblem: "emblem.png",
      insightFrame: "frame02.png",
    },
    leader: {
      folder: "visionary",
      emblem: "Visionary_Emblem.png",
      insightFrame: "frame02.png",
    },
  };
  const architecturalFrame = architecturalFrames[resultType] ?? null;
  const reading = useMemo(
    () => createAiJuzaReading({ answers, result, resultType, questionBankContext }),
    [answers, result, resultType, questionBankContext],
  );
  const [spokenMessage, setSpokenMessage] = useState("");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setSpokenMessage(reading.message);
      return undefined;
    }

    setSpokenMessage("");
    let cursor = 0;
    let intervalId;
    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        cursor = Math.min(cursor + 2, reading.message.length);
        setSpokenMessage(reading.message.slice(0, cursor));
        if (cursor >= reading.message.length) window.clearInterval(intervalId);
      }, 34);
    }, isChallenge ? 1800 : 6600);

    return () => {
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
    };
  }, [isChallenge, reading.message]);

  const juzaPanel = (
    <blockquote
      className="juzaMessage juzaMessage--personalized"
      data-answer-count={reading.profile.answerCount}
      data-primary-score={reading.profile.primaryScore}
      data-speaking={spokenMessage.length > 0 && spokenMessage.length < reading.message.length}
      aria-label={`AI JUZAからのメッセージ: ${reading.message}`}
    >
      <PanelFrameOrnaments />
      {isCreator ? <img className="creatorFrameAsset creatorFrameAsset--juza" src="/images/result-scenes/creator/overlays/ai_juza_frame.png" alt="" aria-hidden="true" /> : null}
      {isHarmonizer ? (
        <>
          <span className="harmonizerJuzaGlass" aria-hidden="true" />
          <img className="harmonizerJuzaFrame" src="/images/result-scenes/harmonizer/overlays/ai_juza_frame.png" alt="" aria-hidden="true" />
          <img className="harmonizerJuzaPortrait" src="/images/result-scenes/harmonizer/characters/ai_juza_portrait.png" alt="" aria-hidden="true" />
        </>
      ) : null}
      {isPioneer ? (
        <>
          <span className="pioneerJuzaGlass" aria-hidden="true" />
          <img className="pioneerJuzaPortrait" src="/images/result-scenes/pioneer/characters/ai_juza_portrait_cosmic.png" alt="" aria-hidden="true" />
          <img className="pioneerJuzaFrame" src="/images/result-scenes/pioneer/overlays/ai_juza_frame.png" alt="" aria-hidden="true" />
        </>
      ) : null}
      {isVisionary ? (
        <>
          <span className="visionaryJuzaGlass" aria-hidden="true" />
          <img className="visionaryJuzaPortrait" src="/images/result-scenes/visionary/characters/ai_juza_portrait.png" alt="" aria-hidden="true" />
          <img className="visionaryJuzaFrame" src="/images/result-scenes/visionary/overlays/ai_juza_frame.png" alt="" aria-hidden="true" />
        </>
      ) : null}
      {resultType === "expression" ? (
        <img
          className="luminaryJuzaPortrait"
          src="/images/result-scenes/light-bringer/characters/ai_juza_portrait.png"
          alt=""
          aria-hidden="true"
        />
      ) : null}
      {architecturalFrame && !isPioneer && resultType !== "leader" ? <img className="typeFrameAsset typeFrameAsset--juza" src={`/images/result-scenes/${architecturalFrame.folder}/overlays/${isIntuitive ? "ai_juza_frame_transparent.png" : "ai_juza_frame.png"}`} alt="" aria-hidden="true" /> : null}
      {resultType === "expression" ? (
        <img
          className="luminaryJuzaForeground"
          src="/images/result-scenes/light-bringer/overlays/ai_juza_frame.png"
          alt=""
          aria-hidden="true"
        />
      ) : null}
      {resultType === "expression" ? <span className="luminaryGlass luminaryGlass--juza" aria-hidden="true" /> : null}
      {resultType === "persistence" ? <img className="typeFrameAsset guardianJuzaPortrait" src="/images/result-scenes/guardian/characters/ai_juza_portrait.png" alt="" aria-hidden="true" /> : null}
      <b className="juzaMessage__particles" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
      </b>
      <p aria-hidden="true">
        {spokenMessage}
        <i className="juzaMessage__cursor" aria-hidden="true" />
      </p>
    </blockquote>
  );

  const insightSection = (
    <>
      {isChallenge ? <div className="challengeSectionTitle"><span>YOUR STRENGTHS</span></div> : null}
      <div className="resultGrid">
        <article className="adviceBox">
          <PanelFrameOrnaments />
          {isCreator ? <img className="creatorFrameAsset creatorFrameAsset--insight" src="/images/result-scenes/creator/overlays/frame02.png" alt="" aria-hidden="true" /> : null}
          {architecturalFrame ? <img className="typeFrameAsset typeFrameAsset--insight" src={`/images/result-scenes/${architecturalFrame.folder}/overlays/${architecturalFrame.insightFrame ?? "frame02.png"}`} alt="" aria-hidden="true" /> : null}
          {resultType === "expression" ? <span className="luminaryGlass luminaryGlass--insight" aria-hidden="true" /> : null}
          <CelestialTraitIcon type={resultType} index={0} />
          <strong>あなたの星の本質</strong>
          <p>{result.essence}</p>
        </article>

        <article className="adviceBox">
          <PanelFrameOrnaments />
          {isCreator ? <img className="creatorFrameAsset creatorFrameAsset--insight" src="/images/result-scenes/creator/overlays/frame02.png" alt="" aria-hidden="true" /> : null}
          {architecturalFrame ? <img className="typeFrameAsset typeFrameAsset--insight" src={`/images/result-scenes/${architecturalFrame.folder}/overlays/${architecturalFrame.insightFrame ?? "frame02.png"}`} alt="" aria-hidden="true" /> : null}
          {resultType === "expression" ? <span className="luminaryGlass luminaryGlass--insight" aria-hidden="true" /> : null}
          <CelestialTraitIcon type={resultType} index={1} />
          <strong>あなたの才能</strong>
          <p>{result.strength}</p>
        </article>

        <article className="adviceBox">
          <PanelFrameOrnaments />
          {isCreator ? <img className="creatorFrameAsset creatorFrameAsset--insight" src="/images/result-scenes/creator/overlays/frame02.png" alt="" aria-hidden="true" /> : null}
          {architecturalFrame ? <img className="typeFrameAsset typeFrameAsset--insight" src={`/images/result-scenes/${architecturalFrame.folder}/overlays/${architecturalFrame.insightFrame ?? "frame02.png"}`} alt="" aria-hidden="true" /> : null}
          {resultType === "expression" ? <span className="luminaryGlass luminaryGlass--insight" aria-hidden="true" /> : null}
          <CelestialTraitIcon type={resultType} index={2} />
          <strong>今日の一歩</strong>
          <p>{result.mission}</p>
        </article>
      </div>
    </>
  );

  return (
    <div className={`resultCard${isChallenge ? " resultCard--challengeMaster" : ""}`} aria-label="NEXTORY11 diagnosis result">
      <div className="resultCard__aura" aria-hidden="true" />
      {isChallenge ? (
        <section className="challengeTopArtifact">
          <PanelFrameOrnaments />
          <header className="challengeIdentity">
            <div className="resultIcon challengeIdentity__emblem" aria-hidden="true">
              <img src="/images/result-scenes/challenge/icons/emblem.png" alt="" />
            </div>
            <div className="english challengeIdentity__english">CHALLENGE</div>
            <h1 className="resultTitle challengeIdentity__title">{result.title}</h1>
            <p className="challengeIdentity__message">限界を超え、未来を切り拓く勇気を持つあなたへ。</p>
            <p className="resultLead challengeIdentity__lead">Break the limit. Become your future.</p>
          </header>
          {juzaPanel}
          {insightSection}
        </section>
      ) : (
        <>
          <div className="resultBadge">YOUR STAR TYPE</div>
          {resultType !== "persistence" ? <div className="resultRealm">{scene.realm}</div> : null}
          <div className="resultIcon" aria-hidden="true">
            {isCreator ? <img src="/images/result-scenes/creator/icons/emblem.png" alt="" /> : architecturalFrame ? <img src={`/images/result-scenes/${architecturalFrame.folder}/icons/${architecturalFrame.emblem}`} alt="" /> : <span>{scene.glyph}</span>}
          </div>

          <p className="resultKicker">あなたの中で目覚めた星</p>
          {resultType === "persistence" ? <div className="guardianEnglishTitle">GUARDIAN</div> : null}
          <h1 className="resultTitle">{result.title}</h1>
          <div className="english">{result.en}</div>
          <p className="resultLead">
            11の回答から映し出された、今のあなたを導く星の輪郭です。
          </p>
          {isIntuitive ? (
            <section className="intuitiveGuidanceFrame" aria-label="AI JUZA and intuitive insights">
              <img
                className="intuitiveGuidanceFrame__asset"
                src="/images/result-scenes/intuitive/overlays/frame02.png"
                alt=""
                aria-hidden="true"
              />
              {juzaPanel}
              {insightSection}
            </section>
          ) : juzaPanel}
        </>
      )}
      {!isChallenge && !isIntuitive ? insightSection : null}
    </div>
  );
}

export default ResultCard;
