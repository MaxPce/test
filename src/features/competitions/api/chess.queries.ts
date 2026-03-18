import { useQuery } from "@tanstack/react-query";
import {
  getChessRounds,
  getChessFullTable,
  getChessStandings,
  getChessParticipants,
} from "./chess.api";

export const CHESS_ROUNDS_KEY = (phaseId: number) =>
  ["chess", "rounds", phaseId] as const;

export const CHESS_FULL_TABLE_KEY = (phaseId: number) =>
  ["chess", "full-table", phaseId] as const;

export const CHESS_STANDINGS_KEY = (phaseId: number) =>
  ["chess", "standings", phaseId] as const;

export const useChessRounds = (phaseId: number) =>
  useQuery({
    queryKey: CHESS_ROUNDS_KEY(phaseId),
    queryFn: () => getChessRounds(phaseId),
    enabled: phaseId > 0,
  });

export const useChessFullTable = (phaseId: number) =>
  useQuery({
    queryKey: CHESS_FULL_TABLE_KEY(phaseId),
    queryFn: () => getChessFullTable(phaseId),
    enabled: phaseId > 0,
  });

export const useChessStandings = (phaseId: number) =>
  useQuery({
    queryKey: CHESS_STANDINGS_KEY(phaseId),
    queryFn: () => getChessStandings(phaseId),
    enabled: phaseId > 0,
  });

  export const useChessParticipants = (phaseId: number) =>
  useQuery({
    queryKey: ["chess", "participants", phaseId] as const,
    queryFn: () => getChessParticipants(phaseId),
    enabled: phaseId > 0,
  });
