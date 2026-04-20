import api from "./api";

// ── Subscription / Plans API Service ─────────────────────────────────────────

/**
 * GET /plans
 * Fetches all available plans with features.
 * @returns {Array<{ id, name_en, name_ar, price, duration, features }>}
 */
export const getPlans = () => api.get("/plans");

/**
 * POST /subscriptions
 * Subscribes the authenticated user to a plan.
 * @param {string} planId — UUID of the plan
 * @returns {Object} subscription record
 */
export const createSubscription = (planId) =>
  api.post("/subscriptions", { planId });

/**
 * GET /subscriptions/me
 * Fetches the current user's active subscription (formatted for client).
 * @returns {{ subscription_id, status, features_snapshot, plan, billingCycle, period }}
 */
export const getMySubscription = () => api.get("/subscriptions/me");

/**
 * GET /subscriptions/me/usage
 * Fetches usage vs limits for all 3 feature keys.
 * @returns {{ subscription_id, plan_ends_at, usage: { projects, ai, estimations } }}
 */
export const getMyUsage = () => api.get("/subscriptions/me/usage");
 
/**
 * PATCH /subscriptions/switch
 * Requests a plan change and emails a confirmation token.
 * @param {string} newPlanId — UUID of the new plan
 * @returns {{ message, currentPlan, newPlan }}
 */
export const requestSwitchPlan = (newPlanId) =>
  api.patch("/subscriptions/switch", { newPlanId });

/**
 * POST /subscriptions/switch/confirm
 * Confirms the plan change using the token from the email.
 * @param {string} confirmationToken — JWT confirmation token
 * @returns {{ message, subscription }}
 */
export const confirmSwitchPlan = (confirmationToken) =>
  api.post("/subscriptions/switch/confirm", { confirmationToken });
