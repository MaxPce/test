// src/features/results/components/TimeInputForm.tsx
import { useState, useEffect, useRef } from "react";
import { useCreateTimeResult } from "../api/results.queries";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface Registration {
  registrationId: number;
  athlete?: {
    athleteId: number;
    name: string;
  };
  team?: {
    teamId: number;
    name: string;
    members: Array<{
      athlete: {
        name: string;
      };
    }>;
  };
}

interface TimeInputFormProps {
  registration: Registration;
  existingResult?: {
    resultId: number;
    timeValue: string;
    rankPosition?: number | null;
    notes?: string | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Parsea "1:15.60" → { min: "1", sec: "15", cs: "60" }
function parseTimeString(time: string): { min: string; sec: string; cs: string } {
  const clean = time.replace(/^x/, ""); // quitar prefijo DQ
  const colonIdx = clean.indexOf(":");
  const dotIdx = clean.indexOf(".");

  if (colonIdx !== -1 && dotIdx !== -1) {
    return {
      min: clean.slice(0, colonIdx),
      sec: clean.slice(colonIdx + 1, dotIdx),
      cs: clean.slice(dotIdx + 1),
    };
  }
  if (dotIdx !== -1) {
    return { min: "", sec: clean.slice(0, dotIdx), cs: clean.slice(dotIdx + 1) };
  }
  return { min: "", sec: clean, cs: "" };
}

export function TimeInputForm({
  registration,
  existingResult,
  onSuccess,
  onCancel,
}: TimeInputFormProps) {
  const [min, setMin] = useState("");
  const [sec, setSec] = useState("");
  const [cs, setCs] = useState("");
  const [notes, setNotes] = useState("");
  const [isDQ, setIsDQ] = useState(false);

  const secRef = useRef<HTMLInputElement>(null);
  const csRef = useRef<HTMLInputElement>(null);

  const mutation = useCreateTimeResult();

  useEffect(() => {
    if (existingResult) {
      const parsed = parseTimeString(existingResult.timeValue);
      setMin(parsed.min);
      setSec(parsed.sec);
      setCs(parsed.cs);
      setNotes(existingResult.notes || "");
      setIsDQ(existingResult.timeValue.startsWith("x"));
    }
  }, [existingResult]);

  // Tiempo concatenado en tiempo real para preview
  const timePreview = (() => {
    if (!sec) return null;
    const secPadded = sec.padStart(2, "0");
    const csPadded = cs.padStart(2, "0");
    return min ? `${min}:${secPadded}.${csPadded}` : `${secPadded}.${csPadded}`;
  })();

  const timeValue = timePreview ?? "";
  const isValid = !!sec && !!cs && parseInt(sec) < 60 && parseInt(cs) < 100;

  const isTeam = !!registration.team;
  const participantName = isTeam
    ? registration.team?.name || "Equipo Desconocido"
    : registration.athlete?.name || "Atleta Desconocido";
  const teamMembers = isTeam
    ? registration.team?.members?.map((m) => m.athlete.name).join(", ")
    : null;

  const handleMinChange = (v: string) => {
    if (!/^\d{0,2}$/.test(v)) return;
    setMin(v);
    if (v.length === 2) secRef.current?.focus();
  };

  const handleSecChange = (v: string) => {
    if (!/^\d{0,2}$/.test(v)) return;
    setSec(v);
    if (v.length === 2) csRef.current?.focus();
  };

  const handleCsChange = (v: string) => {
    if (!/^\d{0,2}$/.test(v)) return;
    setCs(v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const finalTime = isDQ ? `x${timeValue}` : timeValue;

    mutation.mutate(
      {
        registrationId: registration.registrationId,
        timeValue: finalTime,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setMin("");
          setSec("");
          setCs("");
          setNotes("");
          setIsDQ(false);
          onSuccess?.();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Participante */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          {isTeam ? "Equipo" : "Atleta"}
        </p>
        <p className="text-base font-semibold text-gray-900">{participantName}</p>
        {teamMembers && (
          <p className="text-xs text-gray-500 mt-1">Integrantes: {teamMembers}</p>
        )}
      </div>

      {/* Inputs de tiempo separados */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
          Tiempo *
        </label>

        <div className="flex items-center gap-1 justify-center">
          {/* Minutos */}
          <div className="flex flex-col items-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              value={min}
              onChange={(e) => handleMinChange(e.target.value)}
              placeholder="00"
              maxLength={2}
              disabled={mutation.isPending}
              className="w-16 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            <span className="text-xs text-gray-500">Min</span>
          </div>

          <span className="text-3xl font-bold text-gray-400 mb-4">:</span>

          {/* Segundos */}
          <div className="flex flex-col items-center gap-1">
            <input
              ref={secRef}
              type="text"
              inputMode="numeric"
              value={sec}
              onChange={(e) => handleSecChange(e.target.value)}
              placeholder="00"
              maxLength={2}
              required
              disabled={mutation.isPending}
              className="w-16 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            <span className="text-xs text-gray-500">Seg</span>
          </div>

          <span className="text-3xl font-bold text-gray-400 mb-4">.</span>

          {/* Centésimas */}
          <div className="flex flex-col items-center gap-1">
            <input
              ref={csRef}
              type="text"
              inputMode="numeric"
              value={cs}
              onChange={(e) => handleCsChange(e.target.value)}
              placeholder="00"
              maxLength={2}
              required
              disabled={mutation.isPending}
              className="w-16 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            <span className="text-xs text-gray-500">Cs</span>
          </div>
        </div>

        {/* Preview del tiempo concatenado */}
        {timePreview && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-xs text-gray-500">Tiempo registrado:</span>
            <span
              className={`text-sm font-bold px-2 py-0.5 rounded ${
                isDQ
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isDQ ? `x${timePreview}` : timePreview}
            </span>
          </div>
        )}

        {/* Validación segundos */}
        {sec && parseInt(sec) >= 60 && (
          <p className="text-xs text-red-500 mt-1">
            Los segundos deben ser entre 00 y 59
          </p>
        )}
      </div>

     

      {mutation.isError && (
        <Alert variant="error">
          Error:{" "}
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Error desconocido"}
        </Alert>
      )}

      {mutation.isSuccess && (
        <Alert variant="success">¡Tiempo registrado exitosamente!</Alert>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending || !isValid}>
          {mutation.isPending
            ? "Guardando..."
            : existingResult
              ? "Actualizar Tiempo"
              : "Registrar Tiempo"}
        </Button>
      </div>
    </form>
  );
}
