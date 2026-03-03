import { useState } from 'react';
import { useSportCategories }    from '../hooks/useSportCategories';
import { useAthletesByCategory } from '../hooks/useAthletesByCategory';
import type { AthleteSismaster, SportParam } from '../types/sismaster.types';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  localSportId:     number;
  sismasterEventId: number;
  sportName:        string;
  onAthletesReady?: (athletes: AthleteSismaster[], category: SportParam) => void;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function CategoryAthleteSelector({
  localSportId,       // ← corregido: era sismasterSportId en el destructuring
  sismasterEventId,
  sportName,
  onAthletesReady,
}: Props) {
  const [selectedIdparam, setSelectedIdparam] = useState<number | null>(null);
  const [selectedSet,     setSelectedSet]     = useState<Set<number>>(new Set());

  // ── Data fetching ──────────────────────────────────────────────────────────
  const {
    data:    categories,
    isLoading: loadingCats,
    isError:   errorCats,
  } = useSportCategories(localSportId, sismasterEventId);

  const {
    data:      athletes,
    isLoading: loadingAthletes,
    isFetching: fetchingAthletes,
    isError:   errorAthletes,
  } = useAthletesByCategory(sismasterEventId, localSportId, selectedIdparam);

  // ── Estado derivado ────────────────────────────────────────────────────────
  const selectedCategory = categories?.find((c) => c.idparam === selectedIdparam) ?? null;
  const allSelected      = !!athletes?.length && selectedSet.size === athletes.length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value ? Number(e.target.value) : null;
    setSelectedIdparam(val);
    setSelectedSet(new Set());
  }

  function toggleAthlete(idperson: number) {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      next.has(idperson) ? next.delete(idperson) : next.add(idperson);
      return next;
    });
  }

  function handleToggleAll() {
    if (!athletes) return;
    setSelectedSet(
      allSelected ? new Set() : new Set(athletes.map((a) => a.idperson)),
    );
  }

  function handleConfirm() {
    if (!athletes || !selectedCategory || !onAthletesReady) return;
    const chosen = athletes.filter((a) => selectedSet.has(a.idperson));
    onAthletesReady(chosen, selectedCategory);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{sportName}</h2>
        {selectedCategory && athletes && !loadingAthletes && (
          <span className="text-sm text-slate-500">
            {athletes.length} atleta{athletes.length !== 1 ? 's' : ''} •{' '}
            <span className="font-medium text-slate-700">{selectedCategory.name}</span>
          </span>
        )}
      </div>

      {/* ── Selector de categoría ── */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Categoría / División
        </label>

        {loadingCats ? (
          <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
        ) : errorCats ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">
              Error al cargar categorías desde Sismaster. Verifica la conexión.
            </p>
          </div>
        ) : !categories?.length ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-500">
              Sin categorías disponibles para este evento y deporte.
            </p>
          </div>
        ) : (
          <select
            value={selectedIdparam ?? ''}
            onChange={handleCategoryChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5
                       text-sm text-slate-900
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-colors"
          >
            <option value="">— Seleccionar categoría —</option>
            {categories.map((cat) => (
              <option key={cat.idparam} value={cat.idparam}>
                {cat.name} · {cat.athleteCount}{' '}
                {cat.athleteCount === 1 ? 'atleta' : 'atletas'}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Tabla de atletas ── */}
      {selectedIdparam && (
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">

          {/* Estado: cargando */}
          {loadingAthletes && (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <span className="text-sm">Cargando atletas desde Sismaster…</span>
            </div>
          )}

          {/* Estado: error */}
          {!loadingAthletes && errorAthletes && (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-red-600">
                Error al obtener atletas.
              </p>
              <p className="mt-1 text-xs text-red-400">
                Verifica la conexión con Sismaster e intenta de nuevo.
              </p>
            </div>
          )}

          {/* Estado: sin atletas */}
          {!loadingAthletes && !errorAthletes && athletes?.length === 0 && (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-slate-500">
                No hay atletas inscritos en esta categoría.
              </p>
            </div>
          )}

          {/* Estado: con atletas ── */}
          {!loadingAthletes && !errorAthletes && !!athletes?.length && (
            <>
              {/* Sub-header ── */}
              <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                {onAthletesReady && (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleToggleAll}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600
                               focus:ring-blue-500 cursor-pointer"
                  />
                )}

                <span className="text-sm text-slate-600">
                  {selectedSet.size > 0
                    ? `${selectedSet.size} seleccionado${selectedSet.size !== 1 ? 's' : ''} de ${athletes.length}`
                    : `${athletes.length} atleta${athletes.length !== 1 ? 's' : ''}`}
                </span>

                {/* Indicador de refetch en background */}
                {fetchingAthletes && !loadingAthletes && (
                  <span className="text-xs text-slate-400 animate-pulse">
                    actualizando…
                  </span>
                )}

                {/* Botón confirmar */}
                {onAthletesReady && selectedSet.size > 0 && (
                  <button
                    onClick={handleConfirm}
                    className="ml-auto rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium
                               text-white hover:bg-blue-700 active:bg-blue-800
                               transition-colors shadow-sm"
                  >
                    Generar bracket ({selectedSet.size})
                  </button>
                )}
              </div>

              {/* Tabla ── */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      {onAthletesReady && (
                        <th className="w-10 px-4 py-3" />
                      )}
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Atleta
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Institución
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Categoría inscrita
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Género
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Edad
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {athletes.map((athlete) => {
                      const isSelected = selectedSet.has(athlete.idperson);
                      return (
                        <tr
                          key={`${athlete.idperson}-${athlete.idacreditation}`}
                          onClick={() =>
                            onAthletesReady && toggleAthlete(athlete.idperson)
                          }
                          className={[
                            'transition-colors',
                            onAthletesReady ? 'cursor-pointer' : '',
                            isSelected
                              ? 'bg-blue-50 hover:bg-blue-100'
                              : 'hover:bg-slate-50',
                          ].join(' ')}
                        >
                          {/* Checkbox */}
                          {onAthletesReady && (
                            <td
                              className="px-4 py-3 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleAthlete(athlete.idperson)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600
                                           focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                          )}

                          {/* Atleta: avatar + nombre + DNI */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <AthleteAvatar athlete={athlete} />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-900 leading-tight">
                                  {athlete.fullName}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {athlete.docnumber}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Institución: logo + nombre */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <InstitutionLogo athlete={athlete} />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-800 leading-tight">
                                  {athlete.institutionAbrev}
                                </p>
                                <p className="truncate text-xs text-slate-400 leading-tight">
                                  {athlete.institutionName}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Categoría inscrita */}
                          <td className="px-4 py-3 text-slate-700">
                            {athlete.division_inscrita}
                          </td>

                          {/* Género */}
                          <td className="px-4 py-3 text-center">
                            <GenderBadge
                              gender={athlete.gender}
                              text={athlete.gender_text}
                            />
                          </td>

                          {/* Edad */}
                          <td className="px-4 py-3 text-center text-slate-700">
                            {athlete.age ?? '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function AthleteAvatar({ athlete }: { athlete: AthleteSismaster }) {
  if (athlete.photo) {
    return (
      <img
        src={athlete.photo}
        alt={athlete.fullName}
        className="h-9 w-9 flex-shrink-0 rounded-full object-cover ring-1 ring-slate-200"
        onError={(e) => {
          // Fallback a iniciales si la foto falla
          const el = e.currentTarget as HTMLImageElement;
          el.style.display = 'none';
          const parent = el.parentElement;
          if (parent) {
            const fallback = document.createElement('div');
            const initials = [athlete.firstname?.[0], athlete.lastname?.[0]]
              .filter(Boolean)
              .join('')
              .toUpperCase();
            fallback.className =
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600';
            fallback.textContent = initials;
            parent.prepend(fallback);
          }
        }}
      />
    );
  }

  const initials = [athlete.firstname?.[0], athlete.lastname?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return (
    <div
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center
                 rounded-full bg-slate-200 text-xs font-semibold text-slate-600"
    >
      {initials || '?'}
    </div>
  );
}

function InstitutionLogo({ athlete }: { athlete: AthleteSismaster }) {
  if (!athlete.institutionLogo) return null;
  return (
    <img
      src={athlete.institutionLogo}
      alt={athlete.institutionAbrev}
      className="h-7 w-7 flex-shrink-0 rounded object-contain"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

function GenderBadge({ gender, text }: { gender: string; text: string }) {
  const cls =
    gender === 'M'
      ? 'bg-blue-100 text-blue-700'
      : gender === 'F'
        ? 'bg-pink-100 text-pink-700'
        : 'bg-slate-100 text-slate-500';
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {text}
    </span>
  );
}
