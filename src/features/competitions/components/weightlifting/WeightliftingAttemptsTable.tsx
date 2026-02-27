import { useState } from "react";
import { CheckCircle, XCircle, Minus, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { useWeightliftingPhaseResults } from "../../api/weightlifting.queries";
import { WeightliftingScoreModal } from "./WeightliftingScoreModal";
import type {
  WeightliftingAthleteResult,
  WeightliftingAttempt,
} from "../../api/weightlifting.api";

interface Props {
  phaseId: number;
}

type AttemptResult = "valid" | "invalid" | "not_attempted";

const ResultIcon = ({ result }: { result: AttemptResult }) => {
  if (result === "valid")
    return <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />;
  if (result === "invalid")
    return <XCircle className="h-4 w-4 text-red-500 mx-auto" />;
  return <Minus className="h-4 w-4 text-gray-300 mx-auto" />;
};

const AttemptCell = ({
  attempts,
  num,
}: {
  attempts: WeightliftingAttempt[];
  num: 1 | 2 | 3;
}) => {
  const attempt = attempts.find((a) => a.attemptNumber === num);
  if (!attempt || attempt.result === "not_attempted") {
    return (
      <td className="px-2 py-2 text-center border-r border-gray-100">
        <Minus className="h-4 w-4 text-gray-200 mx-auto" />
      </td>
    );
  }
  return (
    <td
      className={`px-2 py-2 text-center border-r border-gray-100 ${
        attempt.result === "valid" ? "bg-green-50" : "bg-red-50"
      }`}
    >
      <div className="flex flex-col items-center gap-0.5">
        <span
          className={`text-xs font-semibold ${
            attempt.result === "valid"
              ? "text-green-700"
              : "text-red-500 line-through"
          }`}
        >
          {attempt.weightKg ?? "—"}
        </span>
        <ResultIcon result={attempt.result} />
      </div>
    </td>
  );
};

// ── Helper: agrupar por división ─────────────────────────────────────────────
function groupByDivision(
  results: WeightliftingAthleteResult[],
): Map<string, WeightliftingAthleteResult[]> {
  const groups = new Map<string, WeightliftingAthleteResult[]>();
  for (const r of results) {
    const div = r.participation?.registration?.weightClass ?? "";
    if (!groups.has(div)) groups.set(div, []);
    groups.get(div)!.push(r);
  }
  return groups;
}

// ── Fila de atleta ────────────────────────────────────────────────────────────
function AthleteRow({
  result,
  idx,
  onEdit,
}: {
  result: WeightliftingAthleteResult;
  idx: number;
  onEdit: (r: WeightliftingAthleteResult) => void;
}) {
  const athleteName =
    result.participation.registration?.athlete?.name ??
    `Atleta ${result.participation.participationId}`;
  const institution =
    result.participation.registration?.athlete?.institution?.name;
  const seedNumber = result.participation.registration?.seedNumber ?? null;  

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Seed */} 
      <td className="px-2 py-3 text-center">
        <span className="text-xs font-semibold text-slate-400">
          {seedNumber ?? "—"}
        </span>
      </td>

      {/* # */}
      <td className="px-3 py-3 text-center">
        <span className="text-xs text-gray-400 font-medium">{idx + 1}</span>
      </td>

      {/* El resto igual... */}
      <td className="px-3 py-3">
        <p className="font-medium text-gray-900 text-sm">{athleteName}</p>
        {institution && (
          <p className="text-xs text-gray-400">{institution}</p>
        )}
      </td>
      <AttemptCell attempts={result.snatchAttempts} num={1} />
      <AttemptCell attempts={result.snatchAttempts} num={2} />
      <AttemptCell attempts={result.snatchAttempts} num={3} />
      <td className="px-3 py-3 text-center border-r border-blue-200">
        <span className={`font-bold text-sm ${result.bestSnatch ? "text-blue-700" : "text-gray-300"}`}>
          {result.bestSnatch ?? "—"}
        </span>
      </td>
      <AttemptCell attempts={result.cleanAndJerkAttempts} num={1} />
      <AttemptCell attempts={result.cleanAndJerkAttempts} num={2} />
      <AttemptCell attempts={result.cleanAndJerkAttempts} num={3} />
      <td className="px-3 py-3 text-center border-r border-purple-200">
        <span className={`font-bold text-sm ${result.bestCleanAndJerk ? "text-purple-700" : "text-gray-300"}`}>
          {result.bestCleanAndJerk ?? "—"}
        </span>
      </td>
      <td className="px-3 py-3 text-center">
        <span className={`font-bold text-base ${result.total ? "text-gray-900" : "text-gray-300"}`}>
          {result.total ?? "—"}
        </span>
      </td>
      <td className="px-3 py-3 text-center">
        <Button size="sm" variant="ghost" onClick={() => onEdit(result)}>
          <Edit3 className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}


// ── Thead reutilizable ────────────────────────────────────────────────────────
function TableHead() {
  return (
    <thead>
      <tr className="bg-gray-50 border-b-2 border-gray-200">
        <th className="px-2 py-3 text-center text-xs font-semibold text-gray-400 w-8">Seed</th> 
        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 w-8">#</th>
        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 min-w-[160px]">Atleta</th>
        <th colSpan={3} className="px-2 py-3 text-center text-xs font-semibold text-blue-700 bg-blue-50 border-x border-blue-200">
          ARRANQUE (Snatch)
        </th>
        <th className="px-3 py-3 text-center text-xs font-semibold text-blue-700 bg-blue-50 border-r border-blue-200">Mejor</th>
        <th colSpan={3} className="px-2 py-3 text-center text-xs font-semibold text-purple-700 bg-purple-50 border-x border-purple-200">
          ENVIÓN (C&J)
        </th>
        <th className="px-3 py-3 text-center text-xs font-semibold text-purple-700 bg-purple-50 border-r border-purple-200">Mejor</th>
        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 bg-yellow-50">TOTAL</th>
        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 w-20">Acción</th>
      </tr>
      <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-400">
        <th /><th /><th />  {/* ← una th más */}
        <th className="py-1 text-center font-normal border-r border-gray-100">1°</th>
        <th className="py-1 text-center font-normal border-r border-gray-100">2°</th>
        <th className="py-1 text-center font-normal border-r border-blue-200">3°</th>
        <th className="border-r border-blue-200" />
        <th className="py-1 text-center font-normal border-r border-gray-100">1°</th>
        <th className="py-1 text-center font-normal border-r border-gray-100">2°</th>
        <th className="py-1 text-center font-normal border-r border-purple-200">3°</th>
        <th className="border-r border-purple-200" />
        <th /><th />
      </tr>
    </thead>
  );
}


// ── Componente principal ──────────────────────────────────────────────────────
export function WeightliftingAttemptsTable({ phaseId }: Props) {
  const { data: results = [], isLoading, refetch } = useWeightliftingPhaseResults(phaseId);
  const [editingParticipationId, setEditingParticipationId] = useState<number | null>(null);
  const [editingAthleteName, setEditingAthleteName] = useState("");

  const openModal = (result: WeightliftingAthleteResult) => {
    setEditingParticipationId(result.participation.participationId);
    setEditingAthleteName(
      result.participation.registration?.athlete?.name ??
        `Atleta ${result.participation.participationId}`,
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando resultados...</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay atletas registrados en esta fase.
      </div>
    );
  }

  // ¿Hay divisiones asignadas?
  const hasDivisions = results.some(
    (r) => r.participation?.registration?.weightClass,
  );

  const groups = groupByDivision(results);

  return (
    <>
      <div className="overflow-x-auto">
        {hasDivisions ? (
          // ── Render agrupado por división ────────────────────────────────
          Array.from(groups.entries()).map(([div, group]) => (
            <div key={div} className="mb-6">
              {/* Separador de división */}
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-700">
                <span className="text-xs font-bold text-white uppercase tracking-widest">
                  {div ? `División ${div} kg` : "Sin división asignada"}
                </span>
                <span className="text-xs text-slate-300">
                  — {group.length} atleta{group.length !== 1 ? "s" : ""}
                </span>
              </div>
              <table className="w-full text-sm border-collapse">
                <TableHead />
                <tbody>
                  {group.map((result, idx) => (
                    <AthleteRow
                      key={result.participation.participationId}
                      result={result}
                      idx={idx}
                      onEdit={openModal}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          // ── Render simple sin divisiones ─────────────────────────────────
          <table className="w-full text-sm border-collapse">
            <TableHead />
            <tbody>
              {results.map((result, idx) => (
                <AthleteRow
                  key={result.participation.participationId}
                  result={result}
                  idx={idx}
                  onEdit={openModal}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de edición de intentos */}
      <Modal
        isOpen={editingParticipationId !== null}
        onClose={() => {
          setEditingParticipationId(null);
          refetch();
        }}
        title={`Registrar Intentos — ${editingAthleteName}`}
        size="lg"
      >
        {editingParticipationId && (
          <WeightliftingScoreModal
            participationId={editingParticipationId}
            athleteName={editingAthleteName}
            phaseId={phaseId}
            onClose={() => {
              setEditingParticipationId(null);
              refetch();
            }}
          />
        )}
      </Modal>
    </>
  );
}
