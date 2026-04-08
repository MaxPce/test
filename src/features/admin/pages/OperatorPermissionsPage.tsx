// src/features/admin/pages/OperatorPermissionsPage.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck, Trash2, Plus } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  useOperatorPermissionsByUser,
  useAssignPermission,
  useRemovePermission,
} from "../hooks/useOperatorPermissions";
import { useSismasterEvents } from "@/features/institutions/api/sismaster.queries";
import type { User } from "@/app/store/useAuthStore";

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface Sport {
  sportId: number;
  name: string;
}

interface EventOption {
  eventId: number;
  name: string;
  source: "local" | "sismaster";
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

const useUserById = (userId: number) =>
  useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const { data } = await apiClient.get<User>(
        ENDPOINTS.AUTH.USERS.DETAIL(userId)
      );
      return data;
    },
    enabled: !!userId,
  });

const useSportsList = () =>
  useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const { data } = await apiClient.get<Sport[]>(ENDPOINTS.SPORTS.LIST);
      return data;
    },
  });

const useAllEvents = () => {
  const localQuery = useQuery({
    queryKey: ["events", "local"],
    queryFn: async () => {
      const { data } = await apiClient.get<any[]>(ENDPOINTS.EVENTS.LIST);
      return data;
    },
  });

  const sismasterQuery = useSismasterEvents();

  const localEvents: EventOption[] = (localQuery.data ?? []).map((e) => ({
    eventId: e.eventId,
    name: e.name,
    source: "local" as const,
  }));

  const sismasterEvents: EventOption[] = (sismasterQuery.data ?? []).map((e) => ({
    eventId: e.idevent,
    name: e.name,
    source: "sismaster" as const,
  }));

  return {
    events: [...localEvents, ...sismasterEvents],
    localEvents,
    sismasterEvents,
    isLoading: localQuery.isLoading || sismasterQuery.isLoading,
  };
};

// ─── Helper de display para la tabla ─────────────────────────────────────────

function getPermissionLabel(
  perm: { sportId: number | null; eventId: number | null },
  sports: Sport[],
  events: EventOption[]
) {
  const event = events.find((e) => e.eventId === perm.eventId);
  const sport = sports.find((s) => s.sportId === perm.sportId);

  return {
    eventName: event?.name ?? `Evento #${perm.eventId}`,
    sportName: sport?.name ?? null,
    source: event?.source ?? "local",
    badge: sport ? "Deporte específico" : "Evento completo",
    badgeColor: sport
      ? "bg-blue-50 text-blue-600"
      : "bg-green-50 text-green-600",
  };
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function OperatorPermissionsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const parsedUserId = Number(userId);

  // Evento seleccionado guarda "local-5" o "sismaster-12" como string
  // para evitar colisiones de IDs entre fuentes
  const [selectedEventKey, setSelectedEventKey] = useState<string>("");
  const [selectedSportId, setSelectedSportId] = useState<number | "">("");

  const { data: user, isLoading: isLoadingUser } = useUserById(parsedUserId);
  const { data: permissions = [], isLoading: isLoadingPerms } =
    useOperatorPermissionsByUser(parsedUserId);
  const { data: sports = [] } = useSportsList();
  const { events, localEvents, sismasterEvents, isLoading: isLoadingEvents } =
    useAllEvents();

  const assignMutation = useAssignPermission(parsedUserId);
  const removeMutation = useRemovePermission(parsedUserId);

  // Extrae el eventId numérico del key "source-id"
  const parsedEventId =
    selectedEventKey !== ""
      ? Number(selectedEventKey.split("-")[1])
      : null;

  const canAssign = parsedEventId !== null;

  const handleAssign = () => {
    if (!parsedEventId) return;

    // Extrae el source del key "local-5" o "sismaster-200"
    const source = selectedEventKey.split("-")[0] as "local" | "sismaster";

    assignMutation.mutate(
      {
        userId:      parsedUserId,
        eventId:     parsedEventId,
        eventSource: source,                                          
        sportId:     selectedSportId !== "" ? Number(selectedSportId) : undefined,
      },
      {
        onSuccess: () => {
          setSelectedEventKey("");
          setSelectedSportId("");
        },
      }
    );
  };

  // ── Loading skeleton ──
  if (isLoadingUser) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
        <div className="h-8 w-56 bg-slate-100 rounded-lg animate-pulse" />
        <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">

      {/* ── Header ── */}
      <div className="space-y-3">
        <button
          onClick={() => navigate("/admin/operators")}
          className="flex items-center gap-2 text-sm text-slate-500
                     hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Operadores
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {user?.fullName ?? `Operador #${parsedUserId}`}
            </h1>
            <p className="text-sm text-slate-400">
              @{user?.username} · Gestión de permisos
            </p>
          </div>
        </div>
      </div>

      {/* ── Formulario de asignación ── */}
      <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">
            Asignar nuevo permiso
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Selecciona un evento. Opcionalmente restringe a un deporte específico
            o deja en blanco para acceso a todos los deportes del evento.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-end">

          {/* PASO 1 — Evento */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">
              1. Evento <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedEventKey}
              onChange={(e) => {
                setSelectedEventKey(e.target.value);
                setSelectedSportId(""); // reset deporte al cambiar evento
              }}
              disabled={isLoadingEvents}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm
                         bg-white min-w-[260px] focus:outline-none
                         focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                         disabled:opacity-50"
            >
              <option value="">Selecciona un evento</option>

              {localEvents.length > 0 && (
                <optgroup label="── Eventos locales">
                  {localEvents.map((e) => (
                    <option key={`local-${e.eventId}`} value={`local-${e.eventId}`}>
                      {e.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {sismasterEvents.length > 0 && (
                <optgroup label="── Sismaster">
                  {sismasterEvents.map((e) => (
                    <option
                      key={`sismaster-${e.eventId}`}
                      value={`sismaster-${e.eventId}`}
                    >
                      {e.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* PASO 2 — Deporte (bloqueado hasta que haya evento) */}
          <div className="flex flex-col gap-1">
            <label
              className={`text-xs font-medium transition-colors ${
                selectedEventKey !== "" ? "text-slate-600" : "text-slate-300"
              }`}
            >
              2. Deporte{" "}
              <span className="font-normal">(opcional)</span>
            </label>
            <select
              value={selectedSportId}
              onChange={(e) =>
                setSelectedSportId(
                  e.target.value !== "" ? Number(e.target.value) : ""
                )
              }
              disabled={selectedEventKey === ""}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm
                         bg-white min-w-[220px] focus:outline-none
                         focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                         disabled:opacity-40 disabled:cursor-not-allowed
                         disabled:bg-slate-100"
            >
              <option value="">
                {selectedEventKey !== ""
                  ? "Todos los deportes del evento"
                  : "— Primero selecciona un evento —"}
              </option>
              {sports.map((s) => (
                <option key={s.sportId} value={s.sportId}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Botón asignar */}
          <button
            onClick={handleAssign}
            disabled={assignMutation.isPending || !canAssign}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                       rounded-lg text-sm font-medium hover:bg-blue-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            <Plus className="h-4 w-4" />
            {assignMutation.isPending ? "Asignando..." : "Asignar"}
          </button>
        </div>

        {assignMutation.isError && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200
                        rounded-lg px-3 py-2">
            Error al asignar. Puede que ese permiso ya exista.
          </p>
        )}
      </div>

      {/* ── Tabla de permisos activos ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">
          Permisos activos{" "}
          <span className="text-slate-400 font-normal">
            ({permissions.length})
          </span>
        </h2>

        {isLoadingPerms ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : permissions.length === 0 ? (
          <div
            className="text-center py-12 border border-dashed border-slate-200
                        rounded-xl text-slate-400"
          >
            <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Sin permisos asignados</p>
            <p className="text-xs mt-1">
              Este operador no puede acceder a ningún recurso todavía.
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="bg-slate-50 border-b border-slate-200 text-xs
                             font-semibold text-slate-500 uppercase tracking-wide"
                >
                  <th className="px-4 py-3 text-left">Evento</th>
                  <th className="px-4 py-3 text-left">Deporte</th>
                  <th className="px-4 py-3 text-left">Tipo de acceso</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissions.map((perm) => {
                  const label = getPermissionLabel(perm, sports, events);
                  return (
                    <tr
                      key={perm.id}
                      className="bg-white hover:bg-slate-50 transition-colors"
                    >
                      {/* Evento */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-700">
                          {label.eventName}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {label.source === "sismaster" ? "Sismaster" : "Local"}
                        </div>
                      </td>

                      {/* Deporte */}
                      <td className="px-4 py-3 text-slate-600">
                        {label.sportName ?? (
                          <span className="text-slate-300 text-xs italic">
                            Todos los deportes
                          </span>
                        )}
                      </td>

                      {/* Badge tipo de acceso */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full
                                      text-xs font-medium ${label.badgeColor}`}
                        >
                          {label.badge}
                        </span>
                      </td>

                      {/* Revocar */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => removeMutation.mutate(perm.id)}
                          disabled={removeMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5
                                     text-xs font-medium text-red-500
                                     hover:text-red-700 hover:bg-red-50
                                     rounded-lg transition-colors
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Revocar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}