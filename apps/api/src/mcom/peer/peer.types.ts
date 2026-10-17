/**
 * Shared types and constants for MCOM backend-to-backend (M2M) peer calls.
 *
 * In the MCOM service mesh the 247GBS Audit backend acts as a *resource
 * server*: partner apps (e.g. fundordonate) mint a short-lived RS256 delegated
 * token at MCOM Central and call us **directly**. Central never sits in the
 * data path — we verify the token completely offline against Central's public
 * JWKS.
 */

/** Issuer claim Central stamps on every service/delegated token. */
export const MCOM_ISSUER = 'mcom-solutions';

/**
 * Token type marking an RFC 8693 delegated (user-scoped) token. Plain
 * client-credentials service tokens are rejected: fundordonate must act on
 * behalf of the signed-in user, never read arbitrary users' data.
 */
export const DELEGATED_TOKEN_TYPE = 'delegated';

/**
 * Granular scopes this app offers as a resource server. These must be
 * registered on the **247gbs-audit** app in the MCOM Admin Console
 * ("Supported Scopes") or Central will refuse to mint tokens requesting them.
 */
export const PEER_SCOPES = {
  PRE_AUDIT_READ: 'preaudit:read',
  AUDIT_READ: 'audit:read',
} as const;

export type PeerScope = (typeof PEER_SCOPES)[keyof typeof PEER_SCOPES];

/** Caller metadata attached to an inbound peer request by `PeerAuthGuard`. */
export interface PeerCaller {
  /** `act.sub` — the calling app's clientId (e.g. "fundordonate"). */
  callerId: string;
  /** Always true here: this app only accepts delegated (user-scoped) tokens. */
  isDelegated: boolean;
  /** `sub` — the MCOM user id the token was delegated for. */
  userId: string;
  /** Scopes parsed from the token's `scope` claim. */
  scopes: string[];
}

/** Request shape after `PeerAuthGuard` has run. */
export interface PeerRequest {
  peerCaller?: PeerCaller;
}
