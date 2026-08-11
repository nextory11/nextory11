const CHALLENGE_DESKTOP_MASTER = "/official-site/images/types/challenge/desktop/challenge-desktop-final-approved-clean-nav.png";
const CHALLENGE_MOBILE_MASTER = "/official-site/images/types/challenge/mobile/challenge-mobile-final-approved-replacement.png";

function ChallengeWorldPage() {
  return (
    <main className="challengeWorldPage" aria-labelledby="challenge-world-title">
      <h1 id="challenge-world-title" className="worldsPage__srOnly">01 CHALLENGE / チャレンジャー</h1>

      <div className="challengeWorldPage__desktop">
        <img
          className="challengeWorldPage__master"
          src={CHALLENGE_DESKTOP_MASTER}
          alt="01 CHALLENGE チャレンジャー — 炎と突破の世界"
          draggable="false"
        />
        <a
          className="challengeWorldPage__diagnosisCta"
          href="/diagnosis"
          aria-label="自分の星を見つける — NEXTORY11を診断する"
        />
      </div>

      <div className="challengeWorldPage__mobile">
        <div className="challengeWorldPage__mobileArtwork">
          <img
            className="challengeWorldPage__mobileMaster"
            src={CHALLENGE_MOBILE_MASTER}
            alt="01 CHALLENGE チャレンジャー — 炎と突破の世界"
            draggable="false"
          />
          <a
            className="challengeWorldPage__mobileDiagnosisCta"
            href="/diagnosis"
            aria-label="自分の星を見つける — NEXTORY11を診断する"
          />
        </div>
      </div>
    </main>
  );
}

export default ChallengeWorldPage;
