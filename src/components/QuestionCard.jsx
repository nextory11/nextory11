import PanelFrameOrnaments from "./PanelFrameOrnaments";
import { useEffect, useRef, useState } from "react";

function QuestionCard({ question, selectedAnswerId: savedAnswerId, canGoPrevious, onAnswer, onPrevious }) {
  const frameRef = useRef(null);
  const answerTimerRef = useRef(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState(savedAnswerId);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const questionId = `question-${question.id}`;

  useEffect(() => {
    window.clearTimeout(answerTimerRef.current);
    frameRef.current?.focus({ preventScroll: true });
    setSelectedAnswerId(savedAnswerId);
    setIsTransitioning(false);
  }, [question.id, savedAnswerId]);

  useEffect(() => () => window.clearTimeout(answerTimerRef.current), []);

  function handleAnswer(answer) {
    if (isTransitioning) return;
    const answerId = answer.id ?? answer.text;
    setSelectedAnswerId(answerId);
    setIsTransitioning(true);
    const delay = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : 220;
    answerTimerRef.current = window.setTimeout(() => onAnswer(answer), delay);
  }

  function handlePrevious() {
    if (isTransitioning || !canGoPrevious) return;
    window.clearTimeout(answerTimerRef.current);
    onPrevious();
  }

  return (
    <section ref={frameRef} className="questionCardFrame" data-question-id={question.id} tabIndex="-1" aria-labelledby={questionId}>
      <PanelFrameOrnaments />
      <div className="questionCardFrame__halo" aria-hidden="true" />
      {canGoPrevious ? (
        <button type="button" className="questionCardFrame__previous" onClick={handlePrevious}>
          <span aria-hidden="true">←</span>
          前の質問へ
        </button>
      ) : null}
      <p className="questionCardFrame__eyebrow">内なる星を読み解く</p>
      <h2 id={questionId} aria-live="polite">{question.question ?? question.text}</h2>
      <div className="questionCardFrame__divider" aria-hidden="true"><span /></div>

      <div className="answerList">
        {question.answers.map((answer, index) => (
          <button
            key={answer.id ?? index}
            type="button"
            className={`answerButton${selectedAnswerId === (answer.id ?? answer.text) ? " answerButton--selected" : ""}`}
            data-answer-id={answer.id}
            aria-pressed={selectedAnswerId === (answer.id ?? answer.text)}
            disabled={isTransitioning}
            onClick={() => handleAnswer(answer)}
          >
            <PanelFrameOrnaments />
            <span className="answerButton__energy" aria-hidden="true" />
            <span className="answerButton__letter">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="answerButton__text">{answer.text}</span>
            {selectedAnswerId === (answer.id ?? answer.text) ? (
              <span className="answerButton__selectedStatus" aria-hidden="true">
                <span>✓</span>
                <span className="answerButton__selectedLabel">選択中</span>
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuestionCard;
