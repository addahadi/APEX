import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getForgotPasswordSchema } from "@/schemas/auth.schema";
import { useForgotPassword } from "@/hooks/useAuth";
import { handleApiError } from "@/api/handleApiError";

const ForgetPassword = () => {
  const { t } = useTranslation("auth");
  const forgotMutation = useForgotPassword();

  const [email, setEmail] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setServerMessage("");
    setErrors({});

    const forgotPasswordSchema = getForgotPasswordSchema(t);
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    forgotMutation.mutate(result.data, {
      onSuccess: (data) => {
        setServerMessage(
          data.message || "If the email exists, a password reset link was sent. Check your inbox."
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
          {t("forgotPassword.backToLogin")}
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900">{t("forgotPassword.title")}</h1>
        <p className="max-w-md text-sm leading-6 text-slate-500">
          {t("forgotPassword.subtitle")}
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
          <label htmlFor="forgot-email" className="text-sm font-medium text-slate-700">
            {t("forgotPassword.email")}
          </label>
          <div className="relative">
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={handleChange("email", setEmail)}
              placeholder={t("forgotPassword.emailPlaceholder")}
              className={`w-full rounded-2xl border bg-slate-50 py-3 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                  : "border-slate-200 focus:border-primary focus:ring-primary/20"
              }`}
            />
            <Mail className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        <button
          type="submit"
          disabled={forgotMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {forgotMutation.isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("forgotPassword.sending")}
            </>
          ) : (
            t("forgotPassword.submit")
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        {t("forgotPassword.rememberPassword")}{" "}
        <Link to="/auth/login" className="font-semibold text-primary hover:underline">
          {t("forgotPassword.login")}
        </Link>
      </p>
    </div>
  );
};

export default ForgetPassword;
