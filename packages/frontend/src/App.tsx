import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useStore } from "./store/useStore";
import { useAuthStore } from "./store/useAuthStore";
import Layout from "./components/Layout";
import Stepper from "./components/Stepper";
import ProjectsList from "./components/ProjectsList";
import WorksList from "./components/WorksList";
import InitStep from "./components/steps/InitStep";
import AnalyzeStep from "./components/steps/AnalyzeStep";
import ScenarioStep from "./components/steps/ScenarioStep";
import GenerateStep from "./components/steps/GenerateStep";
import EditorStep from "./components/steps/EditorStep";
import ProviderSettings from "./components/settings/ProviderSettings";
import ToastContainer from "./components/ui/Toast";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import TokensPage from "./components/auth/TokensPage";

function StepContent() {
  const { currentStep } = useStore();

  switch (currentStep) {
    case 0: return <InitStep />;
    case 1: return <AnalyzeStep />;
    case 2: return <ScenarioStep />;
    case 3: return <GenerateStep />;
    case 4: return <EditorStep />;
  }
}

function AuthenticatedApp() {
  const { currentProjectId, currentWorkId, loadingProject } = useStore();
  const [showTokensPage, setShowTokensPage] = useState(false);

  if (showTokensPage) {
    return (
      <Layout>
        <TokensPage onBack={() => setShowTokensPage(false)} />
        <ToastContainer />
      </Layout>
    );
  }

  if (currentProjectId === null) {
    return (
      <Layout onShowTokens={() => setShowTokensPage(true)}>
        <ProjectsList />
        <ProviderSettings />
        <ToastContainer />
      </Layout>
    );
  }

  if (currentWorkId === null) {
    return (
      <Layout onShowTokens={() => setShowTokensPage(true)}>
        <WorksList projectId={currentProjectId} />
        <ProviderSettings />
        <ToastContainer />
      </Layout>
    );
  }

  if (loadingProject) {
    return (
      <Layout onShowTokens={() => setShowTokensPage(true)}>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 size={48} className="animate-spin text-purple-500 mb-4" />
          <p className="text-gray-400">Loading work...</p>
        </div>
        <ProviderSettings />
        <ToastContainer />
      </Layout>
    );
  }

  return (
    <Layout onShowTokens={() => setShowTokensPage(true)}>
      <Stepper />
      <StepContent />
      <ProviderSettings />
      <ToastContainer />
    </Layout>
  );
}

export default function App() {
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setInitialized(true);
  }, [loadFromStorage]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === "login") {
      return <LoginPage onSwitchToRegister={() => setAuthView("register")} />;
    }
    return <RegisterPage onSwitchToLogin={() => setAuthView("login")} />;
  }

  return <AuthenticatedApp />;
}
