const CHECKOUT_SNAPSHOT_KEY = "nextory11.checkoutSnapshot";
const RUNTIME_CONFIG_PATH = "/stripe-config.json";

function parsePublicBoolean(value) {
  return value === true || value === "true" || value === "1";
}

async function readRuntimeConfig() {
  try {
    const response = await fetch(RUNTIME_CONFIG_PATH, { cache: "no-store" });
    return response.ok ? response.json() : {};
  } catch {
    return {};
  }
}

export async function getPaidCtaEnabled() {
  if (!import.meta.env.DEV) return false;
  const windowFlag = window.__NEXTORY11_PAID_CTA_ENABLED__;
  if (windowFlag !== undefined) return parsePublicBoolean(windowFlag);
  const envFlag = import.meta.env.VITE_PAID_CTA_ENABLED;
  if (envFlag !== undefined) return parsePublicBoolean(envFlag);
  return parsePublicBoolean((await readRuntimeConfig()).paidCtaEnabled);
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

async function postJson(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "payment_backend_unavailable");
  return payload;
}

function normalizeCheckoutUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com" ? url : null;
  } catch {
    return null;
  }
}

export async function redirectToStripeCheckout({ answers, result, resultType, questionBankContext = null }) {
  if (!import.meta.env.DEV) throw new Error("paid_checkout_disabled");
  const reportRequest = await postJson("/api/report-requests", {
    answers: answers.map((answer, index) => ({
      questionId: answer.questionId ?? index + 1,
      answerId: answer.answerLabel,
    })),
    questionBankContext,
  });
  const checkout = await postJson("/api/checkout-sessions", {
    reportRequestId: reportRequest.requestId,
  });
  const checkoutUrl = normalizeCheckoutUrl(checkout.checkoutUrl);
  if (!checkoutUrl) throw new Error("invalid_checkout_url");

  saveCheckoutSnapshot({
    requestId: reportRequest.requestId,
    accessToken: reportRequest.accessToken,
    createdAt: reportRequest.createdAt,
    result: {
      type: resultType,
      ja: result.title,
      en: result.en,
      icon: result.icon,
      essence: result.essence,
      strength: result.strength,
      mission: result.mission,
    },
    answers,
    questionBankContext,
  });
  window.location.assign(checkoutUrl.toString());
}
