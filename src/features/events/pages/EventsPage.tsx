import { useState } from "react";
import {
  Plus,
  Calendar,
  Search,
  Grid3x3,
  List,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/PageHeader";
import { useSismasterEvents } from "@/features/institutions/api/sismaster.queries";
import { EventCard } from "../components/EventCard";
import { adaptSismasterEventsToLocal } from "../utils/sismasterAdapter";
import type { Event } from "../types";
import type { EventStatus } from "@/lib/types/common.types";

export function EventsPage() {
  const [filterStatus, setFilterStatus] = useState<EventStatus | undefined>(
    undefined,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: sismasterEvents = [], isLoading } = useSismasterEvents();

  const events = adaptSismasterEventsToLocal(sismasterEvents);

  // Mostrar alerta de que son eventos de Sismaster (no editables)
  const handleEdit = (event: Event) => {
    alert(
      "Los eventos de Sismaster no pueden ser editados desde esta aplicación.",
    );
  };

  const handleDelete = (event: Event) => {
    alert(
      "Los eventos de Sismaster no pueden ser eliminados desde esta aplicación.",
    );
  };

  const filterOptions = [
    { value: "", label: "Todos los estados" },
    { value: "programado", label: "Programados" },
    { value: "en_curso", label: "En Curso" },
    { value: "finalizado", label: "Finalizados" },
  ];

  // Filtrar eventos por búsqueda y estado
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true;
    const matchesStatus = !filterStatus || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando eventos..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header profesional */}
      <PageHeader title="Eventos" />

      {/* Barra de búsqueda y filtros mejorada */}
      <Card variant="glass">
        <CardBody>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <Input
                placeholder="Buscar eventos por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-5 w-5" />}
                variant="modern"
              />
            </div>

            {/* Filtro de estado */}
            <div className="w-full lg:w-64">
              <Select
                value={filterStatus || ""}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value
                      ? (e.target.value as EventStatus)
                      : undefined,
                  )
                }
                options={filterOptions}
              />
            </div>

            {/* Vista Grid/List */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "primary" : "outline"}
                size="md"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "outline"}
                size="md"
                onClick={() => setViewMode("list")}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {events.length}
              </p>
              <p className="text-xs text-slate-600 mt-1">Total Eventos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {events.filter((e) => e.status === "programado").length}
              </p>
              <p className="text-xs text-slate-600 mt-1">Programados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {events.filter((e) => e.status === "en_curso").length}
              </p>
              <p className="text-xs text-slate-600 mt-1">En Curso</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-600">
                {events.filter((e) => e.status === "finalizado").length}
              </p>
              <p className="text-xs text-slate-600 mt-1">Finalizados</p>
            </div>
          </div>

          {/* Filtros activos */}
          {(filterStatus || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
              <span className="text-sm font-semibold text-slate-600">
                Filtros activos:
              </span>
              {filterStatus && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {filterOptions.find((o) => o.value === filterStatus)?.label}
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  "{searchQuery}"
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterStatus(undefined);
                  setSearchQuery("");
                }}
              >
                Limpiar todo
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Grid/List de eventos */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={
            searchQuery || filterStatus
              ? "No se encontraron eventos"
              : "No hay eventos en Sismaster"
          }
          description={
            searchQuery || filterStatus
              ? "Intenta ajustar los filtros de búsqueda"
              : "No hay eventos registrados en Sismaster"
          }
        />
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredEvents.map((event) => (
            <EventCard
              key={event.eventId}
              event={event}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
