/**
 * AI Audit Types
 * 
 * TypeScript interfaces for Gemini AI integration.
 * These types define the structured input/output for all AI calls.
 */

// PROMPT 1 — Business Context (sent once after sector selection)
export interface AIBusinessContext {
    sector: string;
    group: string;
    businessType: string;
    businessSize?: string;
}

// PROMPT 2 — Audit Step Data (accumulated across steps)
export interface AIAuditStepData {
    step: "SPARE_CAPACITY" | "EXCESS_STOCK";
    data: Record<string, number>;
}

// Full accumulated state sent to AI
export interface AIAuditState {
    context: AIBusinessContext;
    steps: AIAuditStepData[];
    engineStats: {
        capacityDrainPct: number;
        totalStockImpact: number;
        annualRecovery: number;
        impactScore: number;
    };
    // Optional: User answers to follow-up questions
    followUpAnswers?: Record<string, string>;
}

// PROMPT 4 — Structured insight response from Gemini
export interface AIInsightResponse {
    keyIssue: string;
    businessExplanation: string;
    estimatedImpact: string;
    recommendations: [string, string?]; // Max 2 recommendations
}

// PROMPT 5 — Scenario projection response
export interface AIProjectionResponse {
    projectedOutcome: string;
    reasoning: string;
    confidenceLevel: "low" | "moderate" | "high";
}

// ============================================================
// ADAPTIVE FOLLOW-UP QUESTIONING (Long Form Only)
// ============================================================

// Single follow-up question structure
export interface AIFollowUpQuestion {
    id: string;
    question: string;
    reason: string; // Why this clarification improves accuracy
}

// Response from follow-up question generator
export interface AIFollowUpResponse {
    followUpQuestions: AIFollowUpQuestion[];
    confidenceScore: number; // Internal score, not shown to user
}

// API request/response types
export interface AIAuditRequest {
    action: "loadContext" | "updateState" | "generateInsight" | "generateProjection" | "generateFollowUp";
    payload: AIBusinessContext | AIAuditStepData | AIAuditState;
}

export interface AIAuditAPIResponse {
    success: boolean;
    data?: AIInsightResponse | AIProjectionResponse | AIFollowUpResponse;
    error?: string;
    fallback?: boolean; // True if using fallback copy due to AI failure
}
