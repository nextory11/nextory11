const GUARDIAN_DESKTOP_MASTER = "/official-site/images/types/guardian/desktop/guardian-desktop-final-approved.png";
const GUARDIAN_MOBILE_MASTER = "/official-site/images/types/guardian/mobile/guardian-mobile-final-approved.png";

function GuardianWorldPage() {
  return (
    <>
      <main className="guardianWorldPage" aria-labelledby="guardian-world-title">
        <h1 id="guardian-world-title" className="worldsPage__srOnly">06 GUARDIAN / ガーディアン</h1>

        <div className="guardianWorldPage__desktop">
          <img
            className="guardianWorldPage__master"
            src={GUARDIAN_DESKTOP_MASTER}
            alt="06 GUARDIAN ガーディアン — 保護と信念の世界"
            draggable="false"
          />
          <a
            className="guardianWorldPage__diagnosisCta"
            href="/diagnosis"
            aria-label="自分の星を見つける — NEXTORY11を診断する"
          />
        </div>
      </main>

      <div className="guardianWorldPage__mobile">
        <img
          className="guardianWorldPage__mobileMaster"
          src={GUARDIAN_MOBILE_MASTER}
          alt="06 GUARDIAN ガーディアン — 保護と信念の世界"
          draggable="false"
        />
        <a
          className="guardianWorldPage__mobileDiagnosisCta"
          href="/diagnosis"
          aria-label="自分の星を見つける — NEXTORY11を診断する"
        />
      </div>
    </>
  );
}

export default GuardianWorldPage;
