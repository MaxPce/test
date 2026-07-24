import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Plus, Trophy, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { PageHeader } from "@/components/PageHeader";
import { apiClient } from "@/lib/api/client";
import type { Category } from "@/features/sports/types";

export function AddEventCategoryPage() {
  const { eventId, externalEventId, sportId } = useParams<{
    eventId?: string;
    externalEventId?: string;
    sportId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const sportIdNum         = Number(sportId);
  const isHaymasterEvent   = location.pathname.includes("/haymaster-events/");
  const isSismasterEvent   = !!externalEventId && !isHaymasterEvent;
  const isLocalEvent       = !isHaymasterEvent && !isSismasterEvent;

  // ── 1. Carga TODAS las categorías locales del deporte ──────────────────────
  // Sin importar el tipo de evento — siempre son tus categorías locales
  const { data: allCategories = [], isLoading } = useQuery({
    queryKey: ["local-categories-by-sport", sportIdNum],
    queryFn: async () => {
        const { data } = await apiClient.get<Category[]>(
        `/sports/categories?sportId=${sportIdNum}`,
        );

        return data;
    },
    enabled: !!sportIdNum,
    staleTime: 5 * 60 * 1000,
    });


  // ── 2. Filtro de búsqueda ──────────────────────────────────────────────────
  const filtered = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ── 3. Mutación: guarda en el endpoint correcto según origen ───────────────
  const { mutate: addCategory, isPending } = useMutation({
    mutationFn: async (categoryId: number) => {
      if (isHaymasterEvent) {
        return apiClient.post(
          `/events/haymaster/${externalEventId}/categories`,
          { categoryId },
        );
      }
      if (isSismasterEvent) {
        return apiClient.post(
          `/events/sismaster/${externalEventId}/categories`,
          { categoryId },
        );
      }
      // Evento local
      return apiClient.post(`/event-categories`, {
        eventId: Number(eventId),
        categoryId,
      });
    },
    onSuccess: () => {
      // Invalida la query correcta para que se refresque la lista
      if (isHaymasterEvent) {
        queryClient.invalidateQueries({
          queryKey: ["haymaster-event-categories", Number(externalEventId)],
        });
      } else if (isSismasterEvent) {
        queryClient.invalidateQueries({
          queryKey: ["sismaster-event-categories", Number(externalEventId)],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["eventCategories"] });
      }
      navigate(-1); // vuelve a la lista de categorías
    },
  });

  // ── 4. Ruta de regreso ─────────────────────────────────────────────────────
  const backPath =
    isHaymasterEvent
      ? `/admin/haymaster-events/${externalEventId}/sports/${sportId}/categories`
      : isSismasterEvent
      ? `/admin/sismaster-events/${externalEventId}/sports/${sportId}/categories`
      : `/admin/events/${eventId}/sports/${sportId}/categories`;

  const handleConfirm = () => {
    if (!selectedCategoryId) return;
    addCategory(selectedCategoryId);
  };

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Agregar Categoría"
        showBack
        onBack={() => navigate(backPath)}
      />

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista de categorías */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner size="lg" label="Cargando categorías..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No se encontraron categorías para este deporte.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => {
            const isSelected = selectedCategoryId === cat.categoryId;
            return (
                <Card
                key={cat.categoryId}
                hover
                padding="none"
                onClick={() => setSelectedCategoryId(cat.categoryId)}
                className={[
                    "cursor-pointer p-4 border-2 transition-all select-none", // ← añade select-none
                    isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-transparent hover:border-slate-200",
                ].join(" ")}
                >
                <div className="flex items-center gap-3 pointer-events-none"> {/* ← añade pointer-events-none */}
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                    <p className="font-semibold text-slate-900 text-sm">{cat.name}</p>
                    <p className="text-xs text-slate-400 font-mono">ID: {cat.categoryId}</p>
                    {cat.type && (
                      <p className="text-xs text-slate-500 capitalize">{cat.type}</p>
                    )}
                  </div>
                </div>
                </Card> 
            );
            })}
        </div>
      )}

      {/* Botón confirmar */}
      {selectedCategoryId && (
        <div className="flex justify-end">
          <Button
            onClick={handleConfirm}
            variant="gradient"
            size="lg"
            icon={<Plus className="h-5 w-5" />}
            disabled={isPending}
          >
            {isPending ? "Guardando..." : "Confirmar Categoría"}
          </Button>
        </div>
      )}
    </div>
  );
}