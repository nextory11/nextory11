function QuestionCard({ question, onAnswer }) {
  return (
    <div className="answerList">
      {question.answers.map((answer, index) => (
        <button
          key={index}
          className="answerButton"
          onClick={() => onAnswer(answer)}
        >
          <span>{String.fromCharCode(65 + index)}</span>
          {answer.text}
        </button>
      ))}
    </div>
  );
}

export default QuestionCard;