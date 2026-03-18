import { useState } from "react";
import { Plus, Trash2, Trophy, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useChessFullTable, useChessStandings } from "../../api/chess.queries";
import {
  useCreateChessRound,
  useDeleteChessRound,
  useCreateChessMatch,
  useUpdateChessMatch,
  useDeleteChessMatch,
} from "../../api/chess.mutations";
import { ChessMatchModal } from "./ChessMatchModal";
import type {
  ChessFullTable,
  ChessMatch,
  ChessMatchResult,
  ChessParticipant,
} from "../../types/chess.types";

interface ChessRoundsTableProps {
  phaseId: number;
  participants: ChessParticipant[];
}

// ── Resultado inline ──────────────────────────────────────────────────────────

const RESULT_OPTIONS: { value: ChessMatchResult; label: string; color: string }[] = [
  { value: "1-0",   label: "1-0",   color: "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200" },
  { value: "½-½",  label: "½-½",  color: "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200"       },
  { value: "0-1",   label: "0-1",   color: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"              },
];

// ── Sub-componente: fila de match ─────────────────────────────────────────────

function ChessMatchRow({
  match,
  phaseId,
  onDelete,
}: {
  match: ChessMatch;
  phaseId: number;
  onDelete: () => void;
}) {
  const updateMatch = useUpdateChessMatch();

  const handleResult = async (result: ChessMatchResult) => {
    const newResult = match.result === result ? null : result; // toggle off si ya estaba activo
    try {
      await updateMatch.mutateAsync({ id: match.chessMatchId, dto: { result: newResult }, phaseId });
      toast.success(newResult ? `Resultado registrado: ${newResult}` : "Resultado eliminado");
    } catch {
      toast.error("Error al registrar resultado");
    }
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      {/* Tablero */}
      <td className="px-4 py-3 text-center text-sm text-slate-500 w-16">
        {match.boardNumber ?? "—"}
      </td>

      {/* Blancas ♔ */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">♔</span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{match.white.name}</p>
            {match.white.institution && (
              <p className="text-xs text-slate-500">{match.white.institution}</p>
            )}
          </div>
        </div>
      </td>

      {/* Negras ♚ */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">♚</span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{match.black.name}</p>
            {match.black.institution && (
              <p className="text-xs text-slate-500">{match.black.institution}</p>
            )}
          </div>
        </div>
      </td>

      {/* Resultado — botones inline */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {RESULT_OPTIONS.map((opt) => (
            <button
              key={opt.value!}
              onClick={() => handleResult(opt.value)}
              disabled={updateMatch.isPending}
              className={`px-2 py-1 rounded border text-xs font-bold transition-all ${
                match.result === opt.value
                  ? opt.color + " ring-1 ring-offset-1 ring-current scale-105"
                  : "bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </td>

      {/* Eliminar */}
      <td className="px-4 py-3 text-center w-12">
        <button
          onClick={onDelete}
          className="text-slate-300 hover:text-red-500 transition-colors"
          title="Eliminar match"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

// ── Sub-componente: sección de ronda ──────────────────────────────────────────

function ChessRoundSection({
  round,
  phaseId,
  participants,
}: {
  round: ChessFullTable;
  phaseId: number;
  participants: ChessParticipant[];
}) {
  const [expanded, setExpanded] = useState(true);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  const createMatch = useCreateChessMatch();
  const deleteMatch = useDeleteChessMatch();
  const deleteRound = useDeleteChessRound();

  const handleDeleteRound = async () => {
    if (!confirm(`¿Eliminar "${round.name}" y todos sus matches?`)) return;
    try {
      await deleteRound.mutateAsync({ id: round.chessRoundId, phaseId });
      toast.success(`${round.name} eliminada`);
    } catch {
      toast.error("Error al eliminar la ronda");
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    if (!confirm("¿Eliminar este match?")) return;
    try {
      await deleteMatch.mutateAsync({ id: matchId, phaseId });
      toast.success("Match eliminado");
    } catch {
      toast.error("Error al eliminar match");
    }
  };

  const handleCreateMatch = async (dto: any) => {
    try {
      await createMatch.mutateAsync({ dto, phaseId });
      toast.success("Match agregado");
      setIsMatchModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al crear match");
      throw err;
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Header de ronda */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-white" />
            ) : (
              <ChevronRight className="h-4 w-4 text-white" />
            )}
          </div>
          <h4 className="text-sm font-bold text-white">{round.name}</h4>
          <span className="text-xs text-indigo-200">
            {round.matches.length} match{round.matches.length !== 1 ? "es" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setIsMatchModalOpen(true)}
            className="text-white hover:bg-white/20 border-white/30 border text-xs h-7 px-2"
          >
            Match
          </Button>
          <button
            onClick={handleDeleteRound}
            className="w-7 h-7 rounded-lg bg-red-500/70 hover:bg-red-500 flex items-center justify-center text-white transition-colors text-sm"
          >
            ×
          </button>
        </div>
      </div>

      {/* Tabla de matches */}
      {expanded && (
        <>
          {round.matches.length === 0 ? (
            <div className="py-8 text-center bg-slate-50">
              <p className="text-sm text-slate-400">
                No hay matches en esta ronda.{" "}
                <button
                  onClick={() => setIsMatchModalOpen(true)}
                  className="text-indigo-600 underline hover:text-indigo-800"
                >
                  Agregar primero
                </button>
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-2 text-center">Tablero</th>
                    <th className="px-4 py-2 text-left">♔ Blancas</th>
                    <th className="px-4 py-2 text-left">♚ Negras</th>
                    <th className="px-4 py-2 text-left">Resultado</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {round.matches.map((match) => (
                    <ChessMatchRow
                      key={match.chessMatchId}
                      match={match}
                      phaseId={phaseId}
                      onDelete={() => handleDeleteMatch(match.chessMatchId)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal crear match */}
      <ChessMatchModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        chessRoundId={round.chessRoundId}
        roundName={round.name}
        participants={participants}
        isLoading={createMatch.isPending}
        onSubmit={handleCreateMatch}
      />
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ChessRoundsTable({
  phaseId,
  participants,
}: ChessRoundsTableProps) {
  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);
  const [roundName, setRoundName] = useState("");
  const [showStandings, setShowStandings] = useState(false);

  const { data: fullTable = [], isLoading } = useChessFullTable(phaseId);
  const { data: standings = [] } = useChessStandings(phaseId);
  const createRound = useCreateChessRound();

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundName.trim()) return;
    try {
      await createRound.mutateAsync({
        dto: {
          phaseId,
          name: roundName.trim(),
          sortOrder: fullTable.length,
        },
        phaseId,
      });
      toast.success(`${roundName.trim()} creada`);
      setRoundName("");
      setIsRoundModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al crear ronda");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-semibold text-slate-700">
            {fullTable.length} ronda{fullTable.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {standings.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStandings((v) => !v)}
            >
              {showStandings ? "Ocultar Clasificación" : "Ver Clasificación"}
            </Button>
          )}
          <Button
            variant="gradient"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsRoundModalOpen(true)}
          >
            Nueva Ronda
          </Button>
        </div>
      </div>

      {/* Clasificación */}
      {showStandings && standings.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Clasificación General
            </h4>
          </CardHeader>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-2 text-center w-12">#</th>
                  <th className="px-4 py-2 text-left">Jugador</th>
                  <th className="px-4 py-2 text-left">Institución</th>
                  <th className="px-4 py-2 text-center">Partidas</th>
                  <th className="px-4 py-2 text-center font-bold text-indigo-700">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, idx) => (
                  <tr
                    key={s.phaseRegistrationId}
                    className={`border-b border-slate-100 ${idx === 0 ? "bg-amber-50" : ""}`}
                  >
                    <td className="px-4 py-2 text-center">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                    </td>
                    <td className="px-4 py-2 font-semibold text-slate-900">{s.name}</td>
                    <td className="px-4 py-2 text-slate-500">{s.institution}</td>
                    <td className="px-4 py-2 text-center text-slate-600">
                      {s.gamesPlayed}
                    </td>
                    <td className="px-4 py-2 text-center font-bold text-indigo-700">
                      {s.points % 1 === 0 ? s.points : s.points.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {/* Rondas */}
      {fullTable.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No hay rondas"
          description='Crea la primera ronda. Ej: "Rd.1", "Rd.2"'
          action={{
            label: "Crear Primera Ronda",
            onClick: () => setIsRoundModalOpen(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {fullTable.map((round) => (
            <ChessRoundSection
              key={round.chessRoundId}
              round={round}
              phaseId={phaseId}
              participants={participants}
            />
          ))}
        </div>
      )}

      {/* Modal crear ronda */}
      <Modal
        isOpen={isRoundModalOpen}
        onClose={() => setIsRoundModalOpen(false)}
        title="Nueva Ronda"
        size="sm"
      >
        <form onSubmit={handleCreateRound} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre de la ronda
            </label>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder='ej: Rd.1'
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              autoFocus
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Sugerencias: Rd.1 · Rd.2 · Rd.3 · Rd.4 · Final
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setIsRoundModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="gradient"
              size="sm"
              type="submit"
              disabled={!roundName.trim() || createRound.isPending}
            >
              {createRound.isPending ? "Creando..." : "Crear Ronda"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
