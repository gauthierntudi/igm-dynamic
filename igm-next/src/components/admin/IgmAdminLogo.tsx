import React from "react";

import { withDeployedBase } from "@/lib/deployBasePath";

export function IgmAdminLogo() {
  return (
    <div className="igm-admin-logo">
      <img
        src={withDeployedBase("/assets/img/logo-color.png")}
        alt="Inspection Générale des Mines — République Démocratique du Congo"
        width={240}
        height={68}
      />
    </div>
  );
}
