// src/pages/events/EventSportCategoriesPage.tsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trophy, Users, LayoutGrid, BarChart2, Medal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { useEventCategories, useSismasterEventCategories } from "../api/eventCategories.queries";
import { getImageUrl } from "@/lib/utils/imageUrl";
import { ScoreTables } from "../../competitions/components/score-tables/ScoreTables";
import { JudoMedalTable } from "../../competitions/components/judo/JudoMedalTable";
import { SwimmingMedalTable } from "../../results/components/SwimmingMedalTable";
import { WrestlingMedalTable } from "../../competitions/components/wrestling/WrestlingMedalTable";
import { AthleticsMedalTable } from "../../competitions/components/athletics/AthleticsMedalTable";
import { AthleticsRankingsTable } from "../../competitions/components/athletics/AthleticsRankingsTable";

// ─── ID local del deporte Judo en tu tabla `sports` ─────────────────────────
const JUDO_SPORT_ID = 4; 
const SWIMMING_SPORT_ID = 9;
const WRESTLING_SPORT_ID = 6;
const ATHLETICS_SPORT_ID = 7;
// ─── Tipos de vista ──────────────────────────────────────────────────────────
type ActiveView = "categories" | "scores" | "medals" | "rankings";

// ─── Página principal ────────────────────────────────────────────────────────
export function EventSportCategoriesPage() {
  const { eventId, externalEventId, sportId } = useParams<{
    eventId?: string;
    externalEventId?: string;
    sportId: string;
  }>();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<ActiveView>("categories");

  const eventIdNum          = eventId         ? Number(eventId)         : undefined;
  const externalEventIdNum  = externalEventId ? Number(externalEventId) : undefined;
  const sportIdNum          = Number(sportId);
  const isExternalEvent     = !!externalEventId;

  const isJudo = sportIdNum === JUDO_SPORT_ID;
  const isSwimming = sportIdNum === SWIMMING_SPORT_ID;
  const isWrestling = sportIdNum === WRESTLING_SPORT_ID;
  const isAthletics = sportIdNum === ATHLETICS_SPORT_ID;
  const { data: localEventCategories = [], isLoading: localLoading } = useEventCategories(
    { eventId: eventIdNum },
    { enabled: !isExternalEvent && !!eventIdNum }
  );

  const { data: externalEventCategories = [], isLoading: externalLoading } =
    useSismasterEventCategories(externalEventIdNum);

  const eventCategories = isExternalEvent ? externalEventCategories : localEventCategories;
  const isLoading       = isExternalEvent ? externalLoading : localLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando categorías..." />
      </div>
    );
  }

  const sportCategories = eventCategories.filter(
    (ec) => ec.category?.sport?.sportId === sportIdNum
  );

  const sportName    = sportCategories[0]?.category?.sport?.name || "Deporte";
  const sportIconUrl = sportCategories[0]?.category?.sport?.iconUrl;
  const sportImage   = sportIconUrl ? getImageUrl(sportIconUrl) : null;

  const totalParticipants = sportCategories.reduce(
    (sum, ec) => sum + (ec.registrations?.length || 0),
    0
  );

  const backPath = isExternalEvent
    ? `/admin/sismaster-events/${externalEventId}/sports`
    : `/admin/events/${eventId}/sports`;

  const getCategoryDetailPath = (eventCategoryId: number) =>
    isExternalEvent
      ? `/admin/sismaster-events/${externalEventId}/sports/${sportId}/categories/${eventCategoryId}`
      : `/admin/events/${eventId}/sports/${sportId}/categories/${eventCategoryId}`;

  const addCategoryPath = isExternalEvent
    ? `/admin/sismaster-events/${externalEventId}/sports/${sportId}/categories/add`
    : `/admin/events/${eventId}/sports/${sportId}/categories/add`;

  // ── Tabs dinámicos según deporte ────────────────────────────────────────────
  // El tab de resultados cambia su label/icono/key según el deporte
  // ── Tabs dinámicos según deporte ────────────────────────────────────────────
  const VIEW_TABS: { key: ActiveView; label: string; icon: React.ReactNode }[] = [
    {
      key: "categories",
      label: "Categorías",
      icon: <LayoutGrid className="h-4 w-4" />,
    },
    isJudo || isSwimming || isWrestling || isAthletics
      ? {
          key: "medals",
          label: isWrestling ? "Puntajes" : "Medallero",
          icon: <Medal className="h-4 w-4" />,
        }
      : {
          key: "scores",
          label: "Puntajes",
          icon: <BarChart2 className="h-4 w-4" />,
        },
    // ── Tab Rankings solo para atletismo ──
    ...(isAthletics
      ? [
          {
            key: "rankings" as ActiveView,
            label: "Rankings",
            icon: <Trophy className="h-4 w-4" />,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <PageHeader
        title={`Categorías de ${sportName}${isExternalEvent ? " (Sisdeu)" : ""}`}
        showBack
        onBack={() => navigate(backPath)}
      />

      {/* Header del deporte */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-slate-50 flex items-center justify-center flex-shrink-0">
            {sportImage ? (
              <img
                src={sportImage}
                alt={sportName}
                className="w-full h-full object-contain p-3"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <Trophy className="h-10 w-10 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{sportName}</h2>
            <p className="text-slate-600">
              {sportCategories.length}{" "}
              {sportCategories.length === 1 ? "categoría" : "categorías"} •{" "}
              {totalParticipants}{" "}
              {totalParticipants === 1 ? "participante" : "participantes"}
            </p>
          </div>
        </div>
      </Card>

      {/* ── Switcher de vista ── */}
      <div
        role="tablist"
        aria-label="Cambiar vista"
        className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 w-fit"
      >
        {VIEW_TABS.map(({ key, label, icon }) => {
          const isActive = activeView === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveView(key)}
              className={[
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
              ].join(" ")}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Vista: Categorías ── */}
      {activeView === "categories" && (
        <>
          {sportCategories.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No hay categorías configuradas"
              description={`Agrega la primera categoría para ${sportName} en este evento`}
              action={{
                label: "Agregar Primera Categoría",
                onClick: () => navigate(addCategoryPath),
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sportCategories.map((eventCategory) => {
                const isTeam           = eventCategory.category?.type === "equipo";
                const participantsCount = eventCategory.registrations?.length || 0;

                return (
                  <Card
                    key={eventCategory.eventCategoryId}
                    hover
                    variant="elevated"
                    padding="none"
                    onClick={() => navigate(getCategoryDetailPath(eventCategory.eventCategoryId))}
                    className="group cursor-pointer overflow-hidden"
                  >
                    <div className="p-5 pb-3 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                          {eventCategory.category?.name || "Sin nombre"}
                        </h3>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            {isTeam
                              ? <Users className="h-4 w-4 text-blue-600" />
                              : <Trophy className="h-4 w-4 text-blue-600" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium">Formato</p>
                            <p className="text-sm text-slate-900 font-semibold">
                              {isTeam ? "Equipo" : "Individual"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 font-medium">Participantes</p>
                            <p className="text-sm text-slate-900 font-semibold">
                              {participantsCount}{" "}
                              {participantsCount === 1 ? "inscrito" : "inscritos"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Card>
                );
              })}
            </div>
          )}

          {sportCategories.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={() => navigate(addCategoryPath)}
                variant="gradient"
                size="lg"
                icon={<Plus className="h-5 w-5" />}
              >
                Agregar Categoría
              </Button>
            </div>
          )}
        </>
      )}

      {/* ── Vista: Puntajes (atletismo y otros deportes con score_table) ── */}
      {activeView === "scores" && externalEventIdNum && sportId && (
        <ScoreTables
          externalEventId={externalEventIdNum}
          localSportId={sportIdNum}
        />
      )}

      {/* ── Vista: Medallero / Puntajes (judo / natación / lucha) ── */}
      {activeView === "medals" && externalEventIdNum && sportId && (
        isJudo ? (
          <JudoMedalTable
            externalEventId={externalEventIdNum}
            localSportId={sportIdNum}
            eventName={sportName}
          />
        ) : isSwimming ? (
          <SwimmingMedalTable
            externalEventId={externalEventIdNum}
            localSportId={sportIdNum}
          />
        ) : isWrestling ? (
          <WrestlingMedalTable
            externalEventId={externalEventIdNum}
            localSportId={sportIdNum}
          />
        ) : isAthletics ? (                          
          <AthleticsMedalTable                       
            externalEventId={externalEventIdNum}     
            localSportId={sportIdNum}        
            eventName={sportName}       
          /> 
        ) : null
      )}

      {/* ── Vista: Rankings de puntajes (solo atletismo) ── */}
      {activeView === "rankings" && isAthletics && externalEventIdNum && (
        <AthleticsRankingsTable
          externalEventId={externalEventIdNum}
          localSportId={sportIdNum}
        />
      )}
    </div>
  );
}