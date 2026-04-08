import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { ProtectedOutlet } from "@/features/auth/components/ProtectedOutlet";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AdminLayout } from "@/features/admin/layouts/AdminLayout";
import { AdminDashboard } from "@/features/admin/pages/AdminDashboard";

// Operators
import { OperatorsPage } from "@/features/admin/pages/OperatorsPage";
import { OperatorPermissionsPage } from "@/features/admin/pages/OperatorPermissionsPage";

// Companies
import CompaniesPage from "@/features/companies/pages/CompaniesPage";

// Events
import { EventsPage }               from "@/features/events/pages/EventsPage";
import { EventLayout }              from "@/features/events/layouts/EventLayout";
import { EventSportsPage }          from "@/features/events/pages/EventSportsPage";
import { EventSportCategoriesPage } from "@/features/events/pages/EventSportCategoriesPage";
import { CategoryDetailLayout }     from "@/features/events/layouts/CategoryDetailLayout";
import { CategoryInscriptionsPage } from "@/features/events/pages/category/CategoryInscriptionsPage";
import { CategorySchedulePage }     from "@/features/events/pages/category/CategorySchedulePage";
import { CategoryStandingsPage }    from "@/features/events/pages/category/CategoryStandingsPage";
import { CategoryInstitutionsPage } from "@/features/events/pages/category/CategoryInstitutionsPage";
import { FeaturedAthletesPage }     from "@/features/events/pages/FeaturedAthletesPage";
import { AddSportToEventPage }      from "@/features/events/pages/AddSportToEventPage";
import { SismasterSportDetailPage } from "@/features/events/pages/SismasterSportDetailPage";

// Sports (Gestión Global)
import { SportTypesPage } from "@/features/sports/pages/SportTypesPage";
import { SportsPage }     from "@/features/sports/pages/SportsPage";
import { CategoriesPage } from "@/features/sports/pages/CategoriesPage";

// Institutions (Gestión Global)
import { InstitutionsPage } from "@/features/institutions/pages/InstitutionsPage";
import { AthletesPage }     from "@/features/institutions/pages/AthletesPage";
import { TeamsPage }        from "@/features/institutions/pages/TeamsPage";

// Results
import { SwimmingResultsPage } from "@/features/results/pages/SwimmingResultsPage";

export function AppRoutes() {
  return (
    <Routes>

      {/* ======================== RUTAS PÚBLICAS ======================== */}
      <Route path="/"      element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* ======================== RUTAS PROTEGIDAS ========================
          operator añadido al wrapper principal — puede entrar al AdminLayout.
          Las secciones de gestión global tienen su propio ProtectedOutlet.
      =================================================================== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRoles={["admin", "moderator", "operator"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />

        {/* ==================== EVENTOS LOCALES ====================
            ✅ operator accede — filtra por sus permisos en el componente
            ⛔ "sports/add" restringido a admin/moderador
        ========================================================== */}
        <Route path="events">
          <Route index element={<EventsPage />} />

          <Route path=":eventId" element={<EventLayout />}>
            <Route index                element={<EventSportsPage />} />
            <Route path="sports"        element={<EventSportsPage />} />
            <Route path="sports/:sportId" element={<EventSportCategoriesPage />} />

            {/* ⛔ Añadir deporte: solo admin/moderador */}
            <Route
              path="sports/add"
              element={
                <ProtectedOutlet requiredRoles={["admin", "moderator"]} />
              }
            >
              <Route index element={<AddSportToEventPage />} />
            </Route>

            <Route
              path="sports/:sportId/categories/:categoryId"
              element={<CategoryDetailLayout />}
            >
              <Route index              element={<CategoryInscriptionsPage />} />
              <Route path="schedule"    element={<CategorySchedulePage />} />
              <Route path="standings"   element={<CategoryStandingsPage />} />
              <Route path="institutions" element={<CategoryInstitutionsPage />} />
              <Route path="results"     element={<SwimmingResultsPage />} />
              <Route path="featured"    element={<FeaturedAthletesPage />} />
            </Route>
          </Route>
        </Route>

        {/* ==================== EVENTOS DE SISMASTER ====================
            ✅ operator accede — misma lógica de filtrado
            ⛔ "add-sport" restringido a admin/moderador
        ============================================================== */}
        <Route path="sismaster-events">
          <Route path=":externalEventId/sports"           element={<EventSportsPage />} />
          <Route path=":externalEventId/sports/:sportId"  element={<EventSportCategoriesPage />} />

          {/* ⛔ Añadir deporte: solo admin/moderador */}
          <Route
            path=":externalEventId/add-sport"
            element={
              <ProtectedOutlet requiredRoles={["admin", "moderator"]} />
            }
          >
            <Route index element={<AddSportToEventPage />} />
          </Route>

          <Route
            path=":externalEventId/sports/:sportId/categories/:categoryId"
            element={<CategoryDetailLayout />}
          >
            <Route index              element={<CategoryInscriptionsPage />} />
            <Route path="schedule"    element={<CategorySchedulePage />} />
            <Route path="standings"   element={<CategoryStandingsPage />} />
            <Route path="institutions" element={<CategoryInstitutionsPage />} />
            <Route path="results"     element={<SwimmingResultsPage />} />
            <Route path="featured"    element={<FeaturedAthletesPage />} />
          </Route>
        </Route>

        {/* ==================== DEPORTES (Gestión Global) ====================
            ⛔ operator NO puede — es configuración global del sistema
        =================================================================== */}
        <Route
          path="sports"
          element={<ProtectedOutlet requiredRoles={["admin", "moderator"]} />}
        >
          <Route index          element={<SportsPage />} />
          <Route path="types"      element={<SportTypesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
        </Route>

        {/* ==================== INSTITUCIONES (Gestión Global) ====================
            ⛔ operator NO puede
        ======================================================================= */}
        <Route
          path="institutions"
          element={<ProtectedOutlet requiredRoles={["admin", "moderator"]} />}
        >
          <Route index          element={<InstitutionsPage />} />
          <Route path="athletes" element={<AthletesPage />} />
          <Route path="teams"    element={<TeamsPage />} />
        </Route>

        {/* ==================== EMPRESAS ====================
            ⛔ operator NO puede — solo admin
        ================================================== */}
        <Route
          path="companies"
          element={<ProtectedOutlet requiredRoles={["admin", "moderator", "operator"]} />}
        >
          <Route index                      element={<CompaniesPage />} />
          <Route path=":companyId/events"   element={<EventsPage />} />
        </Route>

        {/* ==================== OPERADORES ====================
            ⛔ solo admin puede gestionar operadores
        ================================================== */}
        <Route
          path="operators"
          element={<ProtectedOutlet requiredRoles={["admin"]} />}
        >
          <Route index element={<OperatorsPage />} />
          <Route path=":userId/permissions" element={<OperatorPermissionsPage />} />
        </Route>

        {/* ==================== CONFIGURACIÓN ====================
            ⛔ operator NO puede
        ======================================================= */}
        <Route
          path="settings"
          element={<ProtectedOutlet requiredRoles={["admin", "moderator"]} />}
        >
          <Route index element={<div className="p-4">Configuración - Próximamente</div>} />
        </Route>

      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  );
}