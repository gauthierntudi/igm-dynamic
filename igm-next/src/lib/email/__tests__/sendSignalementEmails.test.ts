import { describe, expect, it } from "vitest";

import { buildIgmEmailHtml, renderIgmEmailReferenceBadge } from "../igmEmailTemplate";
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
    expect(mail.html).toContain("logo-color.png");
    expect(mail.html).toContain("Accusé de réception");
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
    expect(mail.html).toContain("#1b4491");
  });
});

describe("igmEmailTemplate", () => {
  it("affiche la bande tricolore et le logo IGM", () => {
    const html = buildIgmEmailHtml({
      title: "Test",
      bodyHtml: renderIgmEmailReferenceBadge("SIG-TEST"),
    });
    expect(html).toContain("logo-color.png");
    expect(html).toContain("#f6bf0d");
    expect(html).toContain("#e60404");
    expect(html).toContain("Inspection Générale des Mines");
  });
});
