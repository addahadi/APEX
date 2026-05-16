import { useState, useEffect } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getResetPasswordSchema } from "@/schemas/auth.schema";
import { useResetPassword } from "@/hooks/useAuth";
import { handleApiError } from "@/api/handleApiError";

const ResetPassword = () => {
  const { t } = useTranslation("auth");
  const resetMutation = useResetPassword();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      setServerError(t("resetPassword.invalidToken") || "Invalid or missing reset token.");
    }
  }, [token, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    setServerError("");
    setServerMessage("");
    setErrors({});

    const resetPasswordSchema = getResetPasswordSchema(t);
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    resetMutation.mutate({ token, newPassword: password }, {
      onSuccess: (data) => {
        setServerMessage(
          data.message || t("resetPassword.success") || "Your password has been successfully reset."
        );
      },
      onError: (err) => {
        const handled = handleApiError(err);
        if (handled.type === "field") {
          setErrors(handled.fieldErrors);
        } else {
          setServerError(handled.message);
        }
      },
    });
  };

  const handleChange = (field, setter) => (e) => {
    setter(e.target.value);
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setServerError("");
  };

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 flex items-center gap-3 text-slate-600">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("resetPassword.backToLogin") || "Back to Login"}
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900">{t("resetPassword.title") || "Reset Password"}</h1>
        <p className="max-w-md text-sm leading-6 text-slate-500">
          {t("resetPassword.subtitle") || "Enter your new password below."}
        </p>
      </div>

      {serverMessage && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {serverMessage}
        </div>
      )}

      {serverError && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="reset-password" className="text-sm font-medium text-slate-700">
            {t("resetPassword.password") || "New Password"}
          </label>
          <div className="relative">
            <input
              id="reset-password"
              type="password"
              value={password}
              onChange={handleChange("password", setPassword)}
              placeholder={t("resetPassword.passwordPlaceholder") || "Enter your new password"}
              className={`w-full rounded-2xl border bg-slate-50 py-3 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                  : "border-slate-200 focus:border-primary focus:ring-primary/20"
              }`}
            />
            <Lock className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>

        <div className="space-y-3">
          <label htmlFor="reset-confirm-password" className="text-sm font-medium text-slate-700">
            {t("resetPassword.confirmPassword") || "Confirm New Password"}
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={handleChange("confirmPassword", setConfirmPassword)}
              placeholder={t("resetPassword.confirmPasswordPlaceholder") || "Confirm your new password"}
              className={`w-full rounded-2xl border bg-slate-50 py-3 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                  : "border-slate-200 focus:border-primary focus:ring-primary/20"
              }`}
            />
            <Lock className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={resetMutation.isPending || !token}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resetMutation.isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("resetPassword.sending") || "Resetting..."}
            </>
          ) : (
            t("resetPassword.submit") || "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
