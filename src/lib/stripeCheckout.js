const LEGACY_CHECKOUT_SNAPSHOT_KEY = "nextory11.checkoutSnapshot";
const CHECKOUT_SNAPSHOT_PREFIX = "nextory11.checkoutSnapshot.v2.";
const CHECKOUT_SESSION_PREFIX = "nextory11.checkoutSnapshot.session.v2.";
const ACTIVE_CHECKOUT_POINTER_KEY = "nextory11.checkoutSnapshot.active.v2";
const CHECKOUT_SNAPSHOT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
export function isPaidCtaEnabledFlag(value) {
  return value === "true";
}

export async function getPaidCtaEnabled() {
  return isPaidCtaEnabledFlag(import.meta.env.VITE_PAID_CTA_ENABLED);
}

function snapshotKey(requestId) {
  return `${CHECKOUT_SNAPSHOT_PREFIX}${requestId}`;
}

function sessionKey(checkoutSessionId) {
  return `${CHECKOUT_SESSION_PREFIX}${checkoutSessionId}`;
}

function isValidSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return false;
  if (typeof snapshot.requestId !== "string" || !snapshot.requestId) return false;
  if (typeof snapshot.accessToken !== "string" || !snapshot.accessToken) return false;
  const createdAt = Date.parse(snapshot.createdAt);
  return Number.isFinite(createdAt) && Date.now() - createdAt <= CHECKOUT_SNAPSHOT_MAX_AGE_MS;
}

function readStoredSnapshot(key) {
  try {
    const stored = window.localStorage.getItem(key);
    const snapshot = stored ? JSON.parse(stored) : null;
    if (isValidSnapshot(snapshot)) return snapshot;
    if (stored) window.localStorage.removeItem(key);
  } catch {
    window.localStorage.removeItem(key);
  }
  return null;
}

export function saveCheckoutSnapshot(snapshot) {
  if (!isValidSnapshot(snapshot)) throw new Error("invalid_checkout_snapshot");
  window.localStorage.setItem(snapshotKey(snapshot.requestId), JSON.stringify(snapshot));
  window.localStorage.setItem(ACTIVE_CHECKOUT_POINTER_KEY, snapshot.requestId);
  if (snapshot.checkoutSessionId) {
    window.localStorage.setItem(sessionKey(snapshot.checkoutSessionId), snapshot.requestId);
  }
}

export function readCheckoutSnapshot(identifier = null) {
  let requestId = identifier;
  let checkoutSessionId = null;
  if (identifier?.startsWith("cs_")) {
    checkoutSessionId = identifier;
    requestId = window.localStorage.getItem(sessionKey(identifier));
    if (!requestId) return null;
  }
  if (!identifier && !requestId) requestId = window.localStorage.getItem(ACTIVE_CHECKOUT_POINTER_KEY);
  if (requestId) {
    const snapshot = readStoredSnapshot(snapshotKey(requestId));
    if (snapshot) return snapshot;
    if (window.localStorage.getItem(ACTIVE_CHECKOUT_POINTER_KEY) === requestId) {
      window.localStorage.removeItem(ACTIVE_CHECKOUT_POINTER_KEY);
    }
  }
  if (checkoutSessionId) window.localStorage.removeItem(sessionKey(checkoutSessionId));

  if (!identifier) {
    const legacy = readStoredSnapshot(LEGACY_CHECKOUT_SNAPSHOT_KEY);
    if (legacy) {
      saveCheckoutSnapshot(legacy);
      window.localStorage.removeItem(LEGACY_CHECKOUT_SNAPSHOT_KEY);
      return legacy;
    }
  }
  return null;
}

export function clearCheckoutSnapshot(identifier = null) {
  let requestId = identifier;
  let checkoutSessionId = null;
  if (identifier?.startsWith("cs_")) {
    checkoutSessionId = identifier;
    requestId = window.localStorage.getItem(sessionKey(identifier));
    if (!requestId) return;
  }
  if (!identifier && !requestId) requestId = window.localStorage.getItem(ACTIVE_CHECKOUT_POINTER_KEY);
  const snapshot = requestId ? readStoredSnapshot(snapshotKey(requestId)) : null;
  if (snapshot?.checkoutSessionId) {
    window.localStorage.removeItem(sessionKey(snapshot.checkoutSessionId));
  }
  if (checkoutSessionId) window.localStorage.removeItem(sessionKey(checkoutSessionId));
  if (requestId) {
    window.localStorage.removeItem(snapshotKey(requestId));
    if (window.localStorage.getItem(ACTIVE_CHECKOUT_POINTER_KEY) === requestId) {
      window.localStorage.removeItem(ACTIVE_CHECKOUT_POINTER_KEY);
    }
  }
  if (!identifier) window.localStorage.removeItem(LEGACY_CHECKOUT_SNAPSHOT_KEY);
}

export async function recoverCheckoutSnapshot(checkoutSessionId) {
  const recovered = await postJson("/api/checkout-session-recovery", { checkoutSessionId });
  const snapshot = { ...recovered, checkoutSessionId };
  saveCheckoutSnapshot(snapshot);
  return snapshot;
}

async function postJson(path, body, accessToken = null) {
  const headers = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const response = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "payment_backend_unavailable");
  return payload;
}

export async function createCheckoutForExistingRequest({ requestId, accessToken }) {
  if (!requestId || !accessToken) throw new Error("report_access_required");
  const checkout = await postJson("/api/checkout-sessions", { reportRequestId: requestId }, accessToken);
  const checkoutUrl = normalizeCheckoutUrl(checkout.checkoutUrl);
  if (!checkoutUrl) throw new Error("invalid_checkout_url");
  return { ...checkout, checkoutUrl: checkoutUrl.toString() };
}

function normalizeCheckoutUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com" ? url : null;
  } catch {
    return null;
  }
}

export async function redirectToStripeCheckout({
  answers,
  result,
  resultType,
  questionBankContext = null,
  diagnosisSessionId = null,
}) {
  if (!(await getPaidCtaEnabled())) throw new Error("paid_checkout_disabled");
  const reportRequest = await postJson("/api/report-requests", {
    answers: answers.map((answer, index) => ({
      questionId: answer.questionId ?? index + 1,
      answerId: answer.answerLabel,
    })),
    questionBankContext,
    diagnosisSessionId,
  });
  const checkout = await createCheckoutForExistingRequest({
    requestId: reportRequest.requestId,
    accessToken: reportRequest.accessToken,
  });
  const checkoutUrl = new URL(checkout.checkoutUrl);

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
    diagnosisSessionId,
    checkoutSessionId: checkout.checkoutSessionId,
  });
  window.location.assign(checkoutUrl.toString());
}
