const CHECKOUT_SNAPSHOT_KEY = "nextory11.checkoutSnapshot";
const RUNTIME_CONFIG_PATH = "/stripe-config.json";

function normalizeCheckoutUrl(rawUrl) {
  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl);
    const allowedHosts = ["checkout.stripe.com", "buy.stripe.com"];

    if (url.protocol !== "https:" || !allowedHosts.includes(url.hostname)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

async function readRuntimeConfig() {
  try {
    const response = await fetch(RUNTIME_CONFIG_PATH, { cache: "no-store" });

    if (!response.ok) {
      return {};
    }

    const config = await response.json();

    return config;
  } catch {
    return {};
  }
}

function parsePublicBoolean(value) {
  return value === true || value === "true" || value === "1";
}

export async function getStripeCheckoutUrl() {
  const windowUrl = window.__NEXTORY11_STRIPE_CHECKOUT_URL__;
  const envUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL;
  const config = await readRuntimeConfig();

  return normalizeCheckoutUrl(windowUrl || envUrl || config.checkoutUrl);
}

export async function getPaidCtaEnabled() {
  const windowFlag = window.__NEXTORY11_PAID_CTA_ENABLED__;
  const envFlag = import.meta.env.VITE_PAID_CTA_ENABLED;

  if (windowFlag !== undefined) {
    return parsePublicBoolean(windowFlag);
  }

  if (envFlag !== undefined) {
    return parsePublicBoolean(envFlag);
  }

  const config = await readRuntimeConfig();
  return parsePublicBoolean(config.paidCtaEnabled);
}

export function saveCheckoutSnapshot(snapshot) {
  window.localStorage.setItem(CHECKOUT_SNAPSHOT_KEY, JSON.stringify(snapshot));
}

export function readCheckoutSnapshot() {
  try {
    const stored = window.localStorage.getItem(CHECKOUT_SNAPSHOT_KEY);

    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearCheckoutSnapshot() {
  window.localStorage.removeItem(CHECKOUT_SNAPSHOT_KEY);
}

function createLocalRequestId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `nextory11-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createReportRequest({ answers, result, resultType }) {
  return {
    requestId: createLocalRequestId(),
    createdAt: new Date().toISOString(),
    status: "awaiting_payment_verification",
    result: {
      type: resultType,
      ja: result.title,
      en: result.en,
      icon: result.icon,
      essence: result.essence,
      strength: result.strength,
      mission: result.mission,
    },
    answers: answers.map((answer, index) => ({
      questionNumber: index + 1,
      questionId: answer.questionId ?? index + 1,
      question: answer.question ?? "",
      answerLabel: answer.answerLabel ?? "",
      answer: answer.text,
      type: answer.type,
      score: answer.score,
    })),
  };
}

export async function redirectToStripeCheckout({ answers, result, resultType }) {
  const checkoutUrl = await getStripeCheckoutUrl();

  if (!checkoutUrl) {
    throw new Error("Stripe Checkout URL is not configured.");
  }

  const snapshot = createReportRequest({ answers, result, resultType });

  saveCheckoutSnapshot(snapshot);
  window.location.assign(checkoutUrl.toString());
}
