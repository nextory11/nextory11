const LUMINARY_DESKTOP_MASTER = "/official-site/images/types/luminary/desktop/luminary-desktop-final-approved.png";
const LUMINARY_MOBILE_MASTER = "/official-site/images/types/luminary/mobile/luminary-mobile-final-approved.png";

function LuminaryWorldPage() {
  return (
    <>
      <main className="luminaryWorldPage" aria-labelledby="luminary-world-title">
        <h1 id="luminary-world-title" className="worldsPage__srOnly">07 LUMINARY / ルミナリー</h1>

        <div className="luminaryWorldPage__desktop">
          <img
            className="luminaryWorldPage__master"
            src={LUMINARY_DESKTOP_MASTER}
            alt="07 LUMINARY ルミナリー — 光と探究の世界"
            draggable="false"
          />
          <a
            className="luminaryWorldPage__diagnosisCta"
            href="/diagnosis"
            aria-label="自分の星を見つける — NEXTORY11を診断する"
          />
        </div>
      </main>

      <div className="luminaryWorldPage__mobile">
        <img
          className="luminaryWorldPage__mobileMaster"
          src={LUMINARY_MOBILE_MASTER}
          alt="07 LUMINARY ルミナリー — 光と探究の世界"
          draggable="false"
        />
        <a
          className="luminaryWorldPage__mobileDiagnosisCta"
          href="/diagnosis"
          aria-label="自分の星を見つける — NEXTORY11を診断する"
        />
      </div>
    </>
  );
}

export default LuminaryWorldPage;
