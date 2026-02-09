import { useState } from "react";
import { Plus, Edit2, Trash2, Building2, Search, Users, Grid3x3, List } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { useInstitutions } from "../api/institutions.queries";
import {
  useCreateInstitution,
  useUpdateInstitution,
  useDeleteInstitution,
  useUploadInstitutionLogo,
} from "../api/institutions.mutations";
import { InstitutionForm } from "../components/InstitutionForm";
import { DeleteConfirmModal } from "@/features/sports/components/DeleteConfirmModal";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { Institution, CreateInstitutionData } from "../types";

export function InstitutionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  const { data: institutions = [], isLoading } = useInstitutions();
  const createMutation = useCreateInstitution();
  const updateMutation = useUpdateInstitution();
  const deleteMutation = useDeleteInstitution();
  const uploadLogoMutation = useUploadInstitutionLogo();

  const handleCreate = async (data: CreateInstitutionData, logoFile?: File) => {
    try {
      const institution = await createMutation.mutateAsync(data);

      if (logoFile && institution.institutionId) {
        await uploadLogoMutation.mutateAsync({
          id: institution.institutionId,
          file: logoFile,
        });
      }

      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error al crear institución:", error);
    }
  };

  const handleUpdate = async (data: CreateInstitutionData, logoFile?: File) => {
    if (selectedInstitution) {
      try {
        await updateMutation.mutateAsync({
          id: selectedInstitution.institutionId,
          data,
        });

        if (logoFile) {
          await uploadLogoMutation.mutateAsync({
            id: selectedInstitution.institutionId,
            file: logoFile,
          });
        }

        setIsEditModalOpen(false);
        setSelectedInstitution(null);
      } catch (error) {
        console.error("Error al actualizar institución:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedInstitution) {
      await deleteMutation.mutateAsync(selectedInstitution.institutionId);
      setIsDeleteModalOpen(false);
      setSelectedInstitution(null);
    }
  };

  const openEditModal = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsDeleteModalOpen(true);
  };

  // Filtrar instituciones por búsqueda
  const filteredInstitutions = institutions.filter(
    (institution) =>
      institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution.abrev.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando instituciones..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header profesional */}
      <PageHeader
        title="Gestión de Instituciones"
        actions={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="gradient"
            size="lg"
            icon={<Plus className="h-5 w-5" />}
          >
            Nueva Institución
          </Button>
        }
      />

      {/* Barra de búsqueda y filtros */}
      <Card variant="glass">
        <CardBody>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <Input
                placeholder="Buscar instituciones por nombre o abreviatura..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-5 w-5" />}
                variant="modern"
              />
            </div>

            {/* Vista Table/Grid */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "primary" : "outline"}
                size="md"
                onClick={() => setViewMode("table")}
              >
                <List className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "primary" : "outline"}
                size="md"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Filtros activos */}
          {searchQuery && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                Buscando:
              </span>
              <Badge variant="primary">"{searchQuery}"</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
              >
                Limpiar
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Contenido */}
      {filteredInstitutions.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={
            searchQuery
              ? "No se encontraron instituciones"
              : "No hay instituciones registradas"
          }
          description={
            searchQuery
              ? "Intenta ajustar la búsqueda"
              : "Comienza agregando tu primera institución"
          }
          action={
            !searchQuery
              ? {
                  label: "Crear Primera Institución",
                  onClick: () => setIsCreateModalOpen(true),
                }
              : undefined
          }
        />
      ) : viewMode === "grid" ? (
        // Vista Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInstitutions.map((institution) => (
            <InstitutionCard
              key={institution.institutionId}
              institution={institution}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      ) : (
        // Vista Table
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Logo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-32">Abreviatura</TableHead>
                <TableHead className="text-center w-24">Atletas</TableHead>
                <TableHead className="text-right w-32">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstitutions.map((institution) => (
                <TableRow key={institution.institutionId}>
                  <TableCell>
                    {institution.logoUrl ? (
                      <div className="w-12 h-12 rounded-xl bg-slate-50 p-2 flex items-center justify-center border border-slate-200">
                        <img
                          src={getImageUrl(institution.logoUrl)}
                          alt={institution.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/admin/institutions/${institution.institutionId}`}
                      className="font-bold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {institution.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary">{institution.abrev}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-bold text-slate-700">
                      {institution.athletes?.length || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(institution)}
                        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteModal(institution)}
                        className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Modales */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva Institución"
        size="md"
      >
        <InstitutionForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending || uploadLogoMutation.isPending}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInstitution(null);
        }}
        title="Editar Institución"
        size="md"
      >
        <InstitutionForm
          institution={selectedInstitution || undefined}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedInstitution(null);
          }}
          isLoading={updateMutation.isPending || uploadLogoMutation.isPending}
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedInstitution(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Institución"
        message={`¿Estás seguro de que deseas eliminar "${selectedInstitution?.name}"? Esta acción no se puede deshacer y eliminará todos los atletas y equipos asociados.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// Componente auxiliar para la tarjeta de institución
function InstitutionCard({
  institution,
  onEdit,
  onDelete,
}: {
  institution: Institution;
  onEdit: (institution: Institution) => void;
  onDelete: (institution: Institution) => void;
}) {
  return (
    <Card hover variant="elevated" padding="none" className="group overflow-hidden">
      {/* Contenido */}
      <CardBody className="p-6">
        {/* Header con logo y badge */}
        <div className="flex items-start justify-between mb-4">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-slate-50 p-3 flex items-center justify-center border-2 border-slate-200 group-hover:scale-110 transition-transform flex-shrink-0">
            {institution.logoUrl ? (
              <img
                src={getImageUrl(institution.logoUrl)}
                alt={institution.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    e.currentTarget.style.display = "none";
                    const placeholder = document.createElement("div");
                    placeholder.className = "flex items-center justify-center w-full h-full";
                    placeholder.innerHTML = `<svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>`;
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <Building2 className="h-8 w-8 text-slate-400" />
            )}
          </div>

          {/* Badge de abreviatura */}
          <Badge variant="primary" size="sm">
            {institution.abrev}
          </Badge>
        </div>

        {/* Nombre */}
        <Link
          to={`/admin/institutions/${institution.institutionId}`}
          className="block mb-4"
        >
          <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {institution.name}
          </h3>
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
            <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-blue-900">
              {institution.athletes?.length || 0}
            </p>
            <p className="text-xs text-blue-700 font-medium">Atletas</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
            <Users className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-emerald-900">
              {institution.teams?.length || 0}
            </p>
            <p className="text-xs text-emerald-700 font-medium">Equipos</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              onEdit(institution);
            }}
            className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              onDelete(institution);
            }}
            className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardBody>

      {/* Bottom accent */}
      <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}
