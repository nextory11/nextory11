function OfficialPlaceholderPage({ eyebrow, title }) {
  return (
    <main className="officialPlaceholder">
      <div className="officialPlaceholder__stars" aria-hidden="true" />
      <div className="officialPlaceholder__content">
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span aria-hidden="true">✦</span>
        <p className="officialPlaceholder__notice">COMING SOON</p>
      </div>
    </main>
  );
}

export default OfficialPlaceholderPage;
