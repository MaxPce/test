import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="text-sm text-slate-300">Página no encontrada.</p>
      <Link to="/" className="text-sm underline text-slate-300">
        Ir al inicio
      </Link>
    </div>
  );
}
