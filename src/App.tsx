import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { PasswordAnalyzerPage } from "@/pages/PasswordAnalyzerPage";
import { PasswordGeneratorPage } from "@/pages/PasswordGeneratorPage";
import { BreachCheckerPage } from "@/pages/BreachCheckerPage";
import { AiAssistantPage } from "@/pages/AiAssistantPage";
import { PhishingDetectorPage } from "@/pages/PhishingDetectorPage";
import { SecurityReportPage } from "@/pages/SecurityReportPage";
import { QuizPage } from "@/pages/QuizPage";
import { AchievementsPage } from "@/pages/AchievementsPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { SettingsPage } from "@/pages/SettingsPage";

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyzer" element={<PasswordAnalyzerPage />} />
            <Route path="/generator" element={<PasswordGeneratorPage />} />
            <Route path="/breach-checker" element={<BreachCheckerPage />} />
            <Route path="/assistant" element={<AiAssistantPage />} />
            <Route path="/phishing-detector" element={<PhishingDetectorPage />} />
            <Route path="/security-report" element={<SecurityReportPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
