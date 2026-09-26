import { useState, type Dispatch, type SetStateAction } from "react";

/**
 * Local state that re-syncs to an external value without a syncing effect.
 * Uses the "adjust state during render" pattern so props refetches update the
 * draft while the input stays editable (and lint-safe).
 */
export function useSyncedState<T>(external: T): [T, Dispatch<SetStateAction<T>>] {
  const [previous, setPrevious] = useState(external);
  const [state, setState] = useState(external);
  if (previous !== external) {
    setPrevious(external);
    setState(external);
  }
  return [state, setState];
}

export function useSyncedString(external: string): [string, Dispatch<SetStateAction<string>>] {
  return useSyncedState(external);
}