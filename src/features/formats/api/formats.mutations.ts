import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatosService } from "@/services/formatos.service";
import { formatsKeys } from "./formats.queries";
import type { CreateFormatPayload } from "../types";

export function useCreateFormat() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFormatPayload) => formatosService.create(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: formatsKeys.all });
    },
  });
}
