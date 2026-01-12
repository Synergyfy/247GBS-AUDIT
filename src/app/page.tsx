import { AuditWizard } from "@/components/audit/AuditWizard";
import { AuditProvider } from "@/context/AuditContext";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-br from-background via-background to-secondary/20 relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 w-full">
        <AuditProvider>
          <AuditWizard />
        </AuditProvider>
      </div>
    </main>
  );
}
