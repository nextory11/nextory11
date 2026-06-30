function ProgressBar({ step, total }) {
  const percent = ((step + 1) / total) * 100;

  return (
    <>
      <div className="progressText">
        Question {step + 1} / {total}
      </div>

      <div className="progressBar">
        <div
          className="progress"
          style={{ width: `${percent}%` }}
        />
      </div>
    </>
  );
}

export default ProgressBar;