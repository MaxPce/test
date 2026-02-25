import { useQuery } from "@tanstack/react-query";
import { getAthleticsResultsTable } from "./athletics.api";

export const useAthleticsResultsTable = (phaseId: number) => {
  return useQuery({
    queryKey: ["athletics-results", phaseId],
    queryFn: () => getAthleticsResultsTable(phaseId),
    enabled: !!phaseId,
    refetchInterval: 5000,
  });
};
