import { useState, useEffect } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  autoFetch?: boolean;
}

export const useApi = <T>(
  apiCall: () => Promise<T>,
  { initialData, autoFetch = true }: UseApiOptions<T> = {}
) => {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => execute();

  const reset = () => {
    setData(initialData);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    refresh,
    reset,
    setData
  };
};
