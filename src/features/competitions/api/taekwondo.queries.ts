// src/features/competitions/api/taekwondo.queries.ts

import { useQuery } from "@tanstack/react-query";
import {
  getKyoruguiMatchDetails,
  getKyoruguiBracket,
  getPoomsaeScoreTable,
  getPoomsaeScore,
} from "./taekwondo.api";

export const useKyoruguiMatch = (matchId: number | undefined) => {
  return useQuery({
    queryKey: ["kyorugui-match", matchId],
    queryFn: () => getKyoruguiMatchDetails(matchId!),
    enabled: !!matchId,
  });
};

export const useKyoruguiBracket = (phaseId: number | undefined) => {
  return useQuery({
    queryKey: ["kyorugui-bracket", phaseId],
    queryFn: () => getKyoruguiBracket(phaseId!),
    enabled: !!phaseId,
  });
};

export const usePoomsaeScoreTable = (phaseId: number) => {
  return useQuery({
    queryKey: ["poomsae-scores", phaseId],
    queryFn: () => getPoomsaeScoreTable(phaseId),
    enabled: !!phaseId,
  });
};

export const usePoomsaeScore = (participationId: number | undefined) => {
  return useQuery({
    queryKey: ["poomsae-score", participationId],
    queryFn: () => getPoomsaeScore(participationId!),
    enabled: !!participationId,
  });
};
