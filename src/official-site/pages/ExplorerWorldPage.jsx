const EXPLORER_DESKTOP_MASTER = "/official-site/images/types/explorer/desktop/explorer-desktop-final-approved-latest.png";
const EXPLORER_MOBILE_MASTER = "/official-site/images/types/explorer/mobile/explorer-mobile-final-approved-latest.png";

function ExplorerWorldPage() {
  return (
    <>
      <main className="explorerWorldPage" aria-labelledby="explorer-world-title">
        <h1 id="explorer-world-title" className="worldsPage__srOnly">02 EXPLORER / エクスプローラー</h1>

        <div className="explorerWorldPage__desktop">
          <img
            className="explorerWorldPage__master"
            src={EXPLORER_DESKTOP_MASTER}
            alt="02 EXPLORER エクスプローラー — 探究と発見の世界"
            draggable="false"
          />
          <a
            className="explorerWorldPage__diagnosisCta"
            href="/diagnosis?new=1"
            aria-label="自分の星を見つける — NEXTORY11を診断する"
          />
        </div>
      </main>

      <div className="explorerWorldPage__mobile">
        <img
          className="explorerWorldPage__mobileMaster"
          src={EXPLORER_MOBILE_MASTER}
          alt="02 EXPLORER エクスプローラー — 探究と発見の世界"
          draggable="false"
        />
        <a
          className="explorerWorldPage__mobileDiagnosisCta"
          href="/diagnosis?new=1"
          aria-label="自分の星を見つける — NEXTORY11を診断する"
        />
      </div>
    </>
  );
}

export default ExplorerWorldPage;
