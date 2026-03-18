import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createChessRound,
  deleteChessRound,
  createChessMatch,
  updateChessMatch,
  deleteChessMatch,
} from "./chess.api";
import {
  CHESS_ROUNDS_KEY,
  CHESS_FULL_TABLE_KEY,
  CHESS_STANDINGS_KEY,
} from "./chess.queries";
import type {
  CreateChessRoundDto,
  CreateChessMatchDto,
  UpdateChessMatchDto,
} from "../types/chess.types";

export const useCreateChessRound = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dto }: { dto: CreateChessRoundDto; phaseId: number }) =>
      createChessRound(dto),
    onSuccess: (_, { phaseId }) => {
      qc.invalidateQueries({ queryKey: CHESS_ROUNDS_KEY(phaseId) });
      qc.invalidateQueries({ queryKey: CHESS_FULL_TABLE_KEY(phaseId) });
    },
  });
};

export const useDeleteChessRound = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; phaseId: number }) =>
      deleteChessRound(id),
    onSuccess: (_, { phaseId }) => {
      qc.invalidateQueries({ queryKey: CHESS_ROUNDS_KEY(phaseId) });
      qc.invalidateQueries({ queryKey: CHESS_FULL_TABLE_KEY(phaseId) });
      qc.invalidateQueries({ queryKey: CHESS_STANDINGS_KEY(phaseId) });
    },
  });
};

export const useCreateChessMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dto }: { dto: CreateChessMatchDto; phaseId: number }) =>
      createChessMatch(dto),
    onSuccess: (_, { phaseId }) => {
      qc.invalidateQueries({ queryKey: CHESS_FULL_TABLE_KEY(phaseId) });
      qc.invalidateQueries({ queryKey: CHESS_STANDINGS_KEY(phaseId) });
    },
  });
};

export const useUpdateChessMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: UpdateChessMatchDto;
      phaseId: number;
    }) => updateChessMatch(id, dto),
    onSuccess: (_, { phaseId }) => {
      qc.invalidateQueries({ queryKey: CHESS_FULL_TABLE_KEY(phaseId) });
      qc.invalidateQueries({ queryKey: CHESS_STANDINGS_KEY(phaseId) });
    },
  });
};

export const useDeleteChessMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; phaseId: number }) =>
      deleteChessMatch(id),
    onSuccess: (_, { phaseId }) => {
      qc.invalidateQueries({ queryKey: CHESS_FULL_TABLE_KEY(phaseId) });
      qc.invalidateQueries({ queryKey: CHESS_STANDINGS_KEY(phaseId) });
    },
  });
};
