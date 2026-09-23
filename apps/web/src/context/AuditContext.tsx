"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { AuditData, AuditDataSchema, STEPS, StepId } from "@/types/audit";

interface AuditState {
    currentStepIndex: number;
    currentStepId: StepId;
    data: AuditData;
}

type AuditAction =
    | { type: "NEXT_STEP" }
    | { type: "PREV_STEP" }
    | { type: "SET_DATA"; payload: Partial<AuditData> }
    | { type: "RESET" };

const initialState: AuditState = {
    currentStepIndex: 0,
    currentStepId: STEPS[0],
    data: {
        excessStock: [],
        capacityServices: [],
    },
};

const auditReducer = (state: AuditState, action: AuditAction): AuditState => {
    switch (action.type) {
        case "NEXT_STEP":
            const nextIndex = Math.min(state.currentStepIndex + 1, STEPS.length - 1);
            return {
                ...state,
                currentStepIndex: nextIndex,
                currentStepId: STEPS[nextIndex],
            };
        case "PREV_STEP":
            const prevIndex = Math.max(state.currentStepIndex - 1, 0);
            return {
                ...state,
                currentStepIndex: prevIndex,
                currentStepId: STEPS[prevIndex],
            };
        case "SET_DATA":
            return {
                ...state,
                data: { ...state.data, ...action.payload },
            };
        case "RESET":
            return initialState;
        default:
            return state;
    }
};

interface AuditContextType {
    state: AuditState;
    nextStep: () => void;
    prevStep: () => void;
    updateData: (data: Partial<AuditData>) => void;
    resetAudit: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(auditReducer, initialState);

    const nextStep = () => dispatch({ type: "NEXT_STEP" });
    const prevStep = () => dispatch({ type: "PREV_STEP" });
    const updateData = (data: Partial<AuditData>) =>
        dispatch({ type: "SET_DATA", payload: data });
    const resetAudit = () => dispatch({ type: "RESET" });

    const isFirstStep = state.currentStepIndex === 0;
    const isLastStep = state.currentStepIndex === STEPS.length - 1;

    return (
        <AuditContext.Provider
            value={{
                state,
                nextStep,
                prevStep,
                updateData,
                resetAudit,
                isFirstStep,
                isLastStep,
            }}
        >
            {children}
        </AuditContext.Provider>
    );
};

export const useAudit = () => {
    const context = useContext(AuditContext);
    if (context === undefined) {
        throw new Error("useAudit must be used within an AuditProvider");
    }
    return context;
};
