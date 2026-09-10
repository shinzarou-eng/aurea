import { useState } from "react";
import { CompetitorAnalysis, MarketingSession, EngineConfig } from "../types";
import { generateDefaultCompetitors } from "../utils/competitorDefaults";
import { 
  ShieldAlert, 
  Swords, 
  Star, 
  Copy, 
  Check, 
  TrendingUp, 
  Crosshair, 
  Zap,
  Target,
  RefreshCw
} from "lucide-react";

interface CompetitorBenchmarkSectionProps {
  session: MarketingSession;
  engineConfig: EngineConfig;
  onRefine: (sectionKey: string, content: any) => void;
  onUpdateCompetitors?: (updated: CompetitorAnalysis) => void;
}

export default function CompetitorBenchmarkSection({ 
  session, 
  engineConfig, 
  onRefine,
  onUpdateCompetitors 
}: CompetitorBenchmarkSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const rawAnalysis = session.competitorAnalysis || generateDefaultCompetitors(session);
  const analysis: CompetitorAnalysis = {
    unfairAdvantageMoat: rawAnalysis?.unfairAdvantageMoat || "Simplicité radicale et prise en main instantanée sans friction.",
    counterPositioningStrategy: rawAnalysis?.counterPositioningStrategy || "Positionnement centré sur l'efficacité directe face aux applications usines à gaz.",
    targetMarketShareGoal: rawAnalysis?.targetMarketShareGoal || "Capter les utilisateurs actifs fatigués de la complexité des acteurs historiques.",
    competitors: Array.isArray(rawAnalysis?.competitors) && rawAnalysis.competitors.length > 0 
      ? rawAnalysis.competitors 
      : generateDefaultCompetitors(session).competitors,
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/marketing/generate-competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionContext: session,
          engineConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.competitorAnalysis && onUpdateCompetitors) {
        onUpdateCompetitors(data.competitorAnalysis);
      }
    } catch (err) {
      console.error("Erreur d'analyse concurrents :", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div id="section-competitors" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Swords className="w-3.5 h-3.5 text-rose-500" />
              Module 12 • Stratégie Offensive
            </span>
            <h3 className="text-lg font-bold text-slate-900">Analyse Concurrentielle & Avantage Déloyal</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Démontez les faiblesses des leaders du marché et exploitez des angles d'acquisition ciblés pour capturer leurs utilisateurs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "Analyse en cours..." : "Régénérer"}</span>
          </button>

          <button
            onClick={() => onRefine("Analyse Concurrentielle & Moat", analysis)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Affiner</span>
          </button>
        </div>
      </div>

      {/* Strategic Moat & Counter-Positioning Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xs">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Notre Avantage Déloyal (Moat)
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {analysis.unfairAdvantageMoat}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
            Angle de Contre-Positionnement
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">
            {analysis.counterPositioningStrategy}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <Target className="w-3.5 h-3.5 text-amber-600" />
            Objectif de Pénétration Marché
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">
            {analysis.targetMarketShareGoal}
          </p>
        </div>
      </div>

      {/* Competitors Detailed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {analysis.competitors.map((comp, idx) => (
          <div 
            key={idx}
            className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all"
          >
            <div>
              {/* Competitor Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Concurrent #{idx + 1}</span>
                  <h4 className="text-sm font-extrabold text-slate-900">{comp.name}</h4>
                  <span className="inline-block text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-0.5">
                    {comp.category}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(
                    `Concurrent: ${comp.name}\nFaiblesse: ${comp.theirWeakness}\nNotre Avantage: ${comp.ourAdvantage}\nPrix: ${comp.pricingComparison}\nAngle d'acquisition: ${comp.poachingAngle}`,
                    `comp-${idx}`
                  )}
                  className="text-slate-400 hover:text-slate-700 p-1"
                  title="Copier les données du concurrent"
                >
                  {copiedKey === `comp-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Weakness & Vulnerability */}
              <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-100 mb-3">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  Leur Faiblesse / Frustration Utilisateur
                </span>
                <p className="text-xs text-rose-900 leading-relaxed font-medium">
                  {comp.theirWeakness}
                </p>
              </div>

              {/* Our Superior Advantage */}
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 mb-3">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  Pourquoi Notre App Gagne
                </span>
                <p className="text-xs text-emerald-950 leading-relaxed font-semibold">
                  {comp.ourAdvantage}
                </p>
              </div>

              {/* Pricing comparison */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 mb-3 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Comparatif Tarifaire
                </span>
                <p className="text-slate-700 leading-snug">{comp.pricingComparison}</p>
              </div>
            </div>

            {/* Poaching Angle */}
            <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                  <Crosshair className="w-3 h-3 text-indigo-600" />
                  Hook pour 'Voler' leurs Utilisateurs :
                </span>
                <button
                  onClick={() => copyToClipboard(comp.poachingAngle, `hook-poach-${idx}`)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  {copiedKey === `hook-poach-${idx}` ? "Copié !" : "Copier"}
                </button>
              </div>
              <p className="text-xs text-indigo-950 italic leading-relaxed">
                "{comp.poachingAngle}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
