
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { setupGlobalErrorHandling, setupActivityTracking } from "./utils/errorHandler";
import Index from "./pages/Index";
import QuizPage from "./pages/QuizPage";
import MarathonPage from "./pages/MarathonPage";
import SATMockTestPage from "./pages/SATMockTestPage";
import AdvancedInsights from "./pages/AdvancedInsights";
import SkillLearnPage from "./pages/SkillLearnPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/marathon" element={<MarathonPage />} />
                <Route path="/sat-mock-test" element={<SATMockTestPage />} />
                <Route path="/advanced-insights" element={<AdvancedInsights />} />
                <Route path="/learn/skill" element={<SkillLearnPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
