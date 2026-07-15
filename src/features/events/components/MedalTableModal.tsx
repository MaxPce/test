// src/features/events/components/MedalTableModal.tsx
import { Medal } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { useMedalSummary, type MedalRow } from "../api/medalTable.queries";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  externalEventId: number;
  localSportId: number;
  sportName: string;
}

function MedalCell({ count, color }: { count: number; color: string }) {
  return (
    <td className="px-4 py-3 text-center">
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
          count > 0 ? color : "text-gray-300"
        }`}
      >
        {count}
      </span>
    </td>
  );
}

function MedalTableRow({ row }: { row: MedalRow }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-center font-bold text-gray-500 w-10">
        {row.rank}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {row.institutionLogoUrl ? (
            <img
              src={row.institutionLogoUrl}
              alt={row.institutionName}
              className="w-7 h-7 object-contain rounded"
            />
          ) : (
            <div className="w-7 h-7 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 font-bold">
              {row.institutionName.charAt(0)}
            </div>
          )}
          <span className="font-medium text-gray-900 text-sm">
            {row.institutionName}
          </span>
        </div>
      </td>
      <MedalCell count={row.gold}   color="text-yellow-500" />
      <MedalCell count={row.silver} color="text-gray-400" />
      <MedalCell count={row.bronze} color="text-amber-600" />
      <td className="px-4 py-3 text-center font-semibold text-gray-700 text-sm">
        {row.gold + row.silver + row.bronze}
      </td>
    </tr>
  );
}

export function MedalTableModal({
  isOpen,
  onClose,
  externalEventId,
  localSportId,
  sportName,
}: Props) {
  const { data, isLoading, isError } = useMedalSummary(
    externalEventId,
    localSportId,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Medallero — ${sportName}`}
    >
      <div className="min-w-[480px]">
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-red-500 text-sm">
            Error al cargar el medallero. Verifica que el deporte esté configurado.
          </div>
        )}

        {data && data.general.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            <Medal className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Aún no hay medallas registradas para este deporte.</p>
          </div>
        )}

        {data && data.general.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-2 text-center text-gray-500 font-medium w-10">#</th>
                <th className="px-4 py-2 text-left text-gray-500 font-medium">Institución</th>
                <th className="px-4 py-2 text-center w-12">
                  <span className="text-yellow-500 font-bold text-lg">🥇</span>
                </th>
                <th className="px-4 py-2 text-center w-12">
                  <span className="text-gray-400 font-bold text-lg">🥈</span>
                </th>
                <th className="px-4 py-2 text-center w-12">
                  <span className="text-amber-600 font-bold text-lg">🥉</span>
                </th>
                <th className="px-4 py-2 text-center text-gray-500 font-medium w-12">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.general.map((row) => (
                <MedalTableRow key={row.institutionId} row={row} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
}