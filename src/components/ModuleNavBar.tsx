import { 
  Compass, 
  Users, 
  TrendingUp, 
  Crown, 
  Store, 
  GitCompare,
  Video,
  Share2, 
  Target, 
  Megaphone, 
  Calendar, 
  Swords,
  Calculator,
  Award,
  Smartphone,
  Bell,
  CreditCard,
  Palette,
  Globe,
  Briefcase
} from "lucide-react";

interface ModuleNavBarProps {
  activeSection?: string;
  language?: "fr" | "en";
}

const MODULES = [
  { id: "section-overview", label: "Présentation", labelEn: "Overview", short: "Aperçu", shortEn: "Overview", icon: Compass, color: "hover:text-emerald-700" },
  { id: "section-personas", label: "Personas", labelEn: "Personas", short: "Personas", shortEn: "Personas", icon: Users, color: "hover:text-indigo-700" },
  { id: "section-swot", label: "SWOT & Tendances", labelEn: "SWOT & Trends", short: "SWOT", shortEn: "SWOT", icon: TrendingUp, color: "hover:text-cyan-700" },
  { id: "section-monetization", label: "Monétisation", labelEn: "Monetization", short: "Paywall", shortEn: "Paywall", icon: Crown, color: "hover:text-amber-700" },
  { id: "section-paywall-studio", label: "Studio Paywall", labelEn: "Paywall Studio", short: "Studio Paywall", shortEn: "Paywall Studio", icon: CreditCard, color: "hover:text-amber-700" },
  { id: "section-aso", label: "Fiche Store (ASO)", labelEn: "App Store (ASO)", short: "ASO", shortEn: "ASO", icon: Store, color: "hover:text-blue-700" },
  { id: "section-ab-testing", label: "A/B Test Generator", labelEn: "A/B Test Generator", short: "A/B Tests", shortEn: "A/B Tests", icon: GitCompare, color: "hover:text-rose-700" },
  { id: "section-ugc", label: "Scripts Vidéo UGC", labelEn: "UGC Video Scripts", short: "UGC / Vidéo", shortEn: "UGC / Video", icon: Video, color: "hover:text-purple-700" },
  { id: "section-social", label: "Réseaux Sociaux", labelEn: "Social Media", short: "Social", shortEn: "Social", icon: Share2, color: "hover:text-rose-700" },
  { id: "section-ads", label: "Angles Pubs", labelEn: "Ad Angles", short: "Ads", shortEn: "Ads", icon: Target, color: "hover:text-orange-700" },
  { id: "section-ad-creatives", label: "Bannières & Visuels Pub", labelEn: "Ad Creatives", short: "Bannières Pubs", shortEn: "Creatives", icon: Palette, color: "hover:text-pink-700" },
  { id: "section-retention", label: "Séquences Push & Emails", labelEn: "Push & Email Sequences", short: "Push & Rétention", shortEn: "Retention", icon: Bell, color: "hover:text-blue-700" },
  { id: "section-localization-hub", label: "Localisation Internationale", labelEn: "International Localization", short: "Localisation", shortEn: "Localization", icon: Globe, color: "hover:text-teal-700" },
  { id: "section-pr", label: "Presse & Pitch", labelEn: "Press & Pitch", short: "Presse", shortEn: "Press", icon: Megaphone, color: "hover:text-purple-700" },
  { id: "section-roadmap", label: "Plan 7 Jours", labelEn: "7-Day Plan", short: "Plan", shortEn: "Plan", icon: Calendar, color: "hover:text-teal-700" },
  { id: "section-competitors", label: "Analyse Concurrents", labelEn: "Competitor Analysis", short: "Concurrents", shortEn: "Competitors", icon: Swords, color: "hover:text-rose-700" },
  { id: "section-growth-calculator", label: "Simulateur Budget & ROI", labelEn: "Budget & ROI Simulator", short: "Simulateur", shortEn: "Simulator", icon: Calculator, color: "hover:text-emerald-700" },
  { id: "section-okr", label: "Objectifs OKR (30J)", labelEn: "OKR Goals (30D)", short: "OKRs 30J", shortEn: "OKRs 30D", icon: Award, color: "hover:text-purple-700" },
  { id: "section-growth-toolkit", label: "Boîte à outils Growth", labelEn: "Growth Toolkit", short: "Growth", shortEn: "Growth", icon: Briefcase, color: "hover:text-slate-700" },
  { id: "section-mockups", label: "Studio Maquettes", labelEn: "Mockup Studio", short: "Mockups", shortEn: "Mockups", icon: Smartphone, color: "hover:text-emerald-700" },
];

export default function ModuleNavBar({ activeSection, language = "fr" }: ModuleNavBarProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80; // Offset for sticky header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[var(--color-bg)]/95 backdrop-blur-xl border-b border-[var(--color-border)] mb-8 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden md:inline">
            {language === "en" ? "Modules:" : "Modules :"}
          </span>
          {MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => scrollTo(mod.id)}
                className={`text-[11px] font-semibold px-3 py-2 rounded-lg border transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeSection === mod.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white hover:bg-slate-100/80 text-slate-600 border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <span className="text-[10px] text-slate-400 font-mono">0{idx + 1}</span>
                <Icon className="w-3.5 h-3.5 opacity-70" />
                <span className="hidden sm:inline">{language === "en" ? mod.labelEn : mod.label}</span>
                <span className="sm:hidden">{language === "en" ? mod.shortEn : mod.short}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
