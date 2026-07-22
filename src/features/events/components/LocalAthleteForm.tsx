import { useState, useRef, useEffect } from "react";
import { Search, X, Building2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useInstitutions } from "@/features/institutions/api/institutions.queries";
import type { CreateLocalAthleteRegistrationData } from "../types";

interface LocalAthleteFormProps {
  eventCategoryId: number;
  onSubmit: (data: CreateLocalAthleteRegistrationData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function LocalAthleteForm({
  eventCategoryId,
  onSubmit,
  onCancel,
  isLoading,
}: LocalAthleteFormProps) {
  const [name, setName]           = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [errors, setErrors]       = useState<{ name?: string }>({});

  // Combobox institución
  const [institutionId, setInstitutionId]         = useState<number | undefined>(undefined);
  const [institutionLabel, setInstitutionLabel]   = useState("");
  const [search, setSearch]                       = useState("");
  const [dropdownOpen, setDropdownOpen]           = useState(false);
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

  const handleSelect = (id: number, label: string) => {
    setInstitutionId(id);
    setInstitutionLabel(label);
    setSearch("");
    setDropdownOpen(false);
  };

  const handleClear = () => {
    setInstitutionId(undefined);
    setInstitutionLabel("");
    setSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: "El nombre completo es obligatorio" });
      return;
    }
    setErrors({});
    await onSubmit({
      eventCategoryId,
      name:          name.trim(),
      docNumber:     docNumber.trim() || undefined,
      institutionId: institutionId ?? undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre completo */}
      <Input
        label="Nombre completo *"
        type="text"
        placeholder="Ej: Juan Pérez"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />

      {/* N° Documento */}
      <Input
        label="N° Documento (opcional)"
        type="text"
        placeholder="Ej: 12345678"
        value={docNumber}
        onChange={(e) => setDocNumber(e.target.value)}
      />

      {/* Institución — Combobox con buscador */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Institución / Club{" "}
          <span className="text-gray-400 font-normal text-xs">(opcional)</span>
        </label>

        <div ref={comboboxRef} className="relative">
          {/* Trigger: muestra la seleccionada o el input de búsqueda */}
          {institutionId && !dropdownOpen ? (
            // Institución seleccionada
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
                  onClick={handleClear}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            // Input de búsqueda
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
              {/* Opción "Sin institución" */}
              <button
                type="button"
                onClick={handleClear}
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
                    onClick={() => handleSelect(inst.institutionId, inst.name)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between group ${
                      institutionId === inst.institutionId ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
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

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="gradient" isLoading={isLoading}>
          Registrar Atleta
        </Button>
      </div>
    </form>
  );
}