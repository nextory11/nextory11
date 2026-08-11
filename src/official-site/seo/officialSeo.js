const configuredOrigin = import.meta.env.VITE_SITE_URL || "https://nextory11.com";

export const OFFICIAL_SITE_ORIGIN = configuredOrigin.replace(/\/$/, "");
export const OFFICIAL_OG_IMAGE = `${OFFICIAL_SITE_ORIGIN}/official-site/images/experience/nextory11-experience-master.webp`;

const pageSeo = {
  "/official-preview": {
    title: "NEXTORY11 | あなたの中の輝く星を見つける",
    description: "NEXTORY11は、11の問いを通して自分らしさ、強み、価値観、未来の可能性に気づくための自己理解体験です。",
    canonicalPath: "/",
  },
  "/official-preview/about": {
    title: "NEXTORY11とは？ | NEXTORY11",
    description: "NEXTORY11の考え方と、11タイプから自分の内側にある強みや可能性を見つける自己理解体験について紹介します。",
    canonicalPath: "/about",
  },
  "/official-preview/how-to-use": {
    title: "NEXTORY11の使い方 | NEXTORY11",
    description: "11の質問への回答から自分の星を見つけ、AI JUZAやPremium Reportで理解を深めるNEXTORY11の体験の流れを紹介します。",
    canonicalPath: "/how-to-use",
  },
  "/official-preview/types": {
    title: "11のタイプ | NEXTORY11 Type Worlds",
    description: "ChallengeからIntuitiveまで、NEXTORY11の11タイプと、それぞれが持つ強み、価値観、未来の可能性を紹介します。",
    canonicalPath: "/types",
  },
  "/official-preview/why-nextory11": {
    title: "なぜ、NEXTORY11なのか。 | NEXTORY11",
    description: "答えを決めるためではなく、まだ知らない自分と新しい可能性に出会うために。NEXTORY11が大切にする体験の意味を紹介します。",
    canonicalPath: "/why-nextory11",
  },
  "/official-preview/philosophy": {
    title: "PHILOSOPHY 私たちの想い | NEXTORY11",
    description: "人の中に眠る可能性を信じ、本質を映し出し、未来をひらき、多様性を尊重するNEXTORY11の理念を紹介します。",
    canonicalPath: "/philosophy",
  },
};

const typeDescriptions = {
  Challenge: "Challengeは、情熱と突破力で限界を越え、未来を切り拓くNEXTORY11のタイプです。炎と突破の世界、強み、価値観を紹介します。",
  Explorer: "Explorerは、好奇心と探究心で未知の可能性を広げるNEXTORY11のタイプです。探究と発見の世界、強み、価値観を紹介します。",
  Harmony: "Harmonyは、人と人をつなぎ、優しさと理解で調和を育むNEXTORY11のタイプです。つながりの世界、強み、価値観を紹介します。",
  Visionary: "Visionaryは、豊かな想像力と信念で新しい未来を描くNEXTORY11のタイプです。ビジョンと創造の世界、強み、価値観を紹介します。",
  Creator: "Creatorは、感性と発想を独自の形にして世界を照らすNEXTORY11のタイプです。創造と表現の世界、強み、価値観を紹介します。",
  Guardian: "Guardianは、大切なものを守り、誠実さと信念で人を支えるNEXTORY11のタイプです。保護と信念の世界、強み、価値観を紹介します。",
  Luminary: "Luminaryは、知的好奇心とひらめきで人や社会を照らすNEXTORY11のタイプです。光と探究の世界、強み、価値観を紹介します。",
  Pioneer: "Pioneerは、未知を恐れず新しい道と可能性を切り拓くNEXTORY11のタイプです。開拓と挑戦の世界、強み、価値観を紹介します。",
  Evolver: "Evolverは、変化を受け入れ、経験から学びながら未来へ進化するNEXTORY11のタイプです。進化と変容の世界、強み、価値観を紹介します。",
  Empath: "Empathは、人の心に寄り添い、深い共感と優しさで安心を届けるNEXTORY11のタイプです。共感と癒しの世界、強み、価値観を紹介します。",
  Intuitive: "Intuitiveは、目に見えない本質を感じ取り、直感と洞察で未来を照らすNEXTORY11のタイプです。直感と導きの世界、強み、価値観を紹介します。",
};

export function getOfficialSeo(pathname, type) {
  const base = type
    ? {
        title: `${type.name} | NEXTORY11 Type World`,
        description: typeDescriptions[type.name],
        canonicalPath: `/types/${type.name.toLowerCase()}`,
      }
    : pageSeo[pathname] || pageSeo["/official-preview"];

  return {
    ...base,
    canonicalUrl: `${OFFICIAL_SITE_ORIGIN}${base.canonicalPath}`,
    imageUrl: OFFICIAL_OG_IMAGE,
  };
}

export const officialSitemapPaths = [
  ...Object.values(pageSeo).map(({ canonicalPath }) => canonicalPath),
  ...Object.keys(typeDescriptions).map((name) => `/types/${name.toLowerCase()}`),
];
