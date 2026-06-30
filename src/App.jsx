import { useState } from "react";
import "./App.css";
import { questions } from "./data/questions";
import { resultTypes } from "./data/resultTypes";
import Hero from "./components/Hero.jsx";
import ProgressBar from "./components/ProgressBar.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import ResultCard from "./components/ResultCard.jsx";
import PremiumCard from "./components/PremiumCard.jsx";

function App() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  const finished = step >= questions.length;

  function handleAnswer(answer) {
    setAnswers([...answers, answer]);
    setStep(step + 1);
  }

  function getResultKey() {
    const scores = {};
    answers.forEach((answer) => {
      scores[answer.type] = (scores[answer.type] || 0) + answer.score;
    });
    return Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  }

  function resetQuiz() {
    setStarted(false);
    setStep(0);
    setAnswers([]);
  }

  function openPaidReport() {
    alert("AI完全レポートは準備中です。ここにStripe決済を接続します。");
  }

  if (!started) {
    return (
      <main className="app">
        <Hero onStart={() => setStarted(true)} />
      </main>
    );
  }

  if (finished) {
    const resultKey = getResultKey();
    const result = resultTypes[resultKey] || resultTypes.action;

    return (
      <main className="app">
        <section className="hero resultHero">
          <div className="brandMark">✦</div>
          <div className="brand">NEXTORY11</div>
          <div className="badge">Your Star Map</div>

          <ResultCard result={result} />
          <PremiumCard onClick={openPaidReport} />

          <div className="buttonGroup">
            <button className="subButton" onClick={resetQuiz}>
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
      <section className="hero questionHero">
        <div className="brandMark">✦</div>
        <div className="brand">NEXTORY11</div>

        <ProgressBar step={step} total={questions.length} />

        <h2>{currentQuestion.question}</h2>

        <QuestionCard question={currentQuestion} onAnswer={handleAnswer} />
      </section>
    </main>
  );
}

export default App;
