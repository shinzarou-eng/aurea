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
}

const MODULES = [
  { id: "section-overview", label: "Présentation", short: "Aperçu", icon: Compass, color: "hover:text-emerald-700" },
  { id: "section-personas", label: "Personas", short: "Personas", icon: Users, color: "hover:text-indigo-700" },
  { id: "section-swot", label: "SWOT & Tendances", short: "SWOT", icon: TrendingUp, color: "hover:text-cyan-700" },
  { id: "section-monetization", label: "Monétisation", short: "Paywall", icon: Crown, color: "hover:text-amber-700" },
  { id: "section-paywall-studio", label: "Studio Paywall", short: "Studio Paywall", icon: CreditCard, color: "hover:text-amber-700" },
  { id: "section-aso", label: "Fiche Store (ASO)", short: "ASO", icon: Store, color: "hover:text-blue-700" },
  { id: "section-ab-testing", label: "A/B Test Generator", short: "A/B Tests", icon: GitCompare, color: "hover:text-rose-700" },
  { id: "section-ugc", label: "Scripts Vidéo UGC", short: "UGC / Vidéo", icon: Video, color: "hover:text-purple-700" },
  { id: "section-social", label: "Réseaux Sociaux", short: "Social", icon: Share2, color: "hover:text-rose-700" },
  { id: "section-ads", label: "Angles Pubs", short: "Ads", icon: Target, color: "hover:text-orange-700" },
  { id: "section-ad-creatives", label: "Bannières & Visuels Pub", short: "Bannières Pubs", icon: Palette, color: "hover:text-pink-700" },
  { id: "section-retention", label: "Séquences Push & Emails", short: "Push & Rétention", icon: Bell, color: "hover:text-blue-700" },
  { id: "section-localization-hub", label: "Localisation Internationale", short: "Localisation", icon: Globe, color: "hover:text-teal-700" },
  { id: "section-pr", label: "Presse & Pitch", short: "Presse", icon: Megaphone, color: "hover:text-purple-700" },
  { id: "section-roadmap", label: "Plan 7 Jours", short: "Plan", icon: Calendar, color: "hover:text-teal-700" },
  { id: "section-competitors", label: "Analyse Concurrents", short: "Concurrents", icon: Swords, color: "hover:text-rose-700" },
  { id: "section-growth-calculator", label: "Simulateur Budget & ROI", short: "Simulateur", icon: Calculator, color: "hover:text-emerald-700" },
  { id: "section-okr", label: "Objectifs OKR (30J)", short: "OKRs 30J", icon: Award, color: "hover:text-purple-700" },
  { id: "section-growth-toolkit", label: "Boîte à outils Growth", short: "Growth", icon: Briefcase, color: "hover:text-slate-700" },
  { id: "section-mockups", label: "Studio Maquettes", short: "Mockups", icon: Smartphone, color: "hover:text-emerald-700" },
];

export default function ModuleNavBar({ activeSection }: ModuleNavBarProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80; // Offset for sticky header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs mb-6 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden md:inline">
            Modules :
          </span>
          {MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => scrollTo(mod.id)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeSection === mod.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white hover:bg-slate-100/80 text-slate-600 border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <span className="text-[10px] text-slate-400 font-mono">0{idx + 1}</span>
                <Icon className="w-3.5 h-3.5 opacity-70" />
                <span className="hidden sm:inline">{mod.label}</span>
                <span className="sm:hidden">{mod.short}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
