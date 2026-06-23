import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, FileCheck2, BarChart3, BrainCircuit, Users } from "lucide-react";

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
  return (
    <section className="relative overflow-hidden pb-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-patras-cameo/20 blur-2xl dark:bg-[var(--color-primary)]/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-28 h-64 w-64 rounded-full bg-patras-buccaneer/15 blur-3xl dark:bg-[var(--color-border-accent)]/20"
      />

      <div className="relative mx-auto max-w-6xl px-2 sm:px-4">
        <div className="rounded-3xl border border-patras-buccaneer/20 bg-gradient-to-br from-patras-albescentWhite/50 via-white/90 to-patras-cameo/20 p-6 shadow-lg dark:border-[var(--color-border)] dark:from-[var(--color-bg-surface)] dark:via-[var(--color-bg-card)] dark:to-[var(--color-bg-muted)] sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-patras-buccaneer/30 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-patras-buccaneer dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)] dark:text-[var(--color-text-primary)]">
            <Sparkles className="h-3.5 w-3.5" />
            Διπλωματική εργασία • ProfRanker
          </div>

          <h2 className="mt-4 text-2xl font-semibold leading-tight text-patras-buccaneer dark:text-[var(--color-text-primary)] sm:text-3xl lg:text-4xl">
            Από την ανακοίνωση προσκλήσεων στην προτεινόμενη κατάταξη υποψηφίων με τεκμηριωμένη, υβριδική αξιολόγηση
          </h2>

          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-gray-700 dark:text-[var(--color-text-secondary)] sm:text-base">
            Η εφαρμογή ProfRanker σχεδιάστηκε για να καλύψει το πιο απαιτητικό κομμάτι της διαδικασίας επιλογής
            προσωρινών διδασκόντων: την αξιολόγηση. Ενώ η δημοσίευση προσκλήσεων, η υποβολή αιτήσεων και η ανάρτηση
            αποτελεσμάτων έχουν ήδη ψηφιοποιηθεί, η ποσοτική και ποιοτική αποτίμηση των υποψηφιοτήτων παραμένει
            χρονοβόρα. Η παρούσα πλατφόρμα ενσωματώνει τεχνικές AI και LLM για να μετατρέψει τα ετερογενή δεδομένα
            αιτήσεων σε συγκρίσιμες προτάσεις κατάταξης ανά θέση.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-patras-buccaneer px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-patras-sanguineBrown dark:bg-[var(--color-primary)] dark:text-[var(--color-primary-contrast)] dark:hover:bg-[var(--color-primary-hover)]"
            >
              Σύνδεση στην πλατφόρμα
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg border border-patras-buccaneer px-5 py-2.5 text-sm font-semibold text-patras-buccaneer transition-colors hover:bg-patras-albescentWhite dark:border-[var(--color-border-accent)] dark:text-[var(--color-text-secondary)] dark:hover:bg-[var(--color-bg-muted)]"
            >
              Δημιουργία λογαριασμού
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InsightCard
            icon={FileCheck2}
            title="Τυποποιημένη υποβολή"
            description="Συλλογή δομημένων στοιχείων και δικαιολογητικών ανά πρόσκληση, με σαφή κανόνες εγκυρότητας και ίχνη ελέγχου."
          />
          <InsightCard
            icon={BrainCircuit}
            title="Ποιοτική ανάλυση με AI"
            description="Αποτίμηση κειμενικών δεδομένων όπως τίτλος, περίληψη, λέξεις-κλειδιά διδακτορικών και σχεδιαγράμματα διδασκαλίας."
          />
          <InsightCard
            icon={BarChart3}
            title="Ποσοτική βαθμολόγηση"
            description="Αυτοματοποιημένη βαθμολόγηση δημοσιευμένου έργου και κριτηρίων πρόσκλησης, με ενιαίο συνολικό σκορ ανά αίτηση."
          />
          <InsightCard
            icon={Users}
            title="Προτάσεις κατάταξης"
            description="Παραγωγή προτεινόμενων πινάκων ανά θέση που υποστηρίζουν διοικητικό και επιστημονικό προσωπικό στη λήψη αποφάσεων."
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-patras-buccaneer/20 bg-white/90 p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]">
            <h3 className="text-base font-semibold text-patras-buccaneer dark:text-[var(--color-text-primary)]">Επισκέπτης</h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-[var(--color-text-secondary)]">
              Πρόσβαση σε δημοσιευμένα αποτελέσματα και συνολική εικόνα των προσκλήσεων και των κατατάξεων.
            </p>
          </article>

          <article className="rounded-2xl border border-patras-buccaneer/20 bg-white/90 p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]">
            <h3 className="text-base font-semibold text-patras-buccaneer dark:text-[var(--color-text-primary)]">Αιτών/Αιτούσα</h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-[var(--color-text-secondary)]">
              Διαχείριση ενεργών αιτήσεων, πρόσβαση σε παραγόμενες αξιολογήσεις, προσωπικό προφίλ και φάκελος δικαιολογητικών.
            </p>
          </article>

          <article className="rounded-2xl border border-patras-buccaneer/20 bg-white/90 p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]">
            <h3 className="text-base font-semibold text-patras-buccaneer dark:text-[var(--color-text-primary)]">Διαχειριστής</h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-[var(--color-text-secondary)]">
              Εποπτεία όλων των δεδομένων, διαχείριση προσκλήσεων και πρόσβαση σε δείκτες χρήσης και λειτουργίας της εφαρμογής.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
