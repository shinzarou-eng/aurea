import { useState } from "react";
import { 
  AbTestPlan, 
  AbTestVariantTitle, 
  AbTestVariantIcon, 
  AbTestVariantDescription, 
  MarketingSession, 
  EngineConfig 
} from "../types";
import { 
  GitCompare, 
  Star, 
  Copy, 
  Check, 
  Layers, 
  Smartphone, 
  TrendingUp, 
  ArrowRight, 
  Eye, 
  Palette, 
  RefreshCw, 
  Zap, 
  Target, 
  Award, 
  HelpCircle,
  FileText,
  Sliders
} from "lucide-react";
import { generateDefaultAbTestPlan } from "../utils/abTestGenerator";

interface AbTestingSectionProps {
  session: MarketingSession;
  engineConfig: EngineConfig;
  onRefine: (sectionKey: string, content: any) => void;
  onUpdatePlan?: (plan: AbTestPlan) => void;
}

export default function AbTestingSection({ 
  session, 
  engineConfig, 
  onRefine,
  onUpdatePlan 
}: AbTestingSectionProps) {
  // Initialize plan from session or default generator
  const [rawPlan, setPlan] = useState<AbTestPlan>(() => {
    return session.abTesting || generateDefaultAbTestPlan(session);
  });

  const plan: AbTestPlan = {
    testName: rawPlan?.testName || "Protocole de test ASO / CRO",
    objective: rawPlan?.objective || "Maximiser le taux de conversion",
    recommendedPlatform: rawPlan?.recommendedPlatform || "Apple Product Page Optimization (PPO)",
    sampleSizeRecommendation: rawPlan?.sampleSizeRecommendation || "2 500 impressions",
    estimatedDuration: rawPlan?.estimatedDuration || "10 à 14 jours",
    keyMetric: rawPlan?.keyMetric || "Taux de Conversion (CVR)",
    titleVariants: Array.isArray(rawPlan?.titleVariants) ? rawPlan.titleVariants : [],
    iconVariants: Array.isArray(rawPlan?.iconVariants) ? rawPlan.iconVariants : [],
    descriptionVariants: Array.isArray(rawPlan?.descriptionVariants) ? rawPlan.descriptionVariants : [],
    testingTips: Array.isArray(rawPlan?.testingTips) ? rawPlan.testingTips : [],
  };

  const [activeTab, setActiveTab] = useState<"titles" | "icons" | "descriptions" | "simulator" | "methodology">("titles");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationAngle, setGenerationAngle] = useState("cvr");
  const [isAngleModalOpen, setIsAngleModalOpen] = useState(false);

  // Simulator comparison state
  const [selectedTitleVariant, setSelectedTitleVariant] = useState<string>(() => plan.titleVariants[1]?.id || plan.titleVariants[0]?.id || "");
  const [selectedIconVariant, setSelectedIconVariant] = useState<string>(() => plan.iconVariants[1]?.id || plan.iconVariants[0]?.id || "");
  const [selectedDescVariant, setSelectedDescVariant] = useState<string>(() => plan.descriptionVariants[1]?.id || plan.descriptionVariants[0]?.id || "");
  const [simulatorPlatform, setSimulatorPlatform] = useState<"ios" | "android">("ios");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateAiVariants = async (angle: string) => {
    setIsGenerating(true);
    setIsAngleModalOpen(false);
    try {
      const response = await fetch("/api/marketing/generate-ab-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionContext: {
            appOverview: session.appOverview,
            appStoreOptimization: session.appStoreOptimization,
            targetPersonas: session.targetPersonas,
            monetization: session.monetization,
          },
          focusAngle: angle,
          engineConfig,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.abTesting) {
        setPlan(data.abTesting);
        if (onUpdatePlan) onUpdatePlan(data.abTesting);
        setSelectedTitleVariant(data.abTesting.titleVariants[1]?.id || data.abTesting.titleVariants[0]?.id || "");
        setSelectedIconVariant(data.abTesting.iconVariants[1]?.id || data.abTesting.iconVariants[0]?.id || "");
        setSelectedDescVariant(data.abTesting.descriptionVariants[1]?.id || data.abTesting.descriptionVariants[0]?.id || "");
      } else {
        // Graceful fallback with localized parameters
        const fallback = generateDefaultAbTestPlan(session, angle);
        setPlan(fallback);
        if (onUpdatePlan) onUpdatePlan(fallback);
      }
    } catch (err) {
      console.warn("Engine generation failed, using local context-aware CRO generator", err);
      const fallback = generateDefaultAbTestPlan(session, angle);
      setPlan(fallback);
      if (onUpdatePlan) onUpdatePlan(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to get active variants for simulator
  const activeControlTitle: AbTestVariantTitle = plan.titleVariants[0] || {
    id: "title-control",
    name: "Original (Contrôle A)",
    appleTitle: session.appStoreOptimization?.storeTitle || session.appOverview.detectedName,
    appleSubtitle: session.appStoreOptimization?.subtitle || session.appOverview.uniqueValueProposition,
    googleTitle: session.appStoreOptimization?.storeTitle || session.appOverview.detectedName,
    hypothesis: "Version de référence originale.",
    psychologicalTrigger: "Clarté descriptive",
    expectedImpact: "Base (100% CVR)",
    iceScore: { impact: 6, confidence: 7, ease: 10 },
  };
  const currentTestTitle = plan.titleVariants.find((t) => t.id === selectedTitleVariant) || plan.titleVariants[1] || activeControlTitle;
  const currentTestIcon = plan.iconVariants.find((i) => i.id === selectedIconVariant) || plan.iconVariants[0];
  const currentTestDesc = plan.descriptionVariants.find((d) => d.id === selectedDescVariant) || plan.descriptionVariants[0];

  const appName = session.appOverview?.detectedName || "Application";
  const primaryColor = session.appOverview?.colorPalette?.[0] || "#10b981";

  return (
    <div id="section-ab-testing" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <GitCompare className="w-3.5 h-3.5" />
              Module 11 • CRO Lab
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +15% à +35% CVR Visé
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            A/B Test Generator : Optimisation du Taux de Conversion
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Générez des hypothèses et variantes scientifiques de titres, d'icônes et de descriptions prêtes à être testées sur Apple Product Page Optimization (PPO) et Google Play Store Experiments.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAngleModalOpen(true)}
            disabled={isGenerating}
            className="text-xs px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Production des variantes...</span>
              </>
            ) : (
              <>
                <Star className="w-3.5 h-3.5" />
                <span>Générer</span>
              </>
            )}
          </button>

          <button
            onClick={() => onRefine("A/B Test Generator (CRO)", plan)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Affiner</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 border-b border-slate-100">
        <div className="flex bg-slate-100/90 p-1 rounded-xl text-xs font-semibold text-slate-600 shrink-0">
          <button
            onClick={() => setActiveTab("titles")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "titles" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
            }`}
          >
            <span>Variantes de Titres</span>
            <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded-full font-mono">
              {plan.titleVariants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("icons")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "icons" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
            }`}
          >
            <Palette className="w-3.5 h-3.5 opacity-70" />
            <span>Concepts d'Icônes</span>
            <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded-full font-mono">
              {plan.iconVariants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("descriptions")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "descriptions" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 opacity-70" />
            <span>Descriptions & Accroches</span>
            <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded-full font-mono">
              {plan.descriptionVariants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "simulator" ? "bg-emerald-600 text-white shadow-2xs font-bold" : "hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Simulateur A vs B</span>
            <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab("methodology")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "methodology" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 opacity-70" />
            <span>Protocole CRO</span>
          </button>
        </div>

        {/* Quick info tag */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Plateforme conseillée : {plan.recommendedPlatform}</span>
        </div>
      </div>

      {/* TAB 1: TITLE VARIANTS */}
      {activeTab === "titles" && (
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Hypothèses de Titres & Sous-titres (ASO & Hero)
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Chaque variante explore un levier psychologique différent tout en respectant la contrainte stricte de 30 caractères par champ.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 shrink-0">
              Limite iOS/Google : <strong className="text-slate-800">30 car. max</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.titleVariants.map((variant, idx) => {
              const totalIce = variant.iceScore ? (variant.iceScore.impact + variant.iceScore.confidence + variant.iceScore.ease) : 24;
              const isControl = idx === 0;

              return (
                <div
                  key={variant.id}
                  className={`rounded-xl p-5 border transition-all flex flex-col justify-between ${
                    isControl
                      ? "bg-slate-50/70 border-slate-200"
                      : "bg-white border-slate-200/90 shadow-2xs hover:border-rose-300"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isControl ? "bg-slate-200 text-slate-700" : "bg-rose-100 text-rose-800"
                          }`}>
                            {variant.name}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {variant.expectedImpact}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-1.5 flex items-center gap-1">
                          <span className="text-slate-400">Levier :</span>
                          <strong className="text-slate-700">{variant.psychologicalTrigger}</strong>
                        </p>
                      </div>

                      {/* ICE Score Pill */}
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          ICE: {totalIce}/30
                        </div>
                        <span className="text-[9px] text-slate-400">Impact • Conf • Ease</span>
                      </div>
                    </div>

                    {/* Hypothesis */}
                    <div className="bg-slate-50 rounded-lg p-2.5 mb-4 text-xs text-slate-600 border border-slate-100">
                      <span className="font-bold text-slate-700">Hypothèse : </span>
                      {variant.hypothesis}
                    </div>

                    {/* Fields preview */}
                    <div className="space-y-3">
                      {/* Apple Title */}
                      <div className="bg-white rounded-lg p-2.5 border border-slate-200 flex items-center justify-between">
                        <div className="overflow-hidden mr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">
                              Titre App Store
                            </span>
                            <span className={`text-[10px] font-mono ${variant.appleTitle.length > 30 ? "text-rose-600 font-bold" : "text-slate-600"}`}>
                              {variant.appleTitle.length}/30
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                            {variant.appleTitle}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(variant.appleTitle, `at-${variant.id}`)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                          title="Copier le titre"
                        >
                          {copiedKey === `at-${variant.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Apple Subtitle */}
                      <div className="bg-white rounded-lg p-2.5 border border-slate-200 flex items-center justify-between">
                        <div className="overflow-hidden mr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">
                              Sous-titre App Store
                            </span>
                            <span className={`text-[10px] font-mono ${variant.appleSubtitle.length > 30 ? "text-rose-600 font-bold" : "text-slate-600"}`}>
                              {variant.appleSubtitle.length}/30
                            </span>
                          </div>
                          <div className="text-xs font-medium text-slate-800 truncate mt-0.5">
                            {variant.appleSubtitle}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(variant.appleSubtitle, `as-${variant.id}`)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                          title="Copier le sous-titre"
                        >
                          {copiedKey === `as-${variant.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Google Title */}
                      <div className="bg-white rounded-lg p-2.5 border border-slate-200 flex items-center justify-between">
                        <div className="overflow-hidden mr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">
                              Titre Google Play
                            </span>
                            <span className={`text-[10px] font-mono ${variant.googleTitle.length > 30 ? "text-rose-600 font-bold" : "text-slate-600"}`}>
                              {variant.googleTitle.length}/30
                            </span>
                          </div>
                          <div className="text-xs font-medium text-slate-800 truncate mt-0.5">
                            {variant.googleTitle}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(variant.googleTitle, `gt-${variant.id}`)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                          title="Copier le titre Google Play"
                        >
                          {copiedKey === `gt-${variant.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedTitleVariant(variant.id);
                        setActiveTab("simulator");
                      }}
                      className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Comparer dans le simulateur</span>
                    </button>

                    <button
                      onClick={() => {
                        const snippet = `Titre Store: ${variant.appleTitle}\nSous-titre: ${variant.appleSubtitle}\nTitre Play Store: ${variant.googleTitle}`;
                        copyToClipboard(snippet, `all-${variant.id}`);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {copiedKey === `all-${variant.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Tout copier</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ICON VARIANTS */}
      {activeTab === "icons" && (
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Directions Visuelles & Concepts d'Icônes
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                L'icône représente jusqu'à 30% du taux de clic initial dans la recherche. Testez des architectures visuelles tranchées.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 shrink-0">
              Format natif : <strong className="text-slate-800">1024 x 1024 px PNG</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.iconVariants.map((iconVariant) => {
              return (
                <div
                  key={iconVariant.id}
                  className="rounded-2xl p-5 border border-slate-200/90 bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Preview Icon & Meta */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Interactive Rendered App Icon */}
                      <div className="relative shrink-0 group">
                        <div 
                          className={`w-20 h-20 rounded-2xl bg-linear-to-br ${iconVariant.backgroundGradient} shadow-md flex items-center justify-center relative overflow-hidden border border-black/10`}
                          style={{
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                          }}
                        >
                          {/* Inner specular gloss highlight */}
                          <div className="absolute inset-0 bg-linear-to-b from-white/25 via-transparent to-black/20 pointer-events-none" />
                          
                          {/* Dynamic Icon Glyph */}
                          {iconVariant.iconSymbol === "Zap" ? (
                            <Zap className="w-10 h-10 text-white drop-shadow-sm" />
                          ) : iconVariant.iconSymbol === "Target" ? (
                            <Target className="w-10 h-10 text-amber-300 drop-shadow-sm" />
                          ) : iconVariant.iconSymbol === "Award" ? (
                            <span className="text-3xl font-black text-white tracking-tighter drop-shadow-sm">
                              {appName.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <Star className="w-10 h-10 text-emerald-400 drop-shadow-sm" />
                          )}

                          {/* Optional corner badge */}
                          {iconVariant.visualPreview?.badgeText && (
                            <div className="absolute top-1 right-1 bg-white text-slate-900 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
                              {iconVariant.visualPreview.badgeText}
                            </div>
                          )}
                        </div>

                        {/* OS Mock Badge */}
                        <div className="text-center mt-1.5">
                          <span className="text-[10px] text-slate-600 font-medium">
                            iOS / Squircle
                          </span>
                        </div>
                      </div>

                      {/* Header info */}
                      <div className="grow">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {iconVariant.styleTheme}
                          </span>
                          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {iconVariant.accentColor}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 mt-1">
                          {iconVariant.name}
                        </h5>
                        <p className="text-xs text-slate-600 mt-1">
                          {iconVariant.conceptDescription}
                        </p>
                      </div>
                    </div>

                    {/* Rationale & Target */}
                    <div className="space-y-2 mb-4">
                      <div className="text-xs bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                        <span className="font-bold text-slate-700">Pourquoi cette direction ? </span>
                        <span className="text-slate-600">{iconVariant.rationale}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 px-1">
                        <span className="font-bold text-slate-600">Public cible idéal :</span>
                        <span>{iconVariant.bestForAudience}</span>
                      </div>
                    </div>

                    {/* Prompt for Generation */}
                    <div className="bg-slate-900 text-slate-200 rounded-xl p-3 text-xs font-mono">
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Prompt Prêt pour Midjourney / DALL-E / Designer
                        </span>
                        <button
                          onClick={() => {
                            const prompt = `Minimalist modern app icon for "${appName}", style: ${iconVariant.styleTheme}, ${iconVariant.conceptDescription}, clean vector, Apple App Store standard 1024x1024, highly recognizable, 8k render --v 6.0`;
                            copyToClipboard(prompt, `prompt-${iconVariant.id}`);
                          }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-sans"
                        >
                          {copiedKey === `prompt-${iconVariant.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copier le prompt</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-300 leading-relaxed">
                        Minimalist modern app icon for "{appName}", style: {iconVariant.styleTheme}, {iconVariant.conceptDescription}, clean vector, Apple App Store standard 1024x1024, highly recognizable.
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedIconVariant(iconVariant.id);
                        setActiveTab("simulator");
                      }}
                      className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Tester cette icône en direct</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DESCRIPTION VARIANTS */}
      {activeTab === "descriptions" && (
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Variantes de Descriptions & Phrases d'Accroche
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Seules les 3 premières lignes sont visibles sans cliquer sur "Plus". Testez des angles de copywriting éprouvés.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 shrink-0">
              Description courte Play Store : <strong className="text-slate-800">80 car. max</strong>
            </span>
          </div>

          <div className="space-y-4">
            {plan.descriptionVariants.map((desc) => {
              return (
                <div
                  key={desc.id}
                  className="rounded-xl p-5 border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-900">
                          {desc.name}
                        </h5>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                          {desc.conversionFocus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <strong className="text-slate-700">Hypothèse :</strong> {desc.hypothesis}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedDescVariant(desc.id);
                          setActiveTab("simulator");
                        }}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Simuler</span>
                      </button>

                      <button
                        onClick={() => {
                          const full = `${desc.hookHeadline}\n\n${desc.shortDescriptionGoogle}\n\n${desc.bulletPoints.map((b) => `• ${b}`).join("\n")}\n\n${desc.ctaClosing}`;
                          copyToClipboard(full, `desc-${desc.id}`);
                        }}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `desc-${desc.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copier tout</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Hook headline */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Accroche au-dessus de la ligne de flottaison
                        </span>
                        <button
                          onClick={() => copyToClipboard(desc.hookHeadline, `hook-${desc.id}`)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {copiedKey === `hook-${desc.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-slate-900 font-semibold leading-relaxed">
                        "{desc.hookHeadline}"
                      </p>
                    </div>

                    {/* Short Desc Google */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Description courte Google Play
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {desc.shortDescriptionGoogle.length}/80 car.
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(desc.shortDescriptionGoogle, `sd-${desc.id}`)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {copiedKey === `sd-${desc.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {desc.shortDescriptionGoogle}
                      </p>
                    </div>
                  </div>

                  {/* Bullet points & CTA */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      {desc.bulletPoints.map((b, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0">
                      CTA : {desc.ctaClosing}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SIMULATEUR COMPARATIF LIVE (A VS B) */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/30 text-rose-300 px-2 py-0.5 rounded">
                  Comparateur Split-Screen
                </span>
                <span className="text-xs text-slate-300">
                  Visualisez en temps réel l'impact visuel dans le magasin d'applications
                </span>
              </div>
              <h4 className="text-base font-bold">
                Version A (Original Contrôle) vs Version B (Traitement Expérimental)
              </h4>
            </div>

            {/* Platform toggle */}
            <div className="flex bg-white/10 p-1 rounded-xl text-xs font-semibold shrink-0">
              <button
                onClick={() => setSimulatorPlatform("ios")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  simulatorPlatform === "ios" ? "bg-white text-slate-900 font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                Apple App Store (iOS)
              </button>
              <button
                onClick={() => setSimulatorPlatform("android")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  simulatorPlatform === "android" ? "bg-white text-slate-900 font-bold" : "text-slate-300 hover:text-white"
                }`}
              >
                Google Play Store (Android)
              </button>
            </div>
          </div>

          {/* Selector controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Variante de Titre testée :
              </label>
              <select
                value={selectedTitleVariant}
                onChange={(e) => setSelectedTitleVariant(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-rose-500"
              >
                {plan.titleVariants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.appleTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Direction d'Icône testée :
              </label>
              <select
                value={selectedIconVariant}
                onChange={(e) => setSelectedIconVariant(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-rose-500"
              >
                {plan.iconVariants.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.styleTheme})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Accroche testée :
              </label>
              <select
                value={selectedDescVariant}
                onChange={(e) => setSelectedDescVariant(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-rose-500"
              >
                {plan.descriptionVariants.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-side Simulator Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Version A: Control */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Version A (Contrôle 50% du trafic)
                  </span>
                </div>
                <span className="text-[11px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  Baseline (100% CVR)
                </span>
              </div>

              {/* Realistic Store Mockup Card */}
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80">
                <div className="flex items-start gap-4">
                  {/* Default Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0 border border-slate-200">
                    {appName.charAt(0).toUpperCase()}
                  </div>

                  <div className="grow overflow-hidden">
                    <h5 className="text-sm font-bold text-slate-900 truncate">
                      {activeControlTitle.appleTitle}
                    </h5>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {activeControlTitle.appleSubtitle}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex text-amber-400 text-xs">★★★★☆</div>
                      <span className="text-[10px] text-slate-400 font-mono">4.7 (1.2k)</span>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                        4+
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button className="px-4 py-1.5 rounded-full bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
                      {simulatorPlatform === "ios" ? "Obtenir" : "Installer"}
                    </button>
                  </div>
                </div>

                {/* Sub-description snippet */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-slate-600 leading-relaxed">
                  <span className="text-slate-400 font-bold uppercase text-[9px] block mb-1">
                    Accroche visible :
                  </span>
                  "{plan.descriptionVariants[0]?.hookHeadline || session.appOverview.uniqueValueProposition}"
                </div>
              </div>
            </div>

            {/* Version B: Test Variant */}
            <div className="rounded-2xl border-2 border-rose-400 bg-rose-50/20 p-6 relative shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                    Version B (Variante Testée 50% du trafic)
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  {currentTestTitle.expectedImpact}
                </span>
              </div>

              {/* Realistic Store Mockup Card */}
              <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-xs">
                <div className="flex items-start gap-4">
                  {/* Dynamic Test Icon */}
                  <div 
                    className={`w-16 h-16 rounded-2xl bg-linear-to-br ${currentTestIcon.backgroundGradient} shadow-md flex items-center justify-center text-white shrink-0 relative overflow-hidden border border-black/10`}
                  >
                    <div className="absolute inset-0 bg-linear-to-b from-white/20 via-transparent to-black/20 pointer-events-none" />
                    {currentTestIcon.iconSymbol === "Zap" ? (
                      <Zap className="w-8 h-8 text-white drop-shadow-sm" />
                    ) : currentTestIcon.iconSymbol === "Target" ? (
                      <Target className="w-8 h-8 text-amber-300 drop-shadow-sm" />
                    ) : currentTestIcon.iconSymbol === "Award" ? (
                      <span className="text-2xl font-black text-white drop-shadow-sm">
                        {appName.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <Star className="w-8 h-8 text-emerald-300 drop-shadow-sm" />
                    )}
                  </div>

                  <div className="grow overflow-hidden">
                    <h5 className="text-sm font-bold text-slate-900 truncate">
                      {simulatorPlatform === "ios" ? currentTestTitle.appleTitle : currentTestTitle.googleTitle}
                    </h5>
                    <p className="text-xs text-rose-800 font-medium truncate mt-0.5">
                      {currentTestTitle.appleSubtitle}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex text-amber-400 text-xs">★★★★★</div>
                      <span className="text-[10px] text-slate-400 font-mono">4.9 (2.4k)</span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">
                        N° 1
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-rose-700">
                      {simulatorPlatform === "ios" ? "Obtenir" : "Installer"}
                    </button>
                  </div>
                </div>

                {/* Sub-description snippet */}
                <div className="mt-4 pt-3 border-t border-rose-100 text-xs text-slate-700 leading-relaxed">
                  <span className="text-rose-600 font-bold uppercase text-[9px] block mb-1">
                    Accroche visible ({currentTestDesc.name}) :
                  </span>
                  <p className="font-semibold text-slate-900">"{currentTestDesc.hookHeadline}"</p>
                </div>
              </div>

              {/* Uplift prediction banner */}
              <div className="mt-4 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 font-medium">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Levier activé : <strong>{currentTestTitle.psychologicalTrigger}</strong>
                  </span>
                </div>
                <span className="font-bold text-emerald-800">
                  {currentTestTitle.expectedImpact}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PROTOCOLE & CONSEILS CRO */}
      {activeTab === "methodology" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Taille d'échantillon recommandée
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {plan.sampleSizeRecommendation}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Pour garantir une significativité statistique de p &lt; 0.05.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Durée minimale de test
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {plan.estimatedDuration}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Inclure au moins 2 cycles de 7 jours (jours ouvrés + week-ends).
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Métrique clé à surveiller
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate">
                {plan.keyMetric}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Surveiller en parallèle le taux de rétention J1 des nouveaux inscrits.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Règles d'Or pour Réussir vos Tests A/B Store
            </h5>
            <div className="space-y-2.5">
              {plan.testingTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Angle Modal for Generation */}
      {isAngleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-rose-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Générer de nouvelles variantes
                </h4>
              </div>
              <button
                onClick={() => setIsAngleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Sélectionnez l'angle stratégique prioritaire pour orienter la production des variantes automatiquement :
            </p>

            <div className="space-y-2.5 mb-6">
              {[
                {
                  id: "cvr",
                  label: "🎯 Maximiser le CVR pur (Conversion)",
                  desc: "Mise en avant des bénéfices immédiats, réduction de la friction et clarté radicale.",
                },
                {
                  id: "premium",
                  label: "💎 Positionnement Premium & Statut",
                  desc: "Vocabulaire raffiné, rassurance de haut niveau et justification du tarif.",
                },
                {
                  id: "viral",
                  label: "⚡ Jeune, Viral & Réseaux Sociaux",
                  desc: "Énergie, FOMO, accroches modernes et visuels percutants.",
                },
                {
                  id: "enterprise",
                  label: "🏢 B2B & Crédibilité Entreprise",
                  desc: "Rigueur, conformité, sécurité des données et retour sur investissement.",
                },
                {
                  id: "urgency",
                  label: "🔥 Aversion à la Perte & Urgence",
                  desc: "Souligner ce que l'utilisateur perd chaque jour sans l'application.",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setGenerationAngle(item.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    generationAngle === item.id
                      ? "border-rose-500 bg-rose-50/50 font-medium"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="font-bold text-slate-900">{item.label}</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAngleModalOpen(false)}
                className="text-xs px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => handleGenerateAiVariants(generationAngle)}
                className="text-xs px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Générer les variantes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
