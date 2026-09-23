"use client";

import React from "react";
import { useAudit } from "@/context/AuditContext";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { WelcomeStep } from "./steps/WelcomeStep";
import { BusinessBasicsStep } from "./steps/BusinessBasicsStep";
import { ExcessStockStep } from "./steps/ExcessStockStep";
import { SpareCapacityOverviewStep } from "./steps/SpareCapacityOverviewStep";
import { SpareCapacityDetailsStep } from "./steps/SpareCapacityDetailsStep";
import { CostAndLimitsStep } from "./steps/CostAndLimitsStep";
import { RewardRulesStep } from "./steps/RewardRulesStep";
import { RecommendationStep } from "./steps/RecommendationStep";
import { ReviewStep } from "./steps/ReviewStep";
import { AuditCompleteStep } from "./steps/AuditCompleteStep";

// Placeholder components for steps - we will implement these one by one
// ... other placeholders can be generic for now

const StepRenderer = () => {
    const { state } = useAudit();
    const { currentStepId } = state;

    switch (currentStepId) {
        case "welcome": return <WelcomeStep />;
        case "basics": return <BusinessBasicsStep />;
        case "excess-stock": return <ExcessStockStep />;
        case "capacity-overview": return <SpareCapacityOverviewStep />;
        case "capacity-details": return <SpareCapacityDetailsStep />;
        case "costs": return <CostAndLimitsStep />;
        case "rules": return <RewardRulesStep />;
        case "recommendation": return <RecommendationStep />;
        case "review": return <ReviewStep />;
        case "complete": return <AuditCompleteStep />;
        default:
            return (
                <div className="flex flex-col items-center justify-center p-10 space-y-4">
                    <h2 className="text-2xl font-bold">Step: {currentStepId}</h2>
                    <p className="text-muted-foreground">This step is under construction.</p>
                </div>
            );
    }
};

export const AuditWizard = () => {
    const { state, nextStep, prevStep, isFirstStep, isLastStep } = useAudit();

    // Progress percentage
    const progress = ((state.currentStepIndex + 1) / 10) * 100;

    return (
        <div className="w-full max-w-4xl mx-auto min-h-[600px] flex flex-col relative">
            {/* Progress Bar (hidden on welcome screen maybe? Let's keep it minimal) */}
            {!isFirstStep && (
                <div className="w-full h-1.5 bg-orange-100/50 rounded-full overflow-hidden mb-8 backdrop-blur-sm">
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-full bg-white/50 blur-[2px]" />
                        <div className="absolute inset-0 bg-white/20 animate-pulse-slow" />
                    </motion.div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state.currentStepId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                    >
                        <StepRenderer />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls (Temporary for testing navigation) */}
            <div className="flex justify-between mt-8 p-4 border-t border-border/10">
                <button
                    onClick={prevStep}
                    disabled={isFirstStep}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    onClick={nextStep}
                    disabled={isLastStep}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                    Next (Dev Only)
                </button>
            </div>
        </div>
    );
};
