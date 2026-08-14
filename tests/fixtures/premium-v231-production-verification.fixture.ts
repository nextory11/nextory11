import type { ReportGeneratedContent } from "../../server/reports/contracts/report-output.v1.js";

const narrativeSection = (title: string) => ({
  title,
  summary: "現在のV2.3.1契約だけを確認するために作成した、外部接続を行わないテスト専用の要約です。",
  body: [
    "これは現在の契約が求める本文の長さと段落数を満たし、ローカル検証だけを安全に行うための文章です。",
    "これは二つ目の本文段落であり、生成処理やデータベース接続を使わずに構造の完全性を確認するための文章です。",
  ],
  keyPoints: [
    "現在のV2.3.1契約を基準に検証します。",
    "外部サービスへ接続せずローカルで確認します。",
  ],
  reflectionQuestion: "今日から安全に確認できる小さな一歩は何でしょうか。",
});

/** Current-contract-only fixture. Never contains customer or production data. */
export function buildPremiumV231ProductionVerificationFixture(): ReportGeneratedContent {
  return {
    executiveSummary: narrativeSection("全体像"),
    corePersonality: narrativeSection("本質"),
    hiddenStrengths: narrativeSection("強み"),
    traitInteraction: narrativeSection("相互作用"),
    decisionMakingStyle: narrativeSection("意思決定"),
    relationships: narrativeSection("関係性"),
    careerAndTalent: narrativeSection("才能"),
    currentGrowthStage: narrativeSection("成長段階"),
    blindSpots: narrativeSection("盲点"),
    personalRecommendations: narrativeSection("提案"),
    growthPlan30Days: {
      title: "30日計画",
      summary: "三つの連続した期間で小さな行動を試し、自分に合う進み方を安全に確認するテスト専用計画です。",
      actions: [
        { timing: "Day 1-10", title: "観察", action: "毎日一つの気づきを記録し、続けやすい方法を具体的に確認します。", purpose: "現在の傾向を安全に把握するためです。" },
        { timing: "Day 11-20", title: "実験", action: "記録から選んだ行動を小さく試し、結果と感覚を丁寧に比較します。", purpose: "自分に合う選択を見つけるためです。" },
        { timing: "Day 21-30", title: "定着", action: "有効だった行動を日常の予定へ組み込み、次の一歩を決めます。", purpose: "無理なく継続できる形にするためです。" },
      ],
    },
    aiJuzaClosingMessage: "ここまでの確認には、次へ進むための手がかりがあります。焦らず、今日選べる小さな一歩から始めてください。",
  };
}
