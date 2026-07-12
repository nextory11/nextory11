import { useEffect, useState } from "react";
import "./App.css";

import { questions } from "./data/questions";
import { resultTypes } from "./data/resultTypes";

import Hero from "./components/Hero";
import ProgressBar from "./components/ProgressBar.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import ResultCard from "./components/ResultCard.jsx";
import PremiumCard from "./components/PremiumCard.jsx";
import PaymentStatus from "./components/PaymentStatus.jsx";
import {
  clearCheckoutSnapshot,
  getPaidCtaEnabled,
  readCheckoutSnapshot,
  redirectToStripeCheckout,
} from "./lib/stripeCheckout.js";

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

function App() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paidCtaEnabled, setPaidCtaEnabled] = useState(false);

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

  const finished = step >= questions.length;
  const paymentRoute = getPaymentRoute();

  function handleStart() {
    setStarted(true);
    setStep(0);
    setAnswers([]);
  }

  function handleAnswer(answer) {
    const question = questions[step];
    const answerIndex = question.answers.indexOf(answer);

    setAnswers((prev) => [
      ...prev,
      {
        ...answer,
        questionId: question.id,
        question: question.question,
        answerLabel: String.fromCharCode(65 + answerIndex),
      },
    ]);
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
      setStep(questions.length);
      setStarted(true);
      window.history.replaceState({}, "", "/");
    } else {
      handleRestart();
    }
  }

  function getResultSelection() {
    const counts = {};

    answers.forEach((answer) => {
      counts[answer.type] = (counts[answer.type] || 0) + 1;
    });

    const topType =
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      Object.keys(resultTypes)[0];

    return { resultType: topType, result: resultTypes[topType] };
  }

  async function handlePremiumCheckout(result, resultType) {
    setCheckoutError("");
    setCheckoutLoading(true);

    try {
      await redirectToStripeCheckout({ answers, result, resultType });
    } catch {
      setCheckoutError(
        "決済リンクが未設定です。VITE_STRIPE_CHECKOUT_URL または stripe-config.json を設定してください。",
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

  if (!started) {
    return (
      <main className="app">
        <Hero onStart={handleStart} />
      </main>
    );
  }

  if (finished) {
    const { result, resultType } = getResultSelection();

    return (
      <main className="app">
        <section className="resultHero">
          <ResultCard result={result} />

          <PremiumCard
            checkoutError={checkoutError}
            isEnabled={paidCtaEnabled}
            isLoading={checkoutLoading}
            onClick={() => handlePremiumCheckout(result, resultType)}
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

  const currentQuestion = questions[step];

  return (
    <main className="app">
      <section className="questionHero">
        <ProgressBar current={step + 1} total={questions.length} />

        <QuestionCard question={currentQuestion} onAnswer={handleAnswer} />
      </section>
    </main>
  );
}

export default App;
