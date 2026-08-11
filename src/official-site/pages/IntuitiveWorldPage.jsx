const INTUITIVE_DESKTOP_MASTER = "/official-site/images/types/intuitive/desktop/intuitive-desktop-final-approved.png";
const INTUITIVE_MOBILE_MASTER = "/official-site/images/types/intuitive/mobile/intuitive-mobile-final-approved.png";

function IntuitiveWorldPage() {
  return (
    <>
      <main className="intuitiveWorldPage" aria-labelledby="intuitive-world-title">
        <h1 id="intuitive-world-title" className="worldsPage__srOnly">11 INTUITIVE / インテュイティブ</h1>

        <div className="intuitiveWorldPage__desktop">
          <img
            className="intuitiveWorldPage__master"
            src={INTUITIVE_DESKTOP_MASTER}
            alt="11 INTUITIVE インテュイティブ — 直感と導きの世界"
            draggable="false"
          />
        </div>
      </main>

      <div className="intuitiveWorldPage__mobile">
        <img
          className="intuitiveWorldPage__mobileMaster"
          src={INTUITIVE_MOBILE_MASTER}
          alt="11 INTUITIVE インテュイティブ — 直感と導きの世界"
          draggable="false"
        />
      </div>
    </>
  );
}

export default IntuitiveWorldPage;
