import { useState, useCallback, useRef } from 'react';

/**
 * Reusable Submit Locking Hook (useSubmitLock)
 * Guarantees single-execution for async form submissions and network actions.
 * Disables triggers, sets isSubmitting, and re-enables on completion or safety timeout.
 */
export const useSubmitLock = (timeoutMs = 10000) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeoutRef = useRef(null);

  const execute = useCallback(async (asyncFn) => {
    if (isSubmitting) {
      console.warn('[SubmitLock] Action blocked: submission already in progress.');
      return false;
    }

    setIsSubmitting(true);

    // Safety timeout to prevent permanent UI locks if asyncFn hangs
    timeoutRef.current = setTimeout(() => {
      console.warn('[SubmitLock] Safety timeout reached. Re-enabling submit trigger.');
      setIsSubmitting(false);
    }, timeoutMs);

    try {
      const result = await asyncFn();
      return result;
    } catch (error) {
      console.error('[SubmitLock] Execution error:', error);
      throw error;
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsSubmitting(false);
    }
  }, [isSubmitting, timeoutMs]);

  return { isSubmitting, execute };
};

export default useSubmitLock;
