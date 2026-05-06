import { useState, useMemo } from "react";
import { UserPlus, Search, Check, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface Registration {
  registrationId: number;
  athlete?: {
    name: string;
    deletedAt?: string | null;
    institution?: { name: string; logoUrl?: string };
  };
  team?: {
    name: string;
    deletedAt?: string | null;
    institution?: { name: string; logoUrl?: string };
  };
  deletedAt?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  phaseId: number;
  phaseName: string;
  eventCategoryId: number;
  allRegistrations: Registration[];
  assignedRegistrationIds?: number[];
}

export function AssignTaoluParticipantsModal({
  isOpen,
  onClose,
  phaseId,
  phaseName,
  eventCategoryId,
  allRegistrations,
  assignedRegistrationIds = [],
}: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [tab, setTab] = useState<"available" | "assigned">("available");

  const available = useMemo(
    () =>
      allRegistrations.filter(
        (r) =>
          !r.deletedAt &&
          !assignedRegistrationIds.includes(r.registrationId) &&
          getParticipantName(r).toLowerCase().includes(search.toLowerCase())
      ),
    [allRegistrations, assignedRegistrationIds, search]
  );

  const assigned = useMemo(
    () =>
      allRegistrations.filter((r) =>
        assignedRegistrationIds.includes(r.registrationId)
      ),
    [allRegistrations, assignedRegistrationIds]
  );

  // ── Mutation: asignar ──────────────────────────────────────────────────────
  const assignMutation = useMutation({
    mutationFn: async (registrationIds: number[]) => {
        const { data } = await apiClient.post(
        `/competitions/wushu/taolu/phases/${phaseId}/initialize-group`,
        { registrationIds }
        );
        return data;
    },
    onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["matches", phaseId], exact: false }); 
    queryClient.invalidateQueries({ queryKey: ["wushu-taolu-scores", phaseId] });
    queryClient.invalidateQueries({ queryKey: ["eventCategory", eventCategoryId] });
    setSelected([]);
    onClose();
    },
    });

  // ── Mutation: quitar ───────────────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: async (registrationId: number) => {
        await apiClient.delete(
        `/competitions/wushu/taolu/phases/${phaseId}/participants/${registrationId}`
        );
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["matches", phaseId], exact: false }); 
        queryClient.invalidateQueries({ queryKey: ["wushu-taolu-scores", phaseId] });
        queryClient.invalidateQueries({ queryKey: ["eventCategory", eventCategoryId] });
        },

    });


  function toggleSelect(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelected(available.map((r) => r.registrationId));
  }

  function clearAll() {
    setSelected([]);
  }

  function handleRemove(reg: Registration) {
    if (confirm(`¿Quitar a ${getParticipantName(reg)} de la fase?`)) {
      removeMutation.mutate(reg.registrationId);
    }
  }

  const isBusy = assignMutation.isPending || removeMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Participantes de fase — ${phaseName}`}
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex rounded-lg overflow-hidden border border-slate-200">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === "available"
                ? "bg-orange-500 text-white"
                : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
            onClick={() => setTab("available")}
          >
            Asignar ({available.length} disponibles)
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === "assigned"
                ? "bg-slate-100 text-slate-900"
                : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
            onClick={() => setTab("assigned")}
          >
            Asignados ({assigned.length})
          </button>
        </div>

        {/* ── Tab: Disponibles ── */}
        {tab === "available" && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Buscar por nombre o institución..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center text-sm text-slate-500">
              <span>{selected.length} seleccionados</span>
              <div className="flex gap-3">
                {available.length > 0 && selected.length < available.length && (
                  <button
                    type="button"
                    className="text-orange-500 hover:underline text-sm"
                    onClick={selectAll}
                  >
                    Seleccionar todos
                  </button>
                )}
                {selected.length > 0 && (
                  <button
                    type="button"
                    className="text-slate-400 hover:underline text-sm"
                    onClick={clearAll}
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {available.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-6">
                  No hay participantes disponibles
                </p>
              ) : (
                available.map((reg) => {
                  const isSelected = selected.includes(reg.registrationId);
                  return (
                    <button
                      key={reg.registrationId}
                      type="button"
                      onClick={() => toggleSelect(reg.registrationId)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? "border-orange-400 bg-orange-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "bg-orange-500 border-orange-500"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {getParticipantName(reg)}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {getInstitutionName(reg)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ── Tab: Asignados ── */}
        {tab === "assigned" && (
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
            {assigned.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-6">
                No hay participantes asignados aún
              </p>
            ) : (
              assigned.map((reg) => (
                <div
                  key={reg.registrationId}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {getParticipantName(reg)}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {getInstitutionName(reg)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(reg)}
                    disabled={isBusy}
                    className="flex-shrink-0 ml-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Quitar
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Errores */}
        {assignMutation.isError && (
          <p className="text-sm text-red-500 text-center">
            No se pudo asignar los participantes. Intenta nuevamente.
          </p>
        )}
        {removeMutation.isError && (
          <p className="text-sm text-red-500 text-center">
            No se pudo quitar el participante. Intenta nuevamente.
          </p>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isBusy}>
            Cancelar
          </Button>
          {tab === "available" && (
            <Button
              variant="gradient"
              size="sm"
              icon={<UserPlus className="h-4 w-4" />}
              onClick={() => {
                if (selected.length > 0) assignMutation.mutate(selected);
              }}
              disabled={selected.length === 0 || isBusy}
              isLoading={assignMutation.isPending}
            >
              Asignar a fase ({selected.length})
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function getParticipantName(reg: Registration): string {
  return reg.team?.name ?? reg.athlete?.name ?? "Sin nombre";
}

function getInstitutionName(reg: Registration): string {
  return (
    reg.team?.institution?.name ??
    reg.athlete?.institution?.name ??
    "Sin institución"
  );
}