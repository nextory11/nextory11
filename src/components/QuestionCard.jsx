import PanelFrameOrnaments from "./PanelFrameOrnaments";

function QuestionCard({ question, onAnswer }) {
  return (
    <section className="questionCardFrame" data-question-id={question.id}>
      <PanelFrameOrnaments />
      <h2>{question.question ?? question.text}</h2>

      <div className="answerList">
        {question.answers.map((answer, index) => (
          <button
            key={answer.id ?? index}
            type="button"
            className="answerButton"
            data-answer-id={answer.id}
            onClick={() => onAnswer(answer)}
          >
            <PanelFrameOrnaments />
            <span className="answerButton__letter">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="answerButton__text">{answer.text}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuestionCard;
