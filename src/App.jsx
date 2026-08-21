import { lazy, Suspense, useEffect, useRef, useState } from "react";
import "./App.css";
import "./styles/premium-design-system.css";
import "./styles/trust-pages.css";
import "./styles/question.css";
import "./styles/cinematic-refinement.css";
import "./styles/creator-frame-refinement.css";
import "./styles/challenge-design-master.css";
import "./styles/result-master-architecture.css";
import "./styles/empath-frame-refinement.css";
import "./styles/result-responsive-polish.css";
import "./styles/intuitive-frame-refinement.css";
import "./styles/luminary-frame-refinement.css";
import "./styles/harmonizer-juza-refinement.css";
import "./styles/pioneer-juza-refinement.css";
import "./styles/visionary-frame-refinement.css";
import "./styles/result-emblem-size-alignment.css";
import "./styles/premium-mobile-shared.css";
import "./styles/premium-report-universal.css";
import "./styles/premium-cta-frame-system.css";
import "./styles/dev-result-scene-viewer.css";
import "./styles/challenge-result-gold-review.css";
import "./styles/hero/hero-design-master.css";
import "./styles/explorer-star-reading-review.css";
import "./styles/global-star-reading-template.css";
import "./styles/guardian-mobile-refinement.css";
import "./styles/luminary-mobile-refinement.css";
import "./styles/creator-mobile-refinement.css";
import "./styles/pioneer-mobile-refinement.css";
import "./styles/evolver-mobile-refinement.css";
import "./styles/empath-mobile-refinement.css";
import "./styles/intuitive-mobile-refinement.css";
import "./styles/desktop-ai-juza-scroll-standard.css";
import "./styles/guardian-desktop-visual-refinement.css";
import "./styles/diagnosis-navigation.css";

import { questions } from "./data/questions";
import { resultTypes } from "./data/resultTypes";
import { resultScenes } from "./data/resultScenes";

import Hero from "./components/Hero";
import OfficialPreview from "./official-site/OfficialPreview.jsx";
import ProgressBar from "./components/ProgressBar.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import ResultCard from "./components/ResultCard.jsx";
import ResultScene from "./components/ResultScene.jsx";
import PremiumCard from "./components/PremiumCard.jsx";
import PaymentStatus from "./components/PaymentStatus.jsx";
import TrustFooter from "./components/TrustFooter.jsx";
import {
  getPaidCtaEnabled,
  readCheckoutSnapshot,
  redirectToStripeCheckout,
} from "./lib/stripeCheckout.js";
import { scoreQuestionnaire } from "./lib/questionBank/scoring.js";
import { createQuestionBankContext } from "./lib/questionBank/context.js";
import { OFFICIAL_TO_LEGACY_TYPE } from "./lib/questionBank/officialPack.js";
import {
  createOfficialQuestionSession,
  QUESTION_BANK_SELECTION_COUNT,
  saveQuestionHistory,
} from "./lib/questionBank/session.js";
import {
  clearActiveDiagnosisSession,
  clearActiveDiagnosisPointer,
  createDiagnosisSession,
  readActiveDiagnosisSession,
  updateDiagnosisSession,
} from "./lib/questionBank/diagnosisSession.js";
import { TRUST_ROUTES } from "./data/trustContent.js";
import { createPreviewAnswers, parseDevResultPreview } from "./lib/devResultPreview.js";

const TrustExperience = lazy(() => import("./components/TrustExperience.jsx"));
const ChallengeResultGoldReview = lazy(() => import("./components/ChallengeResultGoldReview.jsx"));

const RESULT_REVIEW_ROUTES = Object.freeze({
  challenge: "challenge",
  explorer: "explorer",
  harmony: "harmonizer",
  visionary: "visionary",
  guardian: "guardian",
  luminary: "light-bringer",
  creator: "creator",
  pioneer: "pioneer",
  evolver: "evolver",
  empath: "empath",
  intuitive: "intuitive",
});

const RESULT_REVIEW_LINKS = Object.freeze([
  "challenge", "explorer", "harmony", "visionary", "guardian", "luminary",
  "creator", "pioneer", "evolver", "empath", "intuitive",
]);

const DIAGNOSIS_RETURN_MARKER_KEY = "nextory11.diagnosisReturnToResult.v1";
const DIAGNOSIS_RETURN_SNAPSHOT_KEY = "nextory11.diagnosisReturnSnapshot.v1";

const configuredQuestionBankFlag = import.meta.env.VITE_ENABLE_QUESTION_BANK_V1;
const questionBankEnabled = configuredQuestionBankFlag === undefined || configuredQuestionBankFlag === ""
  ? import.meta.env.DEV
  : String(configuredQuestionBankFlag) === "true";

if (import.meta.env.DEV && (configuredQuestionBankFlag === undefined || configuredQuestionBankFlag === "")) {
  console.warn("[NEXTORY11] VITE_ENABLE_QUESTION_BANK_V1 is unset; the official 220-question bank is enabled in development.");
}

function getPaymentRoute() {
  const hashRoute = window.location.hash.replace(/^#/, "");
  const route = hashRoute || window.location.pathname;

  if (route === "/payment-success") {
    return "success";
  }

  if (route === "/payment-cancel") {
    return "cancel";
  }

  return null;
}

function getTrustRoute() {
  const route = window.location.hash.replace(/^#/, "") || window.location.pathname;
  return TRUST_ROUTES[route] ?? null;
}

function getDevPreviewRequest() {
  if (import.meta.env.DEV) {
    const routeType = window.location.pathname.match(/^\/result-review\/([^/]+)\/?$/)?.[1];
    if (routeType && RESULT_REVIEW_ROUTES[routeType]) {
      return { previewType: RESULT_REVIEW_ROUTES[routeType], section: "full", controls: "hidden" };
    }
  }
  // Preview query parameters are deliberately ignored by every production build.
  return parseDevResultPreview({ isDev: import.meta.env.DEV, search: window.location.search });
}

function ResultReviewIndex() {
  return (
    <main style={{ minHeight: "100vh", padding: "48px", color: "#f4dfad", background: "#05070c", fontFamily: "system-ui, sans-serif" }}>
      <h1>NEXTORY11 Desktop Result Review</h1>
      <p>Local development review routes</p>
      <nav style={{ display: "grid", gap: "12px", maxWidth: "520px", marginTop: "32px" }}>
        {RESULT_REVIEW_LINKS.map((type, index) => (
          <a key={type} href={`/result-review/${type}`} style={{ padding: "14px 18px", color: "#f4cf76", border: "1px solid #8b6728", borderRadius: "8px", textDecoration: "none" }}>
            {String(index + 1).padStart(2, "0")} · {type[0].toUpperCase() + type.slice(1)}
          </a>
        ))}
      </nav>
    </main>
  );
}

function DiagnosisApp() {
  const resultReviewIndex = import.meta.env.DEV && /^\/result-review\/?$/.test(window.location.pathname);
  const devPreview = getDevPreviewRequest();
  const previewResultType = devPreview ? OFFICIAL_TO_LEGACY_TYPE[devPreview.previewType] : null;
  const previewAnswers = previewResultType
    ? createPreviewAnswers(previewResultType, Object.keys(resultTypes))
    : [];
  const [started, setStarted] = useState(Boolean(previewResultType));
  const [step, setStep] = useState(previewAnswers.length);
  const [answers, setAnswers] = useState(previewAnswers);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const checkoutInFlightRef = useRef(false);
  const newDiagnosisStartedRef = useRef(false);
  const [paidCtaEnabled, setPaidCtaEnabled] = useState(Boolean(previewResultType));
  const [questionSession, setQuestionSession] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState(questions);
  const [trustRoute, setTrustRoute] = useState(getTrustRoute);
  const [canReturnToResult] = useState(() => {
    const available = window.sessionStorage.getItem(DIAGNOSIS_RETURN_MARKER_KEY) === "1";
    window.sessionStorage.removeItem(DIAGNOSIS_RETURN_MARKER_KEY);
    return available;
  });

  useEffect(() => {
    if (devPreview || !questionBankEnabled) return;
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      if (newDiagnosisStartedRef.current) return;
      newDiagnosisStartedRef.current = true;
      clearActiveDiagnosisSession();
      handleStart();
      return;
    }
    const restored = readActiveDiagnosisSession();
    if (!restored) return;
    setQuestionSession({
      bank: createOfficialQuestionSession({ count: QUESTION_BANK_SELECTION_COUNT }).bank,
      questions: restored.questions,
      questionSetVersion: restored.record.questionPackVersion,
      diagnosisSessionId: restored.record.diagnosisSessionId,
    });
    setActiveQuestions(restored.questions);
    setAnswers(restored.record.submittedAnswers);
    setStep(restored.record.currentIndex);
    setStarted(true);
  }, []);

  useEffect(() => {
    if (devPreview) return undefined;
    let active = true;

    getPaidCtaEnabled().then((enabled) => {
      if (active) {
        setPaidCtaEnabled(enabled);
      }
    });

    return () => {
      active = false;
    };
  }, [devPreview]);

  useEffect(() => {
    const handleHashChange = () => setTrustRoute(getTrustRoute());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!started) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }, [started, step]);

  const finished = step >= activeQuestions.length;
  const paymentRoute = getPaymentRoute();

  if (resultReviewIndex) {
    return <ResultReviewIndex />;
  }

  function handleStart() {
    if (questionBankEnabled) {
      const session = createOfficialQuestionSession({ count: QUESTION_BANK_SELECTION_COUNT });
      const persisted = createDiagnosisSession(session);
      setQuestionSession({ ...session, diagnosisSessionId: persisted.record.diagnosisSessionId });
      setActiveQuestions(persisted.questions);
    } else {
      setQuestionSession(null);
      setActiveQuestions(questions);
    }
    setStarted(true);
    setStep(0);
    setAnswers([]);
  }

  function handleAnswer(answer) {
    const question = activeQuestions[step];
    const answerIndex = question.answers.indexOf(answer);
    const isQuestionBankAnswer = Boolean(answer.personalityWeights);
    const normalizedAnswer = isQuestionBankAnswer ? {
      text: answer.text,
      type: OFFICIAL_TO_LEGACY_TYPE[answer.metadata.primaryTrait],
      score: 1,
      questionId: String(question.id),
      question: question.text,
      answerLabel: answer.id,
      answerId: answer.id,
      metadata: {
        ...answer.metadata,
        category: question.category,
        tags: question.tags,
        questionSetVersion: questionSession?.questionSetVersion,
      },
      questionBankQuestion: question,
    } : {
      ...answer,
      questionId: question.id,
      question: question.question,
      answerLabel: String.fromCharCode(65 + answerIndex),
    };

    const nextAnswers = [...answers];
    nextAnswers[step] = normalizedAnswer;
    setAnswers(() => {
      return nextAnswers;
    });
    if (questionSession?.diagnosisSessionId) {
      updateDiagnosisSession(questionSession.diagnosisSessionId, {
        currentIndex: step + 1,
        submittedAnswers: nextAnswers,
        completionStatus: step + 1 === activeQuestions.length ? "completed" : "in_progress",
      });
    }
    if (isQuestionBankAnswer && step + 1 === activeQuestions.length) saveQuestionHistory(activeQuestions);
    setStep((prev) => prev + 1);
  }

  function handlePreviousQuestion() {
    const previousStep = Math.max(0, step - 1);
    setStep(previousStep);
    if (questionSession?.diagnosisSessionId) {
      updateDiagnosisSession(questionSession.diagnosisSessionId, {
        currentIndex: previousStep,
        submittedAnswers: answers,
        completionStatus: "in_progress",
      });
    }
  }

  function handleRestart() {
    clearActiveDiagnosisPointer();
    setStarted(false);
    setStep(0);
    setAnswers([]);
  }

  function handleNewDiagnosis() {
    if (finished && answers.length) {
      window.sessionStorage.setItem(DIAGNOSIS_RETURN_SNAPSHOT_KEY, JSON.stringify({
        answers,
        activeQuestions,
        questionSetVersion: questionSession?.questionSetVersion ?? null,
        diagnosisSessionId: questionSession?.diagnosisSessionId ?? null,
      }));
    }
    clearActiveDiagnosisSession();
    window.sessionStorage.setItem(DIAGNOSIS_RETURN_MARKER_KEY, "1");
    window.location.assign("/diagnosis?new=1");
  }

  function handleReturnToTop() {
    clearActiveDiagnosisSession();
    window.location.assign("/");
  }

  function handlePaymentRestart() {
    handleNewDiagnosis();
  }

  function handleReturnToResult() {
    const snapshot = readCheckoutSnapshot();
    let diagnosisSnapshot = null;

    try {
      diagnosisSnapshot = JSON.parse(window.sessionStorage.getItem(DIAGNOSIS_RETURN_SNAPSHOT_KEY) ?? "null");
    } catch {
      window.sessionStorage.removeItem(DIAGNOSIS_RETURN_SNAPSHOT_KEY);
    }

    if (diagnosisSnapshot?.answers?.length && diagnosisSnapshot?.activeQuestions?.length) {
      const restoredOfficialSession = createOfficialQuestionSession({ count: QUESTION_BANK_SELECTION_COUNT });
      setAnswers(diagnosisSnapshot.answers);
      setActiveQuestions(diagnosisSnapshot.activeQuestions);
      setQuestionSession({
        ...restoredOfficialSession,
        questions: diagnosisSnapshot.activeQuestions,
        questionSetVersion:
          diagnosisSnapshot.questionSetVersion ??
          diagnosisSnapshot.questionSession?.questionSetVersion ??
          restoredOfficialSession.questionSetVersion,
        diagnosisSessionId:
          diagnosisSnapshot.diagnosisSessionId ??
          diagnosisSnapshot.questionSession?.diagnosisSessionId ??
          null,
      });
      setStep(diagnosisSnapshot.activeQuestions.length);
      setStarted(true);
    } else if (snapshot?.answers?.length) {
      setAnswers(snapshot.answers.map((answer) => ({
        ...answer,
        text: answer.text ?? answer.answer,
      })));
      setActiveQuestions(snapshot.answers.map((answer) => answer.questionBankQuestion).filter(Boolean).length
        ? snapshot.answers.map((answer) => answer.questionBankQuestion)
        : questions);
      setStep(snapshot.answers.length);
      setStarted(true);
    } else {
      handleRestart();
    }
  }

  function handleCheckoutIncomplete() {
    window.history.replaceState({}, "", "/");
    checkoutInFlightRef.current = false;
    setCheckoutLoading(false);
    setCheckoutError("決済は完了していません。料金は請求されていません。");
    handleReturnToResult();
  }

  function getResultSelection() {
    if (questionBankEnabled && answers.length && answers.every((answer) => answer.questionBankQuestion)) {
      const responses = answers.map((answer) => ({ question: answer.questionBankQuestion, answerId: answer.answerId }));
      const scoring = scoreQuestionnaire(responses, { normalizeOpportunities: true });
      const officialType = scoring.primaryPersonality?.personality ?? "pioneer";
      const resultType = OFFICIAL_TO_LEGACY_TYPE[officialType] ?? "action";
      const bank = questionSession?.bank;
      const questionBankContext = bank ? createQuestionBankContext({
        bank,
        responses,
        scoringResult: scoring,
        diagnosisSessionId: questionSession?.diagnosisSessionId ?? null,
      }) : null;
      return { resultType, result: resultTypes[resultType], scoring, questionBankContext };
    }
    const counts = {};

    answers.forEach((answer) => {
      counts[answer.type] = (counts[answer.type] || 0) + 1;
    });

    const topType =
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      Object.keys(resultTypes)[0];

    return { resultType: topType, result: resultTypes[topType], scoring: null, questionBankContext: null };
  }

  async function handlePremiumCheckout(result, resultType, questionBankContext) {
    if (checkoutInFlightRef.current) return;
    checkoutInFlightRef.current = true;
    setCheckoutError("");
    setCheckoutLoading(true);

    try {
      await redirectToStripeCheckout({
        answers,
        result,
        resultType,
        questionBankContext,
        diagnosisSessionId: questionSession?.diagnosisSessionId ?? null,
      });
    } catch {
      setCheckoutError(
        "開発用の安全な決済セッションを開始できませんでした。",
      );
    } finally {
      checkoutInFlightRef.current = false;
      setCheckoutLoading(false);
    }
  }

  if (paymentRoute) {
    const checkoutSessionId = new URL(window.location.href).searchParams.get("session_id");
    const snapshot = readCheckoutSnapshot(checkoutSessionId);

    return (
      <PaymentStatus
        request={snapshot}
        result={snapshot?.result}
        status={paymentRoute}
        onReturnToResult={handleReturnToResult}
        onCheckoutIncomplete={handleCheckoutIncomplete}
        onRestart={handlePaymentRestart}
        onReturnToTop={handleReturnToTop}
      />
    );
  }

  if (trustRoute) {
    return <Suspense fallback={<main className="trustPage" aria-busy="true" />}><TrustExperience page={trustRoute} /></Suspense>;
  }

  if (!started) {
    return (
      <main className="app">
        <Hero onStart={handleStart} />
      </main>
    );
  }

  if (finished) {
    const { result, resultType, questionBankContext } = getResultSelection();
    const scene = resultScenes[resultType] ?? resultScenes.action;

    if (resultType === "challenger") {
      return (
        <Suspense fallback={<main className="challengeGoldReview__loading" aria-busy="true" />}>
          <ChallengeResultGoldReview
            afterContent={(
              <>
                <div className="buttonGroup">
                  <button type="button" className="subButton rediagnosisButton" onClick={handleNewDiagnosis}>
                    もう一度診断する
                  </button>
                </div>
                <TrustFooter compact />
              </>
            )}
            checkoutError={checkoutError}
            isPremiumEnabled={devPreview ? true : paidCtaEnabled}
            isPremiumLoading={checkoutLoading}
            onPremiumClick={devPreview ? () => {} : () => handlePremiumCheckout(result, resultType, questionBankContext)}
          />
        </Suspense>
      );
    }

    return (
      <main className="app">
        <section className="resultHero" data-star-type={resultType}>
          <ResultScene scene={scene} />
          <ResultCard answers={answers} result={result} resultType={resultType} scene={scene} questionBankContext={questionBankContext} />

          <PremiumCard
            checkoutError={checkoutError}
            isEnabled={devPreview ? true : paidCtaEnabled}
            isLoading={checkoutLoading}
            onClick={devPreview ? () => {} : () => handlePremiumCheckout(result, resultType, questionBankContext)}
            resultType={resultType}
          />

          <div className="buttonGroup">
            <button type="button" className="subButton rediagnosisButton" onClick={handleNewDiagnosis}>
              もう一度診断する
            </button>
          </div>
          <TrustFooter compact />
        </section>
      </main>
    );
  }

  const currentQuestion = activeQuestions[step];

  return (
    <main className="app diagnosisApp">
      <section className="questionHero">
        <div className="questionCosmos" aria-hidden="true">
          <span className="questionCosmos__nebula questionCosmos__nebula--one" />
          <span className="questionCosmos__nebula questionCosmos__nebula--two" />
          <span className="questionCosmos__stars" />
          <span className="questionCosmos__constellation questionCosmos__constellation--left" />
          <span className="questionCosmos__constellation questionCosmos__constellation--right" />
          <span className="questionCosmos__light" />
        </div>
        <nav className="diagnosisNavigation" aria-label="診断ナビゲーション">
          {canReturnToResult ? (
            <button type="button" className="diagnosisNavigation__back" onClick={handleReturnToResult}>
              <span aria-hidden="true">←</span>
              <span>診断結果へ戻る</span>
            </button>
          ) : <span aria-hidden="true" />}
          <button type="button" className="diagnosisNavigation__top" onClick={handleReturnToTop}>
            <span>TOPへ戻る</span>
          </button>
        </nav>
        <ProgressBar current={step + 1} total={activeQuestions.length} />

        <QuestionCard
          question={currentQuestion}
          selectedAnswerId={answers[step]?.answerId ?? answers[step]?.text ?? null}
          canGoPrevious={step > 0}
          onAnswer={handleAnswer}
          onPrevious={handlePreviousQuestion}
        />
      </section>
    </main>
  );
}

function App() {
  if (/^\/official-preview(?:\/|$)/.test(window.location.pathname)) {
    return <OfficialPreview />;
  }

  return <DiagnosisApp />;
}

export default App;
