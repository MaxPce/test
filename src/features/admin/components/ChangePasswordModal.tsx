// src/features/admin/components/ChangePasswordModal.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Eye, EyeOff, KeyRound } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

interface Props {
  userId: number;
  userName: string;
  onClose: () => void;
}

export function ChangePasswordModal({ userId, userName, onClose }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch(ENDPOINTS.AUTH.USERS.CHANGE_PASSWORD(userId), {
        newPassword: password,
      });
    },
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setLocalError("Las contraseñas no coinciden.");
      return;
    }
    mutation.mutate();
  };

  return (
    // Overlay oscuro
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <KeyRound className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Cambiar contraseña
              </h2>
              <p className="text-xs text-slate-400">@{userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Nueva contraseña */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">
              Nueva contraseña <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full border border-slate-200 rounded-lg px-3 py-2
                           text-sm bg-white pr-10 focus:outline-none focus:ring-2
                           focus:ring-amber-500/30 focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">
              Confirmar contraseña <span className="text-red-400">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repite la contraseña"
              required
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm
                         bg-white focus:outline-none focus:ring-2
                         focus:ring-amber-500/30 focus:border-amber-400"
            />
          </div>

          {/* Errores */}
          {(localError || mutation.isError) && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200
                          rounded-lg px-3 py-2">
              {localError || "Error al cambiar la contraseña. Inténtalo de nuevo."}
            </p>
          )}

          {/* Éxito */}
          {mutation.isSuccess && (
            <p className="text-xs text-green-600 bg-green-50 border border-green-200
                          rounded-lg px-3 py-2">
              ✓ Contraseña actualizada correctamente.
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm
                         font-medium hover:bg-amber-600 disabled:opacity-50
                         disabled:cursor-not-allowed transition-colors"
            >
              {mutation.isPending ? "Guardando..." : "Cambiar contraseña"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 rounded-lg text-sm
                         font-medium hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}