const EVOLVER_DESKTOP_MASTER = "/official-site/images/types/evolver/desktop/evolver-desktop-corrected-palette-sunrise.png";
const EVOLVER_MOBILE_MASTER = "/official-site/images/types/evolver/mobile/evolver-mobile-approved.png";

function EvolverWorldPage() {
  return (
    <>
      <main className="evolverWorldPage" aria-labelledby="evolver-world-title">
        <h1 id="evolver-world-title" className="worldsPage__srOnly">09 EVOLVER / エボルバー</h1>

        <div className="evolverWorldPage__desktop">
          <img
            className="evolverWorldPage__master"
            src={EVOLVER_DESKTOP_MASTER}
            alt="09 EVOLVER エボルバー — 進化と変容の世界"
            draggable="false"
          />
        </div>
      </main>

      <div className="evolverWorldPage__mobile">
        <img
          className="evolverWorldPage__mobileMaster"
          src={EVOLVER_MOBILE_MASTER}
          alt="09 EVOLVER エボルバー — 進化と変容の世界"
          draggable="false"
        />
      </div>
    </>
  );
}

export default EvolverWorldPage;
