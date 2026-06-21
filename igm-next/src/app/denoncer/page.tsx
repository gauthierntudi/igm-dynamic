import type { Metadata } from "next";
import Link from "next/link";

import SignalementForm from "@/components/signalement/SignalementForm";

import styles from "./denoncer.module.css";

export const metadata: Metadata = {
  title: "Signalement — IGM",
  description: "Formulaire de signalement (lanceur d’alerte)",
};

export default function DenoncerPage() {
  return (
    <main className={styles.page} data-igm-page="signalement">
      <div id="igm-signalement" className={styles.inner}>
        <Link href="/" className={styles.back}>
          ← Retour à l&apos;accueil
        </Link>
        <h1 className={styles.title}>Formulaire de signalement</h1>
        <p className={styles.subtitle}>
          Transmettez des informations sur des infractions ou pratiques irrégulières dans le secteur
          minier. Les champs marqués d’une astérisque sont obligatoires.
        </p>
        <SignalementForm />
      </div>
    </main>
  );
}
