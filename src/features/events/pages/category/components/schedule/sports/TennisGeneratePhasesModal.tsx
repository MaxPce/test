import React from 'react';
import { X, GitBranch, Users } from 'lucide-react';

interface TennisGeneratePhasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mode: 'with_matches' | 'phases_only') => void;
  assignedCount: number;
  isLoading?: boolean;
}

export const TennisGeneratePhasesModal: React.FC<TennisGeneratePhasesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  assignedCount,
  isLoading = false,
}) => {
  const [selectedMode, setSelectedMode] = React.useState<'with_matches' | 'phases_only' | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Generar Fases</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {assignedCount} atleta{assignedCount !== 1 ? 's' : ''} asignado{assignedCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Elige cómo quieres generar las fases para esta categoría de Tennis:
          </p>

          {/* Opción 1: Con matches */}
          <button
            onClick={() => setSelectedMode('with_matches')}
            className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
              selectedMode === 'with_matches'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg mt-0.5 ${
                selectedMode === 'with_matches' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <GitBranch size={18} className={
                  selectedMode === 'with_matches' ? 'text-blue-600' : 'text-gray-500'
                } />
              </div>
              <div>
                <p className={`font-medium text-sm ${
                  selectedMode === 'with_matches' ? 'text-blue-900' : 'text-gray-800'
                }`}>
                  Generar fases con matches
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Genera las fases de eliminación y crea automáticamente todos los matches con los atletas asignados. Flujo completo listo para iniciar.
                </p>
              </div>
              <div className="ml-auto flex-shrink-0 mt-1">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMode === 'with_matches'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedMode === 'with_matches' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Opción 2: Solo fases */}
          <button
            onClick={() => setSelectedMode('phases_only')}
            className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
              selectedMode === 'phases_only'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg mt-0.5 ${
                selectedMode === 'phases_only' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Users size={18} className={
                  selectedMode === 'phases_only' ? 'text-green-600' : 'text-gray-500'
                } />
              </div>
              <div>
                <p className={`font-medium text-sm ${
                  selectedMode === 'phases_only' ? 'text-green-900' : 'text-gray-800'
                }`}>
                  Generar solo fases con atletas
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Crea las fases con los atletas ya asignados, sin generar matches todavía. Puedes abrir cada fase y continuar el flujo manualmente (grupos, clasificación, etc.).
                </p>
              </div>
              <div className="ml-auto flex-shrink-0 mt-1">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMode === 'phases_only'
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300'
                }`}>
                  {selectedMode === 'phases_only' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => selectedMode && onConfirm(selectedMode)}
            disabled={!selectedMode || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generando...
              </>
            ) : (
              'Confirmar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};