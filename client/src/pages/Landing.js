import React from "react";
import { Link } from "react-router-dom";
import { FileCheck2, BarChart3, BrainCircuit, Users } from "lucide-react";
import { useLanguage } from "../contexts";

function InsightCard({ icon: Icon, title, description }) {
  return (
    <article className="rounded-2xl border border-patras-buccaneer/20 bg-white/90 p-5 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-patras-albescentWhite text-patras-buccaneer dark:bg-[var(--color-bg-muted)] dark:text-[var(--color-text-primary)]">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="text-base font-semibold text-patras-buccaneer dark:text-[var(--color-text-primary)]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-[var(--color-text-secondary)]">
        {description}
      </p>
    </article>
  );
}

export default function Landing() {
  const { t } = useLanguage();
  return (
    <section className="pb-10">
      <div className="relative mx-auto max-w-6xl px-2 sm:px-4">
        <div className="border-b border-[var(--color-border)] py-4 sm:py-12">

          <h2 className="mt-4 text-2xl font-semibold leading-tight text-patras-buccaneer dark:text-[var(--color-text-primary)] sm:text-3xl lg:text-4xl">
            {t("landing.heroTitle")}
          </h2>

          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-gray-700 dark:text-[var(--color-text-secondary)] sm:text-base">
            {t("landing.heroP1")}
          </p>

          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-gray-700 dark:text-[var(--color-text-secondary)] sm:text-base">
            {t("landing.heroP2")}
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-gray-700 dark:text-[var(--color-text-secondary)] sm:text-base">
            {t("landing.heroP3")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-patras-buccaneer px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-patras-sanguineBrown dark:bg-[var(--color-primary)] dark:text-[var(--color-primary-contrast)] dark:hover:bg-[var(--color-primary-hover)]"
            >
              {t("landing.loginCta")}
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg border border-patras-buccaneer px-5 py-2.5 text-sm font-semibold text-patras-buccaneer transition-colors hover:bg-patras-albescentWhite dark:border-[var(--color-border-accent)] dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-bg-muted)]"
            >
              {t("landing.registerCta")}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InsightCard
            icon={FileCheck2}
            title={t("landing.cardPublishTitle")}
            description={t("landing.cardPublishDesc")}
          />

          <InsightCard
            icon={Users}
            title={t("landing.cardSubmitTitle")}
            description={t("landing.cardSubmitDesc")}
          />

          <InsightCard
            icon={BrainCircuit}
            title={t("landing.cardEvalTitle")}
            description={t("landing.cardEvalDesc")}
          />

          <InsightCard
            icon={BarChart3}
            title={t("landing.cardRankTitle")}
            description={t("landing.cardRankDesc")}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-patras-buccaneer/20 bg-white/90 p-6 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]">
          <h3 className="text-lg font-semibold text-patras-buccaneer dark:text-[var(--color-text-primary)]">
            {t("landing.purposeTitle")}
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-[var(--color-text-secondary)]">
            {t("landing.purposeP1")}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-[var(--color-text-secondary)]">
            {t("landing.purposeP2")}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-patras-buccaneer/20 bg-white/90 p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]">
            <h3 className="text-base font-semibold text-patras-buccaneer dark:text-[var(--color-text-primary)]">
              {t("landing.roleCandidatesTitle")}
            </h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-[var(--color-text-secondary)]">
              {t("landing.roleCandidatesDesc")}
            </p>
          </article>
          
          
          <article className="rounded-2xl border border-patras-buccaneer/20 bg-white/90 p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]">
            <h3 className="text-base font-semibold text-patras-buccaneer dark:text-[var(--color-text-primary)]">
              {t("landing.roleGuestsTitle")}
            </h3>

            <p className="mt-2 text-sm text-gray-700 dark:text-[var(--color-text-secondary)]">
              {t("landing.roleGuestsDesc")}
            </p>
          </article>



          <article className="rounded-2xl border border-patras-buccaneer/20 bg-white/90 p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]">
            <h3 className="text-base font-semibold text-patras-buccaneer dark:text-[var(--color-text-primary)]">
              {t("landing.roleAdminsTitle")}
            </h3>

            <p className="mt-2 text-sm text-gray-700 dark:text-[var(--color-text-secondary)]">
              {t("landing.roleAdminsDesc")}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
