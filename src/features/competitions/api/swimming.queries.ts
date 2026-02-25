import { useQuery } from "@tanstack/react-query";
import { getSwimmingResultsTable } from "./swimming.api";

export const useSwimmingResultsTable = (phaseId: number) => {
  return useQuery({
    queryKey: ["swimming-results", phaseId],
    queryFn: () => getSwimmingResultsTable(phaseId),
    enabled: !!phaseId,
    refetchInterval: 5000,
  });
};
