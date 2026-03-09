import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  Hash,
  X,
  Tag,
  Grid3x3,
  List,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { getImageUrl } from "@/lib/utils/imageUrl";
import { useCompanies } from "../api/companies.queries";
import {
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  useUploadCompanyLogo,
} from "../api/companies.mutations";
import { useSismasterEvents } from "@/features/institutions/api/sismaster.queries";
import { adaptSismasterEventsToLocal } from "@/features/events/utils/sismasterAdapter";
import { EventCard } from "@/features/events/components/EventCard";
import type { Company, CreateCompanyData } from "../types";
import type { Event } from "@/features/events/types";
import type { EventStatus } from "@/lib/types/common.types";

const EMPTY_FORM: CreateCompanyData = {
  name: "",
  ruc: "",
  address: "",
  sismasterPrefix: "",
};

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "programado", label: "Programados" },
  { value: "en_curso", label: "En Curso" },
  { value: "finalizado", label: "Finalizados" },
];

export default function CompaniesPage() {
  const navigate = useNavigate();

  // ── Companies data ──
  const { data: companies = [], isLoading } = useCompanies();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const deleteMutation = useDeleteCompany();
  const uploadLogoMutation = useUploadCompanyLogo();

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<"companies" | "events">("companies");

  // ── Companies UI state ──
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState<CreateCompanyData>(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState<File | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  // ── Events tab state ──
  const [eventsSearch, setEventsSearch] = useState("");
  const [eventsStatus, setEventsStatus] = useState<EventStatus | undefined>(undefined);
  const [eventsViewMode, setEventsViewMode] = useState<"grid" | "list">("grid");

  // ── Sismaster events (sin filtro de company) ──
  const { data: rawSismasterEvents = [], isLoading: isLoadingEvents } =
    useSismasterEvents();

  const allEvents: Event[] = useMemo(
    () => adaptSismasterEventsToLocal(rawSismasterEvents),
    [rawSismasterEvents],
  );

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesSearch =
        !eventsSearch ||
        (event.name ?? "").toLowerCase().includes(eventsSearch.toLowerCase());
      const matchesStatus = !eventsStatus || event.status === eventsStatus;
      return matchesSearch && matchesStatus;
    });
  }, [allEvents, eventsSearch, eventsStatus]);

  // ── Companies handlers ──
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setLogoFile(undefined);
    setModalOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditing(company);
    setForm({
      name: company.name ?? "",
      ruc: company.ruc ?? "",
      address: company.address ?? "",
      logoUrl: company.logoUrl ?? "",
      sismasterPrefix: company.sismasterPrefix ?? "",
    });
    setLogoFile(undefined);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setLogoFile(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateCompanyData = {
      name: form.name?.trim() ?? "",
      ruc: form.ruc?.trim() || undefined,
      address: form.address?.trim() || undefined,
      sismasterPrefix: form.sismasterPrefix?.trim() || undefined,
    };
    let savedId: number;
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.companyId, data: payload });
      savedId = editing.companyId;
    } else {
      const created = await createMutation.mutateAsync(payload);
      savedId = created.companyId;
    }
    if (logoFile) {
      await uploadLogoMutation.mutateAsync({ id: savedId, file: logoFile });
    }
    closeModal();
  };

  const handleDelete = async (company: Company) => {
    if (confirm(`¿Eliminar la organización "${company.name}"?`)) {
      await deleteMutation.mutateAsync(company.companyId);
    }
  };

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(q) ||
        (c.ruc ?? "").toLowerCase().includes(q) ||
        (c.address ?? "").toLowerCase().includes(q),
    );
  }, [companies, searchQuery]);

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadLogoMutation.isPending;

  return (
    <div className="p-6 space-y-6 animate-in">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-medium">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === "companies" ? "Organizaciones" : "Todos los Eventos"}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Tab Toggle ── */}
      <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 w-fit">
        <button
          onClick={() => setActiveTab("companies")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "companies"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Organizaciones
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "events"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Todos los Eventos
          {allEvents.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              {allEvents.length}
            </span>
          )}
        </button>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* ── TAB: ORGANIZACIONES ──               */}
      {/* ════════════════════════════════════════ */}
      {activeTab === "companies" && (
        <>
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} variant="default" className="animate-pulse overflow-hidden">
                  <div className="h-36 bg-slate-200" />
                  <CardHeader>
                    <div className="h-5 w-40 bg-slate-200 rounded-lg" />
                    <div className="h-4 w-24 bg-slate-200 rounded-lg mt-2" />
                  </CardHeader>
                  <CardFooter>
                    <div className="h-9 w-full bg-slate-200 rounded-xl" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredCompanies.length === 0 && (
            <Card variant="bordered" className="py-14">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">
                    {searchQuery.trim() ? "Sin resultados" : "Sin organizaciones"}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {searchQuery.trim()
                      ? `No se encontró ninguna organización con "${searchQuery}"`
                      : "Crea tu primera organización para empezar a gestionar eventos."}
                  </p>
                </div>
                {searchQuery.trim() ? (
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                    Limpiar búsqueda
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    Crear organización
                  </Button>
                )}
              </div>
            </Card>
          )}

          {!isLoading && filteredCompanies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredCompanies.map((c) => {
                const logoUrl = getImageUrl(c.logoUrl);
                return (
                  <Card
                    key={c.companyId}
                    variant="elevated"
                    hover
                    padding="none"
                    className="group overflow-hidden flex flex-col"
                  >
                    <div className="relative h-36 bg-white overflow-hidden shrink-0">
                      {logoUrl ? (
                        <>
                          <div
                            className="absolute inset-0 scale-110 blur-xl opacity-20"
                            style={{
                              backgroundImage: `url(${logoUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center p-4">
                            <img
                              src={logoUrl}
                              alt={c.name}
                              className="max-h-full max-w-full object-contain
                     group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center">
                            <Building2 className="h-7 w-7 text-slate-400" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

                    <div className="flex flex-col flex-1 p-5 gap-3">
                      <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                        {c.name}
                      </h3>
                      <div className="space-y-1.5">
                        {c.ruc && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Hash className="h-3.5 w-3.5 shrink-0" />
                            <span>RUC: {c.ruc}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-2">
                        <Button
                          variant="gradient"
                          size="md"
                          className="w-full"
                          onClick={() =>
                            navigate(`/admin/companies/${c.companyId}/events`)
                          }
                        >
                          Ver eventos
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════ */}
      {/* ── TAB: TODOS LOS EVENTOS SISMASTER ──  */}
      {/* ════════════════════════════════════════ */}
      {activeTab === "events" && (
        <div className="space-y-5">
          {/* Barra de búsqueda y filtros */}
          <Card variant="glass">
            <CardBody>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar eventos por nombre..."
                    value={eventsSearch}
                    onChange={(e) => setEventsSearch(e.target.value)}
                    icon={<Search className="h-5 w-5" />}
                    variant="modern"
                  />
                </div>
                <div className="w-full lg:w-64">
                  <Select
                    value={eventsStatus || ""}
                    onChange={(e) =>
                      setEventsStatus(
                        e.target.value ? (e.target.value as EventStatus) : undefined,
                      )
                    }
                    options={STATUS_OPTIONS}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={eventsViewMode === "grid" ? "primary" : "outline"}
                    size="md"
                    onClick={() => setEventsViewMode("grid")}
                  >
                    <Grid3x3 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={eventsViewMode === "list" ? "primary" : "outline"}
                    size="md"
                    onClick={() => setEventsViewMode("list")}
                  >
                    <List className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {(eventsStatus || eventsSearch) && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                  <span className="text-sm font-semibold text-slate-600">
                    Filtros activos:
                  </span>
                  {eventsStatus && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {STATUS_OPTIONS.find((o) => o.value === eventsStatus)?.label}
                    </span>
                  )}
                  {eventsSearch && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      "{eventsSearch}"
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEventsStatus(undefined);
                      setEventsSearch("");
                    }}
                  >
                    Limpiar todo
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Cargando */}
          {isLoadingEvents && (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" label="Cargando eventos..." />
            </div>
          )}

          {/* Estado vacío */}
          {!isLoadingEvents && filteredEvents.length === 0 && (
            <Card variant="bordered" className="py-14">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">Sin eventos</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {eventsSearch || eventsStatus
                      ? "No se encontraron eventos con los filtros aplicados."
                      : "No hay eventos registrados en Sismaster."}
                  </p>
                </div>
                {(eventsSearch || eventsStatus) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEventsSearch("");
                      setEventsStatus(undefined);
                    }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Grid / List de eventos */}
          {!isLoadingEvents && filteredEvents.length > 0 && (
            <div
              className={
                eventsViewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.eventId}
                  event={event}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modal (sin cambios) ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card variant="elevated" className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10">
              <CardTitle className="text-base">
                {editing ? "Editar organización" : "Nueva organización"}
              </CardTitle>
              <button
                onClick={closeModal}
                className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-soft
                               focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">RUC</label>
                  <input
                    type="text"
                    value={form.ruc ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, ruc: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-soft
                               focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dirección</label>
                  <input
                    type="text"
                    value={form.address ?? ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-soft
                               focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Prefijo Sismaster
                  </label>
                  <input
                    type="text"
                    value={form.sismasterPrefix ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sismasterPrefix: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Ej: FEDUP, FISU, FPV"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-soft
                               focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>
                <ImageUpload
                  currentImage={getImageUrl(form.logoUrl)}
                  onImageSelect={setLogoFile}
                  onImageRemove={() => {
                    setLogoFile(undefined);
                    setForm((prev) => ({ ...prev, logoUrl: "" }));
                  }}
                  label="Logo de la Organización"
                  shape="square"
                  size="md"
                  disabled={isSaving}
                />
              </CardBody>

              <CardFooter className="flex justify-end gap-3">
                <Button type="button" variant="ghost" size="md" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                  {editing ? "Guardar cambios" : "Crear"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
