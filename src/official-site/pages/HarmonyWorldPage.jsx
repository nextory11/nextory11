const HARMONY_DESKTOP_MASTER = "/official-site/images/types/harmony/desktop/harmony-desktop-final-approved-clean-nav.png";
const HARMONY_MOBILE_MASTER = "/official-site/images/types/harmony/mobile/harmony-mobile-final-approved.png";

function HarmonyWorldPage() {
  return (
    <>
      <main className="harmonyWorldPage" aria-labelledby="harmony-world-title">
        <h1 id="harmony-world-title" className="worldsPage__srOnly">03 HARMONY / ハーモニー</h1>

        <div className="harmonyWorldPage__desktop">
          <img
            className="harmonyWorldPage__master"
            src={HARMONY_DESKTOP_MASTER}
            alt="03 HARMONY ハーモニー — 調和とつながりの世界"
            draggable="false"
          />
          <a
            className="harmonyWorldPage__diagnosisCta"
            href="/diagnosis?new=1"
            aria-label="自分の星を見つける — NEXTORY11を診断する"
          />
        </div>
      </main>

      <div className="harmonyWorldPage__mobile">
        <img
          className="harmonyWorldPage__mobileMaster"
          src={HARMONY_MOBILE_MASTER}
          alt="03 HARMONY ハーモニー — 調和とつながりの世界"
          draggable="false"
        />
        <a
          className="harmonyWorldPage__mobileDiagnosisCta"
          href="/diagnosis?new=1"
          aria-label="自分の星を見つける — NEXTORY11を診断する"
        />
      </div>
    </>
  );
}

export default HarmonyWorldPage;
