import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">FormatosSoft Front</h1>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/formats"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Ir a Formatos
          </Link>
        </div>
      </div>
    </div>
  );
}
