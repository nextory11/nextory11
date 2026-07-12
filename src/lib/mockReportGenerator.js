const PREVIEW_LABEL = "DEVELOPMENT PREVIEW — NOT THE FINAL PAID REPORT";

function summarizeAnswerThemes(answers) {
  const counts = answers.reduce((summary, answer) => {
    summary[answer.type] = (summary[answer.type] || 0) + 1;
    return summary;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);
}

export async function generateDevelopmentReport(request) {
  await new Promise((resolve) => window.setTimeout(resolve, 900));

  const result = request.result;
  const themes = summarizeAnswerThemes(request.answers);
  const themeText = themes.length ? themes.join(" / ") : result.type;

  return {
    previewLabel: PREVIEW_LABEL,
    requestId: request.requestId,
    generatedAt: new Date().toISOString(),
    result,
    sections: [
      {
        id: "core",
        title: "あなたの本質",
        body: `${result.ja}のあなたは、${result.essence} 11の回答には「${themeText}」の傾向が表れています。これは開発用の簡易分析であり、最終レポートではありません。`,
      },
      {
        id: "strengths",
        title: "強みと才能",
        body: `${result.strength} とくに、自分の感覚を小さな行動へ変換するとき、その力が周囲にも伝わりやすくなります。`,
      },
      {
        id: "work",
        title: "仕事と向いている方向性",
        body: "裁量を持って工夫でき、学びと実践を往復できる環境が候補です。役割名だけで決めず、日々どのような判断と対話をする仕事かを確かめてください。",
      },
      {
        id: "relationships",
        title: "人間関係",
        body: "相手を尊重しながら、自分の希望も短い言葉で伝えることが関係を育てます。察してもらうことだけに頼らず、期待を小さく共有するのが鍵です。",
      },
      {
        id: "future",
        title: "未来の可能性",
        body: "今の強みを一度に完成させる必要はありません。小さな実験、振り返り、次の選択を重ねることで、あなたらしい方向性が具体的になります。",
      },
      {
        id: "plan",
        title: "30日アクションプラン",
        items: [
          "1週目：気になるテーマを一つ選び、毎日5分だけ記録する。",
          "2週目：信頼できる人に、自分の強みについて一つ質問する。",
          "3週目：小さな挑戦を一つ実行し、結果より感触を振り返る。",
          `4週目：${result.mission}`,
        ],
      },
      {
        id: "closing",
        title: "AI Juzaからのメッセージ",
        body: "あなたの星は、答えを急いだときよりも、自分の小さな選択を信じたときに強く輝きます。今日できる一歩を、あなた自身の速度で選んでください。",
      },
    ],
  };
}
