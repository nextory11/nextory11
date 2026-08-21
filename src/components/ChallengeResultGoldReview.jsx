import { useEffect, useRef, useState } from "react";
import PremiumCard from "./PremiumCard";
import StarReadingSection from "./StarReadingSection";
import { selectRandomMessageIndex } from "../lib/aiJuza/randomSelection";
import { challengeAiJuzaMessages, challengeStarReadings } from "../data/challengeOfficialResultCopy";

function ChallengeResultGoldReview({
  afterContent = null,
  checkoutError = "",
  isPremiumEnabled = true,
  isPremiumLoading = false,
  onPremiumClick = () => {},
  showReviewControls = false,
}) {
  const [selectedMessage, setSelectedMessage] = useState(
    () => selectRandomMessageIndex(challengeAiJuzaMessages),
  );
  const messageRef = useRef(null);

  useEffect(() => {
    messageRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [selectedMessage]);

  return (
    <main className="challengeGoldReview">
      <div className="challengeGoldReview__cosmos" aria-hidden="true" />
      <div className="challengeGoldReview__outerFrame" aria-hidden="true" />
      {showReviewControls ? (
        <details className="challengeReviewControls">
          <summary>REVIEW</summary>
          <div>
            {challengeAiJuzaMessages.map((_, index) => (
              <button key={index} type="button" aria-pressed={selectedMessage === index} onClick={() => setSelectedMessage(index)}>{String(index + 1).padStart(2, "0")}</button>
            ))}
          </div>
        </details>
      ) : null}
      <header className="challengeGoldHero">
        <p className="challengeGoldHero__eyebrow">YOUR STAR TYPE</p>
        <div className="challengeGoldHero__emblem">
          <img src="/images/result-scenes/challenge/icons/emblem.png" alt="Challenge official emblem" />
        </div>
        <h1>CHALLENGE</h1>
        <p className="challengeGoldHero__ja">挑戦力タイプ</p>
        <p className="challengeGoldHero__quote">怖くても一歩を踏み出し、未来を自分で切り開く人</p>
        <span>CREATE THE FUTURE.</span>
      </header>

      <div className="challengeGoldReview__content">
        <section className="challengeJuzaGlass cosmicGlass" aria-labelledby="challenge-juza-title">
          <div className="challengeJuzaGlass__portrait">
            <img src="/images/result-scenes/challenge/characters/ai_juza_portrait.png" alt="AI JUZA" />
          </div>
          <div className="challengeJuzaGlass__body">
            <p className="cosmicGlass__eyebrow">A MESSAGE FROM AI JUZA</p>
            <h2 id="challenge-juza-title">AI JUZAからの言葉</h2>
            <div className="challengeJuzaGlass__messageShell">
              <div ref={messageRef} className="challengeJuzaGlass__message" aria-live="polite" tabIndex="0" aria-label={`AI JUZA message ${String(selectedMessage + 1).padStart(2, "0")}; scroll for full text`}>
                {challengeAiJuzaMessages[selectedMessage].split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <span className="challengeJuzaGlass__scrollHint" aria-hidden="true">全文を読む&nbsp;&nbsp;↓</span>
            </div>
          </div>
        </section>

        <StarReadingSection
          cards={challengeStarReadings.map((section) => ({
            ...section,
            previewText: section.fullText.slice(0, 3).join("\n\n"),
          }))}
          renderIcon={(section) => (
            <span className="starReadingPanel__icon" aria-hidden="true">{section.icon}</span>
          )}
          theme="challenge"
        />

        <div className="resultHero challengePremiumRestoreScope" data-star-type="challenger">
          <PremiumCard
            checkoutError={checkoutError}
            isEnabled={isPremiumEnabled}
            isLoading={isPremiumLoading}
            onClick={onPremiumClick}
            resultType="challenger"
          />
        </div>
        {afterContent}
      </div>
      <footer className="challengeGoldReview__footer">― Find Your Star. ―</footer>
    </main>
  );
}

export default ChallengeResultGoldReview;
