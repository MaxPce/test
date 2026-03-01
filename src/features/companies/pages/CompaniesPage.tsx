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
import { getImageUrl } from "@/lib/utils/imageUrl";
import { useCompanies } from "../api/companies.queries";
import {
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  useUploadCompanyLogo,
} from "../api/companies.mutations";
import type { Company, CreateCompanyData } from "../types";

const EMPTY_FORM: CreateCompanyData = {
  name: "",
  ruc: "",
  address: "",
  sismasterPrefix: "",
};

export default function CompaniesPage() {
  const navigate = useNavigate();

  const { data: companies = [], isLoading } = useCompanies();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const deleteMutation = useDeleteCompany();
  const uploadLogoMutation = useUploadCompanyLogo();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState<CreateCompanyData>(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState<File | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

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
      await updateMutation.mutateAsync({
        id: editing.companyId,
        data: payload,
      });
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
              Organizaciones
            </h1>
          </div>
        </div>
        {/* <Button variant="gradient" size="md" onClick={openCreate}>
          Nueva Organización
        </Button> */}
      </div>

      {/* ── Buscador ── */}
      <Card variant="glass">
        <CardBody>
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, RUC o dirección..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm shadow-soft
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </CardBody>
      </Card>

      {/* ── Skeletons ── */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              variant="default"
              className="animate-pulse overflow-hidden"
            >
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

      {/* ── Estado vacío ── */}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
              >
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

      {/* ── Grid de cards ── */}
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
                {/* ── Banner ── */}
                <div className="relative h-36 bg-white overflow-hidden shrink-0">
                  {logoUrl ? (
                    <>
                      {/* Fondo difuminado del logo para llenar el espacio */}
                      <div
                        className="absolute inset-0 scale-110 blur-xl opacity-20"
                        style={{
                          backgroundImage: `url(${logoUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                      {/* Logo contenido sin recortar */}
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

                  {/* Badge prefijo Sismaster */}
                  {c.sismasterPrefix && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold">
                        <Tag className="h-3 w-3" />
                        {c.sismasterPrefix}
                      </span>
                    </div>
                  )}
                </div>

                {/* Franja degradada azul-púrpura debajo del banner */}
                <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

                {/* ── Contenido ── */}
                <div className="flex flex-col flex-1 p-5 gap-3">
                  {/* Nombre de la organización */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {c.name}
                  </h3>

                  {/* RUC y dirección */}
                  <div className="space-y-1.5">
                    {c.ruc && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Hash className="h-3.5 w-3.5 shrink-0" />
                        <span>RUC: {c.ruc}</span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
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

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card
            variant="elevated"
            className="w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
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
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-soft
                               focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* RUC */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    RUC
                  </label>
                  <input
                    type="text"
                    value={form.ruc ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, ruc: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-soft
                               focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={form.address ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-soft
                               focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Prefijo Sismaster */}
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

                {/* Logo */}
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
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={closeModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                >
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
