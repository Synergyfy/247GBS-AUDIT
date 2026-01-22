/**
 * AI Audit API Route
 * 
 * Server-side endpoint for Gemini AI calls.
 * All AI processing happens here — never in the browser.
 * 
 * SAFETY:
 * - Fallback response if AI fails
 * - Structured JSON only (no raw text)
 */

import { NextRequest, NextResponse } from "next/server";
import {
    generateInsight,
    generateProjection,
    generateFollowUpQuestions,
    getFallbackInsight,
    getFallbackFollowUp,
    shouldTriggerAI,
    validateAuditStep
} from "@/services/aiAuditEngine";
import type {
    AIAuditState,
    AIAuditAPIResponse,
    AIAuditStepData
} from "@/types/aiTypes";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, payload } = body;

        // Validate request structure
        if (!action || !payload) {
            return NextResponse.json<AIAuditAPIResponse>({
                success: false,
                error: "Missing action or payload"
            }, { status: 400 });
        }

        switch (action) {
            // ============================================
            // GENERATE INSIGHT (PROMPT 4)
            // Main AI reasoning endpoint
            // ============================================
            case "generateInsight": {
                const state = payload as AIAuditState;

                // Validate state has required fields
                if (!state.context || !state.engineStats) {
                    return NextResponse.json<AIAuditAPIResponse>({
                        success: false,
                        error: "Invalid audit state"
                    }, { status: 400 });
                }

                try {
                    // Call Gemini directly (no timeout restriction)
                    const insight = await generateInsight(state);

                    return NextResponse.json<AIAuditAPIResponse>({
                        success: true,
                        data: insight
                    });
                } catch (error) {
                    // AI failed — return fallback insight
                    console.error("AI insight failed, using fallback:", error);

                    return NextResponse.json<AIAuditAPIResponse>({
                        success: true,
                        data: getFallbackInsight(state),
                        fallback: true
                    });
                }
            }

            // ============================================
            // GENERATE PROJECTION (PROMPT 5)
            // "What if" scenario modeling
            // ============================================
            case "generateProjection": {
                const { state, improvementPercent } = payload as {
                    state: AIAuditState;
                    improvementPercent?: number
                };

                if (!state.context || !state.engineStats) {
                    return NextResponse.json<AIAuditAPIResponse>({
                        success: false,
                        error: "Invalid audit state for projection"
                    }, { status: 400 });
                }

                try {
                    const projection = await generateProjection(state, improvementPercent || 10);

                    return NextResponse.json<AIAuditAPIResponse>({
                        success: true,
                        data: projection
                    });
                } catch (error) {
                    console.error("AI projection failed:", error);

                    return NextResponse.json<AIAuditAPIResponse>({
                        success: true,
                        data: {
                            projectedOutcome: `A ${improvementPercent || 10}% improvement in utilization could recover approximately £${Math.round((state.engineStats.annualRecovery * (improvementPercent || 10)) / 100).toLocaleString()} annually.`,
                            reasoning: "Based on calculated capacity drain metrics.",
                            confidenceLevel: "moderate" as const
                        },
                        fallback: true
                    });
                }
            }

            // ============================================
            // CHECK TRIGGER (PROMPT 3)
            // Determines if AI should be called
            // ============================================
            case "checkTrigger": {
                const { auditType, currentStep, engineStats } = payload as {
                    auditType: "SHORT_FORM" | "LONG_FORM";
                    currentStep: string;
                    engineStats: { capacityDrainPct: number; totalStockImpact: number; impactScore: number };
                };

                const shouldTrigger = shouldTriggerAI(auditType, currentStep, engineStats);

                return NextResponse.json<AIAuditAPIResponse & { shouldTrigger: boolean }>({
                    success: true,
                    shouldTrigger
                });
            }

            // ============================================
            // GENERATE FOLLOW-UP QUESTIONS (ADAPTIVE)
            // Long Form Only — optional clarifications
            // ============================================
            case "generateFollowUp": {
                const state = payload as AIAuditState;

                // Validate state has required fields
                if (!state.context || !state.engineStats) {
                    return NextResponse.json<AIAuditAPIResponse>({
                        success: false,
                        error: "Invalid audit state for follow-up"
                    }, { status: 400 });
                }

                try {
                    const followUp = await generateFollowUpQuestions(state);

                    return NextResponse.json<AIAuditAPIResponse>({
                        success: true,
                        data: followUp
                    });
                } catch (error) {
                    // AI failed — return empty follow-up (continue audit normally)
                    console.error("AI follow-up generation failed:", error);

                    return NextResponse.json<AIAuditAPIResponse>({
                        success: true,
                        data: getFallbackFollowUp(),
                        fallback: true
                    });
                }
            }

            default:
                return NextResponse.json<AIAuditAPIResponse>({
                    success: false,
                    error: `Unknown action: ${action}`
                }, { status: 400 });

        }

    } catch (error) {
        console.error("AI API route error:", error);

        return NextResponse.json<AIAuditAPIResponse>({
            success: false,
            error: "Internal server error"
        }, { status: 500 });
    }
}
