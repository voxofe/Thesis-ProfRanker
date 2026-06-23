import React from "react";
import { Link } from "react-router-dom";
import { FileCheck2, BarChart3, BrainCircuit, Users } from "lucide-react";

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
    <section className="pb-10">
      <div className="relative mx-auto max-w-6xl px-2 sm:px-4">
        <div className="border-b border-[var(--color-border)] py-4 sm:py-12">

          <h2 className="mt-4 text-2xl font-semibold leading-tight text-patras-buccaneer dark:text-[var(--color-text-primary)] sm:text-3xl lg:text-4xl">
            ProfRanker: Σύστημα Διαχείρισης και Αξιολόγησης Αιτήσεων για την Απόκτηση
            Ακαδημαϊκής Διδακτικής Εμπειρίας
          </h2>

          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-gray-700 dark:text-[var(--color-text-secondary)] sm:text-base">
            Η εφαρμογή ProfRanker δημιουργήθηκε για να υποστηρίξει τη διαδικασία αξιολόγησης αιτήσεων 
            προσωρινών διδασκόντων  μέσω της αυτοματοποιημένης παραγωγής προτεινόμενων 
            κατατάξεων των υποψηφίων με βάση ποσοτικά αλλά και ποιοτικά χαρακτηριστικά 
            των αιτήσεών τους. Λειτουργεί τόσο ως ιστότοπος ανακοίνωσης προσκλήσεων, υποβολής αιτήσεων και ανάρτησης 
            αποτελεσμάτων αλλά και ως μηχανισμός αξιολόγησης και παραγωγής συστάσεων κατάταξης των υποψηφίων ανά θέση.
          </p>

          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-gray-700 dark:text-[var(--color-text-secondary)] sm:text-base">
            Συγκεκριμένα, αξιοποιώντας εργαλεία AI και LLM, η πλατφόρμα υποστηρίζει αφενός 
            την αυτοματοποιημένη ανάλυση και  αξιολόγηση δεδομένων κειμένου από τις αιτήσεις 
            των υποψηφίων, όπως τίτλος, περίληψη και λέξεις κλειδιά για τις διδακτορικές διατριβές
            και προτεινόμενα σχεδιαγράμματα διδασκαλίας για τα μαθήματα κάθε θέσης, και αφετέρου 
            τον έλεγχο και την αυτοματοποιημένη βαθμολόγηση του δημοσιευμένου έργου που υποβάλλεται 
            ως μέρος των αιτήσεων των υποψηφίων με βάση τα κριτήρια που ορίζονται στη σχετική πρόσκληση.
            Ως αποτελέσματα, η εφαρμογή παράγει συνολικές βαθμολογίες για όλες τις αιτήσεις που έχουν υποβληθεί 
            βάσει των οποίων χτίζεται και ένας γενικός πίνακας κατάταξης των υποψηφίων ανά θέση/επιστημονικό πεδίο.       
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-gray-700 dark:text-[var(--color-text-secondary)] sm:text-base">
            Ως αποτέλσμα, η εφαρμογή παράγει συνολικές βαθμολογίες για όλες τις αιτήσεις που έχουν υποβληθεί 
            βάσει των οποίων χτίζεται ένας γενικός πίνακας κατάταξης των αιτήσεων για όλες τις δημοσιευμένες θέσεις/επιστημονικά πεδία.       
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
            title="Δημοσίευση Προσκλήσεων"
            description="Διαχείριση και δημοσιοποίηση προσκλήσεων εκδήλωσης ενδιαφέροντος για θέσεις προσωρινών διδασκόντων."
          />

          <InsightCard
            icon={Users}
            title="Υποβολή Αιτήσεων"
            description="Ηλεκτρονική καταχώρηση στοιχείων υποψηφίων και υποβολή των απαιτούμενων δικαιολογητικών ανά πρόσκληση."
          />

          <InsightCard
            icon={BrainCircuit}
            title="Αξιολόγηση Υποψηφίων"
            description="Ποσοτική βαθμολόγηση και AI-υποβοηθούμενη ποιοτική ανάλυση επιστημονικού έργου, διδακτορικών διατριβών και διδακτικών προτάσεων."
          />

          <InsightCard
            icon={BarChart3}
            title="Παραγωγή Κατατάξεων"
            description="Δημιουργία προτεινόμενων πινάκων κατάταξης υποψηφίων ανά θέση με βάση τεκμηριωμένα κριτήρια αξιολόγησης."
          />
        </div>

        <div className="mt-8 rounded-2xl border border-patras-buccaneer/20 bg-white/90 p-6 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]">
          <h3 className="text-lg font-semibold text-patras-buccaneer dark:text-[var(--color-text-primary)]">
            Σκοπός της εφαρμογής
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-[var(--color-text-secondary)]">
            Η εφαρμογή σχεδιάστηκε για να υποστηρίξει το πιο απαιτητικό
            στάδιο της διαδικασίας επιλογής προσωρινών διδασκόντων: την
            αξιολόγηση των υποψηφιοτήτων. Ενώ η δημοσίευση προσκλήσεων, η
            υποβολή αιτήσεων και η ανακοίνωση αποτελεσμάτων πραγματοποιούνται
            ήδη ηλεκτρονικά, η αξιολόγηση των υποψηφίων παραμένει ιδιαίτερα
            απαιτητική και χρονοβόρα διαδικασία.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-[var(--color-text-secondary)]">
            Το ProfRanker επιδιώκει να μειώσει τον απαιτούμενο χρόνο
            επεξεργασίας αιτήσεων, να προσφέρει ενιαίο περιβάλλον διαχείρισης
            δεδομένων και να υποστηρίξει το διοικητικό και επιστημονικό
            προσωπικό μέσω εργαλείων αυτοματοποιημένης ανάλυσης και παραγωγής
            προτεινόμενων κατατάξεων.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-patras-buccaneer/20 bg-white/90 p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]">
            <h3 className="text-base font-semibold text-patras-buccaneer dark:text-[var(--color-text-primary)]">
              Υποψήφιοι
            </h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-[var(--color-text-secondary)]">
              Υποβολή και επεξεργασία αιτήσεων, πρόσβαση στις υποβεβλημένες αιτήσεις τους και τις αντίστοιχες αξιολογήσεις, 
              πρόσβαση σε προσωπικό φάκελο για τη διαχείριση δικαιολογητικών και άλλων δεδομένων για γρήγορη και εύκολη υποβολή πολλαπλών αιτήσεων.
            </p>
          </article>
          
          
          <article className="rounded-2xl border border-patras-buccaneer/20 bg-white/90 p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]">
            <h3 className="text-base font-semibold text-patras-buccaneer dark:text-[var(--color-text-primary)]">
              Επισκέπτες
            </h3>

            <p className="mt-2 text-sm text-gray-700 dark:text-[var(--color-text-secondary)]">
              Πρόσβαση σε δημοσιευμένα αποτελέσματα μετά το πέρας της ανοιχτής περιόδου αιτήσεων
              και αναβάθμιση σε ρόλο αιτούντα μετά από υποβολή αίτησης σε μια θέση.
            </p>
          </article>



          <article className="rounded-2xl border border-patras-buccaneer/20 bg-white/90 p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-bg-card)]">
            <h3 className="text-base font-semibold text-patras-buccaneer dark:text-[var(--color-text-primary)]">
              Διαχειριστές
            </h3>

            <p className="mt-2 text-sm text-gray-700 dark:text-[var(--color-text-secondary)]">
              Πλήρης εποπτεία δεδομένων εφαρμογής, χρηστών, θέσεων, αξιολογήσεων, λίστας κατάταξης.
              Δυνατότητα καταχώρησης και δημοσίευσης προσκλήσεων, και πρόσβαση σε στατιστικά στοιχεία 
              για τη γενική χρήση και λειτουργία της
              εφαρμογής.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
