import { z } from "zod";

// ============================================================
// auth.schema.js — Localized Zod validation schemas
// ============================================================
// Schemas are now factory functions that accept `t` (i18next translate)
// so validation messages appear in the active language.
// ============================================================

// ------------------------------------------------------------
// Login schema factory
// ------------------------------------------------------------
export const getLoginSchema = (t) =>
  z.object({
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    password: z
      .string()
      .min(1, t("validation.passwordRequired"))
      .min(8, t("validation.passwordMin")),
  });

// ------------------------------------------------------------
// Forgot-password schema factory
// ------------------------------------------------------------
export const getForgotPasswordSchema = (t) =>
  z.object({
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
  });

// ------------------------------------------------------------
// Register schema factory
// ------------------------------------------------------------
export const getRegisterSchema = (t) =>
  z
    .object({
      fullName: z
        .string()
        .min(1, t("validation.fullNameRequired"))
        .min(2, t("validation.fullNameMin")),
      email: z
        .string()
        .min(1, t("validation.emailRequired"))
        .email(t("validation.emailInvalid")),
      password: z
        .string()
        .min(1, t("validation.passwordRequired"))
        .min(8, t("validation.passwordMin"))
        .regex(/[A-Z]/, t("validation.passwordUppercase"))
        .regex(/[0-9]/, t("validation.passwordNumber")),
      confirmPassword: z
        .string()
        .min(1, t("validation.confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordMismatch"),
      path: ["confirmPassword"],
    });

// ── Legacy exports for backward compatibility ─────────────────
// These use hardcoded Arabic messages (original behavior).
// Prefer the factory functions in new code.
export const loginSchema = getLoginSchema((k) => {
  const map = {
    "validation.emailRequired": "البريد الإلكتروني مطلوب",
    "validation.emailInvalid": "صيغة البريد الإلكتروني غير صحيحة",
    "validation.passwordRequired": "كلمة المرور مطلوبة",
    "validation.passwordMin": "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
  };
  return map[k] || k;
});

export const forgotPasswordSchema = getForgotPasswordSchema((k) => {
  const map = {
    "validation.emailRequired": "البريد الإلكتروني مطلوب",
    "validation.emailInvalid": "صيغة البريد الإلكتروني غير صحيحة",
  };
  return map[k] || k;
});

export const registerSchema = getRegisterSchema((k) => {
  const map = {
    "validation.fullNameRequired": "الاسم الكامل مطلوب",
    "validation.fullNameMin": "الاسم يجب أن يكون حرفين على الأقل",
    "validation.emailRequired": "البريد الإلكتروني مطلوب",
    "validation.emailInvalid": "صيغة البريد الإلكتروني غير صحيحة",
    "validation.passwordRequired": "كلمة المرور مطلوبة",
    "validation.passwordMin": "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
    "validation.passwordUppercase": "يجب أن تحتوي على حرف كبير واحد على الأقل",
    "validation.passwordNumber": "يجب أن تحتوي على رقم واحد على الأقل",
    "validation.confirmPasswordRequired": "تأكيد كلمة المرور مطلوب",
    "validation.passwordMismatch": "كلمتا المرور غير متطابقتين",
  };
  return map[k] || k;
});
