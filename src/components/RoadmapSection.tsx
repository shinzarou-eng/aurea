import { useState } from "react";
import { ActionPlanDay } from "../types";
import { Calendar, CheckCircle2, Circle, Star } from "lucide-react";

interface RoadmapSectionProps {
  plan: ActionPlanDay[];
  onRefine: (sectionKey: string, content: any) => void;
}

export default function RoadmapSection({ plan, onRefine }: RoadmapSectionProps) {
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});

  const toggleDay = (index: number) => {
    setCompletedDays((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const safePlan = plan || [];
  const completedCount = Object.values(completedDays).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (safePlan.length || 1)) * 100) || 0;

  return (
    <div id="section-roadmap" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md">
              Module 9
            </span>
            <h3 className="text-lg font-bold text-slate-900">Plan d'Action de Lancement (7 Jours)</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Les étapes chronologiques pour transformer votre session marketing en téléchargements réels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800">{completedCount}/{safePlan.length} étapes validées</span>
            <div className="w-28 h-2 rounded-full bg-slate-150 overflow-hidden mt-1">
              <div
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => onRefine("Plan d'Action 7 Jours", safePlan)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Ajuster</span>
          </button>
        </div>
      </div>

      {/* Roadmap Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {safePlan.map((item, idx) => {
          const isDone = !!completedDays[idx];
          return (
            <div
              key={idx}
              onClick={() => toggleDay(idx)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                isDone
                  ? "bg-teal-50/70 border-teal-200 opacity-80"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    {item?.day || `Jour ${idx + 1}`}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                </div>

                <p className={`text-xs leading-relaxed mb-3 ${isDone ? "line-through text-slate-500" : "text-slate-800 font-medium"}`}>
                  {item?.task || "Action à réaliser"}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Canal</span>
                <span className="text-[11px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  {item?.channel || "Général"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
