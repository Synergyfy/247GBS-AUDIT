import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  HandHeart,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound
} from "lucide-react";

export const metadata = {
  title: "Free Business Pre-Audit | 247GBS Audit",
  description:
    "Answer a few quick questions to discover hidden opportunities in your business — free, no account needed.",
};

// Placeholder — replace with the 247GBS intro video ID before launch.
const PRE_AUDIT_VIDEO_ID = "PLACEHOLDER_VIDEO_ID";

const WHO_IT_IS_FOR = [
  {
    icon: <UserRound size={20} />,
    title: "Who it's for",
    body: "Any business owner or manager who wants a quick, honest look at where their business might be leaking time, money, or opportunity.",
  },
  {
    icon: <Clock size={20} />,
    title: "What you'll need",
    body: "Just a few minutes and your honest answers. No documents, no preparation, no sign-in required.",
  },
  {
    icon: <Sparkles size={20} />,
    title: "What you'll get",
    body: "A clear picture of your situation and a recommended next step — including which full Business Audit best fits your business.",
  },
];

const STEPS = [
  { title: "Answer a few questions", body: "One at a time, based on how you answer. Most people finish in 2–3 minutes." },
  { title: "Review your answers", body: "See everything you told us and change anything before you finish." },
  { title: "Leave your email", body: "We record it with your results on your device. No email is sent at this step, and it's optional." },
  { title: "Get your recommendation", body: "See which full audit fits your business — then continue whenever you're ready." },
];

const AFTER_STEPS = [
  "Your answers are kept on your device until you decide to create an account.",
  "A recommended Business Audit is suggested from your answers — never a guaranteed outcome.",
  "Creating a free account lets you run the full audit and keep everything in one place.",
];

export default function PreAuditLandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/40">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-12 sm:pb-16 text-center">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mt-6 mb-4 sm:mb-6 leading-tight">
          Start with a free <span className="text-gradient-premium">Business Pre-Audit</span>
        </h1>
        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10">
          Quick questions — no login, no paperwork. Discover hidden inefficiencies, missed
          revenue, and the best next step for your business.
        </p>
        <div className="max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="aspect-video rounded-3xl overflow-hidden border border-slate-200 bg-black shadow-xl">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${PRE_AUDIT_VIDEO_ID}`}
              title="How the Business Pre-Audit works"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/audit/pre-audit/flow"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
          >
            Start the Pre-Audit
            <ArrowRight size={18} />
          </Link>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-6">
          Takes about 2–3 minutes · Resume anytime on this device
        </p>
      </section>

      {/* What to expect */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {WHO_IT_IS_FOR.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8"
            >
              <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-3">How it works</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
              Questions adapt to your answers, so you only see what’s relevant to your business.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative rounded-3xl border border-slate-100 bg-slate-50 p-6 sm:p-8">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-4">
                  {index + 1}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What happens after */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500">
              <BarChart3 size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">What happens after</h2>
          </div>
          <ul className="space-y-3">
            {AFTER_STEPS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-orange-500 mt-0.5 shrink-0" />
                <span className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-orange-50 border border-orange-100 p-5 flex items-start gap-3">
              <ShieldCheck size={18} className="text-orange-500 mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We never claim a guaranteed outcome. The pre-audit is a self-check that points to the
                most suitable next step for your business.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 flex items-start gap-3">
              <HandHeart size={18} className="text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Questions are never invented on the fly. You’ll only ever be asked the questions
                  we run in the official Business Triage.
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <Mail size={12} />
                  Your email is only stored with your results on your device.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/audit/pre-audit/flow"
            className="mt-8 w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold text-base transition-all hover:-translate-y-1 active:translate-y-0"
          >
            Answer the Questions Now
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}