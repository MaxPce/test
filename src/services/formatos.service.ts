import { http } from "./http";
import type { CreateFormatPayload, Format } from "@/features/formats/types";

export const formatosService = {
  list: () => http.get<Format[]>("/formats"),
  getById: (id: number) => http.get<Format>(`/formats/${id}`),
  create: (payload: CreateFormatPayload) => http.post<Format>("/formats", payload),
};
