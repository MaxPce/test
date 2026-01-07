import { Link } from "react-router-dom";
import { AppRoutes } from "@/app/router/AppRoutes";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl p-6">
        <header className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold tracking-tight">
            FormatosSoft
          </Link>

          <nav className="flex gap-3 text-sm">
            <Link className="text-slate-300 hover:text-slate-100" to="/formats">
              Formatos
            </Link>
          </nav>
        </header>

        <main className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}
