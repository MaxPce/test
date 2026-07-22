import { useState, useRef, useEffect } from "react";
import { Search, X, Building2, ChevronDown, Plus, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useInstitutions } from "@/features/institutions/api/institutions.queries";
import type { CreateLocalTeamData, LocalTeamMemberData } from "../types";

interface LocalTeamCreationFormProps {
  eventCategoryId: number;
  categoryId: number;
  onSubmit: (data: CreateLocalTeamData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

interface MemberDraft {
  id: string;
  name: string;
  docNumber: string;
}

export function LocalTeamCreationForm({
  eventCategoryId,
  categoryId,
  onSubmit,
  onCancel,
  isLoading,
}: LocalTeamCreationFormProps) {
  // — Equipo
  const [teamName, setTeamName] = useState("");
  const [members, setMembers]   = useState<MemberDraft[]>([]);
  const [errors, setErrors]     = useState<{ teamName?: string; members?: string }>({}); 

  // — Draft miembro nuevo
  const [draftName, setDraftName]   = useState("");
  const [draftDoc, setDraftDoc]     = useState("");
  const [draftError, setDraftError] = useState("");

  // — Combobox institución (mismo patrón que LocalAthleteForm)
  const [institutionId, setInstitutionId]       = useState<number | undefined>(undefined);
  const [institutionLabel, setInstitutionLabel] = useState("");
  const [search, setSearch]                     = useState("");
  const [dropdownOpen, setDropdownOpen]         = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  const { data: institutions = [], isLoading: loadingInstitutions } = useInstitutions();

  const filtered = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    inst.abrev.toLowerCase().includes(search.toLowerCase())
  );

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectInstitution = (id: number, label: string) => {
    setInstitutionId(id);
    setInstitutionLabel(label);
    setSearch("");
    setDropdownOpen(false);
    // Auto-rellenar nombre del equipo si está vacío
    if (!teamName.trim()) setTeamName(label);
  };

  const handleClearInstitution = () => {
    setInstitutionId(undefined);
    setInstitutionLabel("");
    setSearch("");
  };

  // — Agregar miembro a la lista local
  const handleAddMember = () => {
    if (!draftName.trim()) {
      setDraftError("El nombre del integrante es obligatorio");
      return;
    }
    setDraftError("");
    setMembers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: draftName.trim(),
        docNumber: draftDoc.trim(),
      },
    ]);
    setDraftName("");
    setDraftDoc("");
  };

  const handleRemoveMember = (id: string) =>
    setMembers((prev) => prev.filter((m) => m.id !== id));

  // — Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!teamName.trim()) errs.teamName = "El nombre del equipo es obligatorio";
    if (members.length === 0) errs.members = "Debes agregar al menos un integrante";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const payload: CreateLocalTeamData = {
      teamName: teamName.trim(),
      categoryId,
      institutionId,
      members: members.map<LocalTeamMemberData>(({ name, docNumber }) => ({
        name,
        docNumber: docNumber || undefined,
      })),
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Institución / Club ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Institución / Club{" "}
          <span className="text-gray-400 font-normal text-xs">(opcional)</span>
        </label>

        <div ref={comboboxRef} className="relative">
          {institutionId && !dropdownOpen ? (
            <div className="flex items-center justify-between w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <div className="flex items-center gap-2 text-gray-800">
                <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                <span>{institutionLabel}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClearInstitution}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2 bg-white focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                placeholder={
                  loadingInstitutions ? "Cargando instituciones..." : "Buscar institución..."
                }
                disabled={loadingInstitutions}
                className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400 disabled:opacity-50"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          )}

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
              <button
                type="button"
                onClick={handleClearInstitution}
                className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 border-b border-gray-100"
              >
                Sin institución
              </button>
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">
                  No se encontraron instituciones
                </div>
              ) : (
                filtered.map((inst) => (
                  <button
                    key={inst.institutionId}
                    type="button"
                    onClick={() => handleSelectInstitution(inst.institutionId, inst.name)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between group ${
                      institutionId === inst.institutionId
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    <span>{inst.name}</span>
                    <span className="text-xs text-gray-400 group-hover:text-blue-400">
                      {inst.abrev}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Nombre del equipo ── */}
      <Input
        label="Nombre del Equipo *"
        type="text"
        placeholder="Ej: Club Atlético Lima"
        value={teamName}
        onChange={(e) => { setTeamName(e.target.value); setErrors((p) => ({ ...p, teamName: undefined })); }}
        error={errors.teamName}
      />

      {/* ── Sección agregar integrante ── */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Agregar Integrante</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nombre completo *"
            type="text"
            placeholder="Ej: Juan Pérez"
            value={draftName}
            onChange={(e) => { setDraftName(e.target.value); setDraftError(""); }}
            error={draftError || undefined}
          />
          <Input
            label="N° Documento (opcional)"
            type="text"
            placeholder="Ej: 12345678"
            value={draftDoc}
            onChange={(e) => setDraftDoc(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleAddMember}
            icon={<Plus className="h-4 w-4" />}
          >
            Agregar
          </Button>
        </div>
      </div>

      {/* ── Lista de miembros agregados ── */}
      {errors.members && (
        <p className="text-sm text-red-500">{errors.members}</p>
      )}

      {members.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            Integrantes{" "}
            <span className="text-xs font-normal text-gray-400">
              ({members.length})
            </span>
          </p>

          {members.map((m, index) => (
            <div
              key={m.id}
              className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <UserCircle2 className="h-7 w-7 text-gray-300 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.name}</p>
                  {m.docNumber && (
                    <p className="text-xs text-gray-400">DNI: {m.docNumber}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">#{index + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(m.id)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Botones ── */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="gradient" isLoading={isLoading}>
          Crear Equipo Local
        </Button>
      </div>
    </form>
  );
}