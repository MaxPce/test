import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useSports } from "../api/sports.queries";
import type { Category, CreateCategoryData } from "../types";

const SPORT_MODALITIES: Record<string, { value: string; label: string }[]> = {
  taekwondo: [
    { value: "Kyorugi", label: "Kyorugi" },
    { value: "Poomsae", label: "Poomsae" },
  ],
  wushu: [
    { value: "Taolu", label: "Taolu" },
    { value: "Sanda", label: "Sanda" },
  ],
  judo: [
    { value: "Judo", label: "Judo" },
  ],
  karate: [
    { value: "Kata", label: "Kata" },
    { value: "Kumite", label: "Kumite" },
  ],
};

const GENDER_LABEL: Record<string, string> = {
  M: "Masculino",
  F: "Femenino",
  MIXTO: "Mixto",
};

function getModalities(sportName: string) {
  const lower = sportName.toLowerCase();
  for (const [key, mods] of Object.entries(SPORT_MODALITIES)) {
    if (lower.includes(key)) return mods;
  }
  return null;
}

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CategoryForm({ category, onSubmit, onCancel, isLoading }: CategoryFormProps) {
  const { data: sports = [] } = useSports();

  const [formData, setFormData] = useState<CreateCategoryData>({
    sportId: 0,
    name: "",
    formatType: "eliminacion_directa",
    resultType: "combat",
    gender: "M",
    type: "individual",
    weightMin: undefined,
    weightMax: undefined,
  });

  const [modalidad, setModalidad]   = useState<string>("");
  const [complement, setComplement] = useState<string>("");

  const selectedSport = sports.find((s) => s.sportId === formData.sportId);
  const modalities    = selectedSport ? getModalities(selectedSport.name) : null;

  const composedName = modalities
    ? [modalidad, complement.trim(), GENDER_LABEL[formData.gender]]
        .filter(Boolean)
        .join(" ")
    : formData.name;

  useEffect(() => {
    if (category) {
      setFormData({
        sportId:    category.sportId,
        name:       category.name,
        formatType: category.formatType,
        resultType: category.resultType,
        gender:     category.gender,
        type:       category.type,
        weightMin:  category.weightMin,
        weightMax:  category.weightMax,
      });
    } else if (sports.length > 0 && formData.sportId === 0) {
      setFormData((prev) => ({ ...prev, sportId: sports[0].sportId }));
    }
  }, [category, sports]);

  useEffect(() => {
    if (modalities && modalities.length > 0) {
      setModalidad(modalities[0].value);
    } else {
      setModalidad("");
    }
    setComplement("");
  }, [formData.sportId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, name: composedName });
  };

  const sportOptions = [
    { value: 0, label: "Seleccione un deporte" },
    ...sports.map((s) => ({ value: s.sportId, label: s.name })),
  ];

  const modalityOptions = modalities?.map((m) => ({ value: m.value, label: m.label })) ?? [];

  const formatTypeOptions = [
    { value: "eliminacion_directa", label: "Eliminación Directa" },
    { value: "round_robin",         label: "Round Robin" },
    { value: "suizo",               label: "Sistema Suizo" },
  ];

  const resultTypeOptions = [
    { value: "combat",   label: "Combate" },
    { value: "time",     label: "Tiempo" },
    { value: "score",    label: "Puntaje" },
    { value: "weight",   label: "Peso" },
    { value: "distance", label: "Distancia" },
    { value: "height",   label: "Altura" },
  ];

  const genderOptions = [
    { value: "M",     label: "Masculino" },
    { value: "F",     label: "Femenino" },
    { value: "MIXTO", label: "Mixto" },
  ];

  const typeOptions = [
    { value: "individual", label: "Individual" },
    { value: "equipo",     label: "Equipo" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Deporte *"
        value={formData.sportId}
        onChange={(e) =>
          setFormData({ ...formData, sportId: Number(e.target.value), name: "" })
        }
        options={sportOptions}
        required
      />

      {modalities ? (
        <>
          <Select
            label="Modalidad *"
            value={modalidad}
            onChange={(e) => setModalidad(e.target.value)}
            options={modalityOptions}
            required
          />

          <Input
            label="Complemento"
            value={complement}
            onChange={(e) => setComplement(e.target.value)}
            placeholder="Ej: -85kg · Individual · Espada · Grupal..."
          />

          <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-400 mb-0.5">Nombre que se guardará</p>
            <p className="text-sm font-bold text-gray-800">
              {composedName || "—"}
            </p>
          </div>
        </>
      ) : (
        <Input
          label="Nombre de la Categoría *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Kumite Masculino -67kg"
          required
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Tipo de Formato *"
          value={formData.formatType}
          onChange={(e) =>
            setFormData({ ...formData, formatType: e.target.value as CreateCategoryData["formatType"] })
          }
          options={formatTypeOptions}
          required
        />
        <Select
          label="Tipo de Resultado *"
          value={formData.resultType}
          onChange={(e) =>
            setFormData({ ...formData, resultType: e.target.value as CreateCategoryData["resultType"] })
          }
          options={resultTypeOptions}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Género *"
          value={formData.gender}
          onChange={(e) =>
            setFormData({ ...formData, gender: e.target.value as CreateCategoryData["gender"] })
          }
          options={genderOptions}
          required
        />
        <Select
          label="Tipo *"
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value as CreateCategoryData["type"] })
          }
          options={typeOptions}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Peso Mínimo (kg)"
          type="number"
          step="0.1"
          value={formData.weightMin || ""}
          onChange={(e) =>
            setFormData({ ...formData, weightMin: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder="60"
        />
        <Input
          label="Peso Máximo (kg)"
          type="number"
          step="0.1"
          value={formData.weightMax || ""}
          onChange={(e) =>
            setFormData({ ...formData, weightMax: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder="67"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={formData.sportId === 0 || !composedName}
        >
          {category ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
