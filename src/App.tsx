import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SimpleToastProvider } from "@/components/ui/simple-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { setupGlobalErrorHandling, setupActivityTracking } from "./utils/errorHandler";
import { useQuestTracking } from "./hooks/useQuestTracking";
// import "./utils/questionTestUtils"; // Load console test utilities
import Index from "./pages/Index";
import QuizPage from "./pages/QuizPage";
import MarathonPage from "./pages/MarathonPage";
import SATMockTestPage from "./pages/SATMockTestPage";
import AdvancedInsights from "./pages/AdvancedInsights";
import SkillLearnPage from "./pages/SkillLearnPage";
import TargetWeakness from "./pages/TargetWeakness";
import QuestionGenerationTest from "./pages/QuestionGenerationTest";
import LeaderboardPage from "./pages/LeaderboardPage";
import QuestionTopicsPage from "./pages/QuestionTopicsPage";
import NotFound from "./pages/NotFound";
import MasteryPage from "./pages/MasteryPage";

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

// Component to enable quest tracking across the app
const QuestTracker = () => {
  useQuestTracking(); // This hook automatically tracks navigation
  return null;
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DataProvider>
            <TooltipProvider>
              <SimpleToastProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                <QuestTracker />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/quiz" element={<QuizPage />} />
                  <Route path="/mastery" element={<MasteryPage />} />
                  <Route path="/marathon" element={<MarathonPage />} />
                  <Route path="/sat-mock-test" element={<SATMockTestPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/advanced-insights" element={<AdvancedInsights />} />
                  <Route path="/learn/skill" element={<SkillLearnPage />} />
                  <Route path="/target-weakness" element={<TargetWeakness />} />
                  <Route path="/test-questions" element={<QuestionGenerationTest />} />
                  <Route path="/question-topics" element={<QuestionTopicsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              </SimpleToastProvider>
            </TooltipProvider>
          </DataProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
