const VISIONARY_DESKTOP_MASTER = "/official-site/images/types/visionary/desktop/visionary-desktop-final-approved.png";
const VISIONARY_MOBILE_MASTER = "/official-site/images/types/visionary/mobile/visionary-mobile-final-approved.png";

function VisionaryWorldPage() {
  return (
    <>
      <main className="visionaryWorldPage" aria-labelledby="visionary-world-title">
        <h1 id="visionary-world-title" className="worldsPage__srOnly">
          04 Visionary — ビジョンと創造の世界
        </h1>

        <img
          className="visionaryWorldPage__master"
          src={VISIONARY_DESKTOP_MASTER}
          alt="04 Visionary — ビジョンと創造の世界"
          draggable="false"
        />
      </main>

      <div className="visionaryWorldPage__mobile">
        <img
          className="visionaryWorldPage__mobileMaster"
          src={VISIONARY_MOBILE_MASTER}
          alt="04 Visionary — ビジョンと創造の世界"
          draggable="false"
        />
      </div>
    </>
  );
}

export default VisionaryWorldPage;
