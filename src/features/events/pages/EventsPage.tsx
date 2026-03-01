import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Search, Grid3x3, List, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/PageHeader";
import { EventCard } from "../components/EventCard";
import { useCompany } from "@/features/companies/api/companies.queries";
import { useSismasterEvents } from "@/features/institutions/api/sismaster.queries";
import { adaptSismasterEventsToLocal } from "../utils/sismasterAdapter";
import type { Event } from "../types";
import type { EventStatus } from "@/lib/types/common.types";

const filterOptions = [
  { value: "", label: "Todos los estados" },
  { value: "programado", label: "Programados" },
  { value: "en_curso", label: "En Curso" },
  { value: "finalizado", label: "Finalizados" },
];

export function EventsPage() {
  const { companyId } = useParams<{ companyId?: string }>();
  const navigate = useNavigate();
  const numericCompanyId = companyId ? Number(companyId) : undefined;

  const [filterStatus, setFilterStatus] = useState<EventStatus | undefined>(
    undefined,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: company, isLoading: isLoadingCompany } = useCompany(
    numericCompanyId ?? 0,
  );

  const { data: rawSismasterEvents = [], isLoading: isLoadingEvents } =
    useSismasterEvents();

  const allEvents: Event[] = adaptSismasterEventsToLocal(rawSismasterEvents);

  const companyEvents: Event[] = company?.sismasterPrefix
    ? allEvents.filter((e) => e.name?.startsWith(company.sismasterPrefix!))
    : [];

  const filteredEvents = companyEvents.filter((event) => {
    const matchesSearch =
      event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true;
    const matchesStatus = !filterStatus || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const isLoading = isLoadingCompany || isLoadingEvents;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando eventos..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <button
        onClick={() => navigate("/admin/companies")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Organizaciones
      </button>

      <PageHeader title={company ? `Eventos — ${company.name}` : "Eventos"} />

      <Card variant="glass">
        <CardBody>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar eventos por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-5 w-5" />}
                variant="modern"
              />
            </div>
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

      {filteredEvents.length === 0 ? (
        <EmptyState
          title={
            !company?.sismasterPrefix
              ? "Sin eventos"
              : searchQuery || filterStatus
                ? "No se encontraron eventos"
                : "Sin eventos"
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
              onEdit={() => {}}
              onDelete={() => {}}
              companyLogoUrl={company?.logoUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
