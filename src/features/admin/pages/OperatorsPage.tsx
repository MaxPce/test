// src/features/admin/pages/OperatorsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Settings, Plus, X, Eye, EyeOff } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { User } from "@/app/store/useAuthStore";

// ─── Hooks ────────────────────────────────────────────────────────────────────

const useOperators = () =>
  useQuery({
    queryKey: ["users", "operators"],
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>(
        `${ENDPOINTS.AUTH.USERS.LIST}?role=operator`
      );
      return data;
    },
  });

const useCreateOperator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      username: string;
      password: string;
      fullName: string;
      email: string;
    }) => {
      const { data } = await apiClient.post(ENDPOINTS.AUTH.REGISTER, {
        ...payload,
        role: "operator",
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "operators"] });
    },
  });
};

// ─── Formulario de creación ───────────────────────────────────────────────────

function CreateOperatorForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const mutation = useCreateOperator();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form, { onSuccess: onClose });
  };

  const field = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="border border-blue-200 rounded-xl bg-blue-50/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Nuevo operador</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Nombre completo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">
              Nombre completo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => field("fullName", e.target.value)}
              placeholder="Juan Pérez"
              required
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm
                         bg-white focus:outline-none focus:ring-2
                         focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">
              Usuario <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => field("username", e.target.value)}
              placeholder="jperez"
              required
              minLength={4}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm
                         bg-white focus:outline-none focus:ring-2
                         focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => field("email", e.target.value)}
            placeholder="jperez@ejemplo.com"
            required
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm
                       bg-white focus:outline-none focus:ring-2
                       focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Contraseña <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => field("password", e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="w-full border border-slate-200 rounded-lg px-3 py-2
                         text-sm bg-white pr-10 focus:outline-none focus:ring-2
                         focus:ring-blue-500/30 focus:border-blue-400"
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

        {/* Error */}
        {mutation.isError && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200
                        rounded-lg px-3 py-2">
            Error al crear el operador. El usuario o email puede ya existir.
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm
                       font-medium hover:bg-blue-700 disabled:opacity-50
                       disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? "Creando..." : "Crear operador"}
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
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function OperatorsPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const { data: operators = [], isLoading } = useOperators();

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Operadores</h1>
            <p className="text-sm text-slate-400">
              Crea operadores y gestiona sus permisos de acceso
            </p>
          </div>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600
                       text-white rounded-lg text-sm font-medium
                       hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo operador
          </button>
        )}
      </div>

      {/* Formulario inline */}
      {showForm && (
        <CreateOperatorForm onClose={() => setShowForm(false)} />
      )}

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : operators.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border border-dashed
                        border-slate-200 rounded-xl">
          <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay operadores registrados</p>
          <p className="text-sm mt-1">
            Crea el primer operador con el botón de arriba
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {operators.map((op) => (
            <div
              key={op.userId}
              className="flex items-center justify-between px-4 py-4
                         border border-slate-200 rounded-xl bg-white
                         hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div>
                <p className="font-semibold text-slate-800">{op.fullName}</p>
                <p className="text-sm text-slate-400">@{op.username}</p>
              </div>

              <button
                onClick={() =>
                  navigate(`/admin/operators/${op.userId}/permissions`)
                }
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                           bg-blue-50 text-blue-600 hover:bg-blue-100
                           text-sm font-medium transition-colors"
              >
                <Settings className="h-4 w-4" />
                Gestionar permisos
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}