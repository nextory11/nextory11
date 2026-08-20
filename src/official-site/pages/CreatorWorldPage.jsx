const CREATOR_DESKTOP_MASTER = "/official-site/images/types/creator/desktop/creator-desktop-final-approved.png";
const CREATOR_MOBILE_MASTER = "/official-site/images/types/creator/mobile/creator-mobile-final-approved.png";

function CreatorWorldPage() {
  return (
    <>
      <main className="creatorWorldPage" aria-labelledby="creator-world-title">
        <h1 id="creator-world-title" className="worldsPage__srOnly">05 CREATOR / クリエイター</h1>

        <div className="creatorWorldPage__desktop">
          <img
            className="creatorWorldPage__master"
            src={CREATOR_DESKTOP_MASTER}
            alt="05 CREATOR クリエイター — 創造と表現の世界"
            draggable="false"
          />
          <a
            className="creatorWorldPage__diagnosisCta"
            href="/diagnosis?new=1"
            aria-label="自分の星を見つける — NEXTORY11を診断する"
          />
        </div>
      </main>

      <div className="creatorWorldPage__mobile">
        <img
          className="creatorWorldPage__mobileMaster"
          src={CREATOR_MOBILE_MASTER}
          alt="05 CREATOR クリエイター — 創造と表現の世界"
          draggable="false"
        />
        <a
          className="creatorWorldPage__mobileDiagnosisCta"
          href="/diagnosis?new=1"
          aria-label="自分の星を見つける — NEXTORY11を診断する"
        />
      </div>
    </>
  );
}

export default CreatorWorldPage;
