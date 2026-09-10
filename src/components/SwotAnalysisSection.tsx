import { useState } from "react";
import { SwotAndTrends } from "../types";
import { 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Star, 
  Copy, 
  Check, 
  Compass, 
  Flame, 
  Lightbulb, 
  ArrowUpRight 
} from "lucide-react";

interface SwotAnalysisSectionProps {
  swot: SwotAndTrends;
  onRefine: (sectionKey: string, content: any) => void;
}

export default function SwotAnalysisSection({ swot, onRefine }: SwotAnalysisSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyFullSwot = () => {
    const text = `
=== ANALYSE SWOT & TENDANCES MARCHÉ ===

FORCES (STRENGTHS) :
${(swot?.strengths || []).map((s) => `- ${s}`).join("\n")}

FAIBLESSES (WEAKNESSES) :
${(swot?.weaknesses || []).map((w) => `- ${w}`).join("\n")}

OPPORTUNITÉS (OPPORTUNITIES) :
${(swot?.opportunities || []).map((o) => `- ${o}`).join("\n")}

MENACES (THREATS) :
${(swot?.threats || []).map((t) => `- ${t}`).join("\n")}

TENDANCES DU MARCHÉ :
${(swot?.marketTrends || []).map((m: any) => {
  const name = typeof m === "string" ? m : (m?.trendName || "Tendance");
  const impact = typeof m === "string" ? "Élevé" : (m?.impactScore || "Fort");
  const desc = typeof m === "string" ? m : (m?.description || "");
  const advice = typeof m === "string" ? "Capitaliser sur cette opportunité" : (m?.actionableAdvice || "");
  return `[${impact}] ${name} : ${desc} -> Conseil : ${advice}`;
}).join("\n")}

SYNTHÈSE STRATÉGIQUE :
${swot?.strategicSummary || ""}
`;
    copyToClipboard(text, "full-swot");
  };

  return (
    <div id="section-swot" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-100 px-2.5 py-1 rounded-md flex items-center gap-1">
              <span>Module 3</span>
              <span className="text-[10px] bg-violet-600 text-white px-1.5 py-0.2 rounded font-extrabold">SWOT</span>
            </span>
            <h3 className="text-lg font-bold text-slate-900">Analyse SWOT & Tendances du Marché</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Diagnostic stratégique 360° établi d'après vos interfaces et la veille concurrentielle du secteur.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyFullSwot}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            {copiedKey === "full-swot" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "full-swot" ? "SWOT copié !" : "Copier le SWOT"}</span>
          </button>

          <button
            onClick={() => onRefine("Analyse SWOT et Tendances", swot)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Affiner</span>
          </button>
        </div>
      </div>

      {/* 4 Quadrants Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 1. Forces (Strengths) */}
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Forces (Strengths)</h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100/60 px-2 py-0.5 rounded">
                Interne
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              {(swot?.strengths || []).map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-bold text-sm leading-none mt-0.5">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2. Faiblesses (Weaknesses) */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Faiblesses (Weaknesses)</h4>
              </div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-100/60 px-2 py-0.5 rounded">
                Interne
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              {(swot?.weaknesses || []).map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-600 font-bold text-sm leading-none mt-0.5">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. Opportunités (Opportunities) */}
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Opportunités (Opportunities)</h4>
              </div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-100/60 px-2 py-0.5 rounded">
                Marché
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              {(swot?.opportunities || []).map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold text-sm leading-none mt-0.5">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. Menaces (Threats) */}
        <div className="rounded-xl border border-rose-200/80 bg-rose-50/40 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Menaces (Threats)</h4>
              </div>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-100/60 px-2 py-0.5 rounded">
                Marché
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              {(swot?.threats || []).map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-rose-600 font-bold text-sm leading-none mt-0.5">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Market Trends Radar */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-violet-100 text-violet-700 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Grandes Tendances de Marché & Signaux Porteurs
            </h4>
            <p className="text-[11px] text-slate-500">
              Les dynamiques d'usage actuelles à exploiter pour maximiser la rétention et l'attrait commercial.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(swot?.marketTrends || []).map((trend: any, idx) => {
            const name = typeof trend === "string" ? trend : (trend?.trendName || `Tendance #${idx + 1}`);
            const impact = typeof trend === "string" ? "Élevé" : (trend?.impactScore || "Fort");
            const desc = typeof trend === "string" ? trend : (trend?.description || "");
            const advice = typeof trend === "string" ? "Mettre en avant ce point fort" : (trend?.actionableAdvice || "");

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col justify-between hover:border-violet-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h5 className="text-xs font-bold text-slate-900">{name}</h5>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 shrink-0">
                      {impact}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {desc}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 text-xs">
                  <span className="font-semibold text-emerald-700 block mb-1 text-[11px] flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    Comment capitaliser dessus :
                  </span>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {advice}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strategic Synthesis Callout */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-start space-x-3.5 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
            Verdict & Synthèse Stratégique du Directeur Marketing
          </span>
          <p className="text-xs text-slate-200 leading-relaxed">
            {swot?.strategicSummary || "Alignement marketing et produit optimal identifié."}
          </p>
        </div>
      </div>
    </div>
  );
}
