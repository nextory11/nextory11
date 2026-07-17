import { lazy, Suspense, useEffect, useState } from "react";
import "./App.css";
import "./styles/premium-design-system.css";
import "./styles/trust-pages.css";

import { questions } from "./data/questions";
import { resultTypes } from "./data/resultTypes";
import { resultScenes } from "./data/resultScenes";

import Hero from "./components/Hero";
import ProgressBar from "./components/ProgressBar.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import ResultCard from "./components/ResultCard.jsx";
import ResultScene from "./components/ResultScene.jsx";
import PremiumCard from "./components/PremiumCard.jsx";
import PaymentStatus from "./components/PaymentStatus.jsx";
import {
  clearCheckoutSnapshot,
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
import { TRUST_ROUTES } from "./data/trustContent.js";

const TrustExperience = lazy(() => import("./components/TrustExperience.jsx"));

const questionBankEnabled = String(import.meta.env.VITE_ENABLE_QUESTION_BANK_V1 ?? "false") === "true";

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

function App() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paidCtaEnabled, setPaidCtaEnabled] = useState(false);
  const [questionSession, setQuestionSession] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState(questions);
  const [trustRoute, setTrustRoute] = useState(getTrustRoute);

  useEffect(() => {
    let active = true;

    getPaidCtaEnabled().then((enabled) => {
      if (active) {
        setPaidCtaEnabled(enabled);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => setTrustRoute(getTrustRoute());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const finished = step >= activeQuestions.length;
  const paymentRoute = getPaymentRoute();

  function handleStart() {
    if (questionBankEnabled) {
      const session = createOfficialQuestionSession({ count: QUESTION_BANK_SELECTION_COUNT });
      setQuestionSession(session);
      setActiveQuestions(session.questions);
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
    setAnswers((prev) => [...prev, isQuestionBankAnswer ? {
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
    }]);
    if (isQuestionBankAnswer && step + 1 === activeQuestions.length) saveQuestionHistory(activeQuestions);
    setStep((prev) => prev + 1);
  }

  function handleRestart() {
    clearCheckoutSnapshot();
    setStarted(false);
    setStep(0);
    setAnswers([]);
  }

  function handleReturnToResult() {
    const snapshot = readCheckoutSnapshot();

    if (snapshot?.answers?.length) {
      setAnswers(snapshot.answers.map((answer) => ({
        ...answer,
        text: answer.text ?? answer.answer,
      })));
      setActiveQuestions(snapshot.answers.map((answer) => answer.questionBankQuestion).filter(Boolean).length
        ? snapshot.answers.map((answer) => answer.questionBankQuestion)
        : questions);
      setStep(snapshot.answers.length);
      setStarted(true);
      window.history.replaceState({}, "", "/");
    } else {
      handleRestart();
    }
  }

  function getResultSelection() {
    if (questionBankEnabled && answers.length && answers.every((answer) => answer.questionBankQuestion)) {
      const responses = answers.map((answer) => ({ question: answer.questionBankQuestion, answerId: answer.answerId }));
      const scoring = scoreQuestionnaire(responses, { normalizeOpportunities: true });
      const officialType = scoring.primaryPersonality?.personality ?? "pioneer";
      const resultType = OFFICIAL_TO_LEGACY_TYPE[officialType] ?? "action";
      const bank = questionSession?.bank;
      const questionBankContext = bank ? createQuestionBankContext({ bank, responses, scoringResult: scoring }) : null;
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
    setCheckoutError("");
    setCheckoutLoading(true);

    try {
      await redirectToStripeCheckout({ answers, result, resultType, questionBankContext });
    } catch {
      setCheckoutError(
        "開発用の安全な決済セッションを開始できませんでした。",
      );
      setCheckoutLoading(false);
    }
  }

  if (paymentRoute) {
    const snapshot = readCheckoutSnapshot();

    return (
      <PaymentStatus
        request={snapshot}
        result={snapshot?.result}
        status={paymentRoute}
        onReturnToResult={handleReturnToResult}
        onRestart={handleRestart}
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

    return (
      <main className="app">
        <section className="resultHero" data-star-type={resultType}>
          <ResultScene scene={scene} />
          <ResultCard answers={answers} result={result} resultType={resultType} scene={scene} questionBankContext={questionBankContext} />

          <PremiumCard
            checkoutError={checkoutError}
            isEnabled={paidCtaEnabled}
            isLoading={checkoutLoading}
            onClick={() => handlePremiumCheckout(result, resultType, questionBankContext)}
          />

          <div className="buttonGroup">
            <button type="button" className="subButton" onClick={handleRestart}>
              もう一度、星を見つける
            </button>
          </div>
        </section>
      </main>
    );
  }

  const currentQuestion = activeQuestions[step];

  return (
    <main className="app">
      <section className="questionHero">
        <ProgressBar current={step + 1} total={activeQuestions.length} />

        <QuestionCard question={currentQuestion} onAnswer={handleAnswer} />
      </section>
    </main>
  );
}

export default App;
