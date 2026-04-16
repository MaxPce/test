import { apiClient } from "@/lib/api/client";
import type {
  AthleticsRow,
  AthlSection,
  AssignSectionEntriesDto,
  UpsertSectionEntryDto,
  CreateSectionDto,
  UpdateSectionDto,
  FieldRow,
  MoveEntrySectionDto,
} from "../types/athletics.types";

// ── Track table ───────────────────────────────────────────────────────────────

export const getAthleticsTrackTable = async (phaseId: number) => {
  const res = await apiClient.get<AthleticsRow[]>(
    `/competitions/phases/${phaseId}/athletics-track-table`,
  );
  return res.data;
};

// ── Secciones ─────────────────────────────────────────────────────────────────

export const getSectionsByPhase = async (phaseId: number) => {
  const res = await apiClient.get<AthlSection[]>(
    `/competitions/athletics/sections`,
    { params: { phaseId } },
  );
  return res.data;
};

export const createSection = async (dto: CreateSectionDto) => {
  const res = await apiClient.post<AthlSection>(
    `/competitions/athletics/sections`,
    dto,
  );
  return res.data;
};

export const updateSection = async (id: number, dto: UpdateSectionDto) => {
  const res = await apiClient.patch<AthlSection>(
    `/competitions/athletics/sections/${id}`,
    dto,
  );
  return res.data;
};

export const deleteSection = async (id: number) => {
  const res = await apiClient.delete(`/competitions/athletics/sections/${id}`);
  return res.data;
};

// ── Section entries ───────────────────────────────────────────────────────────

export const assignSectionEntries = async (dto: AssignSectionEntriesDto) => {
  const res = await apiClient.post(
    `/competitions/athletics/sections/assign`,
    dto,
  );
  return res.data;
};

export const upsertSectionEntry = async (dto: UpsertSectionEntryDto) => {
  const res = await apiClient.patch(
    `/competitions/athletics/sections/entry`,
    dto,
  );
  return res.data;
};

export const getAthleticsFieldTable = async (phaseId: number) => {
  const res = await apiClient.get<FieldRow[]>(
    `/competitions/phases/${phaseId}/athletics-field-table`,
  );
  return res.data;
};

export const createAttempt = async (dto: {
  phaseRegistrationId: number;
  attemptNumber: number;
  distanceValue?: number | null;
  isValid?: boolean;
  wind?: number | null;
  height?: number | null;
  heightResult?: string | null;
  notes?: string | null;
}) => {
  const res = await apiClient.post("/competitions/athletics", dto);
  return res.data;
};

export const updateAttempt = async (
  id: number,
  dto: Partial<{
    distanceValue: number | null;
    isValid: boolean;
    wind: number | null;
    height: number | null;
    heightResult: string | null;
    notes: string | null;
  }>,
) => {
  const res = await apiClient.patch(`/competitions/athletics/${id}`, dto);
  return res.data;
};

export const deleteAttempt = async (id: number) => {
  const res = await apiClient.delete(`/competitions/athletics/${id}`);
  return res.data;
};

export const moveEntryToSection = async (
  entryId: number,
  dto: MoveEntrySectionDto,
) => {
  const res = await apiClient.patch(
    `/competitions/athletics/section-entries/${entryId}/move`,
    dto,
  );
  return res.data;
};