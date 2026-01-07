import { useQuery } from "@tanstack/react-query";
import { formatosService } from "@/services/formatos.service";

export const formatsKeys = {
  all: ["formats"] as const,
  detail: (id: number) => ["formats", id] as const,
};

export function useFormats() {
  return useQuery({
    queryKey: formatsKeys.all,
    queryFn: formatosService.list,
  });
}

export function useFormatById(id: number | null) {
    return useQuery({
      queryKey: id ? formatsKeys.detail(id) : ["formats", "no-id"],
      queryFn: () => formatosService.getById(id as number),
      enabled: typeof id === "number" && !Number.isNaN(id),
    });
  }
