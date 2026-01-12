import { AuditWizard } from "@/components/audit/AuditWizard";
import { AuditProvider } from "@/context/AuditContext";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-white relative overflow-hidden">
      {/* Animated Background Flares */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="z-10 w-full">
        <AuditProvider>
          <AuditWizard />
        </AuditProvider>
      </div>
    </main>
  );
}
