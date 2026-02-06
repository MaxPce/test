import { Loader2 } from "lucide-react";

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = "Cargando..." }: LoadingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="text-center">
        {/* Animated logo */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-6 shadow-lg animate-pulse">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>

        {/* Loading text */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          FormatoSoft
        </h2>
        <p className="text-slate-600 font-medium animate-pulse">{message}</p>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
