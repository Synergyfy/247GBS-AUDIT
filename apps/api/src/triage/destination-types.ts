/**
 * Destination model for the public Pre-Audit flow.
 *
 * Every answer option (or option-less question default) routes the user to
 * ONE place: either the next question (`nextQuestionId`) or a terminal
 * destination expressed as `destinationType` + `destinationTarget`.
 *
 * The destination set is designed to be extensible: admins express where a
 * path should end without the server needing new code. Well-known types are
 * handled with tailored confirmation copy; unknown/legacy destinations can be
 * mapped to CUSTOM.
 */

export enum TriageDestinationType {
  /** Continue into a short audit. */
  SHORT_FORM = 'SHORT_FORM',
  /** Continue into the full/long audit. */
  LONG_FORM = 'LONG_FORM',
  /** Sector-specific audit; `destinationTarget` = sector id/slug. */
  SECTOR = 'SECTOR',
  /** Support / information; no audit is created. */
  SUPPORT = 'SUPPORT',
  /** Raise funds or donate; `destinationTarget` optional fund/donation page. */
  FUND_OR_DONATE = 'FUND_OR_DONATE',
  /** Another MCOM service; `destinationTarget` = MCOM service slug. */
  MCOM = 'MCOM',
  /** Routed to a human for review. */
  HUMAN_REVIEW = 'HUMAN_REVIEW',
  /** No immediate action needed. */
  NO_ACTION = 'NO_ACTION',
  /** Admin-configured destination; `destinationTarget` = custom label/slug. */
  CUSTOM = 'CUSTOM',
}

export const DESTINATION_TYPES: readonly TriageDestinationType[] =
  Object.values(TriageDestinationType);

export const DESTINATION_LABELS: Record<TriageDestinationType, string> = {
  SHORT_FORM: 'Short Audit',
  LONG_FORM: 'Long Audit',
  SECTOR: 'Sector-specific Audit',
  SUPPORT: 'Support & Information',
  FUND_OR_DONATE: 'Fund / Donate',
  MCOM: 'Other MCOM Service',
  HUMAN_REVIEW: 'Human Review',
  NO_ACTION: 'No Immediate Action',
  CUSTOM: 'Custom Destination',
};

/**
 * Destinations that continue into a full business audit. Maps the new
 * destination model back to the legacy audit-type enum used by the audit
 * engine (`AuditType` in triage.entity) so the Pre-Audit -> Audit handoff
 * keeps working unchanged.
 */
export function destinationAuditType(
  type: string | null | undefined,
): 'SHORT_FORM' | 'LONG_FORM' | null {
  if (type === TriageDestinationType.SHORT_FORM) return 'SHORT_FORM';
  if (type === TriageDestinationType.LONG_FORM) return 'LONG_FORM';
  return null;
}

export interface ResolvedDestination {
  destinationType: string | null;
  destinationTarget: string | null;
}

/**
 * Normalizes a "where does this edge lead?" decision using the legacy
 * columns as fallbacks: an answer configured before the destination model
 * existed (auditType = SHORT_FORM/LONG_FORM) keeps resolving to the same
 * destination without a data migration.
 */
export function resolveDestination(input: {
  destinationType?: string | null;
  destinationTarget?: string | null;
  auditType?: string | null;
  defaultDestinationType?: string | null;
  defaultDestinationTarget?: string | null;
  defaultAuditType?: string | null;
}): ResolvedDestination {
  const legacy =
    input.auditType ?? input.defaultAuditType ?? null;
  const modern =
    input.destinationType ?? input.defaultDestinationType ?? null;

  if (modern) {
    return {
      destinationType: modern,
      destinationTarget: input.destinationTarget ?? input.defaultDestinationTarget ?? null,
    };
  }
  if (legacy && legacy !== 'NONE') {
    return {
      destinationType: legacy,
      destinationTarget: null,
    };
  }
  return { destinationType: null, destinationTarget: null };
}