import { useEffect, useMemo, useState } from "react";
import { Command, X, ArrowUpRight, Search, FileText, Printer, RefreshCw, Download, Settings, History, MessageSquare, Globe } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  hasSession: boolean;
  onAction: (action: string) => void;
  language: "fr" | "en";
}

interface ActionItem {
  id: string;
  label: string;
  group: string;
  icon: any;
  requiresSession?: boolean;
}

export default function CommandPalette({
  isOpen,
  onClose,
  hasSession,
  onAction,
  language,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  const baseActions: ActionItem[] = useMemo(
    () => [
      { id: "nav-overview", label: language === "en" ? "Overview" : "Présentation", group: "Modules", icon: ArrowUpRight },
      { id: "nav-personas", label: language === "en" ? "Personas" : "Personas", group: "Modules", icon: ArrowUpRight },
      { id: "nav-swot", label: language === "en" ? "SWOT & Trends" : "SWOT & Tendances", group: "Modules", icon: ArrowUpRight },
      { id: "nav-monetization", label: language === "en" ? "Monetization" : "Monétisation", group: "Modules", icon: ArrowUpRight },
      { id: "nav-paywall-studio", label: language === "en" ? "Paywall Studio" : "Studio Paywall", group: "Modules", icon: ArrowUpRight },
      { id: "nav-aso", label: language === "en" ? "App Store (ASO)" : "Fiche Store (ASO)", group: "Modules", icon: ArrowUpRight },
      { id: "nav-ab-testing", label: language === "en" ? "A/B Tests" : "A/B Tests", group: "Modules", icon: ArrowUpRight },
      { id: "nav-ugc", label: language === "en" ? "UGC Storyboards" : "Scripts UGC", group: "Modules", icon: ArrowUpRight },
      { id: "nav-social", label: language === "en" ? "Social Media" : "Réseaux Sociaux", group: "Modules", icon: ArrowUpRight },
      { id: "nav-ads", label: language === "en" ? "Ad Angles" : "Angles Pubs", group: "Modules", icon: ArrowUpRight },
      { id: "nav-ad-creatives", label: language === "en" ? "Ad Creatives" : "Bannières Pubs", group: "Modules", icon: ArrowUpRight },
      { id: "nav-retention", label: language === "en" ? "Retention" : "Rétention", group: "Modules", icon: ArrowUpRight },
      { id: "nav-localization-hub", label: language === "en" ? "Localization" : "Localisation", group: "Modules", icon: ArrowUpRight },
      { id: "nav-pr", label: language === "en" ? "PR & Pitch" : "Presse", group: "Modules", icon: ArrowUpRight },
      { id: "nav-roadmap", label: language === "en" ? "7-Day Plan" : "Plan 7 Jours", group: "Modules", icon: ArrowUpRight },
      { id: "nav-competitors", label: language === "en" ? "Competitors" : "Concurrents", group: "Modules", icon: ArrowUpRight },
      { id: "nav-growth-calculator", label: language === "en" ? "Growth Simulator" : "Simulateur", group: "Modules", icon: ArrowUpRight },
      { id: "nav-okr", label: language === "en" ? "OKRs 30J" : "OKRs 30J", group: "Modules", icon: ArrowUpRight },
      { id: "nav-growth-toolkit", label: language === "en" ? "Growth Toolkit" : "Boîte à outils Growth", group: "Modules", icon: ArrowUpRight },
      { id: "nav-project-audit", label: language === "en" ? "Project Audit" : "Audit Projet", group: "Modules", icon: ArrowUpRight },
      { id: "nav-mockups", label: language === "en" ? "Mockup Studio" : "Studio Maquettes", group: "Modules", icon: ArrowUpRight },
    ],
    [language]
  );

  const globalActions: ActionItem[] = useMemo(
    () => [
      { id: "export-markdown", label: language === "en" ? "Export Markdown" : "Exporter Markdown", group: "Actions", icon: FileText, requiresSession: true },
      { id: "export-hub", label: language === "en" ? "Open Export Hub" : "Centre d'Exportation", group: "Actions", icon: Download, requiresSession: true },
      { id: "print", label: language === "en" ? "Print" : "Imprimer", group: "Actions", icon: Printer, requiresSession: true },
      { id: "regenerate", label: language === "en" ? "Regenerate session" : "Régénérer la session", group: "Actions", icon: RefreshCw, requiresSession: true },
      { id: "engine-settings", label: language === "en" ? "Settings" : "Paramètres du moteur", group: "Actions", icon: Settings },
      { id: "history", label: language === "en" ? "Session history" : "Historique des sessions", group: "Actions", icon: History },
      { id: "language", label: language === "en" ? "Switch to French" : "Passer en anglais", group: "Actions", icon: Globe },
      { id: "advisor", label: language === "en" ? "Open product advisor" : "Ouvrir le conseiller produit", group: "Actions", icon: MessageSquare },
    ],
    [language]
  );

  const actions = useMemo(() => {
    const all = [...baseActions, ...globalActions];
    const q = query.trim().toLowerCase();
    const filtered = all.filter((a) => a.label.toLowerCase().includes(q) || a.group.toLowerCase().includes(q));
    return filtered.filter((a) => !a.requiresSession || hasSession);
  }, [baseActions, globalActions, query, hasSession]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      setQuery("");
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const run = (id: string) => {
    onAction(id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[70vh]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === "en" ? "Search modules & actions..." : "Rechercher modules & actions..."}
            className="flex-1 text-sm outline-none text-slate-800 placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100"
          >
            ESC
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {actions.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              {language === "en" ? "No matching action" : "Aucune action correspondante"}
            </div>
          ) : (
            <div className="space-y-1">
              {actions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => run(action.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                        <p className="text-[10px] text-slate-400">{action.group}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 group-hover:text-emerald-600">
                      ↵
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>{language === "en" ? "Use Ctrl/Cmd + K to toggle" : "Ctrl/Cmd + K pour ouvrir/fermer"}</span>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" /> + K
          </span>
        </div>
      </div>
    </div>
  );
}
