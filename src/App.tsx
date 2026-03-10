import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import AppLayout from "@/layouts/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectOverviewPage from "@/pages/ProjectOverviewPage";
import ProjectPhasePage from "@/pages/ProjectPhasePage";
import ProjectStepPage from "@/pages/ProjectStepPage";
import DocumentDetailPage from "@/pages/DocumentDetailPage";
import PhaseReferencePage from "@/pages/PhaseReferencePage";
import AdminStructurePage from "@/pages/AdminStructurePage";
import AdminTaxonomyPage from "@/pages/AdminTaxonomyPage";
import GlobalSearchPage from "@/pages/GlobalSearchPage";
import MigrationPage from "@/pages/MigrationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />

              {/* All projects list */}
              <Route path="/projects" element={<AppLayout><ProjectsPage /></AppLayout>} />

              {/* Project detail: overview */}
              <Route path="/projects/:projectId" element={<AppLayout><ProjectOverviewPage /></AppLayout>} />

              {/* Project + phase: work area (upload, notes, docs) */}
              <Route path="/projects/:projectId/phase/:phaseSlug" element={<AppLayout><ProjectPhasePage /></AppLayout>} />

              {/* Project + phase + step */}
              <Route path="/projects/:projectId/phase/:phaseSlug/:stepSlug" element={<AppLayout><ProjectStepPage /></AppLayout>} />

              {/* Doc detail */}
              <Route path="/projects/:projectId/docs/:docId" element={<AppLayout><DocumentDetailPage /></AppLayout>} />

              {/* Phase reference (global, no project) — accessed from left nav */}
              <Route path="/phase/:phaseSlug" element={<AppLayout><PhaseReferencePage /></AppLayout>} />

              {/* Admin */}
              <Route path="/admin/structure" element={<AppLayout><AdminStructurePage /></AppLayout>} />
              <Route path="/admin/taxonomy" element={<AppLayout><AdminTaxonomyPage /></AppLayout>} />

              {/* Search & Migration */}
              <Route path="/search" element={<AppLayout><GlobalSearchPage /></AppLayout>} />
              <Route path="/migration" element={<AppLayout><MigrationPage /></AppLayout>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
