/**
 * AI Audit Engine Service
 * 
 * Core Gemini integration for Long Form Audit intelligence.
 * 
 * ARCHITECTURE:
 * - All calls are server-side only
 * - Structured JSON input/output (no raw chat)
 * - Chained prompt pipeline with context accumulation
 * 
 * IMPORTANT:
 * - AI is ASSISTIVE, not critical-path
 * - AI NEVER replaces core calculations
 * - AI NEVER invents data
 * - AI ONLY activates for Long Form audits
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
    AIBusinessContext,
    AIAuditStepData,
    AIAuditState,
    AIInsightResponse,
    AIProjectionResponse,
    AIFollowUpResponse,
} from "@/types/aiTypes";


// ============================================================
// PROMPT 0 — SYSTEM IDENTITY (prepended to ALL Gemini calls)
// ============================================================
const SYSTEM_PROMPT = `You are an enterprise business audit intelligence engine.
You analyze spare capacity and excess stock data.
You reason only from provided structured inputs.
You do not invent numbers or assumptions.
You give conservative, practical, revenue-focused insights.
You communicate clearly to business owners.`;

// ============================================================
// GEMINI CLIENT INITIALIZATION
// ============================================================
const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
    }
    return new GoogleGenerativeAI(apiKey);
};

// ============================================================
// PROMPT 1 — BUSINESS CONTEXT LOADER
// Called once after sector/group/type selection.
// Stores context silently for later reasoning.
// ============================================================
export async function loadBusinessContext(context: AIBusinessContext): Promise<void> {
    // Context is stored in the accumulated state, not sent to Gemini yet.
    // This function validates the context structure.
    if (!context.sector || !context.businessType) {
        throw new Error("Invalid business context: sector and businessType required");
    }
    // Context will be included in generateInsight call
}

// ============================================================
// PROMPT 2 — AUDIT STATE UPDATES (ACCUMULATIVE)
// Called after each audit step to build up reasoning state.
// Does NOT generate output yet.
// ============================================================
export function validateAuditStep(stepData: AIAuditStepData): boolean {
    if (!stepData.step || !stepData.data) {
        return false;
    }
    if (!["SPARE_CAPACITY", "EXCESS_STOCK"].includes(stepData.step)) {
        return false;
    }
    return true;
}

// ============================================================
// PROMPT 3 — AI TRIGGER LOGIC
// Returns true if AI should be called for output.
// ============================================================
export function shouldTriggerAI(
    auditType: "SHORT_FORM" | "LONG_FORM",
    currentStep: string,
    engineStats: { capacityDrainPct: number; totalStockImpact: number; impactScore: number }
): boolean {
    // RULE 1: Never for Short Form
    if (auditType === "SHORT_FORM") return false;

    // RULE 2: Always on Strategy Preview or Results
    if (currentStep === "STRATEGY_PREVIEW" || currentStep === "RESULTS") return true;

    // RULE 3: If values are statistically extreme (>50% drain or >£10,000 stock impact)
    if (engineStats.capacityDrainPct > 50 || engineStats.totalStockImpact > 10000) return true;

    // RULE 4: Manual trigger (handled by UI button click)
    return false;
}

// ============================================================
// PROMPT 4 — INTERPRETIVE INSIGHT GENERATION
// Main AI reasoning call. Returns structured insight.
// ============================================================
export async function generateInsight(state: AIAuditState): Promise<AIInsightResponse> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const insightPrompt = `${SYSTEM_PROMPT}

BUSINESS CONTEXT:
${JSON.stringify(state.context, null, 2)}

AUDIT DATA:
${JSON.stringify(state.steps, null, 2)}

${state.followUpAnswers ? `ADDITIONAL CLARIFICATIONS:
${JSON.stringify(state.followUpAnswers, null, 2)}` : ""}

CALCULATED METRICS:
- Capacity Drain: ${state.engineStats.capacityDrainPct}%
- Stock Impact: £${state.engineStats.totalStockImpact.toLocaleString()}
- Annual Recovery Potential: £${state.engineStats.annualRecovery.toLocaleString()}
- Impact Score: ${state.engineStats.impactScore}/100

INSTRUCTIONS:
Using the full audit state, business context, and any additional clarifications:
1. Identify the single largest inefficiency
2. Explain WHY it matters for this business type
3. Quantify impact conservatively
4. Avoid jargon
5. Provide no more than 2 recommendations
6. Do not suggest software, tools, or upsells
7. Do not reference follow-up questions explicitly
8. Do not mention uncertainty
9. Present conclusions confidently but realistically

RESPOND IN THIS EXACT JSON FORMAT ONLY:
{
  "keyIssue": "...",
  "businessExplanation": "...",
  "estimatedImpact": "...",
  "recommendations": ["...", "..."]
}`;

    try {
        const result = await model.generateContent(insightPrompt);
        const responseText = result.response.text();

        // Parse JSON from response (handle markdown code blocks)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON in AI response");
        }

        const parsed = JSON.parse(jsonMatch[0]) as AIInsightResponse;

        // Validate required fields
        if (!parsed.keyIssue || !parsed.businessExplanation || !parsed.recommendations) {
            throw new Error("Missing required fields in AI response");
        }

        return parsed;
    } catch (error) {
        console.error("Gemini insight generation failed:", error);
        throw error;
    }
}

// ============================================================
// PROMPT 5 — SCENARIO & PROJECTION SUPPORT (OPTIONAL)
// "What if we improve by X%?" scenario modeling.
// ============================================================
export async function generateProjection(
    state: AIAuditState,
    improvementPercent: number = 10
): Promise<AIProjectionResponse> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const projectionPrompt = `${SYSTEM_PROMPT}

BUSINESS CONTEXT:
${JSON.stringify(state.context, null, 2)}

CURRENT METRICS:
- Capacity Drain: ${state.engineStats.capacityDrainPct}%
- Annual Recovery Potential: £${state.engineStats.annualRecovery.toLocaleString()}

SCENARIO: What if this business improves utilization by ${improvementPercent}%?

INSTRUCTIONS:
1. Estimate realistic outcome
2. Avoid optimistic assumptions
3. Explain reasoning briefly

RESPOND IN THIS EXACT JSON FORMAT ONLY:
{
  "projectedOutcome": "...",
  "reasoning": "...",
  "confidenceLevel": "low" | "moderate" | "high"
}`;

    try {
        const result = await model.generateContent(projectionPrompt);
        const responseText = result.response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON in AI response");
        }

        return JSON.parse(jsonMatch[0]) as AIProjectionResponse;
    } catch (error) {
        console.error("Gemini projection generation failed:", error);
        throw error;
    }
}

// ============================================================
// FALLBACK INSIGHT (when AI fails)
// Platform continues normally with static copy.
// ============================================================
export function getFallbackInsight(state: AIAuditState): AIInsightResponse {
    const isHighImpact = state.engineStats.impactScore > 50;

    return {
        keyIssue: isHighImpact
            ? "Significant operational inefficiency detected"
            : "Moderate optimization opportunity identified",
        businessExplanation: `Based on the audit data for your ${state.context.businessType} business, there are measurable gaps in resource utilization that directly impact profitability.`,
        estimatedImpact: `Potential annual recovery of £${state.engineStats.annualRecovery.toLocaleString()} through targeted operational adjustments.`,
        recommendations: [
            "Review capacity allocation during peak hours",
            "Implement stock aging protocols to reduce waste"
        ]
    };
}

// ============================================================
// ADAPTIVE FOLLOW-UP QUESTIONING (Long Form Only)
// 
// Generates up to 3 clarification questions ONLY when:
// 1. Contradictory inputs detected
// 2. Extreme values outside industry norms
// 3. High-upside opportunity identified
// 4. Low confidence score (<70%)
//
// If none apply, returns empty array (silence is preferred).
// ============================================================
export async function generateFollowUpQuestions(state: AIAuditState): Promise<AIFollowUpResponse> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const followUpPrompt = `${SYSTEM_PROMPT}

You are evaluating whether additional data is required to improve audit accuracy.

BUSINESS CONTEXT:
${JSON.stringify(state.context, null, 2)}

AUDIT DATA:
${JSON.stringify(state.steps, null, 2)}

CALCULATED METRICS:
- Capacity Drain: ${state.engineStats.capacityDrainPct}%
- Stock Impact: £${state.engineStats.totalStockImpact.toLocaleString()}
- Annual Recovery Potential: £${state.engineStats.annualRecovery.toLocaleString()}
- Impact Score: ${state.engineStats.impactScore}/100

EVALUATION INSTRUCTIONS:
1. Determine whether any assumptions materially affect recommendations.
2. Determine whether additional inputs would significantly change projected outcomes.
3. If yes, generate up to 3 follow-up questions.
4. If no, return an empty list.

RULES FOR QUESTIONS:
- Must be specific
- Must be quick to answer
- Must clearly justify their existence
- Must be framed as clarification, not curiosity
- Must not request data already provided

RESPOND IN THIS EXACT JSON FORMAT ONLY:
{
  "followUpQuestions": [
    {
      "id": "clarification_1",
      "question": "...",
      "reason": "..."
    }
  ],
  "confidenceScore": 0-100
}

If no follow-up questions are needed, return:
{
  "followUpQuestions": [],
  "confidenceScore": 85
}`;

    try {
        const result = await model.generateContent(followUpPrompt);
        const responseText = result.response.text();

        // Parse JSON from response (handle markdown code blocks)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("No valid JSON in follow-up response");
            return getFallbackFollowUp();
        }

        const parsed = JSON.parse(jsonMatch[0]) as AIFollowUpResponse;

        // Validate and enforce max 3 questions
        if (!Array.isArray(parsed.followUpQuestions)) {
            console.error("Invalid followUpQuestions array");
            return getFallbackFollowUp();
        }

        // Enforce max 3 questions rule
        if (parsed.followUpQuestions.length > 3) {
            console.warn("AI returned more than 3 questions, truncating");
            parsed.followUpQuestions = parsed.followUpQuestions.slice(0, 3);
        }

        // Validate each question has required fields
        parsed.followUpQuestions = parsed.followUpQuestions.filter(q =>
            q.id && q.question && q.reason
        );

        return parsed;
    } catch (error) {
        console.error("Gemini follow-up generation failed:", error);
        return getFallbackFollowUp();
    }
}

// ============================================================
// FALLBACK FOLLOW-UP (when AI fails or no questions needed)
// Returns empty array to continue audit normally.
// ============================================================
export function getFallbackFollowUp(): AIFollowUpResponse {
    return {
        followUpQuestions: [],
        confidenceScore: 75 // Default moderate confidence
    };
}
