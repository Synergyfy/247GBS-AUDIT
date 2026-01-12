import { AuditWizard } from "@/components/audit/AuditWizard";
import { AuditProvider } from "@/context/AuditContext";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 aurora-bg relative overflow-hidden">
      <div className="z-10 w-full">
        <AuditProvider>
          <AuditWizard />
        </AuditProvider>
      </div>
    </main>
  );
}
