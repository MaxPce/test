import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AdminLayout } from "@/features/admin/layouts/AdminLayout";
import { AdminDashboard } from "@/features/admin/pages/AdminDashboard";

// Sports
import { SportTypesPage } from "@/features/sports/pages/SportTypesPage";
import { SportsPage } from "@/features/sports/pages/SportsPage";
import { CategoriesPage } from "@/features/sports/pages/CategoriesPage";

// Institutions
import { InstitutionsPage } from "@/features/institutions/pages/InstitutionsPage";
import { AthletesPage } from "@/features/institutions/pages/AthletesPage";
import { TeamsPage } from "@/features/institutions/pages/TeamsPage";

// Events
import { EventsPage } from "@/features/events/pages/EventsPage";
import { EventDetailPage } from "@/features/events/pages/EventDetailPage";

// Competitions
import { CompetitionsPage } from "@/features/competitions/pages/CompetitionsPage";
import { PhaseDetailPage } from "@/features/competitions/pages/PhaseDetailPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas del Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRoles={["admin", "moderator"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />

        {/* Rutas de Deportes */}
        <Route path="sports">
          <Route index element={<SportsPage />} />
          <Route path="types" element={<SportTypesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
        </Route>

        {/* Rutas de Instituciones */}
        <Route path="institutions">
          <Route index element={<InstitutionsPage />} />
          <Route path="athletes" element={<AthletesPage />} />
          <Route path="teams" element={<TeamsPage />} />
        </Route>

        {/* Rutas de Eventos */}
        <Route path="events">
          <Route index element={<EventsPage />} />
          <Route path=":id" element={<EventDetailPage />} />
        </Route>

        {/* Rutas de Competencias */}
        <Route path="competitions">
          <Route index element={<CompetitionsPage />} />
          <Route path=":id" element={<PhaseDetailPage />} />
        </Route>

        {/* Rutas placeholder para otros módulos */}
        <Route
          path="settings"
          element={<div className="p-4">Configuración - Próximamente</div>}
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
