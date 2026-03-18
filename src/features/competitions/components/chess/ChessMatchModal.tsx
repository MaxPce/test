import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { ChessParticipant, CreateChessMatchDto } from "../../types/chess.types";

interface ChessMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  chessRoundId: number;
  roundName: string;
  participants: ChessParticipant[];
  isLoading: boolean;
  onSubmit: (dto: CreateChessMatchDto) => Promise<void>;
}

export function ChessMatchModal({
  isOpen,
  onClose,
  chessRoundId,
  roundName,
  participants,
  isLoading,
  onSubmit,
}: ChessMatchModalProps) {
  const [whiteId, setWhiteId] = useState<number | "">("");
  const [blackId, setBlackId] = useState<number | "">("");
  const [boardNumber, setBoardNumber] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whiteId || !blackId) return;
    if (whiteId === blackId) {
      alert("El jugador de blancas y negras no pueden ser el mismo.");
      return;
    }
    await onSubmit({
      chessRoundId,
      whitePhaseRegistrationId: whiteId as number,
      blackPhaseRegistrationId: blackId as number,
      boardNumber: boardNumber ? Number(boardNumber) : undefined,
    });
    setWhiteId("");
    setBlackId("");
    setBoardNumber("");
    onClose();
  };

  const selectClass =
    "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Agregar Match — ${roundName}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Jugador Blancas */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            ♔ Jugador Blancas
          </label>
          <select
            className={selectClass}
            value={whiteId}
            onChange={(e) => setWhiteId(Number(e.target.value) || "")}
            required
          >
            <option value="">— Seleccionar —</option>
            {participants.map((p) => (
              <option
                key={p.phaseRegistrationId}
                value={p.phaseRegistrationId}
                disabled={p.phaseRegistrationId === (blackId as number)}
              >
                {p.athleteName}
                {p.institutionName ? ` · ${p.institutionName}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Jugador Negras */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            ♚ Jugador Negras
          </label>
          <select
            className={selectClass}
            value={blackId}
            onChange={(e) => setBlackId(Number(e.target.value) || "")}
            required
          >
            <option value="">— Seleccionar —</option>
            {participants.map((p) => (
              <option
                key={p.phaseRegistrationId}
                value={p.phaseRegistrationId}
                disabled={p.phaseRegistrationId === (whiteId as number)}
              >
                {p.athleteName}
                {p.institutionName ? ` · ${p.institutionName}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Tablero (opcional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tablero N° <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <input
            type="number"
            min={1}
            className={selectClass}
            value={boardNumber}
            onChange={(e) => setBoardNumber(e.target.value)}
            placeholder="ej: 1"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="gradient"
            size="sm"
            type="submit"
            disabled={!whiteId || !blackId || isLoading}
          >
            {isLoading ? "Guardando..." : "Agregar Match"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
