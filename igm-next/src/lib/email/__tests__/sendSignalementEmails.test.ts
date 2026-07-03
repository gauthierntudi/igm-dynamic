import { describe, expect, it } from "vitest";

import { buildMailContactHtml, renderMailContactReferenceBadge } from "../mailContactTemplate";
import {
  buildSignalementAcknowledgementEmail,
  buildSignalementAdminNotificationEmail,
} from "../sendSignalementEmails";

const basePayload = {
  id: 42,
  reference: "SIG-20260703-ABCDE",
  description: "Description des faits transmis par l'alerteur.",
  estAnonyme: false,
  alerteurNom: "Jean Dupont",
  alerteurEmail: "jean@example.com",
  alerteurTel: "+243 900 000 000",
  province: "Kinshasa",
  typeInfraction: "Fraude minière",
  pieceCount: 2,
};

describe("sendSignalementEmails", () => {
  it("inclut la référence dans l'accusé de réception", () => {
    const mail = buildSignalementAcknowledgementEmail(basePayload);
    expect(mail.subject).toContain("SIG-20260703-ABCDE");
    expect(mail.text).toContain("SIG-20260703-ABCDE");
    expect(mail.html).toContain("SIG-20260703-ABCDE");
    expect(mail.html).toContain("https://www.igmrdc.com/assets/img/logo-color.png");
    expect(mail.html).toContain("Votre signalement a bien été enregistré");
  });

  it("inclut les informations clés dans la notification admin", () => {
    const mail = buildSignalementAdminNotificationEmail(
      basePayload,
      "https://www.igmrdc.com/admin/collections/signalements/42",
    );
    expect(mail.subject).toContain("SIG-20260703-ABCDE");
    expect(mail.text).toContain("Jean Dupont");
    expect(mail.text).toContain("jean@example.com");
    expect(mail.text).toContain("Pièces jointes : 2");
    expect(mail.html).toContain("https://www.igmrdc.com/admin/collections/signalements/42");
    expect(mail.html).toContain("Ouvrir le dossier dans l'admin");
    expect(mail.html).toContain("#ff0c0e");
  });
});

describe("mailContactTemplate", () => {
  it("utilise le template mail-contact avec logo et footer IGM", () => {
    const html = buildMailContactHtml({
      headline: "Test",
      contentHtml: renderMailContactReferenceBadge("SIG-TEST"),
    });
    expect(html).toContain("https://www.igmrdc.com/assets/img/logo-color.png");
    expect(html).toContain("conditions-generales");
    expect(html).toContain("Kinshasa-Gombe");
    expect(html).toContain("SIG-TEST");
  });
});
