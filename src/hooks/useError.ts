import { useCallback } from 'react';
import { errorReporter } from '@/lib/errorReporting';
import { useAuth } from '@/contexts/AuthContext';

export function useError() {
  const { user } = useAuth();

  const reportError = useCallback(
    (error: Error, context: Record<string, unknown> = {}) => {
      errorReporter.report(error, {
        userId: user?.id,
        ...context,
      });
    },
    [user]
  );

  return { reportError };
}