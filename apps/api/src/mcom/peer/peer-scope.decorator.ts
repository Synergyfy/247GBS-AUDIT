import { SetMetadata } from '@nestjs/common';
import { PeerScope } from './peer.types';

export const PEER_SCOPES_KEY = 'peerScopes';

/**
 * Require one or more M2M scopes on an inbound peer endpoint. Enforced by
 * `PeerAuthGuard` against the token's `scope` claim.
 */
export const RequirePeerScope = (...scopes: PeerScope[]) =>
  SetMetadata(PEER_SCOPES_KEY, scopes);
