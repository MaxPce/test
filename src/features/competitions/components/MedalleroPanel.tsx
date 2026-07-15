import { Trophy, Medal } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { MedalEntry } from "../hooks/useMedallero";

// ─── Config visual por medalla ────────────────────────────────────────────────

const MEDAL_CONFIG: Record<
  MedalEntry["medal"],
  { label: string; bg: string; text: string; border: string; emoji: string }
> = {
  gold: {
    label: "Oro",
    bg: "bg-gradient-to-br from-yellow-400 to-amber-500",
    text: "text-yellow-900",
    border: "ring-2 ring-yellow-400",
    emoji: "🥇",
  },
  silver: {
    label: "Plata",
    bg: "bg-gradient-to-br from-slate-300 to-slate-400",
    text: "text-slate-900",
    border: "ring-2 ring-slate-400",
    emoji: "🥈",
  },
  bronze: {
    label: "Bronce",
    bg: "bg-gradient-to-br from-amber-600 to-amber-700",
    text: "text-amber-950",
    border: "ring-2 ring-amber-600",
    emoji: "🥉",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface MedalleroPanelProps {
  medals: MedalEntry[];
  /** Título opcional, útil para mostrar la división en pesas */
  title?: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function MedalleroPanel({ medals, title }: MedalleroPanelProps) {
  if (medals.length === 0) return null;

  return (
    <Card variant="elevated" padding="md" className="mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h3 className="text-base font-semibold text-slate-700">
          {title ? `Medallero — ${title}` : "Medallero"}
        </h3>
      </div>

      {/* Medallistas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {medals.map((entry, i) => {
          const cfg = MEDAL_CONFIG[entry.medal];
          return (
            <div
              key={`${entry.medal}-${entry.registrationId}-${i}`}
              className={`flex items-center gap-3 p-3 rounded-xl ${cfg.bg} ${cfg.border}`}
            >
              {/* Emoji medalla */}
              <span className="text-2xl flex-shrink-0" aria-label={cfg.label}>
                {cfg.emoji}
              </span>

              {/* Logo institución */}
              {entry.logoUrl ? (
                <img
                  src={getImageUrl(entry.logoUrl)}
                  alt={entry.institution ?? ""}
                  className="h-9 w-9 rounded-lg object-contain bg-white/80 p-0.5 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="h-9 w-9 rounded-lg bg-white/30 flex items-center justify-center flex-shrink-0">
                  <Medal className="h-4 w-4 text-white/70" />
                </div>
              )}

              {/* Info */}
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${cfg.text}`}>
                  {entry.name}
                </p>
                {entry.institution && (
                  <p className={`text-xs truncate opacity-80 ${cfg.text}`}>
                    {entry.institution}
                  </p>
                )}
                <p className={`text-xs font-semibold opacity-70 ${cfg.text}`}>
                  {cfg.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}