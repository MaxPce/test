// src/hooks/useScoreTables.ts

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import type { ScoreSummaryResponse } from '../types/score-tables.types';

interface UseScoreTablesReturn {
  data: ScoreSummaryResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useScoreTables(eventId: number | string): UseScoreTablesReturn {
  const [data, setData] = useState<ScoreSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ScoreSummaryResponse>(
        `/score-tables/${eventId}/summary`
      );
      setData(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            'Error al cargar los puntajes. Intenta nuevamente.'
        );
      } else {
        setError('Error inesperado. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}