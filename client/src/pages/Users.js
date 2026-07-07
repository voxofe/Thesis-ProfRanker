import React from "react";
import HomePagePanel from "../components/HomePagePanel";
import PageTitle from "../components/PageTitle";
import { useLanguage } from "../contexts";

export default function Users() {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto p-0">
        <PageTitle className="mb-6">{t("usersPage.pageTitle")}</PageTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <HomePagePanel
          title={t("usersPage.viewTitle")}
          description={t("usersPage.viewDesc")}
          buttonText={t("usersPage.viewButton")}
          to="/users/view"
        />
        <HomePagePanel
          title={t("usersPage.addTitle")}
          description={t("usersPage.addDesc")}
          buttonText={t("usersPage.addButton")}
          to="/users/register-admin"
        />
      </div>
    </div>
  );
}
