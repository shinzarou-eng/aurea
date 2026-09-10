import { Globe, Info, Key, Download, History, Command, Github } from "lucide-react";
import { useState } from "react";
import { EngineConfig } from "../types";
// @ts-ignore
import logo from "/aurea-icon.svg?url";

const t = {
  fr: {
    engine: "Moteur",
    connected: "Connecté",
    export: "Exporter",
    commandTitle: "Palette de commandes (Ctrl/Cmd + K)",
    history: "Historique",
    historyTitle: "Historique des sessions",
    settings: "Configuration",
    settingsTitle: "Configuration API",
    languageTitle: "Changer la langue",
    infoTitle: "Guide d'utilisation",
    infoHeading: "Comment fonctionne Aurea ?",
    infoIntro:
      "Aurea combine une analyse visuelle fine de vos captures d'écran avec une expertise de lancement produit pour vous aider à prioriser, communiquer et déployer votre application.",
    infoSteps: [
      "Importez vos photos : glissez 1 à 6 captures (accueil, profil, fonctionnalité phare, etc.) ou utilisez un exemple.",
      "Analyse complète : nous extrayons la proposition de valeur, les fonctionnalités clés, le ton de marque et les personas cibles.",
      "Kit de lancement : fiche App Store (ASO), posts réseaux, scripts UGC, angles publicitaires et maquettes.",
      "Audit & tests : soumettez le dossier de votre projet pour un audit technique et des tests de build.",
    ],
    infoCta: "Compris, c'est parti",
  },
  en: {
    engine: "Engine",
    connected: "Connected",
    export: "Export",
    commandTitle: "Command palette (Ctrl/Cmd + K)",
    history: "History",
    historyTitle: "Session history",
    settings: "Settings",
    settingsTitle: "API settings",
    languageTitle: "Switch language",
    infoTitle: "User guide",
    infoHeading: "How does Aurea work?",
    infoIntro:
      "Aurea combines visual analysis of your screenshots with product-launch expertise to help you prioritize, communicate, and ship your application.",
    infoSteps: [
      "Upload your screenshots: drag 1 to 6 captures (home, profile, key feature, etc.) or use an example.",
      "Full analysis: we extract the value proposition, key features, brand voice, and target personas.",
      "Launch kit: App Store listing (ASO), social posts, UGC scripts, ad angles, and mockups.",
      "Audit & tests: submit your project folder for a technical audit and build tests.",
    ],
    infoCta: "Got it, let's go",
  },
};

interface HeaderProps {
  language: "fr" | "en";
  setLanguage: (lang: "fr" | "en") => void;
  onExportMarkdown: () => void;
  onOpenExportHub?: () => void;
  hasSession: boolean;
  engineConfig: EngineConfig;
  onOpenEngineSettings: () => void;
  onOpenHistory?: () => void;
  onOpenCommandPalette?: () => void;
}

export default function Header({
  language,
  setLanguage,
  onOpenExportHub,
  hasSession,
  engineConfig,
  onOpenEngineSettings,
  onOpenHistory,
  onOpenCommandPalette,
}: HeaderProps) {
  const [showInfo, setShowInfo] = useState(false);
  const txt = t[language];

  const providerLabel = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    custom: "Custom",
    gemini: "Google",
    deepseek: "DeepSeek",
    groq: "Groq",
    mistral: "Mistral",
    openrouter: "OpenRouter",
    perplexity: "Perplexity",
  }[engineConfig.provider] || "Google";

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)]/95 backdrop-blur-xl border-b border-[var(--color-border)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 h-[4.5rem] flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Aurea"
            className="size-9 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
          />
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-[1.45rem] text-[var(--color-text)] tracking-tight">Aurea</span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {engineConfig.apiKey ? `${txt.connected} • ${providerLabel}` : `${txt.engine} • ${providerLabel}`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {hasSession && (
            <button
              onClick={onOpenExportHub}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{txt.export}</span>
            </button>
          )}

          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            title={txt.commandTitle}
          >
            <Command className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px]">⌘K</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            title={txt.historyTitle}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{txt.history}</span>
          </button>

          <button
            onClick={onOpenEngineSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            title={txt.settingsTitle}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{txt.settings}</span>
          </button>

          <button
            onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            title={txt.languageTitle}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase">{language}</span>
          </button>

          <button
            onClick={() => setShowInfo(true)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            title={txt.infoTitle}
          >
            <Info className="w-4 h-4" />
          </button>

          <a
            href="https://github.com/shinzarou-eng"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            title="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{txt.infoHeading}</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {txt.infoIntro}
            </p>
            <div className="space-y-2.5 text-xs text-slate-600 mb-6">
              {txt.infoSteps.map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                {txt.infoCta}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
