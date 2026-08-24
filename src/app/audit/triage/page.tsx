"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ChevronLeft,
    Clock,
    CheckCircle2,
    ArrowRight,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Target,
    Users,
    Zap,
    BarChart3,
    ShieldCheck,
    Loader2,
    ArrowRightCircle,
    AlertTriangle,
    Lightbulb,
    LogIn,
    UserPlus,
    X,
    Bookmark
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { TriageData, TriageStageId } from "@/types/audit";

const TRIAGE_STAGES: TriageStageId[] = [
    'business-performance',
    'operations',
    'customers-marketing',
    'growth-technology',
    'business-priorities'
];

const STAGE_META: Record<TriageStageId, { title: string; icon: React.ReactNode; description: string }> = {
    'business-performance': { title: 'Business Performance', icon: <BarChart3 size={20} />, description: 'Understanding the overall condition of your business' },
    'operations': { title: 'Operations', icon: <Zap size={20} />, description: 'Identifying operational inefficiencies' },
    'customers-marketing': { title: 'Customers & Marketing', icon: <Users size={20} />, description: 'Understanding customer acquisition and retention' },
    'growth-technology': { title: 'Growth & Technology', icon: <Target size={20} />, description: 'Understanding your growth readiness' },
    'business-priorities': { title: 'Business Priorities', icon: <Lightbulb size={20} />, description: 'Identifying your immediate concerns' },
    'processing': { title: 'Processing', icon: <Loader2 size={20} />, description: '' },
    'result': { title: 'Result', icon: <CheckCircle2 size={20} />, description: '' },
};

// Questions per stage — each stage shows one question at a time
const STAGE_QUESTIONS: Record<string, { id: string; text: string; options: { id: string; label: string; sub?: string; icon?: React.ReactNode }[] }[]> = {
    'business-performance': [
        {
            id: 'businessPerformance',
            text: 'How would you describe your business performance today?',
            options: [
                { id: 'good', label: 'Good', sub: 'We are growing and hitting targets', icon: <TrendingUp size={20} /> },
                { id: 'stable', label: 'Stable', sub: 'Holding steady but not growing', icon: <CheckCircle2 size={20} /> },
                { id: 'declining', label: 'Declining', sub: 'Sales or profit are falling', icon: <TrendingDown size={20} /> },
                { id: 'not-sure', label: 'Not sure', sub: 'I don\'t regularly track performance', icon: <AlertCircle size={20} /> }
            ]
        },
        {
            id: 'salesTrend',
            text: 'Are your sales increasing, stable, or declining?',
            options: [
                { id: 'increasing', label: 'Increasing', sub: 'Sales are growing month on month', icon: <TrendingUp size={20} /> },
                { id: 'stable', label: 'Stable', sub: 'Sales remain roughly the same', icon: <CheckCircle2 size={20} /> },
                { id: 'declining', label: 'Declining', sub: 'Sales are dropping', icon: <TrendingDown size={20} /> },
                { id: 'not-sure', label: 'Not sure', sub: 'I don\'t measure this regularly', icon: <AlertCircle size={20} /> }
            ]
        },
        {
            id: 'isProfitable',
            text: 'Are you currently profitable?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'We are making a profit', icon: <TrendingUp size={20} /> },
                { id: 'no', label: 'No', sub: 'We are breaking even or losing money', icon: <TrendingDown size={20} /> },
                { id: 'not-sure', label: 'Not sure', sub: 'I don\'t have clear visibility', icon: <AlertCircle size={20} /> }
            ]
        },
        {
            id: 'measuresPerformance',
            text: 'Do you regularly measure business performance?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'I review financials and KPIs regularly', icon: <CheckCircle2 size={20} /> },
                { id: 'no', label: 'No', sub: 'I don\'t track performance formally', icon: <AlertCircle size={20} /> },
                { id: 'sometimes', label: 'Sometimes', sub: 'I check occasionally but not consistently', icon: <AlertCircle size={20} /> }
            ]
        }
    ],
    'operations': [
        {
            id: 'hasExcessStock',
            text: 'Do you currently have excess or slow-moving stock?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'We have stock that isn\'t selling', icon: <AlertTriangle size={20} /> },
                { id: 'no', label: 'No', sub: 'Our stock moves quickly', icon: <CheckCircle2 size={20} /> },
                { id: 'not-sure', label: 'Not sure', sub: 'I haven\'t checked recently', icon: <AlertCircle size={20} /> }
            ]
        },
        {
            id: 'hasUnusedCapacity',
            text: 'Do you have unused operational capacity?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'Staff, equipment, or space sit idle', icon: <AlertTriangle size={20} /> },
                { id: 'no', label: 'No', sub: 'We run at full capacity', icon: <CheckCircle2 size={20} /> },
                { id: 'not-sure', label: 'Not sure', sub: 'I haven\'t measured this', icon: <AlertCircle size={20} /> }
            ]
        },
        {
            id: 'operationalChallenges',
            text: 'Are there operational challenges affecting profitability?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'Several things are holding us back', icon: <AlertTriangle size={20} /> },
                { id: 'no', label: 'No', sub: 'Operations run smoothly', icon: <CheckCircle2 size={20} /> },
                { id: 'not-sure', label: 'Not sure', sub: 'I suspect there are issues', icon: <AlertCircle size={20} /> }
            ]
        },
        {
            id: 'processImprovements',
            text: 'Are there processes you believe could be improved?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'Many processes feel inefficient', icon: <Lightbulb size={20} /> },
                { id: 'no', label: 'No', sub: 'Our processes work well', icon: <CheckCircle2 size={20} /> },
                { id: 'not-sure', label: 'Not sure', sub: 'I haven\'t thought about it', icon: <AlertCircle size={20} /> }
            ]
        }
    ],
    'customers-marketing': [
        {
            id: 'hasLoyaltyProgramme',
            text: 'Do you currently have a loyalty programme?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'We reward repeat customers', icon: <CheckCircle2 size={20} /> },
                { id: 'no', label: 'No', sub: 'We don\'t have one', icon: <AlertCircle size={20} /> },
                { id: 'considering', label: 'Considering', sub: 'We want to set one up', icon: <Lightbulb size={20} /> }
            ]
        },
        {
            id: 'activelyMarketing',
            text: 'Are you actively marketing your business?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'We have ongoing marketing efforts', icon: <CheckCircle2 size={20} /> },
                { id: 'no', label: 'No', sub: 'We rely mostly on word of mouth', icon: <AlertCircle size={20} /> },
                { id: 'sometimes', label: 'Sometimes', sub: 'We market occasionally', icon: <AlertCircle size={20} /> }
            ]
        },
        {
            id: 'knowsCustomerAcquisition',
            text: 'Do you know how new customers find your business?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'I know our main channels', icon: <CheckCircle2 size={20} /> },
                { id: 'no', label: 'No', sub: 'I have no idea', icon: <AlertCircle size={20} /> },
                { id: 'partially', label: 'Partially', sub: 'I have a rough idea', icon: <AlertCircle size={20} /> }
            ]
        },
        {
            id: 'hasRepeatCustomers',
            text: 'Do you experience repeat customers?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'Many customers come back', icon: <CheckCircle2 size={20} /> },
                { id: 'no', label: 'No', sub: 'Most customers are one-time', icon: <AlertCircle size={20} /> },
                { id: 'not-sure', label: 'Not sure', sub: 'I don\'t track this', icon: <AlertCircle size={20} /> }
            ]
        }
    ],
    'growth-technology': [
        {
            id: 'sellsOnline',
            text: 'Do you currently sell online?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'We have an online store or platform', icon: <CheckCircle2 size={20} /> },
                { id: 'no', label: 'No', sub: 'We only sell in-person', icon: <AlertCircle size={20} /> },
                { id: 'planning', label: 'Planning to', sub: 'We want to start selling online', icon: <Lightbulb size={20} /> }
            ]
        },
        {
            id: 'usesBusinessSoftware',
            text: 'Do you use business software?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'We use accounting, CRM, or other tools', icon: <CheckCircle2 size={20} /> },
                { id: 'no', label: 'No', sub: 'We manage everything manually', icon: <AlertCircle size={20} /> },
                { id: 'limited', label: 'Limited', sub: 'We use basic tools like spreadsheets', icon: <AlertCircle size={20} /> }
            ]
        },
        {
            id: 'planningGrowth',
            text: 'Are you planning to grow within the next 12 months?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'Growth is a key priority', icon: <TrendingUp size={20} /> },
                { id: 'no', label: 'No', sub: 'We are focusing on stabilising', icon: <CheckCircle2 size={20} /> },
                { id: 'unsure', label: 'Unsure', sub: 'It depends on conditions', icon: <AlertCircle size={20} /> }
            ]
        },
        {
            id: 'lookingForNewCustomers',
            text: 'Are you looking for new customers?',
            options: [
                { id: 'yes', label: 'Yes', sub: 'Acquiring new customers is a priority', icon: <TrendingUp size={20} /> },
                { id: 'no', label: 'No', sub: 'We have enough customers', icon: <CheckCircle2 size={20} /> },
                { id: 'always', label: 'Always', sub: 'We are always looking', icon: <TrendingUp size={20} /> }
            ]
        }
    ],
    'business-priorities': [
        {
            id: 'biggestChallenge',
            text: 'What is your biggest business challenge today?',
            options: [
                { id: 'cashflow', label: 'Cash flow', sub: 'Managing money coming in and going out', icon: <TrendingDown size={20} /> },
                { id: 'customers', label: 'Getting customers', sub: 'Finding and keeping customers', icon: <Users size={20} /> },
                { id: 'costs', label: 'High costs', sub: 'Expenses are eating into profits', icon: <AlertTriangle size={20} /> },
                { id: 'operations', label: 'Operations', sub: 'Processes are slow or inefficient', icon: <Zap size={20} /> },
                { id: 'growth', label: 'Growth', sub: 'Struggling to scale the business', icon: <TrendingUp size={20} /> },
                { id: 'other', label: 'Other', sub: 'Something else entirely', icon: <AlertCircle size={20} /> }
            ]
        },
        {
            id: 'priorityArea',
            text: 'Which area would you most like to improve first?',
            options: [
                { id: 'stock', label: 'Stock management', sub: 'Reduce excess and slow-moving inventory', icon: <AlertTriangle size={20} /> },
                { id: 'capacity', label: 'Capacity utilisation', sub: 'Make better use of staff and resources', icon: <Zap size={20} /> },
                { id: 'customers', label: 'Customer retention', sub: 'Keep existing customers coming back', icon: <Users size={20} /> },
                { id: 'marketing', label: 'Marketing', sub: 'Attract more new customers', icon: <Target size={20} /> },
                { id: 'technology', label: 'Technology', sub: 'Modernise systems and tools', icon: <BarChart3 size={20} /> },
                { id: 'efficiency', label: 'Efficiency', sub: 'Streamline operations and reduce waste', icon: <Zap size={20} /> }
            ]
        },
        {
            id: 'desiredOutcome',
            text: 'What outcome would make the biggest difference to your business?',
            options: [
                { id: 'more-revenue', label: 'More revenue', sub: 'Increase sales and income', icon: <TrendingUp size={20} /> },
                { id: 'lower-costs', label: 'Lower costs', sub: 'Reduce expenses and waste', icon: <TrendingDown size={20} /> },
                { id: 'better-retention', label: 'Better retention', sub: 'Keep customers longer', icon: <Users size={20} /> },
                { id: 'clear-plan', label: 'A clear plan', sub: 'Know exactly what to do next', icon: <Target size={20} /> },
                { id: 'more-time', label: 'More time', sub: 'Free up time to focus on growth', icon: <Clock size={20} /> }
            ]
        }
    ]
};

// Estimate time remaining based on current position
function estimateTimeRemaining(currentStageIdx: number, currentQuestionIdx: number, totalQuestions: number): string {
    let questionsLeft = 0;
    for (let i = currentStageIdx; i < TRIAGE_STAGES.length; i++) {
        const stageId = TRIAGE_STAGES[i];
        const questions = STAGE_QUESTIONS[stageId] || [];
        if (i === currentStageIdx) {
            questionsLeft += questions.length - currentQuestionIdx - 1;
        } else {
            questionsLeft += questions.length;
        }
    }
    const minutes = Math.max(1, Math.ceil(questionsLeft * 0.3));
    return `~${minutes} min`;
}

// Determine audit type based on responses
function determineAuditType(data: TriageData): 'SHORT_FORM' | 'LONG_FORM' {
    let score = 0;

    // Business Performance signals
    if (data.businessPerformance === 'declining') score += 3;
    if (data.salesTrend === 'declining') score += 2;
    if (data.isProfitable === 'no') score += 3;
    if (data.measuresPerformance === 'no') score += 1;

    // Operations signals
    if (data.hasExcessStock === 'yes') score += 2;
    if (data.hasUnusedCapacity === 'yes') score += 2;
    if (data.operationalChallenges === 'yes') score += 2;
    if (data.processImprovements === 'yes') score += 1;

    // Customers & Marketing signals
    if (data.hasLoyaltyProgramme === 'no') score += 1;
    if (data.activelyMarketing === 'no') score += 1;
    if (data.knowsCustomerAcquisition === 'no') score += 1;
    if (data.hasRepeatCustomers === 'no') score += 1;

    // Growth & Technology signals
    if (data.sellsOnline === 'no') score += 1;
    if (data.usesBusinessSoftware === 'no') score += 1;
    if (data.planningGrowth === 'yes') score += 1;

    // Threshold: 8+ = Long Form, else Short Form
    return score >= 8 ? 'LONG_FORM' : 'SHORT_FORM';
}

function getExplanation(auditType: 'SHORT_FORM' | 'LONG_FORM'): string {
    if (auditType === 'LONG_FORM') {
        return 'Your responses indicate that your business would benefit from a more comprehensive assessment covering multiple operational areas. A Long Business Audit will provide deeper analysis and a detailed recovery roadmap.';
    }
    return 'Based on your responses, a focused assessment will effectively identify your key opportunities. A Short Business Audit will deliver clear, actionable insights efficiently.';
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AuditTriagePage() {
    const router = useRouter();
    const { user, signOut, isAuthenticated } = useAuth();
    const [stage, setStage] = useState<TriageStageId>('business-performance');
    const [data, setData] = useState<TriageData>({});
    const [questionIdx, setQuestionIdx] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showSavedToast, setShowSavedToast] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

    // Restore progress from cookies on mount
    useEffect(() => {
        const saved = localStorage.getItem("247gbs_triage_progress");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.type === "triage" && TRIAGE_STAGES.includes(parsed.stage)) {
                    setStage(parsed.stage);
                    setData(parsed.data || {});
                    setQuestionIdx(parsed.questionIdx || 0);
                }
            } catch {}
        }
        setHydrated(true);
    }, []);

    // Save progress on changes
    useEffect(() => {
        if (!hydrated) return;
        if (stage === 'processing' || stage === 'result') return;
        localStorage.setItem("247gbs_triage_progress", JSON.stringify({
            type: "triage",
            stage,
            data,
            questionIdx
        }));
    }, [stage, data, questionIdx, hydrated]);

    const stageIdx = TRIAGE_STAGES.indexOf(stage);
    const stageQuestions = STAGE_QUESTIONS[stage] || [];
    const currentQuestion = stageQuestions[questionIdx];
    const totalQuestions = TRIAGE_STAGES.reduce((sum, s) => sum + (STAGE_QUESTIONS[s]?.length || 0), 0);
    const answeredQuestions = TRIAGE_STAGES.slice(0, stageIdx).reduce((sum, s) => sum + (STAGE_QUESTIONS[s]?.length || 0), 0) + questionIdx;

    const handleSignOut = () => {
        signOut();
        router.push("/auth/signin");
    };

    const handleContinueLater = () => {
        if (!isAuthenticated) {
            // Show auth prompt modal for public/guest users
            setShowAuthModal(true);
            return;
        }
        // Authenticated user — progress is already saved by useEffect.
        // Show a brief toast confirmation and redirect to dashboard.
        setShowSavedToast(true);
        setTimeout(() => {
            router.push('/dashboard');
        }, 1200);
    };

    const handleSkip = () => {
        advance();
    };

    const advance = () => {
        if (questionIdx < stageQuestions.length - 1) {
            // More questions in this stage
            setQuestionIdx(prev => prev + 1);
        } else if (stageIdx < TRIAGE_STAGES.length - 1) {
            // Move to next stage
            setStage(TRIAGE_STAGES[stageIdx + 1]);
            setQuestionIdx(0);
        } else {
            // All questions done → processing
            setStage('processing');
            // After processing, determine audit type
            setTimeout(() => {
                const auditType = determineAuditType(data);
                setData(prev => ({ ...prev, assignedAudit: auditType }));
                setStage('result');
                localStorage.removeItem("247gbs_triage_progress");
                localStorage.setItem("247gbs_triage_result", JSON.stringify({
                    assignedAudit: auditType,
                    completedAt: new Date().toISOString()
                }));
            }, 3000);
        }
    }

    const handleSelect = (questionId: string, optionId: string) => {
        setData(prev => ({ ...prev, [questionId]: optionId }));

        // Auto-advance after short delay
        setTimeout(() => {
            advance();
        }, 300);
    };

    const handleBack = () => {
        if (questionIdx > 0) {
            setQuestionIdx(prev => prev - 1);
        } else if (stageIdx > 0) {
            const prevStage = TRIAGE_STAGES[stageIdx - 1];
            setStage(prevStage);
            setQuestionIdx((STAGE_QUESTIONS[prevStage]?.length || 1) - 1);
        } else {
            router.push('/audit/welcome');
        }
    };

    // ==================== PROCESSING SCREEN ====================
    if (stage === 'processing') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center"
                >
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Loader2 size={32} className="text-orange-500 animate-spin" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                        Analysing Your Business Assessment
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                        Please wait while we analyse your responses and determine the most appropriate audit for your business.
                    </p>
                    <p className="text-slate-400 text-xs sm:text-sm">
                        This usually takes only a few moments.
                    </p>
                    <div className="mt-8 flex justify-center gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-orange-500 rounded-full"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    // ==================== RESULT SCREEN ====================
    if (stage === 'result') {
        const auditType = data.assignedAudit || 'SHORT_FORM';
        const isLong = auditType === 'LONG_FORM';

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4 pt-24 sm:pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl"
                >
                    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-slate-900 px-6 sm:px-10 py-8 sm:py-12 text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={32} className="text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                                Business Triage Complete
                            </h1>
                            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
                                Thank you for completing your Business Triage.
                            </p>
                        </div>

                        <div className="px-6 sm:px-10 py-8 sm:py-10">
                            <p className="text-slate-600 text-sm sm:text-base text-center mb-8">
                                Based on your responses, we have identified the most appropriate audit for your business.
                            </p>

                            {/* Assigned Audit Card */}
                            <div className={`border-2 rounded-2xl p-6 sm:p-8 mb-6 ${isLong ? 'border-orange-500 bg-orange-50' : 'border-blue-500 bg-blue-50'}`}>
                                <div className="text-center">
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                        Recommended Audit
                                    </span>
                                    <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${isLong ? 'text-orange-600' : 'text-blue-600'}`}>
                                        {isLong ? 'Long Business Audit' : 'Short Business Audit'}
                                    </h2>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-xs text-slate-500 mb-1">Estimated Time</div>
                                            <div className="font-bold text-slate-900">{isLong ? '30 min' : '10 min'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 mb-1">Stages</div>
                                            <div className="font-bold text-slate-900">{isLong ? '10' : '6'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 mb-1">Questions</div>
                                            <div className="font-bold text-slate-900">~{isLong ? '60' : '20'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Explanation */}
                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 mb-8">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {getExplanation(auditType)}
                                </p>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => {
                                    markAssessmentCompleted();
                                    router.push('/dashboard');
                                }}
                                className="w-full bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:translate-y-0"
                            >
                                Continue to My Audit Dashboard
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ==================== TRIAGE QUESTIONS ====================
    const meta = STAGE_META[stage];
    const stageNumber = stageIdx + 1;
    const totalStages = TRIAGE_STAGES.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 text-sm tracking-tight">247GBS Audit</div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Business Check</div>
                    </div>
                </div>
                <div className="relative" ref={navRef}>
                    <button
                        onClick={() => {}}
                        className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    >
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Progress Header */}
                <div className="mb-6 sm:mb-10">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900">Business Triage</h2>
                        <span className="text-[10px] sm:text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                            Stage {stageNumber} of {totalStages}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                        <motion.div
                            className="bg-orange-500 h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((answeredQuestions) / totalQuestions) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
                        <span>Question {answeredQuestions + 1} of {totalQuestions}</span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {estimateTimeRemaining(stageIdx, questionIdx, totalQuestions)} remaining
                        </span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-50 relative z-10 overflow-hidden">
                    <div className="p-6 sm:p-10 lg:p-14">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${stage}-${questionIdx}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Stage label */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
                                        {meta.icon}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{meta.title}</span>
                                </div>

                                {/* Question */}
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-6 sm:mb-8 leading-tight">
                                    {currentQuestion?.text}
                                </h2>

                                {/* Options */}
                                <div className="grid gap-3 sm:gap-4">
                                    {currentQuestion?.options.map((opt) => {
                                        const isSelected = data[currentQuestion.id as keyof TriageData] === opt.id;
                                        return (
                                            <motion.button
                                                key={opt.id}
                                                whileHover={{ scale: 1.01, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSelect(currentQuestion.id, opt.id)}
                                                className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden ${
                                                    isSelected
                                                        ? "bg-white border-orange-500 shadow-[0_8px_30px_rgb(249,115,22,0.12)] ring-1 ring-orange-500 ring-offset-2"
                                                        : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"
                                                }`}
                                            >
                                                {isSelected && (
                                                    <motion.div layoutId="activeBg" className="absolute inset-0 bg-gradient-to-r from-orange-50/30 to-transparent pointer-events-none" />
                                                )}
                                                <div className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                                                    isSelected ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110" : "bg-slate-50 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500"
                                                }`}>
                                                    {opt.icon}
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="font-bold text-base sm:text-lg leading-tight transition-colors duration-300 group-hover:text-orange-600 text-slate-900">{opt.label}</div>
                                                    {opt.sub && <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">{opt.sub}</div>}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="px-6 sm:px-10 py-5 sm:py-6 border-t border-slate-50 flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all"
                        >
                            <ChevronLeft size={14} />
                            Back
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleContinueLater}
                                className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-400 px-4 py-2 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all"
                            >
                                <Bookmark size={12} />
                                Continue Later
                            </button>
                            <button
                                onClick={handleSkip}
                                className="flex items-center gap-2 text-slate-400 hover:text-orange-600 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all"
                            >
                                Skip
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Saved Toast */}
                <AnimatePresence>
                    {showSavedToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
                        >
                            <CheckCircle2 size={18} className="text-green-400" />
                            <span className="font-bold text-sm">Progress saved! Redirecting to dashboard…</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Auth Prompt Modal — for unauthenticated users */}
                <AnimatePresence>
                    {showAuthModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowAuthModal(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close button */}
                                <button
                                    onClick={() => setShowAuthModal(false)}
                                    className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors z-10"
                                >
                                    <X size={16} />
                                </button>

                                {/* Modal header */}
                                <div className="bg-slate-900 px-6 sm:px-8 py-6 sm:py-8 text-center">
                                    <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Bookmark size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                        Save Your Progress
                                    </h3>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                        Sign in or create an account to save your triage progress and continue anytime.
                                    </p>
                                </div>

                                {/* Modal body */}
                                <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-3">
                                    <Link
                                        href="/auth/signin?callbackUrl=/audit/triage"
                                        className="w-full bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <LogIn size={18} />
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth/signup?callbackUrl=/audit/triage"
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <UserPlus size={18} />
                                        Create Account
                                    </Link>
                                    <p className="text-[10px] sm:text-xs text-slate-400 text-center pt-2 leading-relaxed">
                                        Your answers are saved locally on this device. Sign in to sync your progress across devices.
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function markAssessmentCompleted() {
    localStorage.setItem("247gbs_assessment_completed", "true");
}
