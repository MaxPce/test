import { useState, useCallback } from 'react';
import { competitionsService } from '../../../services/competitions.service';

export interface ManualRankItem {
  registrationId: number;
  manualRankPosition: number | null;
  registration: {
    athlete?: { name: string; photoUrl?: string; institution?: { name: string; abrev: string; logoUrl?: string } } | null;
    team?: { name: string; institution?: { name: string; abrev: string; logoUrl?: string } } | null;
  };
}

export function usePhaseManualRanks(phaseId: number) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualRanks, setManualRanks] = useState<ManualRankItem[]>([]);

  const fetchManualRanks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await competitionsService.getManualRanks(phaseId);
      setManualRanks(data);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar rankings manuales');
    } finally {
      setLoading(false);
    }
  }, [phaseId]);

  const saveManualRanks = useCallback(
    async (ranks: { registrationId: number; manualRankPosition: number }[]) => {
      setSaving(true);
      setError(null);
      try {
        await competitionsService.setManualRanks(phaseId, ranks);
        await fetchManualRanks();
        return true;
      } catch (err: any) {
        setError(err?.message ?? 'Error al guardar rankings manuales');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [phaseId, fetchManualRanks],
  );

  const clearManualRanks = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await competitionsService.clearManualRanks(phaseId);
      setManualRanks([]);
      return true;
    } catch (err: any) {
      setError(err?.message ?? 'Error al limpiar rankings manuales');
      return false;
    } finally {
      setSaving(false);
    }
  }, [phaseId]);

  return {
    manualRanks,
    loading,
    saving,
    error,
    fetchManualRanks,
    saveManualRanks,
    clearManualRanks,
  };
}