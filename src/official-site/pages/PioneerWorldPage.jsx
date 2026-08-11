const PIONEER_DESKTOP_MASTER = "/official-site/images/types/pioneer/desktop/pioneer-desktop-final-approved.png";
const PIONEER_MOBILE_MASTER = "/official-site/images/types/pioneer/mobile/pioneer-mobile-final-approved.png";

function PioneerWorldPage() {
  return (
    <>
      <main className="pioneerWorldPage" aria-labelledby="pioneer-world-title">
        <h1 id="pioneer-world-title" className="worldsPage__srOnly">08 PIONEER / パイオニア</h1>

        <div className="pioneerWorldPage__desktop">
          <img
            className="pioneerWorldPage__master"
            src={PIONEER_DESKTOP_MASTER}
            alt="08 PIONEER パイオニア — 開拓と挑戦の世界"
            draggable="false"
          />
        </div>
      </main>

      <div className="pioneerWorldPage__mobile">
        <img
          className="pioneerWorldPage__mobileMaster"
          src={PIONEER_MOBILE_MASTER}
          alt="08 PIONEER パイオニア — 開拓と挑戦の世界"
          draggable="false"
        />
      </div>
    </>
  );
}

export default PioneerWorldPage;
