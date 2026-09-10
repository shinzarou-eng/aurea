import { useState } from "react";
import { AdvertisingAngle } from "../types";
import { Copy, Check, Star, Target, MousePointerClick, Image as ImageIcon } from "lucide-react";

interface AdsSectionProps {
  angles: AdvertisingAngle[];
  onRefine: (sectionKey: string, content: any) => void;
}

export default function AdsSection({ angles, onRefine }: AdsSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div id="section-ads" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
              Module 7
            </span>
            <h3 className="text-lg font-bold text-slate-900">Angles Publicitaires (Meta, TikTok & Google Ads)</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Structures de copywriting à fort taux de conversion prêtes pour vos campagnes payantes.
          </p>
        </div>

        <button
          onClick={() => onRefine("Angles Publicitaires", angles)}
          className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
        >
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span>Affiner</span>
        </button>
      </div>

      {/* Grid of Angles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {(angles || []).map((angle, idx) => {
          const angleName = angle?.angleName || `Angle #${idx + 1}`;
          const hookText = angle?.hookText || "Découvrez une nouvelle manière de faire";
          const bodyCopy = angle?.bodyCopy || "Gagnez du temps au quotidien avec notre application innovante.";
          const ctaButton = angle?.ctaButton || "Installer l'application";
          const visual = angle?.recommendedVisualConcept || "Capture d'écran montrant le bénéfice immédiat";

          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded">
                    Angle #{idx + 1} : {angleName}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `[Titre]: ${hookText}\n\n[Texte]: ${bodyCopy}\n\n[Bouton]: ${ctaButton}\n\n[Visuel suggéré]: ${visual}`,
                        `angle-${idx}`
                      )
                    }
                    className="text-slate-400 hover:text-slate-700"
                    title="Copier tout l'angle"
                  >
                    {copiedKey === `angle-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Ad Headline Hook */}
                <div className="p-3 rounded-lg bg-white border border-slate-200 mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Accroche Principale (Headline)
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-snug">{hookText}</p>
                </div>

                {/* Ad Body (PAS / Story) */}
                <div className="p-3 rounded-lg bg-white border border-slate-200 mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Corps du Texte Publicitaire
                  </span>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{bodyCopy}</p>
                </div>

                {/* CTA Button */}
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between mb-3 text-xs">
                  <span className="text-emerald-800 font-medium flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5 text-emerald-600" />
                    Bouton CTA recommandé :
                  </span>
                  <span className="font-bold text-emerald-950 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {ctaButton}
                  </span>
                </div>
              </div>

              {/* Visual concept */}
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800 flex items-center gap-1 mb-1 text-[11px]">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  Concept Visuel basé sur vos captures :
                </span>
                <p className="text-[11px] leading-relaxed">{visual}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
