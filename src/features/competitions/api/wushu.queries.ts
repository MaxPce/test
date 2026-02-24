import { useQuery } from '@tanstack/react-query';
import {
  getWushuMatchDetails,
  getWushuBracket,
  getWushuTaoluScoreTable,
  getWushuTaoluScore,
  getWushuTaoluBracketMatchScores,
} from './wushu.api';

// ==================== WUSHU - SANDA ====================

export const useWushuMatch = (matchId: number) => {
  return useQuery({
    queryKey: ['wushu-match', matchId],
    queryFn: () => getWushuMatchDetails(matchId),
    enabled: !!matchId,
  });
};

export const useWushuBracket = (phaseId: number) => {
  return useQuery({
    queryKey: ['wushu-bracket', phaseId],
    queryFn: () => getWushuBracket(phaseId),
    enabled: !!phaseId,
  });
};

// ==================== WUSHU - TAOLU ====================

export const useWushuTaoluScoreTable = (phaseId: number) => {
  return useQuery({
    queryKey: ['wushu-taolu-scores', phaseId],
    queryFn: () => getWushuTaoluScoreTable(phaseId),
    enabled: !!phaseId,
    refetchInterval: 5000,
  });
};

export const useWushuTaoluScore = (participationId: number) => {
  return useQuery({
    queryKey: ['wushu-taolu-score', participationId],
    queryFn: () => getWushuTaoluScore(participationId),
    enabled: !!participationId,
  });
};

export const useWushuTaoluBracketMatchScores = (matchId: number) => {
  return useQuery({
    queryKey: ['wushu-taolu-bracket-match', matchId],
    queryFn: () => getWushuTaoluBracketMatchScores(matchId),
    enabled: !!matchId,
    refetchInterval: 3000,
  });
};
