const EMPATH_DESKTOP_MASTER = "/official-site/images/types/empath/desktop/empath-desktop-final-approved.png";
const EMPATH_MOBILE_MASTER = "/official-site/images/types/empath/mobile/empath-mobile-final-approved.png";

function EmpathWorldPage() {
  return (
    <>
      <main className="empathWorldPage" aria-labelledby="empath-world-title">
        <h1 id="empath-world-title" className="worldsPage__srOnly">10 EMPATH / エンパス</h1>

        <div className="empathWorldPage__desktop">
          <img
            className="empathWorldPage__master"
            src={EMPATH_DESKTOP_MASTER}
            alt="10 EMPATH エンパス — 共感と癒しの世界"
            draggable="false"
          />
        </div>
      </main>

      <div className="empathWorldPage__mobile">
        <img
          className="empathWorldPage__mobileMaster"
          src={EMPATH_MOBILE_MASTER}
          alt="10 EMPATH エンパス — 共感と癒しの世界"
          draggable="false"
        />
      </div>
    </>
  );
}

export default EmpathWorldPage;
