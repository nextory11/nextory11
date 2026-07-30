import PanelFrameOrnaments from "./PanelFrameOrnaments";

function ProgressBar({ current, total }) {
  const percent = (current / total) * 100;

  return (
    <div className="progressContainer" aria-label={`Question ${current} of ${total}`}>
      <PanelFrameOrnaments />
      <div className="progressText" aria-hidden="true">
        <span>星の旅路</span>
        <strong>{String(current).padStart(2, "0")}</strong>
        <i>/</i>
        <span>{String(total).padStart(2, "0")}</span>
      </div>

      <div className="progressBar" role="progressbar" aria-valuemin="1" aria-valuemax={total} aria-valuenow={current}>
        <div
          className="progress"
          style={{ width: `${percent}%` }}
        >
          <span className="progress__marker" />
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
