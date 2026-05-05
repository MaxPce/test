import { useState } from "react";
import { useWushuTaoluScoreTable } from "../../api/wushu.queries";
import { useUpdateWushuTaoluScore } from "../../api/wushu.mutations";
import { getImageUrl } from "@/lib/utils/imageUrl";
import type { WushuTaoluParticipant } from "../../types/wushu.types";
import { toast } from "sonner";

// ── helpers ───────────────────────────────────────────────────

function avg(values: (number | string | null | undefined)[]): number {
  const valid = values
    .map((v) => (v !== null && v !== undefined ? Number(v) : null))
    .filter((v): v is number => v !== null && !isNaN(v));
  if (valid.length === 0) return 0;
  return valid.reduce((s, v) => s + v, 0) / valid.length;
}

function fmt(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  return isNaN(n) ? "—" : n.toFixed(2);
}


function fmtAvg(values: (number | null | undefined)[]): string {
  const valid = values.filter((v): v is number => v !== null && v !== undefined);
  if (valid.length === 0) return "—";
  return avg(values).toFixed(2);
}

// ── inline form state ─────────────────────────────────────────

interface FormState {
  b1: string; b2: string; b3: string;
  a1: string; a2: string;
  juezPrincipalMinus: string;
  juezPrincipalPlus: string;
}

function buildForm(p: WushuTaoluParticipant): FormState {
  return {
    b1: p.b1 != null ? String(p.b1) : "",
    b2: p.b2 != null ? String(p.b2) : "",
    b3: p.b3 != null ? String(p.b3) : "",
    a1: p.a1 != null ? String(p.a1) : "",
    a2: p.a2 != null ? String(p.a2) : "",
    juezPrincipalMinus: p.juezPrincipalMinus != null ? String(p.juezPrincipalMinus) : "0",
    juezPrincipalPlus:  p.juezPrincipalPlus  != null ? String(p.juezPrincipalPlus)  : "0",
  };
}

function parseField(v: string): number | null {
  if (v === "" || v === null) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// ── component ─────────────────────────────────────────────────

interface Props {
  phaseId: number;
}

export const WushuTaoluScoreTable = ({ phaseId }: Props) => {
  const { data: participants = [], isLoading } = useWushuTaoluScoreTable(phaseId);
  const updateScoreMutation = useUpdateWushuTaoluScore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  const handleStartEdit = (p: WushuTaoluParticipant) => {
    setEditingId(p.participationId);
    setForm(buildForm(p));
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(null);
  };

  const handleSave = (participationId: number) => {
    if (!form) return;
    updateScoreMutation.mutate(
      {
        participationId,
        data: {
          b1: parseField(form.b1),
          b2: parseField(form.b2),
          b3: parseField(form.b3),
          a1: parseField(form.a1),
          a2: parseField(form.a2),
          juezPrincipalMinus: parseField(form.juezPrincipalMinus) ?? 0,
          juezPrincipalPlus:  parseField(form.juezPrincipalPlus)  ?? 0,
        },
      },
      {
        onSuccess: () => { handleCancel(); toast.success("Puntaje guardado"); },
        onError:   () => toast.error("Error al guardar puntaje"),
      },
    );
  };

  // preview en tiempo real del form activo
  const previewB   = form ? avg([parseField(form.b1), parseField(form.b2), parseField(form.b3)]) : 0;
  const previewA   = form ? avg([parseField(form.a1), parseField(form.a2)]) : 0;
  const previewAct = previewB + previewA;
  const previewMin = parseField(form?.juezPrincipalMinus ?? "0") ?? 0;
  const previewPlu = parseField(form?.juezPrincipalPlus  ?? "0") ?? 0;
  const previewFin = previewAct - previewMin + previewPlu;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No hay participantes inscritos en esta categoría</p>
        <p className="text-sm mt-2">
          Dirígete a la pestaña "Inscripciones" para agregar participantes
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
      <table className="min-w-full text-xs border-collapse">

        {/* ── HEADER ── */}
        <thead>
          {/* Fila 1 — grupos de columnas */}
          <tr>
            <th colSpan={3} className="bg-pink-300 text-center font-bold text-sm py-2 px-3 border border-gray-300">
              Participante
            </th>
            <th colSpan={3} className="bg-gray-100 text-center font-semibold py-2 px-2 border border-gray-300">
              Jueces B
            </th>
            <th className="bg-gray-200 text-center font-bold py-2 px-2 border border-gray-300">
              PROM B
            </th>
            <th colSpan={2} className="bg-gray-100 text-center font-semibold py-2 px-2 border border-gray-300">
              Jueces A
            </th>
            <th className="bg-gray-200 text-center font-bold py-2 px-2 border border-gray-300">
              PROM A
            </th>
            <th className="bg-yellow-100 text-center font-bold py-2 px-2 border border-gray-300">
              Puntaje Actual
            </th>
            <th colSpan={2} className="bg-gray-100 text-center font-semibold py-2 px-2 border border-gray-300">
              Juez Princ.
            </th>
            <th className="bg-yellow-200 text-center font-bold py-2 px-2 border border-gray-300">
              Puntaje Final
            </th>
            <th className="bg-gray-100 text-center font-semibold py-2 px-2 border border-gray-300">
              PUESTO
            </th>
            <th className="bg-gray-100 text-center font-semibold py-2 px-2 border border-gray-300">
              Acción
            </th>
          </tr>

          {/* Fila 2 — sub-headers */}
          <tr>
            <th className="bg-yellow-200 text-center py-1 px-3 border border-gray-300 font-bold">Inst.</th>
            <th className="bg-yellow-200 text-center py-1 px-3 border border-gray-300 font-bold">Deportista</th>
            <th className="bg-yellow-200 text-center py-1 px-2 border border-gray-300 font-bold">Gén.</th>
            <th className="bg-gray-50 text-center py-1 px-2 border border-gray-300 font-semibold">B1</th>
            <th className="bg-gray-50 text-center py-1 px-2 border border-gray-300 font-semibold">B2</th>
            <th className="bg-gray-50 text-center py-1 px-2 border border-gray-300 font-semibold">B3</th>
            <th className="bg-gray-200 text-center py-1 px-2 border border-gray-300 font-bold">B</th>
            <th className="bg-gray-50 text-center py-1 px-2 border border-gray-300 font-semibold">A1</th>
            <th className="bg-gray-50 text-center py-1 px-2 border border-gray-300 font-semibold">A2</th>
            <th className="bg-gray-200 text-center py-1 px-2 border border-gray-300 font-bold">A</th>
            <th className="bg-yellow-100 text-center py-1 px-2 border border-gray-300" />
            <th className="bg-gray-50 text-center py-1 px-2 border border-gray-300 font-semibold">(-)</th>
            <th className="bg-gray-50 text-center py-1 px-2 border border-gray-300 font-semibold">(+)</th>
            <th className="bg-yellow-200 text-center py-1 px-2 border border-gray-300" />
            <th className="bg-gray-50 text-center py-1 px-2 border border-gray-300" />
            <th className="bg-gray-50 text-center py-1 px-2 border border-gray-300" />
          </tr>
        </thead>

        {/* ── BODY ── */}
        <tbody>
          {participants.map((p: WushuTaoluParticipant, idx: number) => {
            const isEditing = editingId === p.participationId;
            const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50";

            // valores calculados para la fila en modo lectura
            const promB = avg([p.b1, p.b2, p.b3]);
            const promA = avg([p.a1, p.a2]);
            const puntajeActual = promB + promA;
            const minus = Number(p.juezPrincipalMinus ?? 0);
            const plus  = Number(p.juezPrincipalPlus  ?? 0);
            const hasData = p.b1 != null || p.a1 != null || p.total != null;
            const puntajeFinal = hasData
              ? parseFloat((puntajeActual - minus + plus).toFixed(2))
              : null;


            return (
              <tr key={p.participationId} className={`${rowBg} transition-colors`}>

                {/* Institución */}
                <td className="py-1.5 px-2 border border-gray-200">
                  <div className="flex items-center justify-center">
                    {p.institutionLogo ? (
                      <img
                        src={getImageUrl(p.institutionLogo)}
                        alt={p.institution}
                        className="h-6 w-6 object-contain"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <span className="text-xs text-gray-500 font-semibold">
                        {p.institution.substring(0, 6).toUpperCase()}
                      </span>
                    )}
                  </div>
                </td>

                {/* Deportista */}
                <td className="py-1.5 px-3 border border-gray-200">
                  <div className="text-xs font-medium text-gray-900">{p.participantName}</div>
                  {p.isTeam && <div className="text-xs text-red-500">Equipo</div>}
                </td>

                {/* Género */}
                <td className="py-1.5 px-2 border border-gray-200 text-center text-gray-600">
                  {p.gender === "male" ? "M" : p.gender === "female" ? "F" : p.gender ?? "—"}
                </td>

                {/* ── MODO EDICIÓN ── */}
                {isEditing && form ? (
                  <>
                    {/* B1 B2 B3 */}
                    {(["b1", "b2", "b3"] as const).map((field) => (
                      <td key={field} className="py-1 px-1 border border-gray-200">
                        <input
                          type="number" step="0.01" min="0" max="10"
                          value={form[field]}
                          onChange={(e) => setForm((f) => f ? { ...f, [field]: e.target.value } : f)}
                          className="w-16 border border-gray-300 rounded px-1 py-0.5 text-xs text-center focus:ring-1 focus:ring-blue-400 focus:outline-none"
                          placeholder="—"
                        />
                      </td>
                    ))}

                    {/* PROM B preview */}
                    <td className="py-1 px-2 border border-gray-200 text-center font-bold bg-gray-100 tabular-nums">
                      {previewB > 0 ? previewB.toFixed(2) : "—"}
                    </td>

                    {/* A1 A2 */}
                    {(["a1", "a2"] as const).map((field) => (
                      <td key={field} className="py-1 px-1 border border-gray-200">
                        <input
                          type="number" step="0.01" min="0" max="10"
                          value={form[field]}
                          onChange={(e) => setForm((f) => f ? { ...f, [field]: e.target.value } : f)}
                          className="w-16 border border-gray-300 rounded px-1 py-0.5 text-xs text-center focus:ring-1 focus:ring-blue-400 focus:outline-none"
                          placeholder="—"
                        />
                      </td>
                    ))}

                    {/* PROM A preview */}
                    <td className="py-1 px-2 border border-gray-200 text-center font-bold bg-gray-100 tabular-nums">
                      {previewA > 0 ? previewA.toFixed(2) : "—"}
                    </td>

                    {/* Puntaje Actual preview */}
                    <td className="py-1 px-2 border border-gray-200 text-center font-bold bg-yellow-50 tabular-nums">
                      {previewAct > 0 ? previewAct.toFixed(2) : "—"}
                    </td>

                    {/* Juez Principal (-) */}
                    <td className="py-1 px-1 border border-gray-200">
                      <input
                        type="number" step="0.01" min="0" max="5"
                        value={form.juezPrincipalMinus}
                        onChange={(e) => setForm((f) => f ? { ...f, juezPrincipalMinus: e.target.value } : f)}
                        className="w-14 border border-red-200 rounded px-1 py-0.5 text-xs text-center text-red-600 focus:ring-1 focus:ring-red-400 focus:outline-none"
                        placeholder="0"
                      />
                    </td>

                    {/* Juez Principal (+) */}
                    <td className="py-1 px-1 border border-gray-200">
                      <input
                        type="number" step="0.01" min="0" max="5"
                        value={form.juezPrincipalPlus}
                        onChange={(e) => setForm((f) => f ? { ...f, juezPrincipalPlus: e.target.value } : f)}
                        className="w-14 border border-green-200 rounded px-1 py-0.5 text-xs text-center text-green-600 focus:ring-1 focus:ring-green-400 focus:outline-none"
                        placeholder="0"
                      />
                    </td>

                    {/* Puntaje Final preview */}
                    <td className="py-1 px-2 border border-gray-200 text-center font-bold bg-yellow-100 tabular-nums text-blue-700">
                      {previewAct > 0 ? previewFin.toFixed(2) : "—"}
                    </td>

                    {/* Puesto — vacío mientras edita */}
                    <td className="py-1 px-2 border border-gray-200 text-center text-gray-400">
                      {p.rank ?? "—"}
                    </td>

                    {/* Botones guardar/cancelar */}
                    <td className="py-1 px-2 border border-gray-200 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleSave(p.participationId)}
                          disabled={updateScoreMutation.isPending}
                          className="px-2 py-0.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                        >
                          {updateScoreMutation.isPending ? "..." : "✓"}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={updateScoreMutation.isPending}
                          className="px-2 py-0.5 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  /* ── MODO LECTURA ── */
                  <>
                    <td className="py-1.5 px-2 border border-gray-200 text-center tabular-nums">{fmt(p.b1)}</td>
                    <td className="py-1.5 px-2 border border-gray-200 text-center tabular-nums">{fmt(p.b2)}</td>
                    <td className="py-1.5 px-2 border border-gray-200 text-center tabular-nums">{fmt(p.b3)}</td>
                    <td className="py-1.5 px-2 border border-gray-200 text-center font-bold bg-gray-100 tabular-nums">
                      {fmtAvg([p.b1, p.b2, p.b3])}
                    </td>
                    <td className="py-1.5 px-2 border border-gray-200 text-center tabular-nums">{fmt(p.a1)}</td>
                    <td className="py-1.5 px-2 border border-gray-200 text-center tabular-nums">{fmt(p.a2)}</td>
                    <td className="py-1.5 px-2 border border-gray-200 text-center font-bold bg-gray-100 tabular-nums">
                      {fmtAvg([p.a1, p.a2])}
                    </td>
                    <td className="py-1.5 px-2 border border-gray-200 text-center font-bold bg-yellow-50 tabular-nums">
                      {hasData ? puntajeActual.toFixed(2) : "—"}
                    </td>
                    <td className="py-1.5 px-2 border border-gray-200 text-center tabular-nums text-red-600">
                      {fmt(p.juezPrincipalMinus)}
                    </td>
                    <td className="py-1.5 px-2 border border-gray-200 text-center tabular-nums text-green-600">
                      {fmt(p.juezPrincipalPlus)}
                    </td>
                    <td className="py-1.5 px-2 border border-gray-200 text-center font-bold bg-yellow-100 tabular-nums">
                      {puntajeFinal !== null ? puntajeFinal.toFixed(2) : "—"}
                    </td>
                    <td className="py-1.5 px-2 border border-gray-200 text-center font-bold">
                      {p.rank ?? "—"}
                    </td>
                    <td className="py-1.5 px-2 border border-gray-200 text-center">
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Editar
                      </button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};