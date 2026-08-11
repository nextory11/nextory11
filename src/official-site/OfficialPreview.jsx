import OfficialHero from "./sections/OfficialHero.jsx";
import WhatIsNextory11 from "./sections/WhatIsNextory11.jsx";
import HowToUseNextory11 from "./sections/HowToUseNextory11.jsx";
import WhyNextory11 from "./sections/WhyNextory11.jsx";
import OfficialSiteShell from "./components/OfficialSiteShell.jsx";
import PhilosophyPage from "./pages/PhilosophyPage.jsx";
import TypesWorldsPage from "./pages/TypesWorldsPage.jsx";
import TypeWorldPlaceholderPage from "./pages/TypeWorldPlaceholderPage.jsx";
import ChallengeWorldPage from "./pages/ChallengeWorldPage.jsx";
import ExplorerWorldPage from "./pages/ExplorerWorldPage.jsx";
import HarmonyWorldPage from "./pages/HarmonyWorldPage.jsx";
import VisionaryWorldPage from "./pages/VisionaryWorldPage.jsx";
import CreatorWorldPage from "./pages/CreatorWorldPage.jsx";
import GuardianWorldPage from "./pages/GuardianWorldPage.jsx";
import LuminaryWorldPage from "./pages/LuminaryWorldPage.jsx";
import PioneerWorldPage from "./pages/PioneerWorldPage.jsx";
import EvolverWorldPage from "./pages/EvolverWorldPage.jsx";
import EmpathWorldPage from "./pages/EmpathWorldPage.jsx";
import IntuitiveWorldPage from "./pages/IntuitiveWorldPage.jsx";
import { officialTypes } from "./data/officialTypes.js";
import { getOfficialSeo } from "./seo/officialSeo.js";
import { toPreviewRoute } from "./routing.js";
import "./styles/official-site.css";
import "./styles/types-worlds-page.css";
import "./styles/challenge-world-page.css";
import "./styles/explorer-world-page.css";
import "./styles/harmony-world-page.css";
import "./styles/visionary-world-page.css";
import "./styles/creator-world-page.css";
import "./styles/guardian-world-page.css";
import "./styles/luminary-world-page.css";
import "./styles/pioneer-world-page.css";
import "./styles/evolver-world-page.css";
import "./styles/empath-world-page.css";
import "./styles/intuitive-world-page.css";

const routes = {
  "/official-preview": {
    title: "NEXTORY11 Official Website",
    content: <OfficialHero />,
  },
  "/official-preview/about": {
    title: "NEXTORY11とは？",
    content: <WhatIsNextory11 />,
  },
  "/official-preview/how-to-use": {
    title: "NEXTORY11の使い方",
    content: <HowToUseNextory11 />,
  },
  "/official-preview/types": {
    title: "11のタイプ",
    content: <TypesWorldsPage />,
  },
  "/official-preview/why-nextory11": {
    title: "なぜ、NEXTORY11なのか。",
    content: <WhyNextory11 />,
  },
  "/official-preview/philosophy": {
    title: "PHILOSOPHY",
    content: <PhilosophyPage />,
  },
};

function OfficialPreview() {
  const pathname = toPreviewRoute();
  const typeSlug = pathname.match(/^\/official-preview\/types\/([a-z-]+)$/)?.[1];
  const type = officialTypes.find((entry) => entry.name.toLowerCase() === typeSlug);
  const worldPages = {
    Challenge: <ChallengeWorldPage />,
    Explorer: <ExplorerWorldPage />,
    Harmony: <HarmonyWorldPage />,
    Visionary: <VisionaryWorldPage />,
    Creator: <CreatorWorldPage />,
    Guardian: <GuardianWorldPage />,
    Luminary: <LuminaryWorldPage />,
    Pioneer: <PioneerWorldPage />,
    Evolver: <EvolverWorldPage />,
    Empath: <EmpathWorldPage />,
    Intuitive: <IntuitiveWorldPage />,
  };
  const route = type
    ? { title: `${type.name} | 11 WORLDS`, content: worldPages[type.name] ?? <TypeWorldPlaceholderPage typeName={type.name} /> }
    : routes[pathname] ?? routes["/official-preview"];
  const pageKey = pathname.split("/").filter(Boolean).at(-1) ?? "top";
  const seo = getOfficialSeo(pathname, type);

  return (
    <OfficialSiteShell pageTitle={route.title} pageKey={pageKey} seo={seo}>
      {route.content}
    </OfficialSiteShell>
  );
}

export default OfficialPreview;
