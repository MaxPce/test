import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Eye, Edit2, Trash2, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Phase } from "../types";

interface PhaseCardProps {
  phase: Phase;
  onEdit: (phase: Phase) => void;
  onDelete: (phase: Phase) => void;
}

export function PhaseCard({ phase, onEdit, onDelete }: PhaseCardProps) {
  const navigate = useNavigate();

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "success" | "primary" | "default"> = {
      pendiente: "default",
      en_curso: "success",
      finalizado: "primary",
    };
    return variants[status] || "default";
  };

  const getFormatLabel = (format: string) => {
    const labels: Record<string, string> = {
      eliminacion_directa: "Eliminación Directa",
      round_robin: "Round Robin",
      grupos: "Fase de Grupos",
    };
    return labels[format] || format;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No definida";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card hover>
      <CardBody>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{phase.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {getFormatLabel(phase.format)}
              </p>
            </div>
            <Badge variant={getStatusBadgeVariant(phase.status)}>
              {phase.status === "pendiente" && "Pendiente"}
              {phase.status === "en_curso" && "En Curso"}
              {phase.status === "finalizado" && "Finalizado"}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              {phase.matches?.length || 0} partidos •{" "}
              {phase.participations?.length || 0} participantes
            </span>
          </div>

          {(phase.subPhases ?? []).length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50
                            border border-slate-200 rounded-lg px-2.5 py-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {phase.subPhases!.length} grupos ·{" "}
                {phase.subPhases!.every(g =>
                  (g.groupStandings ?? []).some(s => s.qualified)
                ) ? (
                  <span className="text-emerald-600 font-medium">Cerrados ✓</span>
                ) : (
                  <span className="text-amber-600 font-medium">En curso</span>
                )}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => navigate(`/admin/competitions/${phase.phaseId}`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Fase
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(phase)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(phase)}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
