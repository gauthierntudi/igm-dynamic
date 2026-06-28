import React from "react";

import { withDeployedBase } from "@/lib/deployBasePath";

export function IgmAdminIcon() {
  return (
    <img
      className="igm-admin-icon"
      src={withDeployedBase("/assets/img/pin-carte.png")}
      alt="IGM"
      width={28}
      height={28}
    />
  );
}
