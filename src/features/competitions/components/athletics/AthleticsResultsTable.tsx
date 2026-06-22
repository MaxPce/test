import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/utils/imageUrl";

import { toast } from "sonner";
import {
  Plus, Wind, ChevronDown, ChevronUp, Pencil,
  Trash2, UserPlus, X, Users, Check, Lock, LockOpen,
} from "lucide-react";

import type {
  AthleticsRow,
  AthlSection,
  SectionEntry,
} from "../../types/athletics.types";
import {
  useAthleticsTrackTable,
  useAthleticsSections,
  useClassificationStatus,
  TRACK_TABLE_KEY,
  CLASSIFICATION_STATUS_KEY,
} from "../../api/athletics.queries";
import {
  useCreateSection, useUpdateSection, useDeleteSection,
  useAssignSectionEntries, useUpsertSectionEntry,
  useMoveEntryToSection, useClassifyPhase, useReopenPhase,
} from "../../api/athletics.mutations";
import { updateSection } from "../../api/athletics.api";

// ── Tipos locales ─────────────────────────────────────────────────────────────

interface SectionState extends AthlSection {
  collapsed: boolean;
  editing: boolean;
  editingName: string;
}

interface Props {
  phaseId: number;
}

// Statuses especiales — guardados en notes
type RaceStatus = "DNF" | "DNS" | "DQ" | null;

const STATUS_CONFIG: Record<
  NonNullable<RaceStatus>,
  { label: string; bg: string; text: string }
> = {
  DNF: { label: "DNF", bg: "bg-red-100", text: "text-red-700" },
  DNS: { label: "DNS", bg: "bg-slate-100", text: "text-slate-600" },
  DQ: { label: "DQ", bg: "bg-amber-100", text: "text-amber-700" },
};

const parseStatus = (notes: string | null): RaceStatus => {
  if (notes === "DNF" || notes === "DNS" || notes === "DQ") return notes;
  return null;
};

// ── Constantes estables ───────────────────────────────────────────────────────

const EMPTY_ROWS: AthleticsRow[] = [];
const EMPTY_SECTIONS: AthlSection[] = [];

// ── Panel atletas sin sección ─────────────────────────────────────────────────

function AllAthletesPanel({ rows }: { rows: AthleticsRow[] }) {
  const [open, setOpen] = useState(false);
  const unassignedCount = rows.filter((r) => r.sections.length === 0).length;

  return (
    <div className="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
      {/* Header — siempre visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-slate-100 transition-colors"
      >
        <Users className="h-4 w-4 flex-shrink-0 text-slate-400" />
        <span className="flex-1 text-sm text-slate-600">
          <span className="font-semibold">{rows.length}</span> atleta
          {rows.length !== 1 ? "s" : ""} en esta fas
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {/* Lista expandible */}
      {open && (
        <div className="border-t border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2 text-left">
                  {rows.some((r) => r.isTeam) ? "Equipo" : "Atleta"}
                </th>
                <th className="hidden px-4 py-2 text-center md:table-cell">
                  Institución
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row) => (
                <tr
                  key={row.phaseRegistrationId}
                  className={`bg-white hover:bg-slate-50 transition-colors ${
                    row.sections.length === 0 ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{row.athleteName.toUpperCase()}</span>
                      {row.isTeam && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                          Equipo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-2 md:table-cell">
                    <div className="flex items-center gap-2">
                      {row.institutionLogo && (
                        <img
                          src={getImageUrl(row.institutionLogo)}
                          alt={row.institutionName || ""}
                          className="h-5 w-5 object-contain flex-shrink-0"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      )}
                      <span className="text-sm text-slate-400">{row.institutionName || "—"}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Modal asignar atletas ─────────────────────────────────────────────────────

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: number;
  sectionName: string;
  allRows: AthleticsRow[];
  onConfirm: (toAdd: number[], toRemove: number[]) => Promise<void>;
}

function AssignToSectionModal({
  isOpen,
  onClose,
  sectionId,
  sectionName,
  allRows,
  onConfirm,
}: AssignModalProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected(
        new Set(
          allRows
            .filter((r) =>
              r.sections.some((e) => e.athleticsSectionId === sectionId),
            )
            .map((r) => r.phaseRegistrationId),
        ),
      );
    }
  }, [isOpen, sectionId, allRows]);

  if (!isOpen) return null;

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSubmit = async () => {
    setSaving(true);
    const originalIds = new Set(
      allRows
        .filter((r) =>
          r.sections.some((e) => e.athleticsSectionId === sectionId),
        )
        .map((r) => r.phaseRegistrationId),
    );
    const toAdd = [...selected].filter((id) => !originalIds.has(id));
    const toRemove = [...originalIds].filter((id) => !selected.has(id));
    try {
      await onConfirm(toAdd, toRemove);
    } finally {
      setSaving(false);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Atletas en "{sectionName}"
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {selected.size} seleccionados
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-3 px-5 py-2.5">
          <button
            type="button"
            onClick={() =>
              setSelected(new Set(allRows.map((r) => r.phaseRegistrationId)))
            }
            className="text-xs text-orange-600 hover:underline"
          >
            Seleccionar todos
          </button>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs text-slate-500 hover:underline"
          >
            Limpiar
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {allRows.map((row) => {
            const isSelected = selected.has(row.phaseRegistrationId);
            const otherSections = row.sections.filter(
              (e) => e.athleticsSectionId !== sectionId,
            );
            return (
              <label
                key={row.phaseRegistrationId}
                className={`flex cursor-pointer select-none items-center gap-3 rounded-xl border p-3 transition-all ${
                  isSelected
                    ? "border-orange-400 bg-orange-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(row.phaseRegistrationId)}
                  className="h-4 w-4 rounded accent-orange-500"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{row.athleteName.toUpperCase()}</p>
                    {row.isTeam && (
                      <span className="flex-shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                        Equipo
                      </span>
                    )}
                  </div>
                  {otherSections.length > 0 && (
                    <p className="truncate text-xs text-amber-600">
                      · también en:{" "}
                      {otherSections.map((e) => e.sectionName).join(", ")}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 flex-shrink-0 text-orange-500" />
                )}
              </label>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Celda de tiempo + status ──────────────────────────────────────────────────

interface TimeCellProps {
  entry: SectionEntry;
  phaseRegistrationId: number;
  sectionId: number;
  onUpdateEntry: (
    phaseRegistrationId: number,
    sectionId: number,
    patch: Partial<SectionEntry>,
  ) => void;
  onSaveEntry: (
    phaseRegistrationId: number,
    sectionId: number,
    entry: SectionEntry,
  ) => Promise<void>;
  isSaving: boolean;
  readonly?: boolean;
}

function TimeCell({
  entry,
  phaseRegistrationId,
  sectionId,
  onUpdateEntry,
  onSaveEntry,
  isSaving,
  readonly = false,
}: TimeCellProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const status = parseStatus(entry.notes ?? null);

  const handleSetStatus = (s: RaceStatus) => {
    if (readonly) return;
    setStatusOpen(false);
    onUpdateEntry(phaseRegistrationId, sectionId, {
      notes: s,
      time: null,
    });
  };

  const handleClearStatus = () => {
    if (readonly) return;
    onUpdateEntry(phaseRegistrationId, sectionId, { notes: null });
  };

  if (readonly) {
    return (
      <div className="flex items-center gap-1.5">
        {status ? (
          <span className={`rounded px-2.5 py-1 text-xs font-bold ${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text}`}>
            {STATUS_CONFIG[status].label}
          </span>
        ) : (
          <span className="font-mono text-xs text-slate-500">
            {entry.time ?? "—"}
          </span>
        )}
      </div>
    );
  }


  return (
    <div className="flex items-center gap-1.5">
      {status ? (
        <button
          type="button"
          onClick={handleClearStatus}
          title="Click para quitar el status"
          className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold ${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text} hover:opacity-75 transition-opacity`}
        >
          {STATUS_CONFIG[status].label}
          <X className="h-3 w-3" />
        </button>
      ) : (
        <input
          type="text"
          value={entry.time ?? ""}
          placeholder="00:00.00"
          onChange={(e) =>
            onUpdateEntry(phaseRegistrationId, sectionId, {
              time: e.target.value || null,
            })
          }
          className="w-28 rounded border border-slate-300 px-2 py-1 font-mono text-xs focus:border-orange-400 focus:outline-none"
        />
      )}

      {/* Botón para elegir DNF/DNS/DQ */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setStatusOpen((v) => !v)}
          title="Asignar DNF / DNS / DQ"
          className={`rounded px-1.5 py-1 text-[10px] font-bold transition-colors ${
            status
              ? `${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text}`
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          }`}
        >
          {status ?? "···"}
        </button>

        {statusOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setStatusOpen(false)}
            />
            <div className="absolute right-0 top-8 z-20 flex gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              {(Object.keys(STATUS_CONFIG) as NonNullable<RaceStatus>[]).map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSetStatus(s)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all hover:scale-105 ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text}`}
                  >
                    {s}
                  </button>
                ),
              )}
              {status && (
                <button
                  type="button"
                  onClick={() => handleSetStatus(null)}
                  className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-200"
                  title="Quitar status"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Guardar si hay cambios */}
      {entry.isDirty && (
        <button
          type="button"
          onClick={() => onSaveEntry(phaseRegistrationId, sectionId, entry)}
          disabled={isSaving}
          className="rounded bg-orange-500 px-2 py-1 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          title="Guardar"
        >
          ✓
        </button>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function AthleticsResultsTable({ phaseId }: Props) {
  const queryClient = useQueryClient();
  const collapseRef = useRef<Map<number, boolean>>(new Map());

  const [rows, setRows] = useState<AthleticsRow[]>([]);
  const [sections, setSections] = useState<SectionState[]>([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [assigningToSection, setAssigningToSection] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [redistributeMode, setRedistributeMode] = useState(false);
  const [searchAthletes, setSearchAthletes] = useState("");

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: rowsData = EMPTY_ROWS, isLoading: rowsLoading } =
    useAthleticsTrackTable(phaseId);
  const { data: sectionsData = EMPTY_SECTIONS, isLoading: sectionsLoading } =
    useAthleticsSections(phaseId);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createSectionMutation = useCreateSection(phaseId);
  const updateSectionMutation = useUpdateSection(phaseId);
  const deleteSectionMutation = useDeleteSection(phaseId);
  const assignEntriesMutation = useAssignSectionEntries(phaseId);
  const upsertEntryMutation = useUpsertSectionEntry(phaseId);
  const moveEntryMutation = useMoveEntryToSection(phaseId);
  const classifyMutation = useClassifyPhase(phaseId);
  const reopenMutation = useReopenPhase(phaseId);

  const { data: classificationStatus } = useClassificationStatus(phaseId);
  const phaseFinalized = classificationStatus?.isFinalized ?? false;


  // ── Sync rows ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setRows(rowsData.map((r) => ({ ...r })));
  }, [rowsData]);

  // ── Sync sections ─────────────────────────────────────────────────────────
  useEffect(() => {
    setSections((prev) => {
      const prevMap = new Map(prev.map((s) => [s.athleticsSectionId, s]));
      return sectionsData.map((s) => ({
        ...s,
        collapsed: collapseRef.current.has(s.athleticsSectionId)
          ? collapseRef.current.get(s.athleticsSectionId)!
          : (prevMap.get(s.athleticsSectionId)?.collapsed ?? true),
        editing: false,
        editingName: prevMap.get(s.athleticsSectionId)?.editingName ?? s.name,
      }));
    });
  }, [sectionsData]);

  // ── Helpers entries ───────────────────────────────────────────────────────

  const updateEntry = (
    phaseRegistrationId: number,
    sectionId: number,
    patch: Partial<SectionEntry>,
  ) =>
    setRows((prev) =>
      prev.map((r) =>
        r.phaseRegistrationId === phaseRegistrationId
          ? {
              ...r,
              sections: r.sections.map((e) =>
                e.athleticsSectionId === sectionId
                  ? { ...e, ...patch, isDirty: true }
                  : e,
              ),
            }
          : r,
      ),
    );

  const handleSaveEntry = async (
    phaseRegistrationId: number,
    sectionId: number,
    entry: SectionEntry,
  ) => {
    await upsertEntryMutation.mutateAsync({
      athleticsSectionId: sectionId,
      phaseRegistrationId,
      lane: entry.lane != null ? Number(entry.lane) : null,
      time: entry.time,
      wind: entry.wind != null ? Number(entry.wind) : null,
      notes: entry.notes,
    });
    toast.success("Guardado");
  };

  // ── Helpers secciones ─────────────────────────────────────────────────────

  const handleAddSection = async () => {
    const name = newSectionName.trim();
    if (!name) return;
    await createSectionMutation.mutateAsync({ phaseId, name });
    setNewSectionName("");
    toast.success(`"${name}" creada`);
  };

  const handleDeleteSection = async (
    sectionId: number,
    sectionName: string,
  ) => {
    if (
      !confirm(
        `¿Eliminar "${sectionName}"? Los atletas quedarán sin esta sección.`,
      )
    )
      return;
    collapseRef.current.delete(sectionId);
    await deleteSectionMutation.mutateAsync(sectionId);
    toast.success(`"${sectionName}" eliminada`);
  };

  const handleRenameSection = async (
    id: number,
    oldName: string,
    newName: string,
  ) => {
    newName = newName.trim();
    if (!newName || newName === oldName) {
      setSections((prev) =>
        prev.map((s) =>
          s.athleticsSectionId === id ? { ...s, editing: false } : s,
        ),
      );
      return;
    }
    await updateSectionMutation.mutateAsync({ id, dto: { name: newName } });
    toast.success("Sección renombrada");
  };

  const handleSectionWind = async (sectionId: number, wind: number | null) => {
    setSections((prev) =>
      prev.map((s) =>
        s.athleticsSectionId === sectionId ? { ...s, wind } : s,
      ),
    );
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        sections: r.sections.map((e) =>
          e.athleticsSectionId === sectionId
            ? { ...e, wind, isDirty: true }
            : e,
        ),
      })),
    );
    try {
      await updateSection(sectionId, { wind });
    } catch {
      toast.error("Error al guardar el viento");
    }
  };

  const handleSaveSection = async (sectionId: number, sectionName: string) => {
    const toSave = rows.flatMap((r) =>
      r.sections
        .filter((e) => e.athleticsSectionId === sectionId && e.isDirty)
        .map((e) => ({ phaseRegistrationId: r.phaseRegistrationId, entry: e })),
    );
    await Promise.all(
      toSave.map(({ phaseRegistrationId, entry }) =>
        upsertEntryMutation.mutateAsync({
          athleticsSectionId: sectionId,
          phaseRegistrationId,
          lane: entry.lane,
          time: entry.time,
          wind: entry.wind,
          notes: entry.notes,
        }),
      ),
    );
    await queryClient.invalidateQueries({ queryKey: TRACK_TABLE_KEY(phaseId) });
    toast.success(`"${sectionName}" guardada`);
  };

  const handleConfirmAssign = async (
    sectionId: number,
    toAdd: number[],
    toRemove: number[],
  ) => {
    await assignEntriesMutation.mutateAsync({
      athleticsSectionId: sectionId,
      toAdd,
      toRemove,
    });
    toast.success("Atletas actualizados");
  };

  const handleRemoveFromSection = async (
    phaseRegistrationId: number,
    sectionId: number,
  ) => {
    await assignEntriesMutation.mutateAsync({
      athleticsSectionId: sectionId,
      toAdd: [],
      toRemove: [phaseRegistrationId],
    });
    toast.success("Atleta quitado de la sección");
  };

  const toggleCollapse = (id: number) => {
    const newValue = !(collapseRef.current.get(id) ?? true);
    collapseRef.current.set(id, newValue);
    setSections((prev) =>
      prev.map((s) =>
        s.athleticsSectionId === id ? { ...s, collapsed: newValue } : s,
      ),
    );
  };

  const handleFinalizePhase = async () => {
    if (phaseFinalized) return;
    if (!confirm("¿Finalizar la fase? Los resultados quedarán bloqueados. Podrás reabrirla si necesitas hacer cambios.")) return;
    try {
      await classifyMutation.mutateAsync();
      queryClient.invalidateQueries({ queryKey: CLASSIFICATION_STATUS_KEY(phaseId) });
    } catch {
      // El toast de error lo maneja useClassifyPhase.onError
    }
  };

  const handleReopenPhase = async () => {
    if (!confirm("¿Reabrir la fase? Se borrarán las clasificaciones actuales y podrás volver a editar.")) return;
    await reopenMutation.mutateAsync();
    toast.success("Fase reabierta — ya puedes editar los resultados");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (rowsLoading || sectionsLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  const unassigned = rows.filter((r) => r.sections.length === 0);

  const searchTerm = searchAthletes.toLowerCase().trim();
  const filteredSections = searchTerm
    ? sections.filter((section) =>
        rows.some(
          (r) =>
            r.sections.some((e) => e.athleticsSectionId === section.athleticsSectionId) &&
            r.athleteName.toLowerCase().includes(searchTerm),
        ),
      )
    : sections;

  return (
    <div className="space-y-3">

     
      {/* Nueva sección */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Input + Nueva Sección — solo si no está finalizada */}
        {!phaseFinalized && (
          <>
            <input
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSection()}
              placeholder='Ej: "Serie 1", "Serie 2", "Finales"'
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
            <button
              type="button"
              onClick={handleAddSection}
              disabled={createSectionMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {createSectionMutation.isPending ? "Creando..." : "Nueva Sección"}
            </button>
          </>
        )}

        {/* Botón Finalizar / Badge + Reabrir */}
        {!phaseFinalized ? (
          <button
            type="button"
            onClick={handleFinalizePhase}
            disabled={classifyMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            {classifyMutation.isPending ? "Procesando..." : "Finalizar Fase"}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
              <Lock className="h-4 w-4" />
              Fase Finalizada
            </span>
            <button
              type="button"
              onClick={handleReopenPhase}
              disabled={reopenMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <LockOpen className="h-4 w-4" />
              {reopenMutation.isPending ? "Reabriendo..." : "Reabrir Fase"}
            </button>
          </div>
        )}

        {/* Redistribuir — solo si no está finalizada */}
        {!phaseFinalized && sections.length > 1 && (
          <button
            type="button"
            onClick={() => setRedistributeMode((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              redistributeMode
                ? "border-blue-400 bg-blue-500 text-white hover:bg-blue-600"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Users className="h-4 w-4" />
            {redistributeMode ? "Redistribuyendo..." : "Redistribuir"}
          </button>
        )}
      </div>

      {/* Buscador por series */}
      {rows.length > 0 && sections.length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            value={searchAthletes}
            onChange={(e) => setSearchAthletes(e.target.value)}
            placeholder="Buscar atleta en las series..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 transition-all"
          />
          {searchAthletes && (
            <button
              type="button"
              onClick={() => setSearchAthletes("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {searchAthletes && (
            <p className="mt-1 text-xs text-slate-400 pl-1">
              {filteredSections.length === 0
                ? "Sin resultados"
                : `${filteredSections.length} serie${filteredSections.length !== 1 ? "s" : ""} con "${searchAthletes}"`}
            </p>
          )}
        </div>
      )}

      {/* Todos los atletas de la fase — colapsable */}
      {rows.length > 0 && <AllAthletesPanel rows={rows} />}

      {sections.length === 0 && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No hay atletas en esta fase.
        </div>
      )}

      {/* Secciones */}
      {filteredSections.map((section) => {
        const sectionRows = rows
          .filter((r) =>
            r.sections.some(
              (e) => e.athleticsSectionId === section.athleticsSectionId,
            ) &&
            (searchTerm ? r.athleteName.toLowerCase().includes(searchTerm) : true),
          )
          .map((r) => ({
            ...r,
            entry: r.sections.find(
              (e) => e.athleticsSectionId === section.athleticsSectionId,
            )!,
          }))
          .sort((a, b) => (a.entry.lane ?? 999) - (b.entry.lane ?? 999));

        const hasDirty = sectionRows.some((r) => r.entry.isDirty);

        return (
          <div
            key={section.athleticsSectionId}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Header sección */}
            <div className="flex items-center gap-2 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3">
              <button
                type="button"
                onClick={() => toggleCollapse(section.athleticsSectionId)}
                className="flex-shrink-0 rounded p-1 text-slate-500 hover:bg-orange-100 hover:text-slate-700"
              >
                {section.collapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>

              {section.editing ? (
                <div className="flex flex-1 items-center gap-1.5">
                  <input
                    autoFocus
                    type="text"
                    value={section.editingName}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((s) =>
                          s.athleticsSectionId === section.athleticsSectionId
                            ? { ...s, editingName: e.target.value }
                            : s,
                        ),
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        handleRenameSection(
                          section.athleticsSectionId,
                          section.name,
                          section.editingName,
                        );
                      if (e.key === "Escape")
                        setSections((prev) =>
                          prev.map((s) =>
                            s.athleticsSectionId === section.athleticsSectionId
                              ? { ...s, editing: false }
                              : s,
                          ),
                        );
                    }}
                    className="w-40 rounded border border-orange-400 px-2 py-0.5 text-sm font-bold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleRenameSection(
                        section.athleticsSectionId,
                        section.name,
                        section.editingName,
                      )
                    }
                    className="rounded bg-orange-500 p-1 text-white hover:bg-orange-600"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSections((prev) =>
                        prev.map((s) =>
                          s.athleticsSectionId === section.athleticsSectionId
                            ? { ...s, editing: false }
                            : s,
                        ),
                      )
                    }
                    className="rounded bg-slate-200 p-1 text-slate-600 hover:bg-slate-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate font-bold text-slate-900">
                    {section.name}
                  </span>
                  <span className="flex-shrink-0 text-xs text-slate-500">
                    {sectionRows.length} atleta
                    {sectionRows.length !== 1 ? "s" : ""}
                  </span>
                  {!phaseFinalized && (
                    <button
                      type="button"
                      onClick={() =>
                        setSections((prev) =>
                          prev.map((s) =>
                            s.athleticsSectionId === section.athleticsSectionId
                              ? { ...s, editing: true, editingName: s.name }
                              : s,
                          ),
                        )
                      }
                      className="flex-shrink-0 rounded p-1 text-slate-400 hover:bg-orange-100 hover:text-orange-600"
                      title="Renombrar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-shrink-0 items-center gap-2">
                {!phaseFinalized && (
                  <>
                    {/* viento */}
                    <div className="flex items-center gap-1">
                      <Wind className="h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="number"
                        step="0.1"
                        value={section.wind ?? ""}
                        placeholder="0.0"
                        onChange={(e) =>
                          handleSectionWind(
                            section.athleticsSectionId,
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        className="w-16 rounded border border-slate-300 px-1.5 py-0.5 text-xs focus:border-orange-400 focus:outline-none"
                      />
                      <span className="text-xs text-slate-400">m/s</span>
                    </div>

                    {/* botón Atletas */}
                    <button
                      type="button"
                      onClick={() =>
                        setAssigningToSection({ id: section.athleticsSectionId, name: section.name })
                      }
                      className="flex items-center gap-1 rounded-lg border border-orange-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Atletas
                    </button>

                    {/* Guardar si hay cambios */}
                    {hasDirty && (
                      <button
                        type="button"
                        onClick={() => handleSaveSection(section.athleticsSectionId, section.name)}
                        disabled={upsertEntryMutation.isPending}
                        className="rounded-lg bg-orange-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                      >
                        Guardar
                      </button>
                    )}

                    {/* Eliminar sección */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.athleticsSectionId, section.name)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      title="Eliminar sección"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tabla atletas */}
            {!section.collapsed &&
              (sectionRows.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-400">
                  Sin atletas — usa el botón "Atletas" para asignarlos
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="w-20 px-4 py-2 text-center">Carril</th>
                        <th className="px-4 py-2 text-center">
                          {sectionRows.some((r) => r.isTeam)
                            ? "Equipo"
                            : "Atleta"}
                        </th>
                        <th className="hidden px-4 py-2 text-centers md:table-cell">
                          Institución
                        </th>
                        <th className="px-4 py-2 text-left">Tiempo</th>
                        <th className="w-10 px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sectionRows.map((row) => {
                        const status = parseStatus(row.entry.notes ?? null);
                        return (
                          <tr
                            key={row.phaseRegistrationId}
                            className={
                              row.entry.isDirty
                                ? "bg-amber-50"
                                : status
                                  ? "bg-slate-50 opacity-75"
                                  : "transition-colors hover:bg-slate-50"
                            }
                          >
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                min={1} max={12}
                                value={row.entry.lane ?? ""}
                                placeholder="—"
                                readOnly={phaseFinalized}
                                disabled={phaseFinalized}
                                onChange={(e) => !phaseFinalized && updateEntry(row.phaseRegistrationId, section.athleticsSectionId, { lane: e.target.value ? Number(e.target.value) : null })}
                                className={`w-16 rounded border px-2 py-1 text-xs focus:outline-none ${
                                  phaseFinalized
                                    ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                                    : "border-slate-300 focus:border-orange-400"
                                }`}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-900">
                                    {row.athleteName.toUpperCase()}
                                  </span>
                                  {row.isTeam && (
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                                      Equipo
                                    </span>
                                  )}
                                </div>
                                {redistributeMode && (
                                  <select
                                    value={row.entry.athleticsSectionId}
                                    disabled={moveEntryMutation.isPending}
                                    onChange={(e) => {
                                      const targetId = Number(e.target.value);
                                      if (targetId === row.entry.athleticsSectionId) return;
                                      moveEntryMutation.mutate({
                                        entryId: row.entry.entryId,
                                        athleticsSectionId: targetId,
                                      });
                                    }}
                                    className={`w-fit rounded border px-1.5 py-0.5 text-xs focus:border-orange-400 focus:outline-none cursor-pointer transition-colors
                                      ${moveEntryMutation.isPending
                                        ? "border-orange-200 bg-orange-50 text-orange-400 opacity-60"
                                        : "border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300"
                                      }`}
                                  >
                                    {sections.map((s) => (
                                      <option key={s.athleticsSectionId} value={s.athleticsSectionId}>
                                        {s.name}
                                      </option>
                                    ))}
                                  </select>
                                )}

                              </div>
                            </td>
                            <td className="hidden px-4 py-2 md:table-cell">
                              <div className="flex items-center gap-2">
                                {row.institutionLogo && (
                                  <img
                                    src={getImageUrl(row.institutionLogo)}
                                    alt={row.institutionName || ""}
                                    className="h-5 w-5 object-contain flex-shrink-0"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                  />
                                )}
                                <span className="text-sm text-slate-500">{row.institutionName || "—"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <TimeCell
                                entry={row.entry}
                                phaseRegistrationId={row.phaseRegistrationId}
                                sectionId={section.athleticsSectionId}
                                onUpdateEntry={updateEntry}
                                onSaveEntry={handleSaveEntry}
                                isSaving={upsertEntryMutation.isPending}
                                readonly={phaseFinalized}
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              {!phaseFinalized && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveFromSection(row.phaseRegistrationId, section.athleticsSectionId)
                                  }
                                  className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                                  title="Quitar de esta sección"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
          </div>
        );
      })}

      {assigningToSection && (
        <AssignToSectionModal
          isOpen={true}
          onClose={() => setAssigningToSection(null)}
          sectionId={assigningToSection.id}
          sectionName={assigningToSection.name}
          allRows={rows}
          onConfirm={(toAdd, toRemove) =>
            handleConfirmAssign(assigningToSection.id, toAdd, toRemove)
          }
        />
      )}
    </div>
  );
}
