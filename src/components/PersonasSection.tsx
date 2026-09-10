import { TargetPersona } from "../types";
import { UserCheck, Zap, HeartHandshake, Star, AlertCircle } from "lucide-react";

interface PersonasSectionProps {
  personas: TargetPersona[];
  onRefine: (sectionKey: string, content: any) => void;
}

export default function PersonasSection({ personas, onRefine }: PersonasSectionProps) {
  return (
    <div id="section-personas" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Module 2
            </span>
            <h3 className="text-lg font-bold text-slate-900">Personas & Publics Cibles Idéaux</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Les profils utilisateurs qui convertiront le plus vite selon l'expérience visuelle proposée.
          </p>
        </div>

        <button
          onClick={() => onRefine("Personas Cibles", personas)}
          className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
        >
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span>Affiner</span>
        </button>
      </div>

      {/* Personas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(personas || []).map((persona, idx) => {
          const name = persona?.personaName || (persona as any)?.name || `Profil #${idx + 1}`;
          const painPoint = persona?.corePainPoint || (Array.isArray((persona as any)?.corePainPoints) ? (persona as any).corePainPoints.join(", ") : (persona as any)?.painPoint) || "Non spécifié";
          const trigger = persona?.triggerMoment || (persona as any)?.acquisitionHook || "Adoption naturelle";
          const benefit = persona?.keyBenefitExpected || (Array.isArray((persona as any)?.goals) ? (persona as any).goals.join(", ") : (persona as any)?.benefit) || "Gain de temps";

          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                {/* Persona Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Profil #{idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{name}</h4>
                  </div>
                </div>

                {/* Persona Details */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-slate-150">
                    <span className="font-bold text-slate-800 flex items-center gap-1 mb-1 text-[11px] text-rose-700">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Frustration / Douleur majeure
                    </span>
                    <p className="text-slate-600 leading-relaxed">{painPoint}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-150">
                    <span className="font-bold text-slate-800 flex items-center gap-1 mb-1 text-[11px] text-amber-700">
                      <Zap className="w-3.5 h-3.5" />
                      Moment déclencheur d'adoption
                    </span>
                    <p className="text-slate-600 leading-relaxed">{trigger}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-150">
                    <span className="font-bold text-slate-800 flex items-center gap-1 mb-1 text-[11px] text-emerald-700">
                      <HeartHandshake className="w-3.5 h-3.5" />
                      Bénéfice clé recherché
                    </span>
                    <p className="text-slate-600 leading-relaxed">{benefit}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
