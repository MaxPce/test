import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AlertCircle, Trophy, XCircle } from "lucide-react";

interface WalkoverDialogProps {
  participant1Name: string;
  participant2Name: string;
  participant1RegistrationId: number;
  participant2RegistrationId: number;
  onConfirm: (winnerRegistrationId: number, reason: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WalkoverDialog({
  participant1Name,
  participant2Name,
  participant1RegistrationId,
  participant2RegistrationId,
  onConfirm,
  onCancel,
  isLoading = false,
}: WalkoverDialogProps) {
  const [selectedWinner, setSelectedWinner] = useState<number | null>(null);
  const [reason, setReason] = useState("Equipo contrario no se presentó");

  const handleConfirm = () => {
    if (!selectedWinner) {
      alert("Por favor selecciona un ganador");
      return;
    }

    if (!reason.trim()) {
      alert("Por favor ingresa una razón para el walkover");
      return;
    }

    onConfirm(selectedWinner, reason);
  };

  const predefinedReasons = [
    "Equipo contrario no se presentó",
    "Equipo contrario se retiró",
    "Equipo contrario fue descalificado",
    "No cumplió requisitos de participación",
    "Otra razón",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Marcar Match como Walkover
              </h2>
              
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-6 space-y-6">
          {/* Selección de ganador */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Selecciona al ganador del match
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Participante 1 */}
              <button
                type="button"
                onClick={() => setSelectedWinner(participant1RegistrationId)}
                disabled={isLoading}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    selectedWinner === participant1RegistrationId
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  
                  
                </div>
                <p className="font-semibold text-gray-900 text-left">
                  {participant1Name}
                </p>
              </button>

              {/* Participante 2 */}
              <button
                type="button"
                onClick={() => setSelectedWinner(participant2RegistrationId)}
                disabled={isLoading}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    selectedWinner === participant2RegistrationId
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  
                  
                </div>
                <p className="font-semibold text-gray-900 text-left">
                  {participant2Name}
                </p>
              </button>
            </div>
          </div>

          {/* Razón del walkover */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Razón del walkover
            </label>
            <div className="space-y-2 mb-3">
              {predefinedReasons.map((preReason) => (
                <button
                  key={preReason}
                  type="button"
                  onClick={() => setReason(preReason)}
                  disabled={isLoading}
                  className={`
                    w-full text-left px-3 py-2 rounded border text-sm transition-colors
                    ${
                      reason === preReason
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                    }
                    ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {preReason}
                </button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              placeholder="Escribe una razón personalizada..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          
        </CardBody>

        {/* Footer con botones */}
        <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <Button
            onClick={onCancel}
            variant="ghost"
            disabled={isLoading}
          >

            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            variant="default"
            isLoading={isLoading}
            disabled={!selectedWinner || !reason.trim()}
          >
            
            Confirmar Walkover
          </Button>
        </div>
      </Card>
    </div>
  );
}
