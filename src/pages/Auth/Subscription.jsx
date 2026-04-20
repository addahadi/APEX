import React from "react";
import PlanCard from "@/components/auth/PlanCard";
import PlanTable from "@/components/auth/PlanTable";
import { usePlans, useSubscribe, useMySubscription, useRequestSwitch } from "@/hooks/useSubscription";
import { PackageOpen, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedField } from "@/hooks/useLocalizedField";

const Subscription = () => {
  const { t } = useTranslation("auth");
  const { t: tc } = useTranslation("common");
  const localize = useLocalizedField();
  const { data: rawPlans, isLoading, isError, error } = usePlans();
  const { data: activeSub, isLoading: activeSubLoading } = useMySubscription();
  const subscribeMutation = useSubscribe();
  const requestSwitchMutation = useRequestSwitch();

  const plans = React.useMemo(() => {
    if (!rawPlans || !Array.isArray(rawPlans)) return [];

    return rawPlans.map((p) => {
      const featureList = p.features
        ? Object.entries(p.features).map(([key, val]) => ({
            text: `${key} — ${val}`,
            icon: "check",
          }))
        : [];

      return {
        id: p.id,
        title: localize(p, 'name'),
        price: p.price === 0 ? "Free" : `${p.price} DA`,
        subtitle: p.duration ? t("subscription.daysPlan", { days: p.duration }) : "",
        highlight: p.price > 0 && rawPlans.indexOf(p) === rawPlans.length - 1,
        features: featureList,
        buttonText: t("subscription.selectPlan"),
      };
    });
  }, [rawPlans, t, localize]);

  const tableData = React.useMemo(() => {
    if (!rawPlans || rawPlans.length < 2) return [];

    const allKeys = new Set();
    rawPlans.forEach((p) => {
      if (p.features) {
        Object.keys(p.features).forEach((k) => allKeys.add(k));
      }
    });

    return Array.from(allKeys).map((key) => ({
      feature: key,
      normal: rawPlans[0]?.features?.[key] || "—",
      company: rawPlans[1]?.features?.[key] || "—",
    }));
  }, [rawPlans]);

  const handleSelectPlan = (planId) => {
    if (activeSub) {
      // Prevent requesting switch to the exact same plan
      if (activeSub.plan.id === planId || activeSub.plan_id === planId) {
        requestSwitchMutation.mutate(planId); // Let backend catch it, or just use mutate. The backend will throw "You are already on this plan"
      } else {
        requestSwitchMutation.mutate(planId);
      }
    } else {
      subscribeMutation.mutate(planId);
    }
  };

  const isPending = subscribeMutation.isPending || requestSwitchMutation.isPending;

  if (isLoading || activeSubLoading) {
    return (
      <div className="group/design-root relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="flex flex-1 justify-center px-4 py-5 sm:px-10 lg:px-40">
            <div className="layout-content-container flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-lg font-medium text-slate-600">{t("subscription.loadingPlans")}</p>
                <p className="text-sm text-slate-400">{t("subscription.pleaseWait")}</p>
              </div>
              <div className="mx-auto mt-12 grid w-full max-w-4xl grid-cols-1 gap-8 px-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-8">
                    <div className="mb-4 h-6 w-32 rounded bg-slate-200" />
                    <div className="mb-3 h-10 w-24 rounded bg-slate-200" />
                    <div className="mb-8 h-4 w-40 rounded bg-slate-200" />
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-slate-200" />
                          <div className="h-4 w-48 rounded bg-slate-200" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 h-12 w-full rounded-lg bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="group/design-root relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="flex flex-1 items-center justify-center px-4 py-5">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <PackageOpen className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{t("subscription.failedToLoad")}</h2>
              <p className="max-w-sm text-sm text-slate-500">
                {error?.message || tc("error")}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {tc("retry")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!plans.length) {
    return (
      <div className="group/design-root relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="flex flex-1 items-center justify-center px-4 py-5">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <PackageOpen className="h-8 w-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{t("subscription.noPlans")}</h2>
              <p className="max-w-sm text-sm text-slate-500">
                {t("subscription.noPlansDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group/design-root relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 py-5 sm:px-10 lg:px-40">
          <div className="layout-content-container flex w-full max-w-[1200px] flex-1 flex-col">
            <div className="mb-8 flex flex-col items-center gap-4 p-4 pt-8 text-center">
              <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
                {t("subscription.title")}
              </h1>
              <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-2xl text-lg">
                {t("subscription.subtitle")}
              </p>
            </div>

            <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 px-4 py-4 md:grid-cols-2">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  {...plan}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isPending}
                />
              ))}
            </div>

            {isPending && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{requestSwitchMutation.isPending ? "Requesting switch..." : t("subscription.activating")}</span>
              </div>
            )}

            {tableData.length > 0 && (
              <div className="mx-auto mb-20 mt-16 w-full max-w-4xl px-4">
                <h3 className="mb-6 text-center text-2xl font-bold leading-tight tracking-tight">
                  {t("subscription.comparePlans")}
                </h3>
                <PlanTable data={tableData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;