import { useState } from "react";
import "./App.css";
import { questions } from "./data/questions";
import { resultTypes } from "./data/resultTypes";

function App() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

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
    setLoading(false);
  }

  function openPaidReport() {
    setLoading(true);

    setTimeout(() => {
      alert("Stripe決済準備中です。ここに980円のAI完全レポート購入ページを接続します。");
      setLoading(false);
    }, 1200);
  }

  if (!started) {
    return (
      <main className="app">
        <section className="hero">
          <div className="brandMark">✦</div>
          <div className="brand">NEXTORY11</div>
          <div className="badge">β1.0</div>

          <h1>
            あなたには、まだ
            <br />
            見つかっていない星がある。
          </h1>

          <p>
            11の質問が、あなたの中に眠る才能を照らします。
            これは未来を決めつける診断ではなく、
            次の物語を見つけるための自己発見です。
          </p>

          <button className="startButton" onClick={() => setStarted(true)}>
            星を見つける
          </button>

          <div className="heroNote">
            Free Diagnosis｜11 Questions｜Star Map
          </div>
        </section>
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
          <div className="badge">あなたの星図</div>

          <div className="resultIcon">{result.icon}</div>

          <h1>{result.title}</h1>
          <div className="english">{result.en}</div>

          <div className="adviceBox">
            <strong>あなたの本質</strong>
            <br />
            {result.essence}
          </div>

          <div className="adviceBox">
            <strong>あなたの才能</strong>
            <br />
            {result.strength}
          </div>

          <div className="adviceBox">
            <strong>今日の一歩</strong>
            <br />
            {result.mission}
          </div>

          <div className="paidBox">
            <div className="paidLabel">PREMIUM STAR MAP</div>
            <h2>AI完全レポートを作成する</h2>

            <p>
              あなたの回答をもとに、才能・仕事・人間関係・恋愛傾向・30日プランを深く分析します。
            </p>

            <ul className="premiumList">
              <li>あなただけの星図分析</li>
              <li>仕事・恋愛・人間関係の傾向</li>
              <li>30日アクションプラン</li>
              <li>AIからの応援メッセージ</li>
            </ul>

            <button className="premiumButton" onClick={openPaidReport}>
              {loading ? "星図を準備中..." : "980円でAI完全レポートを作成する"}
            </button>
          </div>

          <div className="buttonGroup">
            <button className="subButton" onClick={resetQuiz}>
              もう一度診断する
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

        <div className="progressText">
          Question {step + 1} / {questions.length}
        </div>

        <div className="progressBar">
          <div
            className="progress"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>

        <h2>{currentQuestion.question}</h2>

        <div className="answerList">
          {currentQuestion.answers.map((answer, index) => (
            <button
              key={answer.text}
              className="answerButton"
              onClick={() => handleAnswer(answer)}
            >
              <span>{String.fromCharCode(65 + index)}</span>
              {answer.text}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;