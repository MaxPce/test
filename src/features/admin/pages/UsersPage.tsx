// src/features/admin/pages/UsersPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  Plus,
  X,
  Eye,
  EyeOff,
  KeyRound,
  Settings,
  Users,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { User } from "@/app/store/useAuthStore";
import { ChangePasswordModal } from "@/features/admin/components/ChangePasswordModal";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TabRole = "operator" | "admin" | "deleted";

// ─── Hooks ────────────────────────────────────────────────────────────────────

const useUsersByRole = (role: "operator" | "admin") =>
  useQuery({
    queryKey: ["users", role],
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>(
        `${ENDPOINTS.AUTH.USERS.LIST}?role=${role}`
      );
      return data;
    },
  });

const useDeletedUsers = () =>
  useQuery({
    queryKey: ["users", "deleted"],
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>(
        ENDPOINTS.AUTH.USERS.DELETED
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
      queryClient.invalidateQueries({ queryKey: ["users", "operator"] });
    },
  });
};

const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      username: string;
      password: string;
      fullName: string;
      email: string;
    }) => {
      const { data } = await apiClient.post(ENDPOINTS.AUTH.ADMINS.CREATE, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
    },
  });
};

const useDeleteUser = (role: "operator" | "admin") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      await apiClient.delete(ENDPOINTS.AUTH.USERS.DETAIL(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", role] });
      queryClient.invalidateQueries({ queryKey: ["users", "deleted"] });
    },
  });
};

const useRestoreUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      await apiClient.patch(ENDPOINTS.AUTH.USERS.RESTORE(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// ─── Formulario genérico de creación ─────────────────────────────────────────

interface CreateUserFormProps {
  role: "operator" | "admin";
  onClose: () => void;
}

function CreateUserForm({ role, onClose }: CreateUserFormProps) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const createOperator = useCreateOperator();
  const createAdmin    = useCreateAdmin();
  const mutation       = role === "operator" ? createOperator : createAdmin;

  const isOperator = role === "operator";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form, { onSuccess: onClose });
  };

  const field = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const ringClass   = isOperator
    ? "focus:ring-blue-500/30 focus:border-blue-400"
    : "focus:ring-purple-500/30 focus:border-purple-400";
  const borderClass = isOperator
    ? "border-blue-200 bg-blue-50/50"
    : "border-purple-200 bg-purple-50/50";
  const btnClass    = isOperator
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-purple-600 hover:bg-purple-700";

  return (
    <div className={`border ${borderClass} rounded-xl p-5 space-y-4`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          {isOperator ? "Nuevo operador" : "Nuevo administrador"}
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              className={`border border-slate-200 rounded-lg px-3 py-2 text-sm
                         bg-white focus:outline-none focus:ring-2 ${ringClass}`}
            />
          </div>

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
              className={`border border-slate-200 rounded-lg px-3 py-2 text-sm
                         bg-white focus:outline-none focus:ring-2 ${ringClass}`}
            />
          </div>
        </div>

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
            className={`border border-slate-200 rounded-lg px-3 py-2 text-sm
                       bg-white focus:outline-none focus:ring-2 ${ringClass}`}
          />
        </div>

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
              className={`w-full border border-slate-200 rounded-lg px-3 py-2
                         text-sm bg-white pr-10 focus:outline-none focus:ring-2 ${ringClass}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mutation.isError && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200
                        rounded-lg px-3 py-2">
            Error al crear el usuario. El nombre de usuario o email puede ya existir.
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={mutation.isPending}
            className={`px-4 py-2 ${btnClass} text-white rounded-lg text-sm
                       font-medium disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors`}
          >
            {mutation.isPending
              ? "Creando..."
              : isOperator ? "Crear operador" : "Crear administrador"}
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

// ─── Lista de usuarios activos ────────────────────────────────────────────────

interface UserListProps {
  role: "operator" | "admin";
  onChangePassword: (user: User) => void;
}

function UserList({ role, onChangePassword }: UserListProps) {
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useUsersByRole(role);
  const deleteMutation = useDeleteUser(role);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const isOperator = role === "operator";

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 border border-dashed
                      border-slate-200 rounded-xl">
        <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">
          No hay {isOperator ? "operadores" : "administradores"} registrados
        </p>
        <p className="text-sm mt-1">Crea el primero con el botón de arriba</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.userId}
          className="flex items-center justify-between px-4 py-4
                     border border-slate-200 rounded-xl bg-white
                     hover:border-slate-300 hover:shadow-sm transition-all"
        >
          <div>
            <p className="font-semibold text-slate-800">{user.fullName}</p>
            <p className="text-sm text-slate-400">@{user.username}</p>
          </div>

          <div className="flex items-center gap-2">
            {confirmDeleteId === user.userId ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg
                              bg-red-50 border border-red-200">
                <span className="text-xs text-red-600 font-medium">¿Eliminar?</span>
                <button
                  onClick={() =>
                    deleteMutation.mutate(user.userId, {
                      onSuccess: () => setConfirmDeleteId(null),
                    })
                  }
                  disabled={deleteMutation.isPending}
                  className="px-2 py-1 bg-red-500 text-white text-xs font-medium
                             rounded-md hover:bg-red-600 disabled:opacity-50
                             transition-colors"
                >
                  {deleteMutation.isPending ? "..." : "Sí"}
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-2 py-1 text-slate-500 text-xs font-medium
                             rounded-md hover:bg-slate-100 transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onChangePassword(user)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg
                             bg-amber-50 text-amber-600 hover:bg-amber-100
                             text-sm font-medium transition-colors"
                >
                  <KeyRound className="h-4 w-4" />
                  Contraseña
                </button>

                {isOperator && (
                  <button
                    onClick={() =>
                      navigate(`/admin/operators/${user.userId}/permissions`)
                    }
                    className="flex items-center gap-2 px-3 py-2 rounded-lg
                               bg-blue-50 text-blue-600 hover:bg-blue-100
                               text-sm font-medium transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Permisos
                  </button>
                )}

                <button
                  onClick={() => setConfirmDeleteId(user.userId)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg
                             bg-red-50 text-red-500 hover:bg-red-100
                             text-sm font-medium transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Lista de usuarios eliminados ─────────────────────────────────────────────

function DeletedUserList() {
  const { data: users = [], isLoading } = useDeletedUsers();
  const restoreMutation = useRestoreUser();
  const [confirmRestoreId, setConfirmRestoreId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 border border-dashed
                      border-slate-200 rounded-xl">
        <RotateCcw className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No hay usuarios eliminados</p>
        <p className="text-sm mt-1">
          Los usuarios eliminados aparecerán aquí para poder restaurarlos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.userId}
          className="flex items-center justify-between px-4 py-4
                     border border-red-100 rounded-xl bg-red-50/30"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-500">{user.fullName}</p>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full
                               bg-slate-100 text-slate-400 capitalize">
                {user.role}
              </span>
            </div>
            <p className="text-sm text-slate-400">@{user.username}</p>
          </div>

          <div className="flex items-center gap-2">
            {confirmRestoreId === user.userId ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg
                              bg-green-50 border border-green-200">
                <span className="text-xs text-green-700 font-medium">
                  ¿Restaurar?
                </span>
                <button
                  onClick={() =>
                    restoreMutation.mutate(user.userId, {
                      onSuccess: () => setConfirmRestoreId(null),
                    })
                  }
                  disabled={restoreMutation.isPending}
                  className="px-2 py-1 bg-green-500 text-white text-xs font-medium
                             rounded-md hover:bg-green-600 disabled:opacity-50
                             transition-colors"
                >
                  {restoreMutation.isPending ? "..." : "Sí"}
                </button>
                <button
                  onClick={() => setConfirmRestoreId(null)}
                  className="px-2 py-1 text-slate-500 text-xs font-medium
                             rounded-md hover:bg-slate-100 transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmRestoreId(user.userId)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg
                           bg-green-50 text-green-600 hover:bg-green-100
                           text-sm font-medium transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function UsersPage() {
  const [activeTab, setActiveTab] = useState<TabRole>("operator");
  const [showForm, setShowForm]   = useState(false);
  const [changingPasswordFor, setChangingPasswordFor] = useState<User | null>(null);

  const isDeleted  = activeTab === "deleted";
  const isOperator = activeTab === "operator";

  const handleTabChange = (tab: TabRole) => {
    setActiveTab(tab);
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Users className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Usuarios</h1>
            <p className="text-sm text-slate-400">
              Gestiona operadores y administradores del sistema
            </p>
          </div>
        </div>

        {/* Botón crear — oculto en tab eliminados */}
        {!showForm && !isDeleted && (
          <button
            onClick={() => setShowForm(true)}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg
                       text-sm font-medium transition-colors
                       ${isOperator
                         ? "bg-blue-600 hover:bg-blue-700"
                         : "bg-purple-600 hover:bg-purple-700"
                       }`}
          >
            <Plus className="h-4 w-4" />
            {isOperator ? "Nuevo operador" : "Nuevo administrador"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => handleTabChange("operator")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                     font-medium transition-all
                     ${activeTab === "operator"
                       ? "bg-white text-blue-600 shadow-sm"
                       : "text-slate-500 hover:text-slate-700"
                     }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Operadores
        </button>
        <button
          onClick={() => handleTabChange("admin")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                     font-medium transition-all
                     ${activeTab === "admin"
                       ? "bg-white text-purple-600 shadow-sm"
                       : "text-slate-500 hover:text-slate-700"
                     }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Administradores
        </button>
        <button
          onClick={() => handleTabChange("deleted")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                     font-medium transition-all
                     ${activeTab === "deleted"
                       ? "bg-white text-red-500 shadow-sm"
                       : "text-slate-500 hover:text-slate-700"
                     }`}
        >
          <Trash2 className="h-4 w-4" />
          Eliminados
        </button>
      </div>

      {/* Formulario inline — solo en tabs activos */}
      {showForm && !isDeleted && (
        <CreateUserForm
          role={activeTab as "operator" | "admin"}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Lista condicional por tab */}
      {isDeleted ? (
        <DeletedUserList />
      ) : (
        <UserList
          role={activeTab as "operator" | "admin"}
          onChangePassword={setChangingPasswordFor}
        />
      )}

      {/* Modal cambio de contraseña */}
      {changingPasswordFor && (
        <ChangePasswordModal
          userId={changingPasswordFor.userId}
          userName={changingPasswordFor.username}
          onClose={() => setChangingPasswordFor(null)}
        />
      )}
    </div>
  );
}