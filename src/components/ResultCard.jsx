import { useEffect, useMemo, useRef, useState } from "react";
import { createAiJuzaReading, createJuzaContext } from "../lib/aiJuza";
import { selectRandomMessageIndex } from "../lib/aiJuza/randomSelection";
import { challengeAiJuzaMessages } from "../data/challengeOfficialResultCopy";
import { explorerAiJuzaMessages, explorerStarReadings } from "../data/explorerOfficialResultCopy";
import { harmonyAiJuzaMessages, harmonyStarReadings } from "../data/harmonyOfficialResultCopy";
import { visionaryAiJuzaMessages, visionaryStarReadings, visionaryTypeDescriptor } from "../data/visionaryOfficialResultCopy";
import { intuitiveAiJuzaMessages, intuitiveStarReadings } from "../data/intuitiveOfficialResultCopy";
import { empathAiJuzaMessages, empathStarReadings } from "../data/empathOfficialResultCopy";
import { evolverAiJuzaMessages, evolverStarReadings } from "../data/evolverOfficialResultCopy";
import { pioneerAiJuzaMessages, pioneerStarReadings } from "../data/pioneerOfficialResultCopy";
import { creatorAiJuzaMessages, creatorStarReadings, creatorTypeDescriptor } from "../data/creatorOfficialResultCopy";
import { luminaryAiJuzaMessages, luminaryStarReadings } from "../data/luminaryOfficialResultCopy";
import { guardianAiJuzaMessages, guardianStarReadings, guardianTypeDescriptor } from "../data/guardianOfficialResultCopy";
import PanelFrameOrnaments from "./PanelFrameOrnaments";
import StarReadingSection from "./StarReadingSection";

const OFFICIAL_AI_JUZA_RESULT_TYPES = new Set([
  "challenger",
  "explorer",
  "thinker",
  "leader",
  "persistence",
  "expression",
  "creator",
  "action",
  "adaptability",
  "empathy",
  "intuition",
]);

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
    <path key="plan" className="adviceBox__roleMotif" d="M12 11h16v19H12V11Zm4-4h8v7h-8V7Zm1 12 2 2 4-5m-6 10h7" />,
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
  const isExplorer = resultType === "explorer";
  const isIntuitive = resultType === "intuition";
  const isHarmonizer = resultType === "thinker";
  const isPioneer = resultType === "action";
  const isVisionary = resultType === "leader";
  const isGuardian = resultType === "persistence";
  const isLuminary = resultType === "expression";
  const isEvolver = resultType === "adaptability";
  const isEmpath = resultType === "empathy";
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
  const baseReading = useMemo(
    () => {
      if (OFFICIAL_AI_JUZA_RESULT_TYPES.has(resultType)) {
        const context = createJuzaContext({ answers, result, resultType, questionBankContext });
        return { profile: context.profile, message: "" };
      }
      return createAiJuzaReading({ answers, result, resultType, questionBankContext });
    },
    [answers, result, resultType, questionBankContext],
  );
  const intuitiveMessageIndex = useMemo(
    () => selectRandomMessageIndex(intuitiveAiJuzaMessages),
    [resultType],
  );
  const empathMessageIndex = useMemo(
    () => selectRandomMessageIndex(empathAiJuzaMessages),
    [resultType],
  );
  const evolverMessageIndex = useMemo(
    () => selectRandomMessageIndex(evolverAiJuzaMessages),
    [resultType],
  );
  const pioneerMessageIndex = useMemo(
    () => selectRandomMessageIndex(pioneerAiJuzaMessages),
    [resultType],
  );
  const creatorMessageIndex = useMemo(
    () => selectRandomMessageIndex(creatorAiJuzaMessages),
    [resultType],
  );
  const luminaryMessageIndex = useMemo(
    () => selectRandomMessageIndex(luminaryAiJuzaMessages),
    [resultType],
  );
  const guardianMessageIndex = useMemo(
    () => selectRandomMessageIndex(guardianAiJuzaMessages),
    [resultType],
  );
  const challengeMessageIndex = useMemo(
    () => selectRandomMessageIndex(challengeAiJuzaMessages),
    [resultType],
  );
  const explorerMessageIndex = useMemo(
    () => selectRandomMessageIndex(explorerAiJuzaMessages),
    [resultType],
  );
  const harmonyMessageIndex = useMemo(
    () => selectRandomMessageIndex(harmonyAiJuzaMessages),
    [resultType],
  );
  const visionaryMessageIndex = useMemo(
    () => selectRandomMessageIndex(visionaryAiJuzaMessages),
    [resultType],
  );
  const reading = useMemo(() => {
    if (isChallenge) {
      return {
        ...baseReading,
        message: challengeAiJuzaMessages[challengeMessageIndex],
      };
    }
    if (isExplorer) {
      return {
        ...baseReading,
        message: explorerAiJuzaMessages[explorerMessageIndex],
      };
    }
    if (isHarmonizer) {
      const approvedMessage = harmonyAiJuzaMessages[harmonyMessageIndex];
      return {
        ...baseReading,
        message: approvedMessage.paragraphs.join("\n\n"),
      };
    }
    if (isVisionary) {
      const approvedMessage = visionaryAiJuzaMessages[visionaryMessageIndex];
      return {
        ...baseReading,
        message: approvedMessage.paragraphs.join("\n\n"),
      };
    }
    if (isPioneer) {
      const approvedMessage = pioneerAiJuzaMessages[pioneerMessageIndex];
      return {
        ...baseReading,
        message: approvedMessage.paragraphs.join("\n\n"),
      };
    }
    if (isCreator) {
      const approvedMessage = creatorAiJuzaMessages[creatorMessageIndex];
      return {
        ...baseReading,
        message: approvedMessage.paragraphs.join("\n\n"),
      };
    }
    if (isIntuitive) {
      const approvedMessage = intuitiveAiJuzaMessages[intuitiveMessageIndex];
      return {
        ...baseReading,
        message: approvedMessage.paragraphs.join("\n\n"),
      };
    }
    if (isEmpath) {
      const approvedMessage = empathAiJuzaMessages[empathMessageIndex];
      return {
        ...baseReading,
        message: approvedMessage.paragraphs.join("\n\n"),
      };
    }
    if (isEvolver) {
      const approvedMessage = evolverAiJuzaMessages[evolverMessageIndex];
      return {
        ...baseReading,
        message: approvedMessage.paragraphs.join("\n\n"),
      };
    }
    if (isLuminary) {
      const approvedMessage = luminaryAiJuzaMessages[luminaryMessageIndex];
      return {
        ...baseReading,
        message: approvedMessage.paragraphs.join("\n\n"),
      };
    }
    if (isGuardian) {
      const approvedMessage = guardianAiJuzaMessages[guardianMessageIndex];
      return {
        ...baseReading,
        message: approvedMessage.paragraphs.join("\n\n"),
      };
    }
    return baseReading;
  }, [baseReading, challengeMessageIndex, creatorMessageIndex, empathMessageIndex, evolverMessageIndex, explorerMessageIndex, guardianMessageIndex, harmonyMessageIndex, intuitiveMessageIndex, isChallenge, isCreator, isEmpath, isEvolver, isExplorer, isGuardian, isHarmonizer, isIntuitive, isLuminary, isPioneer, isVisionary, luminaryMessageIndex, pioneerMessageIndex, visionaryMessageIndex]);
  const [spokenMessage, setSpokenMessage] = useState("");
  const [explorerMessageExpanded, setExplorerMessageExpanded] = useState(false);
  const juzaMessageTextRef = useRef(null);

  useEffect(() => {
    const desktopScrollTypes = new Set([
      "persistence",
      "creator",
      "action",
      "adaptability",
      "empathy",
      "intuition",
      "explorer",
    ]);
    const isDesktopLayout = window.matchMedia(
      "(min-width: 1100px), (min-width: 900px) and (orientation: landscape)",
    ).matches;

    if (desktopScrollTypes.has(resultType) && isDesktopLayout) {
      juzaMessageTextRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [reading.message, resultType]);

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
      className={`juzaMessage juzaMessage--personalized${isExplorer && explorerMessageExpanded ? " is-message-expanded" : ""}`}
      data-answer-count={reading.profile.answerCount}
      data-primary-score={reading.profile.primaryScore}
      data-speaking={spokenMessage.length > 0 && spokenMessage.length < reading.message.length}
      aria-label={`AI JUZAからのメッセージ: ${reading.message}`}
    >
      <PanelFrameOrnaments />
      {isCreator ? <img className="creatorFrameAsset creatorFrameAsset--juza" src="/images/result-scenes/creator/overlays/ai_juza_frame.png" alt="" aria-hidden="true" /> : null}
      {isCreator ? (
        <>
          <span className="creatorJuzaMobileGlass" aria-hidden="true" />
          <img className="creatorJuzaPortraitV2" src="/images/result-scenes/creator/characters/ai_juza_portrait_v2.png" alt="" aria-hidden="true" />
          <img className="creatorJuzaMobilePortraitFrame" src="/images/result-scenes/creator/overlays/ai_juza_mobile_portrait_frame.png" alt="" aria-hidden="true" />
          <img className="creatorJuzaMobileOuterFrame" src="/images/result-scenes/creator/overlays/ai_juza_mobile_outer_frame.png" alt="" aria-hidden="true" />
        </>
      ) : null}
      {isHarmonizer ? (
        <>
          <span className="harmonizerJuzaGlass" aria-hidden="true" />
          <img className="harmonizerJuzaFrame" src="/images/result-scenes/harmonizer/overlays/ai_juza_frame.png" alt="" aria-hidden="true" />
          <img className="harmonizerJuzaPortrait" src="/images/result-scenes/harmonizer/characters/ai_juza_portrait.png" alt="" aria-hidden="true" />
          <img className="harmonizerJuzaPortraitV2" src="/images/result-scenes/harmonizer/characters/ai_juza_portrait_v2.png" alt="" aria-hidden="true" />
          <img className="harmonizerJuzaMobileOuterFrame" src="/images/result-scenes/harmonizer/overlays/ai_juza_mobile_outer_frame.png" alt="" aria-hidden="true" />
          <img className="harmonizerJuzaMobilePortraitFrame" src="/images/result-scenes/harmonizer/overlays/ai_juza_mobile_portrait_frame.png" alt="" aria-hidden="true" />
        </>
      ) : null}
      {isPioneer ? (
        <>
          <span className="pioneerJuzaGlass" aria-hidden="true" />
          <img className="pioneerJuzaPortrait" src="/images/result-scenes/pioneer/characters/ai_juza_portrait_cosmic.png" alt="" aria-hidden="true" />
          <img className="pioneerJuzaFrame" src="/images/result-scenes/pioneer/overlays/ai_juza_frame.png" alt="" aria-hidden="true" />
          <img className="pioneerJuzaPortraitV2" src="/images/result-scenes/pioneer/characters/ai_juza_portrait_v2.png" alt="" aria-hidden="true" />
          <img className="pioneerJuzaMobilePortraitFrame" src="/images/result-scenes/pioneer/overlays/ai_juza_mobile_portrait_frame_v2.png" alt="" aria-hidden="true" />
          <img className="pioneerJuzaMobileOuterFrame" src="/images/result-scenes/pioneer/overlays/ai_juza_mobile_outer_frame.png" alt="" aria-hidden="true" />
        </>
      ) : null}
      {isEvolver ? (
        <>
          <span className="evolverJuzaMobileGlass" aria-hidden="true" />
          <img className="evolverJuzaPortraitV2" src="/images/result-scenes/evolver/characters/ai_juza_portrait_v2.png" alt="" aria-hidden="true" />
          <img className="evolverJuzaMobilePortraitFrame" src="/images/result-scenes/evolver/overlays/ai_juza_mobile_portrait_frame.png" alt="" aria-hidden="true" />
          <img className="evolverJuzaMobileOuterFrame" src="/images/result-scenes/evolver/overlays/ai_juza_mobile_outer_frame.png" alt="" aria-hidden="true" />
        </>
      ) : null}
      {isEmpath ? (
        <>
          <span className="empathJuzaMobileGlass" aria-hidden="true" />
          <img className="empathJuzaPortraitV2" src="/images/result-scenes/empath/characters/ai_juza_portrait_v2.png" alt="" aria-hidden="true" />
          <img className="empathJuzaMobilePortraitFrame" src="/images/result-scenes/empath/overlays/ai_juza_mobile_portrait_frame.png" alt="" aria-hidden="true" />
          <img className="empathJuzaMobileOuterFrame" src="/images/result-scenes/empath/overlays/ai_juza_mobile_outer_frame_v2.png" alt="" aria-hidden="true" />
        </>
      ) : null}
      {isIntuitive ? (
        <>
          <span className="intuitiveJuzaMobileGlass" aria-hidden="true" />
          <img className="intuitiveJuzaPortraitV2" src="/images/result-scenes/intuitive/characters/ai_juza_portrait_v2.png" alt="" aria-hidden="true" />
          <img className="intuitiveJuzaMobilePortraitFrame" src="/images/result-scenes/intuitive/overlays/ai_juza_mobile_portrait_frame.png" alt="" aria-hidden="true" />
          <img className="intuitiveJuzaMobileOuterFrame" src="/images/result-scenes/intuitive/overlays/ai_juza_mobile_outer_frame.png" alt="" aria-hidden="true" />
        </>
      ) : null}
      {isVisionary ? (
        <>
          <span className="visionaryJuzaGlass" aria-hidden="true" />
          <img className="visionaryJuzaPortrait" src="/images/result-scenes/visionary/characters/ai_juza_portrait.png" alt="" aria-hidden="true" />
          <img className="visionaryJuzaPortraitV2" src="/images/result-scenes/visionary/characters/ai_juza_portrait_v2.png" alt="" aria-hidden="true" />
          <img className="visionaryJuzaMobilePortraitFrame" src="/images/result-scenes/visionary/overlays/ai_juza_mobile_portrait_frame.png" alt="" aria-hidden="true" />
          <img className="visionaryJuzaFrame" src="/images/result-scenes/visionary/overlays/ai_juza_frame.png" alt="" aria-hidden="true" />
          <img className="visionaryJuzaMobileFrame" src="/images/result-scenes/visionary/overlays/ai_juza_mobile_outer_frame.png" alt="" aria-hidden="true" />
        </>
      ) : null}
      {isGuardian ? (
        <>
          <span className="guardianJuzaGlass" aria-hidden="true" />
          <img className="guardianJuzaPortraitV2" src="/images/result-scenes/guardian/characters/ai_juza_portrait_v2.png" alt="" aria-hidden="true" />
          <img className="guardianJuzaMobilePortraitFrame" src="/images/result-scenes/guardian/overlays/ai_juza_mobile_portrait_frame.png" alt="" aria-hidden="true" />
          <img className="guardianJuzaMobileOuterFrame" src="/images/result-scenes/guardian/overlays/ai_juza_mobile_outer_frame.png" alt="" aria-hidden="true" />
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
      {isLuminary ? (
        <>
          <span className="luminaryJuzaMobileGlass" aria-hidden="true" />
          <img className="luminaryJuzaPortraitV2" src="/images/result-scenes/light-bringer/characters/ai_juza_portrait_v2.png" alt="" aria-hidden="true" />
          <img
            className="luminaryJuzaPortraitFrameOfficial"
            src="/images/result-scenes/light-bringer/overlays/portrait_frame.png"
            alt=""
            aria-hidden="true"
          />
          <img className="luminaryJuzaMobilePortraitFrame" src="/images/result-scenes/light-bringer/overlays/ai_juza_mobile_portrait_frame.png" alt="" aria-hidden="true" />
          <img className="luminaryJuzaMobileOuterFrame" src="/images/result-scenes/light-bringer/overlays/ai_juza_mobile_outer_frame.png" alt="" aria-hidden="true" />
        </>
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
      {isExplorer ? (
        <header className="explorerJuzaHeading">
          <span>A MESSAGE FROM AI JUZA</span>
          <strong>AI JUZAからの言葉</strong>
        </header>
      ) : null}
      {isCreator ? (
        <header className="creatorJuzaMobileHeading">
          <span>A MESSAGE FROM AI JUZA</span>
          <strong>AI JUZAからの言葉</strong>
        </header>
      ) : null}
      {isPioneer ? (
        <header className="pioneerJuzaMobileHeading"><span>A MESSAGE FROM AI JUZA</span><strong>AI JUZAからの言葉</strong></header>
      ) : null}
      {isEvolver ? (
        <header className="evolverJuzaMobileHeading"><span>A MESSAGE FROM AI JUZA</span><strong>AI JUZAからの言葉</strong></header>
      ) : null}
      {isEmpath ? (
        <header className="empathJuzaMobileHeading"><span>A MESSAGE FROM AI JUZA</span><strong>AI JUZAからの言葉</strong></header>
      ) : null}
      {isIntuitive ? (
        <header className="intuitiveJuzaMobileHeading"><span>A MESSAGE FROM AI JUZA</span><strong>AI JUZAからの言葉</strong></header>
      ) : null}
      {isHarmonizer ? (
        <header className="harmonizerJuzaHeading">
          <span>A MESSAGE FROM AI JUZA</span>
          <strong>AI JUZAからの言葉</strong>
        </header>
      ) : null}
      {isVisionary ? (
        <header className="visionaryJuzaHeading">
          <span>A MESSAGE FROM AI JUZA</span>
          <strong>AI JUZAからの言葉</strong>
        </header>
      ) : null}
      {isGuardian ? (
        <header className="guardianJuzaHeading">
          <span>A MESSAGE FROM AI JUZA</span>
          <strong>AI JUZAからの言葉</strong>
        </header>
      ) : null}
      {isLuminary ? (
        <header className="luminaryJuzaMobileHeading">
          <span>A MESSAGE FROM AI JUZA</span>
          <strong>AI JUZAからの言葉</strong>
        </header>
      ) : null}
      <p ref={juzaMessageTextRef} aria-hidden="true">
        {spokenMessage}
        <i className="juzaMessage__cursor" aria-hidden="true" />
      </p>
      {isExplorer ? (
        <button
          className="explorerJuzaReadAll"
          type="button"
          aria-expanded={explorerMessageExpanded}
          onClick={() => setExplorerMessageExpanded((expanded) => !expanded)}
        >
          {explorerMessageExpanded ? "閉じる" : "全文を読む"}
        </button>
      ) : null}
      {isCreator ? (
        <button
          className="creatorJuzaMobileReadAll"
          type="button"
          onClick={(event) => {
            const message = event.currentTarget.closest(".juzaMessage")?.querySelector(":scope > p");
            message?.scrollTo({ top: message.scrollHeight, behavior: "smooth" });
          }}
        >
          全文を読む <span aria-hidden="true">⌄</span>
        </button>
      ) : null}
      {isPioneer ? (
        <button className="pioneerJuzaMobileReadAll" type="button" onClick={(event) => { const message=event.currentTarget.closest(".juzaMessage")?.querySelector(":scope > p"); message?.scrollTo({top:message.scrollHeight,behavior:"smooth"}); }}>全文を読む <span aria-hidden="true">⌄</span></button>
      ) : null}
      {isEvolver ? (
        <button className="evolverJuzaMobileReadAll" type="button" onClick={(event) => { const message=event.currentTarget.closest(".juzaMessage")?.querySelector(":scope > p"); message?.scrollTo({top:message.scrollHeight,behavior:"smooth"}); }}>全文を読む <span aria-hidden="true">⌄</span></button>
      ) : null}
      {isEmpath ? (
        <button className="empathJuzaMobileReadAll" type="button" onClick={(event) => { const message=event.currentTarget.closest(".juzaMessage")?.querySelector(":scope > p"); message?.scrollTo({top:message.scrollHeight,behavior:"smooth"}); }}>全文を読む <span aria-hidden="true">⌄</span></button>
      ) : null}
      {isIntuitive ? (
        <button className="intuitiveJuzaMobileReadAll" type="button" onClick={(event) => { const message=event.currentTarget.closest(".juzaMessage")?.querySelector(":scope > p"); message?.scrollTo({top:message.scrollHeight,behavior:"smooth"}); }}>全文を読む <span aria-hidden="true">⌄</span></button>
      ) : null}
      {isHarmonizer ? (
        <button
          className="harmonizerJuzaReadAll"
          type="button"
          onClick={(event) => {
            const message = event.currentTarget.closest(".juzaMessage")?.querySelector(":scope > p");
            message?.scrollTo({ top: message.scrollHeight, behavior: "smooth" });
          }}
        >
          全文を読む <span aria-hidden="true">⌄</span>
        </button>
      ) : null}
      {isVisionary ? (
        <button
          className="visionaryJuzaReadAll"
          type="button"
          onClick={(event) => {
            const message = event.currentTarget.closest(".juzaMessage")?.querySelector(":scope > p");
            message?.scrollTo({ top: message.scrollHeight, behavior: "smooth" });
          }}
        >
          全文を読む <span aria-hidden="true">⌄</span>
        </button>
      ) : null}
      {isGuardian ? (
        <button
          className="guardianJuzaReadAll"
          type="button"
          onClick={(event) => {
            const message = event.currentTarget.closest(".juzaMessage")?.querySelector(":scope > p");
            message?.scrollTo({ top: message.scrollHeight, behavior: "smooth" });
          }}
        >
          全文を読む <span aria-hidden="true">⌄</span>
        </button>
      ) : null}
      {isLuminary ? (
        <button
          className="luminaryJuzaMobileReadAll"
          type="button"
          onClick={(event) => {
            const message = event.currentTarget.closest(".juzaMessage")?.querySelector(":scope > p");
            message?.scrollTo({ top: message.scrollHeight, behavior: "smooth" });
          }}
        >
          全文を読む <span aria-hidden="true">⌄</span>
        </button>
      ) : null}
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
          <strong>
            <span className="visionaryDesktopCopy">今日の一歩</span>
            {isVisionary ? <span className="visionaryMobileCopy">あなたの恋愛・人間関係の傾向</span> : null}
          </strong>
          <p>
            <span className="visionaryDesktopCopy">{result.mission}</span>
            {isVisionary ? <span className="visionaryMobileCopy">心のつながりと未来の流れを読む力があります。</span> : null}
          </p>
        </article>

        {isVisionary ? (
          <article className="adviceBox adviceBox--visionaryMobileOnly">
            <PanelFrameOrnaments />
            <img className="typeFrameAsset typeFrameAsset--insight" src="/images/result-scenes/visionary/overlays/frame02.png" alt="" aria-hidden="true" />
            <CelestialTraitIcon type={resultType} index={2} />
            <strong>あなたの30日アクションプラン</strong>
            <p>{result.mission}</p>
          </article>
        ) : null}
      </div>
    </>
  );

  const explorerReadingCards = explorerStarReadings.map((card) => ({
    ...card,
    previewText: card.fullText.slice(0, 3).join("\n"),
  }));

  const explorerDesktopReadingSection = isExplorer ? (
    <StarReadingSection
      cards={explorerReadingCards}
      renderIcon={(_, index) => <CelestialTraitIcon type="explorer" index={index} />}
      theme="explorer"
    />
  ) : null;

  const harmonyDesktopReadingSection = isHarmonizer ? (
    <StarReadingSection
      cards={harmonyStarReadings.map((card) => ({
        ...card,
        previewText: card.fullText.slice(0, 3).join("\n"),
      }))}
      renderIcon={(_, index) => <CelestialTraitIcon type="thinker" index={index} />}
      theme="harmony"
    />
  ) : null;

  const visionaryDesktopReadingSection = isVisionary ? (
    <StarReadingSection
      cards={visionaryStarReadings}
      renderIcon={(_, index) => <CelestialTraitIcon type="leader" index={index} />}
      theme="visionary"
    />
  ) : null;

  const guardianReadingCards = guardianStarReadings.map((card) => ({
    ...card,
    previewText: card.fullText.slice(0, 3).join("\n\n"),
  }));

  const guardianMobileReadingSection = isGuardian ? (
    <StarReadingSection
      cards={guardianReadingCards}
      renderIcon={(_, index) => <CelestialTraitIcon type="persistence" index={index} />}
      theme="guardian"
    />
  ) : null;

  const luminaryReadingCards = luminaryStarReadings.map((card) => ({
    ...card,
    previewText: card.fullText.slice(0, 3).join("\n\n"),
  }));

  const luminaryReadingSection = isLuminary ? (
    <StarReadingSection
      cards={luminaryReadingCards}
      renderIcon={(_, index) => <CelestialTraitIcon type="expression" index={index} />}
      theme="luminary"
    />
  ) : null;

  const creatorReadingCards = creatorStarReadings.map((card) => ({
    ...card,
    previewText: card.fullText.slice(0, 3).join("\n\n"),
  }));

  const creatorMobileReadingSection = isCreator ? (
    <StarReadingSection
      cards={creatorReadingCards}
      renderIcon={(_, index) => <CelestialTraitIcon type="creator" index={index} />}
      theme="creator"
    />
  ) : null;

  const pioneerReadingCards = pioneerStarReadings.map((card) => ({
    ...card,
    previewText: card.fullText.slice(0, 3).join("\n\n"),
  }));
  const pioneerReadingSection=isPioneer?(<StarReadingSection cards={pioneerReadingCards} renderIcon={(_,index)=><CelestialTraitIcon type="action" index={index}/>} theme="pioneer"/>):null;

  const evolverReadingCards = evolverStarReadings.map((card) => ({
    ...card,
    previewText: card.fullText.slice(0, 3).join("\n\n"),
  }));
  const evolverMobileReadingSection = isEvolver ? (
    <StarReadingSection cards={evolverReadingCards} renderIcon={(_, index) => <CelestialTraitIcon type="adaptability" index={index} />} theme="evolver" />
  ) : null;

  const empathReadingCards = empathStarReadings.map((card) => ({
    ...card,
    previewText: card.fullText.slice(0, 3).join("\n\n"),
  }));
  const empathMobileReadingSection = isEmpath ? (
    <StarReadingSection cards={empathReadingCards} renderIcon={(_, index) => <CelestialTraitIcon type="empathy" index={index} />} theme="empath" />
  ) : null;

  const intuitiveReadingCards = intuitiveStarReadings.map((card) => ({
    ...card,
    previewText: card.fullText.slice(0, 3).join("\n\n"),
  }));
  const intuitiveMobileReadingSection = isIntuitive ? (
    <StarReadingSection cards={intuitiveReadingCards} renderIcon={(_, index) => <CelestialTraitIcon type="intuition" index={index} />} theme="intuitive" />
  ) : null;

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

          <p className="resultKicker">
            <span className="visionaryDesktopCopy">あなたの中で目覚めた星</span>
            {isVisionary ? <span className="visionaryMobileCopy">YOUR ARCHETYPE</span> : null}
          </p>
          {resultType === "persistence" ? <div className="guardianEnglishTitle">GUARDIAN</div> : null}
          <h1 className="resultTitle">
            <span className="visionaryDesktopCopy">{result.title}</span>
            {isVisionary ? <span className="visionaryMobileCopy">VISIONARY</span> : null}
          </h1>
          <div className="english">
            <span className="visionaryDesktopCopy">{result.en}</span>
            {isVisionary ? <span className="visionaryMobileCopy">未来創造タイプ</span> : null}
          </div>
          <p className="resultLead">
            <span className={`visionaryDesktopCopy${isCreator ? " creatorDesktopLead" : ""}`}>{isCreator ? creatorTypeDescriptor : isGuardian ? guardianTypeDescriptor : isVisionary ? visionaryTypeDescriptor : "11の回答から映し出された、今のあなたを導く星の輪郭です。"}</span>
            {isVisionary ? <span className="visionaryMobileCopy">{visionaryTypeDescriptor}</span> : null}
            {isCreator ? <span className="creatorMobileLead">{creatorTypeDescriptor}</span> : null}
          </p>
          {isIntuitive ? (
            <>
              <section className="intuitiveGuidanceFrame" aria-label="AI JUZA and intuitive insights">
                <img
                  className="intuitiveGuidanceFrame__asset"
                  src="/images/result-scenes/intuitive/overlays/frame02.png"
                  alt=""
                  aria-hidden="true"
                />
                {juzaPanel}
              </section>
              <div className="intuitiveDesktopInsights">{intuitiveMobileReadingSection}</div>
              <div className="intuitiveMobileInsights">{intuitiveMobileReadingSection}</div>
            </>
          ) : juzaPanel}
        </>
      )}
      {!isChallenge && !isIntuitive ? (
        <>
          {isExplorer ? explorerDesktopReadingSection : null}
          {isHarmonizer ? harmonyDesktopReadingSection : null}
          {isVisionary ? visionaryDesktopReadingSection : null}
          {isGuardian ? guardianMobileReadingSection : null}
          {isLuminary ? luminaryReadingSection : null}
          {isCreator ? creatorMobileReadingSection : null}
          {isPioneer ? pioneerReadingSection : null}
          {isEvolver ? evolverMobileReadingSection : null}
          {isEmpath ? empathMobileReadingSection : null}
          {!isCreator && !isEvolver && !isPioneer && !isLuminary && !isGuardian ? insightSection : null}
        </>
      ) : null}
    </div>
  );
}

export default ResultCard;
