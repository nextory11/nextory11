import PanelFrameOrnaments from "./PanelFrameOrnaments";

function ProgressBar({ current, total }) {
  const percent = (current / total) * 100;

  return (
    <div className="progressContainer">
      <PanelFrameOrnaments />
      <div className="progressText">
        Question {current} / {total}
      </div>

      <div className="progressBar">
        <div
          className="progress"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
