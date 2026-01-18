import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-9xl font-bold text-slate-200 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                <Search className="h-16 w-16 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Página No Encontrada
          </h2>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95"
          >
            <Home className="h-5 w-5" />
            Ir al Inicio
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver Atrás
          </button>
        </div>
      </div>
    </div>
  );
}
