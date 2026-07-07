// src/features/competitions/components/athletics/InstitutionMedalsDrawer.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import type {
  AthleticsCategoryData,
  AthleticsResultEntry,
} from "../../api/athletics-results.queries";

const MEDAL_META: Record<
  number,
  { emoji: string; label: string; bg: string; text: string; border: string }
> = {
  1: { emoji: "🥇", label: "Oro",    bg: "bg-yellow-50",  text: "text-yellow-700", border: "border-yellow-300" },
  2: { emoji: "🥈", label: "Plata",  bg: "bg-slate-50",   text: "text-slate-600",  border: "border-slate-300"  },
  3: { emoji: "🥉", label: "Bronce", bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-300" },
};

interface MedalEntry {
  position: 1 | 2 | 3;
  eventName: string;
  category: string;
  gender: "F" | "M";
  mark: string;
  windSpeed: string | null;
  athleteName: string;
  isRelay: boolean;
  teamMembers: string[];
}

interface Props {
  universityAbrev: string;
  universityName: string;
  data: AthleticsCategoryData[];
  onClose: () => void;
}

function collectMedals(
  universityAbrev: string,
  data: AthleticsCategoryData[],
): MedalEntry[] {
  const medals: MedalEntry[] = [];
  const seen = new Set<string>();

  for (const cat of data) {
    for (const ev of cat.events) {
      const pairs: [AthleticsResultEntry[], "F" | "M"][] = [
        [ev.femaleResults, "F"],
        [ev.maleResults, "M"],
      ];
      for (const [results, gender] of pairs) {
        for (const r of results) {
          if (r.position < 1 || r.position > 3) continue;
          const key = r.universityAbrev || r.university;
          if (key !== universityAbrev) continue;

          // Evitar duplicados (evento mixto aparece en ambas listas)
          const dedupKey = `${cat.category}__${ev.eventName}__${gender}__${r.position}`;
          if (seen.has(dedupKey)) continue;
          seen.add(dedupKey);

          medals.push({
            position:    r.position as 1 | 2 | 3,
            eventName:   ev.eventName,
            category:    cat.category,
            gender,
            mark:        r.mark,
            windSpeed:   r.windSpeed ?? null,
            athleteName: r.athleteName,
            isRelay:     r.isRelay ?? false,
            teamMembers: r.teamMembers ?? [],
          });
        }
      }
    }
  }

  return medals.sort(
    (a, b) =>
      a.position - b.position || a.category.localeCompare(b.category),
  );
}

export function InstitutionMedalsDrawer({
  universityAbrev,
  universityName,
  data,
  onClose,
}: Props) {
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState<0 | 1 | 2 | 3>(0); // 0 = todos
  const inputRef = useRef<HTMLInputElement>(null);

  // ESC cierra
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Auto-focus al buscador
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const allMedals = useMemo(
    () => collectMedals(universityAbrev, data),
    [universityAbrev, data],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allMedals.filter((m) => {
      // Filtro por posición
      if (posFilter !== 0 && m.position !== posFilter) return false;
      // Filtro por búsqueda: nombre de atleta, evento o categoría
      if (!q) return true;
      const inAthlete = m.athleteName.toLowerCase().includes(q);
      const inTeam    = m.teamMembers.some((tm) => tm.toLowerCase().includes(q));
      const inEvent   = m.eventName.toLowerCase().includes(q);
      const inCat     = m.category.toLowerCase().includes(q);
      return inAthlete || inTeam || inEvent || inCat;
    });
  }, [allMedals, search, posFilter]);

  const goldCount   = allMedals.filter((m) => m.position === 1).length;
  const silverCount = allMedals.filter((m) => m.position === 2).length;
  const bronzeCount = allMedals.filter((m) => m.position === 3).length;

  const POS_FILTERS: { value: 0 | 1 | 2 | 3; label: string }[] = [
    { value: 0, label: "Todas" },
    { value: 1, label: "🥇 Oro" },
    { value: 2, label: "🥈 Plata" },
    { value: 3, label: "🥉 Bronce" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal centrado */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-4 flex items-start justify-between shrink-0">
            <div>
              <p className="text-yellow-100 text-xs font-semibold uppercase tracking-widest mb-0.5">
                Detalle de medallas
              </p>
              <h2 className="text-white font-bold text-xl leading-tight">
                {universityName}
              </h2>
              {universityAbrev && universityAbrev !== universityName && (
                <p className="text-yellow-100 text-xs mt-0.5">{universityAbrev}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors rounded-lg p-1.5 hover:bg-white/20"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ── Contadores ──────────────────────────────────────────── */}
          <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 shrink-0">
            {[
              { emoji: "🥇", label: "Oro",    count: goldCount,   color: "text-yellow-600" },
              { emoji: "🥈", label: "Plata",  count: silverCount, color: "text-slate-500"  },
              { emoji: "🥉", label: "Bronce", count: bronzeCount, color: "text-orange-600" },
            ].map(({ emoji, label, count, color }) => (
              <div key={label} className="flex flex-col items-center py-3">
                <span className="text-lg">{emoji}</span>
                <span className={`text-2xl font-black ${color}`}>{count}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* ── Buscador + filtros ───────────────────────────────────── */}
          <div className="px-5 py-3 border-b border-slate-100 shrink-0 space-y-2">
            {/* Input de búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por atleta o categoría…"
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Chips de filtro por medalla */}
            <div className="flex gap-1.5 flex-wrap">
              {POS_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPosFilter(value)}
                  className={[
                    "px-3 py-1 text-xs font-semibold rounded-full border transition-all",
                    posFilter === value
                      ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
              <span className="ml-auto text-xs text-slate-400 self-center">
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* ── Lista de medallas ────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">
                  {search || posFilter !== 0
                    ? "No hay medallas que coincidan con la búsqueda."
                    : "Sin medallas registradas."}
                </p>
                {(search || posFilter !== 0) && (
                  <button
                    onClick={() => { setSearch(""); setPosFilter(0); }}
                    className="mt-2 text-xs text-amber-600 hover:underline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}

            {filtered.map((m, i) => {
              const meta = MEDAL_META[m.position];
              return (
                <div
                  key={i}
                  className={`rounded-xl border ${meta.border} ${meta.bg} p-4 transition-shadow hover:shadow-md`}
                >
                  {/* Fila superior */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{meta.emoji}</span>
                      <div>
                        <p className={`text-[11px] font-bold uppercase tracking-wider ${meta.text}`}>
                          {meta.label}
                        </p>
                        <p className="font-semibold text-slate-800 text-sm leading-tight">
                          {m.eventName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full mb-0.5">
                        {m.category}
                      </span>
                      <p className="text-xs text-slate-400">
                        {m.gender === "F" ? "Damas" : "Varones"}
                      </p>
                    </div>
                  </div>

                  {/* Marca + viento */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-white border border-slate-200 text-slate-700 font-mono font-bold px-2.5 py-0.5 rounded-md">
                      {m.mark}
                    </span>
                    {m.windSpeed && (
                      <span className="text-xs text-slate-400 italic">
                        viento {m.windSpeed} m/s
                      </span>
                    )}
                  </div>

                  {/* Atleta(s) */}
                  {m.isRelay && m.teamMembers.length > 0 ? (
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1.5">
                        Integrantes del equipo
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.teamMembers.map((name, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full"
                          >
                            <span className="text-slate-300 text-[10px]">#{idx + 1}</span>
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 rounded-full bg-slate-200 text-slate-600 text-[11px] font-bold items-center justify-center shrink-0">
                        {m.athleteName.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {m.athleteName}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <div className="border-t border-slate-100 px-6 py-3 shrink-0 bg-slate-50">
            <p className="text-xs text-slate-400 text-center">
              {allMedals.length} medalla{allMedals.length !== 1 ? "s" : ""} en total ·{" "}
              {goldCount}🥇 {silverCount}🥈 {bronzeCount}🥉 · ESC para cerrar
            </p>
          </div>

        </div>
      </div>
    </>
  );
}