import React from "react";

import { withDeployedBase } from "@/lib/deployBasePath";

export function IgmLoginIntro() {
  return (
    <div className="igm-login-intro">
      <p className="igm-login-intro__eyebrow">Espace sécurisé</p>
      <h1 className="igm-login-intro__title">Administration IGM</h1>
      <p className="igm-login-intro__lead">
        Connexion réservée aux équipes autorisées de l&apos;Inspection Générale des Mines.
      </p>
      <a className="igm-login-intro__back" href={withDeployedBase("/")}>
        ← Retour au site public
      </a>
    </div>
  );
}
