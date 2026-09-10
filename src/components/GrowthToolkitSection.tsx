import { useState } from "react";
import { Wand2, Copy, Check, Rocket, Calendar, Newspaper, Briefcase, Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import { EngineConfig, MarketingSession } from "../types";
import { parseApiResponse } from "../utils/parseApiResponse";

interface GrowthToolkitSectionProps {
  session: MarketingSession;
  appName: string;
  language: "fr" | "en";
  engineConfig: EngineConfig;
  onRefine?: (sectionKey: string, content: any) => void;
}

type ToolkitTab = "landing" | "calendar" | "press";

export default function GrowthToolkitSection({
  session,
  appName,
  language,
  engineConfig,
}: GrowthToolkitSectionProps) {
  const [activeTab, setActiveTab] = useState<ToolkitTab>("landing");
  const [content, setContent] = useState<Record<ToolkitTab, string | null>>({
    landing: null,
    calendar: null,
    press: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabMeta: Record<ToolkitTab, { label: string; icon: any; title: string; prompt: string }> = {
    landing: {
      label: language === "en" ? "Landing Page" : "Landing Page",
      icon: Rocket,
      title: language === "en" ? "Landing Page Copy" : "Copy de Landing Page",
      prompt:
        language === "en"
          ? `Write a high-converting landing page for the app "${appName}". Include: 1) a hero headline + subheadline, 2) a problem-solution structure, 3) 5 benefit bullets, 4) social proof placeholders, 5) a FAQ section, 6) a strong CTA block. Use the session context and keep the brand voice.`
          : `Rédige une landing page à fort taux de conversion pour l'app "${appName}". Inclus : 1) un hero headline + sous-titre, 2) une structure problème-solution, 3) 5 bullets de bénéfices, 4) placeholders de preuve sociale, 5) une FAQ, 6) un bloc CTA fort. Utilise le contexte de la session et le ton de marque.`,
    },
    calendar: {
      label: language === "en" ? "30-Day Calendar" : "Calendrier 30J",
      icon: Calendar,
      title: language === "en" ? "30-Day Content Calendar" : "Calendrier de Contenu 30 Jours",
      prompt:
        language === "en"
          ? `Create a 30-day launch content calendar for "${appName}". For each week, list 3-5 platform-specific posts (Twitter/X, LinkedIn, TikTok/Reels, Instagram) with suggested hooks and a clear objective (awareness, activation, conversion, retention). Use the session context.`
          : `Crée un calendrier de contenu sur 30 jours pour le lancement de "${appName}". Pour chaque semaine, liste 3 à 5 posts par plateforme (Twitter/X, LinkedIn, TikTok/Reels, Instagram) avec des accroches et un objectif clair (notoriété, activation, conversion, rétention). Utilise le contexte de la session.`,
    },
    press: {
      label: language === "en" ? "Press Kit" : "Kit de Presse",
      icon: Newspaper,
      title: language === "en" ? "Press Kit" : "Kit de Presse",
      prompt:
        language === "en"
          ? `Generate a complete press kit for "${appName}" in English. Include: boilerplate (150 words), key facts/bullet points, founder/team quote placeholders, 3 press release headline options, media contact placeholders, and 3 influencer pitch angles. Use the session context.`
          : `Génère un kit de presse complet pour "${appName}" en français. Inclus : boilerplate (150 mots), faits clés, placeholders de citation fondateur/équipe, 3 options de titres de communiqué, placeholders de contact presse, et 3 angles de pitch pour influenceurs. Utilise le contexte de la session.`,
    },
  };

  const buildContext = () => {
    const ctx = {
      appOverview: session.appOverview,
      targetPersonas: session.targetPersonas,
      monetization: session.monetization,
      aso: session.appStoreOptimization,
      advertisingAngles: session.advertisingAngles,
      swotSummary: session.swotAndTrends?.strategicSummary,
    };
    return JSON.stringify(ctx, null, 2).slice(0, 6000);
  };

  const handleGenerate = async (tab: ToolkitTab) => {
    setIsLoading(true);
    setError(null);
    try {
      const meta = tabMeta[tab];
      const res = await fetch("/api/marketing/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey: meta.title,
          currentContent: { sessionContext: buildContext() },
          userInstructions: meta.prompt,
          language,
          engineConfig,
        }),
      });

      const data = await parseApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur de production.");
      }
      setContent((prev) => ({ ...prev, [tab]: data.revisedContent || "" }));
    } catch (err: any) {
      setError(err.message || "Impossible de générer le contenu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const text = content[activeTab];
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const activeMeta = tabMeta[activeTab];
  const Icon = activeMeta.icon;
  const activeContent = content[activeTab];

  return (
    <section id="section-growth-toolkit" className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === "en" ? "Growth Toolkit" : "Boîte à outils Growth"}
            </h2>
            <p className="text-xs text-slate-500">
              {language === "en"
                ? "Generate extra launch assets on demand: landing page, 30-day calendar, press kit."
                : "Générez à la demande des assets complémentaires : landing page, calendrier 30J, kit de presse."}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(tabMeta) as ToolkitTab[]).map((tab) => {
          const TabIcon = tabMeta[tab].icon;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                activeTab === tab
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tabMeta[tab].label}
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 min-h-[12rem]">
        {activeContent ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {activeMeta.title}
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? (language === "en" ? "Copied" : "Copié") : language === "en" ? "Copy" : "Copier"}
              </button>
            </div>
            <div className="markdown-body bg-white rounded-xl border border-slate-200 p-4 text-xs text-slate-800 leading-relaxed max-h-[32rem] overflow-y-auto">
              <Markdown>{activeContent}</Markdown>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <Wand2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">{activeMeta.title}</p>
            <p className="text-xs text-slate-500 max-w-md mb-4">
              {language === "en"
                ? "Generate this asset with one click using your session context."
                : "Générez cet asset en un clic en utilisant le contexte de la session."}
            </p>
            <button
              onClick={() => handleGenerate(activeTab)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-colors ${
                isLoading ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {language === "en" ? "Producing..." : "Production..."}
                </>
              ) : (
                <>
                  <Rocket className="w-3.5 h-3.5" />
                  {language === "en" ? "Generate" : "Générer"}
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
