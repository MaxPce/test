import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AdminLayout } from "@/features/admin/layouts/AdminLayout";
import { AdminDashboard } from "@/features/admin/pages/AdminDashboard";
// Companies
import CompaniesPage from "@/features/companies/pages/CompaniesPage";

// Events
import { EventsPage } from "@/features/events/pages/EventsPage";
import { EventLayout } from "@/features/events/layouts/EventLayout";
import { EventSportsPage } from "@/features/events/pages/EventSportsPage";
import { EventSportCategoriesPage } from "@/features/events/pages/EventSportCategoriesPage";
import { CategoryDetailLayout } from "@/features/events/layouts/CategoryDetailLayout";
import { CategoryInscriptionsPage } from "@/features/events/pages/category/CategoryInscriptionsPage";
import { CategorySchedulePage } from "@/features/events/pages/category/CategorySchedulePage";
import { CategoryStandingsPage } from "@/features/events/pages/category/CategoryStandingsPage";
import { CategoryInstitutionsPage } from "@/features/events/pages/category/CategoryInstitutionsPage";
import { AddSportToEventPage } from "@/features/events/pages/AddSportToEventPage";

// Sports (Gestión Global)
import { SportTypesPage } from "@/features/sports/pages/SportTypesPage";
import { SportsPage } from "@/features/sports/pages/SportsPage";
import { CategoriesPage } from "@/features/sports/pages/CategoriesPage";

// Institutions (Gestión Global)
import { InstitutionsPage } from "@/features/institutions/pages/InstitutionsPage";
import { AthletesPage } from "@/features/institutions/pages/AthletesPage";
import { TeamsPage } from "@/features/institutions/pages/TeamsPage";

// Results
import { SwimmingResultsPage } from "@/features/results/pages/SwimmingResultsPage";

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
        {/* ==================== EVENTOS LOCALES ==================== */}
        <Route path="events">
          <Route index element={<EventsPage />} />

          {/* Estructura jerárquica del evento local */}
          <Route path=":eventId" element={<EventLayout />}>
            {/* Lista de deportes del evento */}
            <Route index element={<EventSportsPage />} />
            <Route path="sports" element={<EventSportsPage />} />

            {/* Agregar deporte al evento */}
            <Route path="sports/add" element={<AddSportToEventPage />} />

            {/* Lista de categorías de un deporte */}
            <Route
              path="sports/:sportId"
              element={<EventSportCategoriesPage />}
            />

            {/* Detalle de una categoría con tabs */}
            <Route
              path="sports/:sportId/categories/:categoryId"
              element={<CategoryDetailLayout />}
            >
              <Route index element={<CategoryInscriptionsPage />} />
              <Route path="schedule" element={<CategorySchedulePage />} />
              <Route path="standings" element={<CategoryStandingsPage />} />
              <Route
                path="institutions"
                element={<CategoryInstitutionsPage />}
              />
              <Route path="results" element={<SwimmingResultsPage />} />
            </Route>
          </Route>
        </Route>
        {/* ==================== EVENTOS DE SISMASTER ==================== */}
        <Route path="sismaster-events">
          {/* Ver deportes de un evento de Sismaster */}
          <Route path=":externalEventId/sports" element={<EventSportsPage />} />

          {/* Agregar deporte a evento de Sismaster */}
          <Route
            path=":externalEventId/add-sport"
            element={<AddSportToEventPage />}
          />

          {/* Ver categorías de un deporte específico */}
          <Route
            path=":externalEventId/sports/:sportId"
            element={<EventSportCategoriesPage />}
          />

          {/* Detalle de una categoría con tabs */}
          <Route
            path=":externalEventId/sports/:sportId/categories/:categoryId"
            element={<CategoryDetailLayout />}
          >
            <Route index element={<CategoryInscriptionsPage />} />
            <Route path="schedule" element={<CategorySchedulePage />} />
            <Route path="standings" element={<CategoryStandingsPage />} />
            <Route path="institutions" element={<CategoryInstitutionsPage />} />
            <Route path="results" element={<SwimmingResultsPage />} />
          </Route>
        </Route>
        {/* ==================== DEPORTES (Gestión Global) ==================== */}
        <Route path="sports">
          <Route index element={<SportsPage />} />
          <Route path="types" element={<SportTypesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
        </Route>
        {/* ==================== INSTITUCIONES (Gestión Global) ==================== */}
        <Route path="institutions">
          <Route index element={<InstitutionsPage />} />
          <Route path="athletes" element={<AthletesPage />} />
          <Route path="teams" element={<TeamsPage />} />
        </Route>
        {/* ==================== EMPRESAS (Gestión Global) ==================== */}{" "}
        <Route path="companies">
          <Route index element={<CompaniesPage />} />
          <Route path=":companyId/events" element={<EventsPage />} />
        </Route>
        {/* ==================== CONFIGURACIÓN ==================== */}
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
