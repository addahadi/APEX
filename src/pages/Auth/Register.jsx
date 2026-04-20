import { useState } from "react";
import { Eye, EyeOff, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getRegisterSchema } from "@/schemas/auth.schema";
import { useRegister } from "@/hooks/useAuth";
import { handleApiError } from "@/api/handelApiError";

const Register = () => {
  const { t } = useTranslation("auth");
  const registerMutation = useRegister();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const registerSchema = getRegisterSchema(t);
    const result = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    registerMutation.mutate(
      {
        name: result.data.fullName,
        email: result.data.email,
        password: result.data.password,
      },
      {
        onError: (err) => {
          const handled = handleApiError(err);
          if (handled.type === "field") {
            setErrors(handled.fieldErrors);
          } else {
            setServerError(handled.message);
          }
        },
      }
    );
  };

  const handleChange = (field, setter) => (e) => {
    setter(e.target.value);
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setServerError("");
  };

  const inputClass = (field) =>
    `w-full rounded-lg border bg-slate-50 py-3 pl-4 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
      errors[field]
        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
        : "border-slate-200 focus:border-primary focus:ring-primary/20"
    }`;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
          {t("register.title")}
        </h1>
        <p className="text-sm text-slate-500">
          {t("register.subtitle")}
        </p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="register-fullName" className="text-sm font-medium text-slate-700">
            {t("register.fullName")}
          </label>
          <div className="relative">
            <input
              id="register-fullName"
              type="text"
              value={fullName}
              onChange={handleChange("fullName", setFullName)}
              placeholder={t("register.fullNamePlaceholder")}
              className={inputClass("fullName")}
            />
            <User className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="register-email" className="text-sm font-medium text-slate-700">
            {t("register.email")}
          </label>
          <div className="relative">
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={handleChange("email", setEmail)}
              placeholder={t("register.emailPlaceholder")}
              className={inputClass("email")}
            />
            <Mail className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Password pair */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="register-password" className="text-sm font-medium text-slate-700">
              {t("register.password")}
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handleChange("password", setPassword)}
                placeholder="••••••••"
                className={inputClass("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-confirmPassword" className="text-sm font-medium text-slate-700">
              {t("register.confirmPassword")}
            </label>
            <div className="relative">
              <input
                id="register-confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleChange("confirmPassword", setConfirmPassword)}
                placeholder="••••••••"
                className={`w-full rounded-lg border bg-slate-50 py-3 pl-4 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                    : "border-slate-200 focus:border-primary focus:ring-primary/20"
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2.5">
          <input
            id="register-terms"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-primary"
          />
          <label htmlFor="register-terms" className="text-sm leading-relaxed text-slate-600">
            {t("register.agreeTerms")}{" "}
            <Link to="#" className="font-medium text-primary hover:underline">{t("register.termsAndConditions")}</Link>
            {" "}{t("register.and")}{" "}
            <Link to="#" className="font-medium text-primary hover:underline">{t("register.privacyPolicy")}</Link>.
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {registerMutation.isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("register.creating")}
            </>
          ) : (
            <>{t("register.submit")} <span>→</span></>
          )}
        </button>

        {/* Login link */}
        <p className="text-center text-sm text-slate-500">
          {t("register.hasAccount")}{" "}
          <Link to="/auth/login" className="font-semibold text-primary hover:underline">
            {t("register.login")}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;