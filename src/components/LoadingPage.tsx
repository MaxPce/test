import { Spinner } from "./ui/Spinner";

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = "Cargando..." }: LoadingPageProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">FS</span>
          </div>
        </div>
        <Spinner size="lg" />
        <p className="mt-6 text-slate-600 font-medium">{message}</p>
      </div>
    </div>
  );
}
