function ProgressBar({ current, total }) {
  const percent = (current / total) * 100;

  return (
    <>
      <div className="progressText">
        Question {current} / {total}
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
