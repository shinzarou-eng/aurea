import { useState, useEffect } from "react";
import Header from "./components/Header";
import UploadSection from "./components/UploadSection";
import OverviewSection from "./components/OverviewSection";
import PersonasSection from "./components/PersonasSection";
import SwotAnalysisSection from "./components/SwotAnalysisSection";
import MonetizationSection from "./components/MonetizationSection";
import StoreOptimizationSection from "./components/StoreOptimizationSection";
import AbTestingSection from "./components/AbTestingSection";
import UgcStoryboardSection from "./components/UgcStoryboardSection";
import SocialCampaignSection from "./components/SocialCampaignSection";
import AdsSection from "./components/AdsSection";
import PrOutreachSection from "./components/PrOutreachSection";
import RoadmapSection from "./components/RoadmapSection";
import CompetitorBenchmarkSection from "./components/CompetitorBenchmarkSection";
import GrowthCalculatorSection from "./components/GrowthCalculatorSection";
import OkrSection from "./components/OkrSection";
import MockupStudio from "./components/MockupStudio";
import ModuleNavBar from "./components/ModuleNavBar";
import RetentionSequencesSection from "./components/RetentionSequencesSection";
import PaywallStudioSection from "./components/PaywallStudioSection";
import AdCreativesSection from "./components/AdCreativesSection";
import LocalizationHubSection from "./components/LocalizationHubSection";
import RefineModal from "./components/RefineModal";
import SettingsModal from "./components/SettingsModal";
import ExportHubModal from "./components/ExportHubModal";
import SessionHistoryModal from "./components/SessionHistoryModal";
import AdvisorChat from "./components/AdvisorChat";
import CommandPalette from "./components/CommandPalette";
import GrowthToolkitSection from "./components/GrowthToolkitSection";
import ProjectFolderUpload from "./components/ProjectFolderUpload";
import ProjectAuditSection from "./components/ProjectAuditSection";
import ProjectTestResults from "./components/ProjectTestResults";
import { saveSessionToHistory } from "./utils/sessionHistory";
import { parseApiResponse } from "./utils/parseApiResponse";
import { UploadedImage, MarketingSession, EngineConfig, ProjectFile, ProjectAudit, ProjectTestResult } from "./types";
import { SimulatorGrowthInputs } from "./utils/okrDefaults";
import { PRESET_APPS } from "./data/presets";
import { generateMarketingMarkdown } from "./utils/exportMarkdown";
import { Sparkles, ArrowUp, RefreshCw, FileText, Printer, CheckCircle2, Download } from "lucide-react";
import confetti from "canvas-confetti";

const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  provider: "gemini",
  apiKey: "",
  model: "gemini-3.8-flash",
  customEndpoint: "",
};

export default function App() {
  // Pre-load default preset so the user sees a complete, ready-to-test setup immediately
  const defaultPreset = PRESET_APPS[0];
  const [images, setImages] = useState<UploadedImage[]>(defaultPreset.images);
  const [appName, setAppName] = useState(defaultPreset.name);
  const [targetAudience, setTargetAudience] = useState(defaultPreset.audience);
  const [tone, setTone] = useState("Dynamique & Inspirant");
  const [pricingModel, setPricingModel] = useState("Freemium / Abonnement");
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [isExportHubOpen, setIsExportHubOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [projectAudit, setProjectAudit] = useState<ProjectAudit | null>(null);
  const [isProjectAuditLoading, setIsProjectAuditLoading] = useState(false);
  const [projectTestResult, setProjectTestResult] = useState<ProjectTestResult | null>(null);
  const [isProjectTestLoading, setIsProjectTestLoading] = useState(false);
  const [lastProjectFiles, setLastProjectFiles] = useState<ProjectFile[]>([]);
  const [simulatorInputs, setSimulatorInputs] = useState<SimulatorGrowthInputs | undefined>(undefined);

  // Engine configuration with localStorage persistence
  const [engineConfig, setEngineConfig] = useState<EngineConfig>(() => {
    try {
      const saved = localStorage.getItem("app_marketing_engine_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ENGINE_CONFIG;
  });
  const [isEngineSettingsOpen, setIsEngineSettingsOpen] = useState(false);

  // Keyboard shortcuts listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSaveEngineConfig = (newConfig: EngineConfig) => {
    setEngineConfig(newConfig);
    try {
      localStorage.setItem("app_marketing_engine_config", JSON.stringify(newConfig));
    } catch {}
  };

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<MarketingSession | null>(null);

  // Refine modal state
  const [refineState, setRefineState] = useState<{
    isOpen: boolean;
    sectionKey: string;
    content: any;
  }>({
    isOpen: false,
    sectionKey: "",
    content: null,
  });

  const handleGenerate = async () => {
    if (images.length === 0) {
      setError("Veuillez importer au moins une photo ou capture d'écran de l'application.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const providerName = 
      engineConfig.provider === "openai" ? "OpenAI" :
      engineConfig.provider === "anthropic" ? "Anthropic" :
      engineConfig.provider === "custom" ? "Moteur personnalisé" : "Google";
    setLoadingStep(`Analyse visuelle via ${providerName}...`);

    try {
      // Simulate step transitions for smooth UX
      const timer1 = setTimeout(() => setLoadingStep("Extraction de l'UX, des fonctionnalités et des couleurs..."), 2000);
      const timer2 = setTimeout(() => setLoadingStep("Rédaction des fiches App Store, posts et angles publicitaires..."), 4500);

      const payload = {
        images: images.map((img) => ({ data: img.dataUrl })),
        appName,
        targetAudience,
        tone,
        pricingModel,
        language,
        engineConfig,
      };

      const res = await fetch("/api/marketing/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await parseApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec de l'analyse marketing.");
      }

      setSession(data.session);
      saveSessionToHistory(data.session, appName);

      // Scroll to dashboard smoothly
      setTimeout(() => {
        const el = document.getElementById("session-results");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de la communication avec le moteur.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleOpenRefine = (sectionKey: string, content: any) => {
    setRefineState({
      isOpen: true,
      sectionKey,
      content,
    });
  };

  const handleExportMarkdown = () => {
    if (!session) return;
    const md = generateMarketingMarkdown(session, appName || "app");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kit-marketing-${session.appOverview.detectedName.toLowerCase().replace(/\s+/g, "-") || "app"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLoadSession = (loaded: MarketingSession, loadedAppName: string) => {
    setSession(loaded);
    setAppName(loadedAppName);
    // Optional: sync inputs with loaded overview if present
    if (loaded.appOverview?.detectedName) {
      setAppName(loaded.appOverview.detectedName);
    }
    if (loaded.targetPersonas?.[0]?.personaName) {
      setTargetAudience(loaded.targetPersonas.map((p) => p.personaName).join(", "));
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleCommandPaletteAction = (actionId: string) => {
    if (actionId.startsWith("nav-")) {
      const sectionId = actionId.replace("nav-", "section-");
      if (sectionId === "section-growth-toolkit") {
        const el = document.getElementById("section-growth-toolkit");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      scrollToSection(sectionId);
      return;
    }
    switch (actionId) {
      case "export-markdown":
        handleExportMarkdown();
        break;
      case "export-hub":
        setIsExportHubOpen(true);
        break;
      case "print":
        handlePrint();
        break;
      case "regenerate":
        handleGenerate();
        break;
      case "engine-settings":
        setIsEngineSettingsOpen(true);
        break;
      case "history":
        setIsHistoryOpen(true);
        break;
      case "language":
        setLanguage((prev) => (prev === "fr" ? "en" : "fr"));
        break;
      case "advisor":
        setIsAdvisorOpen(true);
        break;
    }
  };

  const handleProjectAudit = async (files: ProjectFile[]) => {
    setIsProjectAuditLoading(true);
    setLastProjectFiles(files);
    setError(null);
    try {
      const res = await fetch("/api/marketing/audit-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files,
          appName,
          language,
          engineConfig,
        }),
      });
      const data = await parseApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec de l'audit projet.");
      }
      setProjectAudit(data.audit);
      setTimeout(() => {
        const el = document.getElementById("section-project-audit");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de l'audit du projet.");
    } finally {
      setIsProjectAuditLoading(false);
    }
  };

  const handleProjectTest = async (files: ProjectFile[]) => {
    setIsProjectTestLoading(true);
    setLastProjectFiles(files);
    setError(null);
    try {
      const res = await fetch("/api/marketing/test-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });
      const data = await parseApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec des tests projet.");
      }
      setProjectTestResult(data.result);
      setTimeout(() => {
        const el = document.getElementById("section-project-test");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors des tests du projet.");
    } finally {
      setIsProjectTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        language={language}
        setLanguage={setLanguage}
        onExportMarkdown={handleExportMarkdown}
        onOpenExportHub={() => setIsExportHubOpen(true)}
        hasSession={!!session}
        engineConfig={engineConfig}
        onOpenEngineSettings={() => setIsEngineSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Container */}
      <main className="grow max-w-[1400px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-12 lg:py-16">
        {/* Page Header */}
        <div className="mb-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3"><span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--color-accent)]">AUREA / LAUNCH STUDIO</span><span className="h-px w-12 bg-[var(--color-accent)]/40" /></div>
            <h1 className="max-w-4xl font-serif text-5xl sm:text-6xl lg:text-[5.3rem] font-normal text-[var(--color-text)] tracking-tight leading-[0.98]">
              Lancez votre application avec clarté
            </h1>
            <p className="text-base text-slate-500 mt-6 max-w-2xl leading-relaxed">
              Transformez vos écrans en une stratégie de lancement précise, lisible et prête à exécuter.
            </p>
          </div>
          <div className="hidden lg:block border-l border-[var(--color-border-strong)] pl-5 pb-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">Ce que vous obtenez</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">Positionnement, messages, acquisition et feuille de route réunis dans un seul espace de travail.</p>
          </div>
        </div>

        {/* Upload & Configuration Section */}
        <UploadSection
          images={images}
          setImages={setImages}
          appName={appName}
          setAppName={setAppName}
          targetAudience={targetAudience}
          setTargetAudience={setTargetAudience}
          tone={tone}
          setTone={setTone}
          pricingModel={pricingModel}
          setPricingModel={setPricingModel}
          isLoading={isLoading}
          loadingStep={loadingStep}
          error={error}
          onGenerate={handleGenerate}
          engineConfig={engineConfig}
          onOpenEngineSettings={() => setIsEngineSettingsOpen(true)}
        />

        {/* Project Folder Audit */}
        <ProjectFolderUpload
          onAudit={handleProjectAudit}
          onTest={handleProjectTest}
          isAuditLoading={isProjectAuditLoading}
          isTestLoading={isProjectTestLoading}
          language={language}
        />

        {projectTestResult && (
          <div id="section-project-test">
            <ProjectTestResults
              result={projectTestResult}
              isLoading={isProjectTestLoading}
              language={language}
              onRunTests={() => lastProjectFiles.length && handleProjectTest(lastProjectFiles)}
            />
          </div>
        )}

        {projectAudit && (
          <ProjectAuditSection audit={projectAudit} language={language} />
        )}

        {/* Generated Session Dashboard */}
        {session && (
          <div id="session-results" className="space-y-6 pt-4 animate-fadeIn">
            {/* Quick Action Bar */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    Session Marketing prête : {session.appOverview?.detectedName || appName || "Application"}
                  </h2>
                  <p className="text-xs text-slate-300">
                    15 modules stratégiques d'élite, UGC, benchmarks concurrents, simulateur CAC/LTV & objectifs OKR 30J
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="btn-export-hub-dashboard"
                  onClick={() => setIsExportHubOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Centre d'Exportation (PDF, CSV, Notion)</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Régénérer</span>
                </button>
              </div>
            </div>

            {/* Sticky Navigation Pills Bar */}
            <ModuleNavBar />

            {/* Modules 1 to 14 */}
            {session.appOverview && (
              <OverviewSection overview={session.appOverview} onRefine={handleOpenRefine} />
            )}
            {session.targetPersonas && (
              <PersonasSection personas={session.targetPersonas} onRefine={handleOpenRefine} />
            )}
            {session.swotAndTrends && (
              <SwotAnalysisSection swot={session.swotAndTrends} onRefine={handleOpenRefine} />
            )}
            {session.monetization && (
              <MonetizationSection monetization={session.monetization} onRefine={handleOpenRefine} />
            )}
            
            {/* Module: Studio Paywall Mobile Interactif */}
            <PaywallStudioSection 
              session={session} 
              onRefine={handleOpenRefine}
              onUpdatePaywall={(config) => setSession((prev) => prev ? { ...prev, customPaywall: config } : null)}
            />

            {session.appStoreOptimization && (
              <StoreOptimizationSection 
                aso={session.appStoreOptimization} 
                engineConfig={engineConfig}
                onRefine={handleOpenRefine}
                localizedAso={session.localizedAso}
                onUpdateLocalizedAso={(lang, data) => setSession((prev) => prev ? {
                  ...prev,
                  localizedAso: { ...(prev.localizedAso || {}), [lang]: data }
                } : null)}
              />
            )}

            {/* Module: Hub de Localisation Internationale Multi-Marchés */}
            <LocalizationHubSection 
              session={session} 
              onRefine={handleOpenRefine}
              onUpdateMarkets={(plan) => setSession((prev) => prev ? { ...prev, multiMarketPlan: plan } : null)}
            />

            <AbTestingSection 
              session={session} 
              engineConfig={engineConfig} 
              onRefine={handleOpenRefine}
              onUpdatePlan={(newPlan) => setSession((prev) => prev ? { ...prev, abTesting: newPlan } : null)}
            />
            
            {/* Module 7: UGC Storyboards */}
            <UgcStoryboardSection 
              session={session} 
              onRefine={handleOpenRefine} 
            />

            {session.socialMediaLaunch && (
              <SocialCampaignSection social={session.socialMediaLaunch} onRefine={handleOpenRefine} />
            )}

            {/* Module: Séquences Push & Emails Onboarding */}
            <RetentionSequencesSection 
              session={session} 
              onRefine={handleOpenRefine}
              onUpdatePlan={(plan) => setSession((prev) => prev ? { ...prev, retentionSequence: plan } : null)}
            />

            {session.advertisingAngles && (
              <AdsSection angles={session.advertisingAngles} onRefine={handleOpenRefine} />
            )}

            {/* Module: Bannières & Visuels Publicitaires */}
            <AdCreativesSection 
              session={session} 
              onRefine={handleOpenRefine}
              onUpdateCreatives={(creatives) => setSession((prev) => prev ? { ...prev, adCreatives: creatives } : null)}
            />
            {session.prAndOutreach && (
              <PrOutreachSection pr={session.prAndOutreach} onRefine={handleOpenRefine} />
            )}
            {session.actionPlan7Days && (
              <RoadmapSection plan={session.actionPlan7Days} onRefine={handleOpenRefine} />
            )}

            {/* Module 12: Competitor Benchmarking */}
            <CompetitorBenchmarkSection 
              session={session} 
              engineConfig={engineConfig} 
              onRefine={handleOpenRefine}
              onUpdateCompetitors={(updated) => setSession((prev) => prev ? { ...prev, competitorAnalysis: updated } : null)}
            />

            {/* Module 13: Growth & ROI Unit Economics Simulator */}
            <GrowthCalculatorSection 
              session={session} 
              onMetricsChange={setSimulatorInputs}
              onSyncToOkr={(inputs) => {
                setSimulatorInputs(inputs);
                const el = document.getElementById("section-okr");
                if (el) {
                  const yOffset = -80;
                  const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
            />

            {/* Module 14: Objectifs OKR (30 Jours) */}
            <OkrSection 
              session={session} 
              simulatorInputs={simulatorInputs}
              onUpdateOkrPlan={(newPlan) => setSession((prev) => prev ? { ...prev, okrPlan: newPlan } : null)}
              onRefine={handleOpenRefine}
            />

            {/* Module 16: Growth Toolkit (Landing Page, 30J Calendar, Press Kit) */}
            <GrowthToolkitSection
              session={session}
              appName={session.appOverview?.detectedName || appName}
              language={language}
              engineConfig={engineConfig}
            />

            {/* Module 15: Mockup Studio */}
            <MockupStudio
              images={images}
              suggestedCaptions={session.appStoreOptimization?.screenshotCaptions || []}
              defaultAppName={session.appOverview?.detectedName || appName}
            />
          </div>
        )}
      </main>

      {/* Refinement Modal */}
      <RefineModal
        isOpen={refineState.isOpen}
        onClose={() => setRefineState((prev) => ({ ...prev, isOpen: false }))}
        sectionKey={refineState.sectionKey}
        currentContent={refineState.content}
        language={language}
        engineConfig={engineConfig}
      />

      {/* Provider & API Keys Modal */}
      <SettingsModal
        isOpen={isEngineSettingsOpen}
        onClose={() => setIsEngineSettingsOpen(false)}
        currentConfig={engineConfig}
        onSaveConfig={handleSaveEngineConfig}
      />

      {/* Export Hub Modal (PDF, CSV for Ads, Notion, Markdown) */}
      {session && (
        <ExportHubModal
          isOpen={isExportHubOpen}
          onClose={() => setIsExportHubOpen(false)}
          session={session}
          appName={session.appOverview?.detectedName || appName}
        />
      )}

      {/* Session History Modal */}
      <SessionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadSession={handleLoadSession}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        hasSession={!!session}
        language={language}
        onAction={handleCommandPaletteAction}
      />

      {/* Product advisor chat */}
      <AdvisorChat
        session={session}
        appName={session?.appOverview?.detectedName || appName}
        language={language}
        engineConfig={engineConfig}
        open={isAdvisorOpen}
        onOpenChange={setIsAdvisorOpen}
      />
    </div>
  );
}
