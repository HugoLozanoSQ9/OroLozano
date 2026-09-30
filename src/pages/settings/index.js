import { useEffect } from "react";
import { useRouter } from "next/router";
import { PageShell } from "@/components/SiteChrome";
import { Loader } from "@/components/Loader";

/** Settings vive dentro de Atelier → pestaña Settings */
export default function SettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);
  return (
    <PageShell>
      <Loader label="Abriendo Settings en Atelier…" />
    </PageShell>
  );
}
