const EMPATH_DESKTOP_MASTER = "/official-site/images/types/empath/desktop/empath-desktop-corrected-palette.png";
const EMPATH_MOBILE_MASTER = "/official-site/images/types/empath/mobile/empath-mobile-corrected-palette.png";

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
        <div className="empathWorldPage__mobileClosing" aria-label="あなたの優しさが、世界を癒し、未来を照らす。その共感が、新しい希望の光となります。">
          <p>あなたの優しさが、<br />世界を癒し、未来を照らす。</p>
          <span>その共感が、新しい希望の光となります。</span>
        </div>
      </div>
    </>
  );
}

export default EmpathWorldPage;
