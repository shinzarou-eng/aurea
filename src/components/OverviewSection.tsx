import { useState } from "react";
import { AppOverview } from "../types";
import { Copy, Check, Star, Palette, Layers, Award, Tag } from "lucide-react";

interface OverviewSectionProps {
  overview: AppOverview;
  onRefine: (sectionKey: string, content: any) => void;
}

export default function OverviewSection({ overview, onRefine }: OverviewSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div id="section-overview" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              Module 1
            </span>
            <h3 className="text-lg font-bold text-slate-900">Analyse de Marque & Positionnement</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Déduit directement de l'ergonomie, des couleurs et de la hiérarchie visuelle de vos captures.
          </p>
        </div>

        <button
          onClick={() => onRefine("Positionnement et Marque", overview)}
          className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
        >
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span>Affiner</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Slogan & UVP */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative group">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Slogan & Tagline phare</span>
              <button
                onClick={() => copyToClipboard(overview.catchphrase, "catchphrase")}
                className="text-slate-400 hover:text-slate-700 flex items-center gap-1"
                title="Copier le slogan"
              >
                {copiedKey === "catchphrase" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copiedKey === "catchphrase" ? "Copié !" : "Copier"}</span>
              </button>
            </div>
            <p className="text-base font-bold text-slate-900 leading-snug">
              "{overview.catchphrase}"
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative group">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Proposition de Valeur Unique (UVP)</span>
              <button
                onClick={() => copyToClipboard(overview.uniqueValueProposition, "uvp")}
                className="text-slate-400 hover:text-slate-700 flex items-center gap-1"
                title="Copier l'UVP"
              >
                {copiedKey === "uvp" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copiedKey === "uvp" ? "Copié !" : "Copier"}</span>
              </button>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {overview.uniqueValueProposition}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              <span>Tonalité de Marque Recommandée</span>
            </div>
            <p className="text-xs font-semibold text-slate-800">
              {overview.brandVoice}
            </p>
          </div>
        </div>

        {/* Right Column: Features & Palette */}
        <div className="space-y-4">
          {/* Key Features Detected */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Fonctionnalités Clés Détectées sur les Écrans</span>
            </div>
            <div className="space-y-2">
              {(overview?.primaryFeaturesDetected || []).map((feat, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-700">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span>Palette de Couleurs Extraite des Visuels</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {(overview?.colorPalette || ["#10B981", "#059669", "#047857"]).map((color, i) => (
                <button
                  key={i}
                  onClick={() => copyToClipboard(color, `color-${i}`)}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs text-slate-700 shadow-2xs transition-all"
                  title="Cliquer pour copier le code HEX"
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-mono text-[11px] font-semibold">{color}</span>
                  {copiedKey === `color-${i}` && <span className="text-[10px] text-emerald-600 font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pill */}
          <div className="flex items-center justify-between text-xs px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600">
            <span className="font-medium">Catégorie cible principale :</span>
            <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
              {overview.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
