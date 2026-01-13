import { Link } from "react-router-dom";
import { useAuthStore } from "@/app/store/useAuthStore";

export function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">FormatoSoft Sports</h1>
          <p className="text-xl mb-8">
            Sistema de Gestión de Competencias Deportivas
          </p>

          <div className="space-x-4">
            {isAuthenticated ? (
              <>
                <p className="mb-4">Bienvenido, {user?.fullName}</p>
                <Link
                  to="/admin"
                  className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
                >
                  Ir al Panel de Administración
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
