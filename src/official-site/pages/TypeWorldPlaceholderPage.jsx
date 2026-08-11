import { toOfficialHref } from "../routing.js";

function TypeWorldPlaceholderPage({ typeName }) {
  return (
    <main className="officialPlaceholder">
      <div className="officialPlaceholder__stars" aria-hidden="true" />
      <div className="officialPlaceholder__content">
        <p>11 WORLDS</p><h1>{typeName}</h1><span aria-hidden="true">✦</span>
        <p className="officialPlaceholder__notice">WORLD PAGE — COMING SOON</p>
        <a className="officialPlaceholder__return" href={toOfficialHref("/official-preview/types")}>11のタイプへ戻る</a>
      </div>
    </main>
  );
}

export default TypeWorldPlaceholderPage;
