import { useParams, useNavigate } from 'react-router-dom';
import { useSports } from '@/features/sports/api/sports.queries';
import { CategoryAthleteSelector } from '@/features/competitions/components/CategoryAthleteSelector';
import { PageHeader }   from '@/components/PageHeader';
import { Spinner }      from '@/components/ui/Spinner';
import { EmptyState }   from '@/components/ui/EmptyState';
import { Trophy }       from 'lucide-react';
import type { AthleteSismaster, SportParam } from '@/features/competitions/types/sismaster.types';

/**
 * Ruta: /admin/sismaster-events/:externalEventId/sports/:sportId
 *
 * Flujo completo:
 *  1. Carga el deporte local por sportId (para obtener el nombre)
 *  2. CategoryAthleteSelector consulta Sismaster para las categorías disponibles
 *  3. El usuario elige categoría → se listan sus atletas
 *  4. El usuario selecciona atletas → onAthletesReady para generar bracket
 */
export function SismasterSportDetailPage() {
  const { externalEventId, sportId } = useParams<{
    externalEventId: string;
    sportId:         string;
  }>();
  const navigate = useNavigate();

  const sismasterEventId = externalEventId ? Number(externalEventId) : null;
  const localSportId     = sportId         ? Number(sportId)         : null;

  // Obtener el nombre del deporte desde la BD local
  const { data: sports = [], isLoading: sportsLoading } = useSports();
  const sport = sports.find((s) => s.sportId === localSportId);

  const backPath = `/admin/sismaster-events/${externalEventId}/sports`;

  // ── Manejo de errores de parámetros ─────────────────────────────────────────
  if (!sismasterEventId || !localSportId || isNaN(sismasterEventId) || isNaN(localSportId)) {
    return (
      <EmptyState
        icon={Trophy}
        title="Parámetros inválidos"
        description="Los IDs del evento o del deporte no son válidos."
        action={{ label: 'Volver', onClick: () => navigate(backPath) }}
      />
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (sportsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" label="Cargando deporte..." />
      </div>
    );
  }

  // ── Deporte no encontrado en BD local ────────────────────────────────────────
  if (!sport) {
    return (
      <EmptyState
        icon={Trophy}
        title="Deporte no encontrado"
        description={`No se encontró el deporte #${localSportId} en el sistema.`}
        action={{ label: 'Volver a deportes', onClick: () => navigate(backPath) }}
      />
    );
  }

  // ── Callback al confirmar atletas ────────────────────────────────────────────
  function handleAthletesReady(athletes: AthleteSismaster[], category: SportParam) {
    console.log(
      `[SismasterSportDetail] ${athletes.length} atleta(s) seleccionados` +
      ` en "${category.name}" para sport_id=${localSportId}`,
    );
    // TODO: aquí conectarás con tu lógica de generación de brackets/formatos
    // Ejemplo futuro:
    // navigate(`/admin/sismaster-events/${externalEventId}/sports/${sportId}/bracket`, {
    //   state: { athletes, category },
    // });
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title={sport.name}
        showBack
        onBack={() => navigate(backPath)}
      />

      <CategoryAthleteSelector
        localSportId={localSportId}
        sismasterEventId={sismasterEventId}
        sportName={sport.name}
        onAthletesReady={handleAthletesReady}
      />
    </div>
  );
}
