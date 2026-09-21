import React from "react";
import HomePagePanel from "../components/HomePagePanel";
import PageTitle from "../components/PageTitle";
import { useLanguage } from "../contexts";

export default function ScientificFields() {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto p-0">
      <div className="mb-0">
        <PageTitle className="mb-6">{t("scientificFields.pageTitle")}</PageTitle>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <HomePagePanel
          title={t("scientificFields.viewTitle")}
          description={t("scientificFields.viewDesc")}
          buttonText={t("scientificFields.viewButton")}
          to="/scientific-fields/view"
        />
        <HomePagePanel
          title={t("scientificFields.createTitle")}
          description={t("scientificFields.createDesc")}
          buttonText={t("scientificFields.createButton")}
          to="/scientific-fields/create"
        />
      </div>
    </div>
  );
}
