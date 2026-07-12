function QuestionCard({ question, onAnswer }) {
  return (
    <>
      <h2>{question.question}</h2>

      <div className="answerList">
        {question.answers.map((answer, index) => (
          <button
            key={index}
            type="button"
            className="answerButton"
            onClick={() => onAnswer(answer)}
          >
            <span className="answerButton__letter">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="answerButton__text">{answer.text}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export default QuestionCard;
