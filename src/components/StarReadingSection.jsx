import { useState } from "react";

function StarReadingSection({ cards, renderIcon, theme }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section
      className={`starReadingSection starReadingSection--${theme}`}
      aria-label={`${theme} readings`}
    >
      {cards.map((card, index) => {
        const isOpen = openIndex === index;
        const contentId = `${theme}-reading-${card.number}`;
        const paragraphs = isOpen ? card.fullText : [card.previewText ?? card.summary];

        return (
          <article
            className={`starReadingPanel starReadingPanel--${theme}${isOpen ? " is-active" : ""}`}
            key={card.number}
          >
            <div className="starReadingPanel__heading">
              {renderIcon(card, index)}
              <h2>{card.title}</h2>
            </div>
            <div className="starReadingPanel__body" id={contentId}>
              {paragraphs.map((paragraph, paragraphIndex) => (
                <p key={`${card.number}-${paragraphIndex}`}>{paragraph}</p>
              ))}
            </div>
            <button
              type="button"
              aria-controls={contentId}
              aria-expanded={isOpen}
              onClick={() => setOpenIndex((currentIndex) => currentIndex === index ? null : index)}
            >
              {isOpen ? "閉じる" : "続きを読む"}
            </button>
          </article>
        );
      })}
    </section>
  );
}

export default StarReadingSection;
