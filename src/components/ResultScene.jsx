import { useEffect, useRef } from "react";

const DESIGN_MASTER_SCENES = {
  "01": { folder: "pioneer", constellation: "constellation01.png" },
  "02": { folder: "creator", constellation: "Creator_Constellation.png" },
  "03": { folder: "intuitive", constellation: "Intuitive_Constellation.png" },
  "04": { folder: "harmonizer", constellation: "Harmony_Constellation.png" },
  "05": { folder: "empath", constellation: "Empath_Constellation.png" },
  "06": { folder: "light-bringer", constellation: "Luminary_Constellation.png" },
  "07": { folder: "explorer", constellation: "Explorer_Constellation.png" },
  "08": { folder: "challenge", constellation: "constellation.png" },
  "09": { folder: "visionary", constellation: "Visionary_Constellation.png" },
  "10": { folder: "guardian", constellation: "Guardian_Constellation.png" },
  "11": { folder: "evolver", constellation: "constellation.png" },
};

function ResultScene({ scene }) {
  const sceneRef = useRef(null);
  const master = DESIGN_MASTER_SCENES[scene.number];

  useEffect(() => {
    const element = sceneRef.current;
    if (!element) return undefined;
    const resultHero = element.closest(".resultHero");

    const updatePointerLight = ({ clientX, clientY }) => {
      const x = clientX / window.innerWidth;
      const y = clientY / window.innerHeight;
      element.style.setProperty("--master-pointer-x", `${x * 100}%`);
      element.style.setProperty("--master-pointer-y", `${y * 100}%`);
      element.style.setProperty("--master-parallax-x", `${(x - 0.5) * -10}px`);
      element.style.setProperty("--master-parallax-y", `${(y - 0.5) * -7}px`);
      resultHero?.style.setProperty("--master-ui-x", `${(x - 0.5) * 5}px`);
      resultHero?.style.setProperty("--master-ui-y", `${(y - 0.5) * 4}px`);
    };

    window.addEventListener("pointermove", updatePointerLight, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointerLight);
  }, []);

  if (!master) return null;

  const base = `/images/result-scenes/${master.folder}`;

  return (
    <div ref={sceneRef} className="resultScene resultScene--designMaster" data-master-scene={master.folder} aria-hidden="true">
      <div className="designMasterScene__background" style={{ backgroundImage: `url(${base}/backgrounds/design_master.png)` }} />
      <div className="designMasterScene__atmosphere" />
      <div className="designMasterScene__bloom" />
      <div className="designMasterScene__lensFlare" />
      <div className="designMasterScene__stars">{Array.from({ length: 30 }, (_, index) => <i key={index} />)}</div>
      <div className="designMasterScene__dust">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
      <div className="designMasterScene__signature">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div>
      <div className="designMasterScene__constellation" style={{ backgroundImage: `url(${base}/icons/${master.constellation})` }} />
      <div className="designMasterScene__pointerLight" />
    </div>
  );
}

export default ResultScene;
