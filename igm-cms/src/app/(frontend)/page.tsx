import Link from "next/link";

export default function CmsHomePage() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "3rem", maxWidth: 720 }}>
      <h1>IGM — Back-office</h1>
      <p>API Payload CMS pour le site public <strong>igm-next</strong>.</p>
      <p>
        <Link href="/admin">Ouvrir l’administration →</Link>
      </p>
    </main>
  );
}
