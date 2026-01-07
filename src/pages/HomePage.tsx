import { Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function HomePage() {
  const [devName, setDevName] = useLocalStorage<string>("dev_name", "Dev");

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">FormatosSoft Front</h1>
        <p className="text-sm text-slate-300">
          Base lista: React + TS + Tailwind v3 + TanStack Query + Zustand + Router
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-300 mb-2">Demo localStorage:</p>

        <label className="text-sm text-slate-200">Nombre del dev</label>
        <input
          value={devName}
          onChange={(e) => setDevName(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none"
          placeholder="Escribe tu nombre..."
        />

        <p className="mt-3 text-sm text-slate-300">
          Guardado en localStorage como <span className="text-slate-100">dev_name</span>.
        </p>
      </div>

      <nav className="flex gap-3">
        <Link
          to="/formats"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          Ir a Formatos
        </Link>
      </nav>
    </div>
  );
}
