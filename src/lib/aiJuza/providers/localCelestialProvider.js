import { AI_JUZA_READING_VERSION } from "../contracts";

const openings = [
  "あなたの回答の奥に、静かに繰り返し現れる光がありました。",
  "星を読み終えた今、ひとつ興味深い響きが残っています。",
  "あなたが選んだ言葉の重なりから、穏やかな輪郭が浮かびました。",
  "この旅の答えには、あなたらしい一貫した光が宿っています。",
];
const interpretations = [
  (name) => `${name}の星は、あなたを決めつけるものではなく、今のあなたが自然に向かう方角を照らしています。`,
  (name) => `${name}という輪郭は、あなたのすべてではありません。けれど、今の選択を支える確かな光です。`,
  (name) => `${name}の性質は、ほかの力と結びつくことで、さらにあなたらしい輝きになります。`,
];
const closings = [
  "この結果を答えではなく、まだ知らない自分へ近づくための灯りとして受け取ってください。",
  "急いで変わる必要はありません。その可能性がすでに自分の中にあることを覚えていてください。",
  "あなたの星は完成形ではなく、これから自由に描き続けられる星図です。",
  "その光を信じる小さな瞬間が、あなた自身の物語を静かに広げていくでしょう。",
];

export function createLocalCelestialProvider() {
  return {
    id: "local-celestial",
    version: "1.0.0",
    capabilities: { dynamicQuestions: true, conversation: false, persistentMemory: false, mentoring: true },
    generateReading(context) {
      const { profile } = context;
      const hash = profile.answerSignature;
      const hidden = profile.hiddenTraits[0];
      const primaryStrength = profile.strengthRanking[0]?.strength;
      const message = [
        openings[hash % openings.length],
        interpretations[(hash >>> 3) % interpretations.length](profile.personalityLabel),
        primaryStrength ? `特に強く届いたのは、${primaryStrength}` : null,
        hidden ? `そして、${hidden.title}の光も静かに寄り添っています。${hidden.essence}` : "まだ表に出ていない可能性も、経験の中でゆっくり形になるでしょう。",
        closings[(hash >>> 5) % closings.length],
      ].filter(Boolean).join(" ");

      return { version: AI_JUZA_READING_VERSION, message, profile, provider: { id: this.id, version: this.version } };
    },
  };
}
