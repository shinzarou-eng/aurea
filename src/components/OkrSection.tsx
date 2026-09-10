import { useState, useMemo, useEffect } from "react";
import { MarketingSession, OkrPlan30Days, KeyResult, ObjectiveOkr } from "../types";
import { generateDefaultOkrPlan, SimulatorGrowthInputs } from "../utils/okrDefaults";
import {
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  RefreshCw,
  Edit3,
  Calendar,
  Check,
  ChevronRight,
  Flame,
  ShieldCheck,
  ArrowUpRight,
  Lightbulb,
  Award,
  FileText
} from "lucide-react";
import OkrReportModal from "./OkrReportModal";

interface OkrSectionProps {
  session: MarketingSession;
  simulatorInputs?: SimulatorGrowthInputs;
  onUpdateOkrPlan?: (plan: OkrPlan30Days) => void;
  onRefine?: (sectionKey: string, content: string) => void;
}

export default function OkrSection({
  session,
  simulatorInputs,
  onUpdateOkrPlan,
  onRefine
}: OkrSectionProps) {
  // Initialize plan from session or generate from defaults / simulator
  const [plan, setPlan] = useState<OkrPlan30Days>(() => {
    if (session.okrPlan && session.okrPlan.objectives?.length > 0) {
      return session.okrPlan;
    }
    return generateDefaultOkrPlan(session, simulatorInputs);
  });

  const [editingKrId, setEditingKrId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Sync with session when session.okrPlan updates externally
  useEffect(() => {
    if (session.okrPlan && session.okrPlan.objectives?.length > 0) {
      setPlan(session.okrPlan);
    }
  }, [session.okrPlan]);

  // Persist updates to parent
  const handlePlanChange = (newPlan: OkrPlan30Days) => {
    setPlan(newPlan);
    if (onUpdateOkrPlan) {
      onUpdateOkrPlan(newPlan);
    }
  };

  // Synchronize targets with current simulator inputs
  const handleSyncWithSimulator = () => {
    const refreshed = generateDefaultOkrPlan(session, simulatorInputs);
    // Keep user's currentDay and current logged values if present
    const updatedObjectives = refreshed.objectives.map((refObj) => {
      const existingObj = plan.objectives.find((o) => o.id === refObj.id);
      if (!existingObj) return refObj;

      const updatedKrs = refObj.keyResults.map((refKr) => {
        const existingKr = existingObj.keyResults.find((k) => k.id === refKr.id);
        return {
          ...refKr,
          currentValue: existingKr !== undefined ? existingKr.currentValue : refKr.currentValue,
        };
      });

      return {
        ...refObj,
        keyResults: updatedKrs,
      };
    });

    const updatedPlan: OkrPlan30Days = {
      ...plan,
      objectives: updatedObjectives,
      weeklyMilestones: refreshed.weeklyMilestones.map((m, idx) => ({
        ...m,
        completed: plan.weeklyMilestones[idx]?.completed ?? m.completed,
      })),
    };

    handlePlanChange(updatedPlan);
    setSyncSuccessMessage("Indicateurs synchronisés avec succès avec le simulateur CAC/LTV !");
    setTimeout(() => setSyncSuccessMessage(null), 3000);
  };

  // Update current logged value for a specific KR
  const handleSaveKrValue = (krId: string) => {
    const numeric = parseFloat(editValue.replace(",", "."));
    if (isNaN(numeric)) {
      setEditingKrId(null);
      return;
    }

    const updatedObjectives = plan.objectives.map((obj) => ({
      ...obj,
      keyResults: obj.keyResults.map((kr) =>
        kr.id === krId ? { ...kr, currentValue: numeric } : kr
      ),
    }));

    handlePlanChange({
      ...plan,
      objectives: updatedObjectives,
    });
    setEditingKrId(null);
  };

  // Toggle milestone completion
  const handleToggleMilestone = (weekNum: number) => {
    const updated = plan.weeklyMilestones.map((m) =>
      m.week === weekNum ? { ...m, completed: !m.completed } : m
    );
    handlePlanChange({
      ...plan,
      weeklyMilestones: updated,
    });
  };

  // Change current tracking day (1 to 30)
  const handleDayChange = (newDay: number) => {
    handlePlanChange({
      ...plan,
      currentDay: Math.max(1, Math.min(30, newDay)),
    });
  };

  // Calculate achievement percentage for a single KR
  const getKrProgress = (kr: KeyResult): { pct: number; status: "achieved" | "on_track" | "at_risk" | "behind" } => {
    let pct = 0;
    if (kr.type === "higher_is_better") {
      pct = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
    } else {
      // Lower is better (e.g. CPI, Crash rate)
      // If current <= target -> 100%+
      if (kr.currentValue <= kr.targetValue) {
        pct = 100;
      } else {
        const excess = kr.currentValue - kr.targetValue;
        pct = Math.max(0, 100 - (excess / kr.targetValue) * 100);
      }
    }

    const expectedPct = (plan.currentDay / 30) * 100;
    let status: "achieved" | "on_track" | "at_risk" | "behind" = "on_track";

    if (pct >= 100) {
      status = "achieved";
    } else if (pct >= expectedPct * 0.85) {
      status = "on_track";
    } else if (pct >= expectedPct * 0.6) {
      status = "at_risk";
    } else {
      status = "behind";
    }

    return { pct: Math.min(150, Math.round(pct)), status };
  };

  // Global KPIs stats calculation
  const stats = useMemo(() => {
    let totalKrs = 0;
    let sumPct = 0;
    let achievedCount = 0;
    let onTrackCount = 0;
    let atRiskCount = 0;
    let behindCount = 0;

    plan.objectives.forEach((obj) => {
      obj.keyResults.forEach((kr) => {
        totalKrs++;
        const { pct, status } = getKrProgress(kr);
        sumPct += Math.min(100, pct);
        if (status === "achieved") achievedCount++;
        else if (status === "on_track") onTrackCount++;
        else if (status === "at_risk") atRiskCount++;
        else behindCount++;
      });
    });

    const avgProgress = totalKrs > 0 ? Math.round(sumPct / totalKrs) : 0;
    const completedMilestones = plan.weeklyMilestones.filter((m) => m.completed).length;

    return {
      totalKrs,
      avgProgress,
      achievedCount,
      onTrackCount,
      atRiskCount,
      behindCount,
      completedMilestones,
    };
  }, [plan]);

  // Tactical advice based on lagging KRs
  const tacticalRecommendations = useMemo(() => {
    const list: { title: string; advice: string; impact: string }[] = [];

    // Check CPI
    const cpiKr = plan.objectives[0]?.keyResults.find((k) => k.id === "kr-1-2");
    if (cpiKr && cpiKr.currentValue > cpiKr.targetValue) {
      list.push({
        title: "Pression sur le CPI publicitaire",
        advice: "Votre coût par téléchargement dépasse la cible du simulateur. Mettez en pause les ensembles de pubs à faible CTR et réorientez 60% du budget vers les vidéos UGC axées sur la douleur immédiate résolue par l'app.",
        impact: "Réduction estimée du CPI de -15% à -25%",
      });
    }

    // Check Paywall & Trial
    const trialKr = plan.objectives[1]?.keyResults.find((k) => k.id === "kr-2-2");
    if (trialKr && trialKr.currentValue < trialKr.targetValue * 0.8) {
      list.push({
        title: "Taux d'opt-in de l'essai gratuit en deçà de la cible",
        advice: "Le paywall ne déclenche pas assez d'essais. Intégrez une garantie 'Aucun prélèvement avant J-7' bien visible au-dessus du bouton CTA et activez un écran de pré-paywall expliquant pourquoi tester la version Pro.",
        impact: "Gain attendu de +1.5 à +3 points de conversion",
      });
    }

    // Check Retention / Quality
    const retKr = plan.objectives[3]?.keyResults.find((k) => k.id === "kr-4-2");
    if (retKr && retKr.currentValue < retKr.targetValue * 0.8) {
      list.push({
        title: "Rétention D7 à consolider",
        advice: "Trop d'utilisateurs abandonnent l'app en première semaine. Déclenchez une notification push contextuelle à J+2 proposant une action rapide de 60 secondes pour recréer l'effet 'Wow'.",
        impact: "+20% de réengagement des primo-téléchargeurs",
      });
    }

    // Default good recommendations if everything is on track
    if (list.length === 0) {
      list.push({
        title: "Trajectoire optimale : Préparez le palier de scaling",
        advice: "Tous vos indicateurs de lancement s'alignent avec les prévisions du simulateur. Vous pouvez progressivement augmenter le budget publicitaire journalier de +15% tous les 3 jours sans risquer de dégrader le CPI.",
        impact: "Accélération du MRR sans saturation d'audience",
      });
    }

    return list;
  }, [plan]);

  const filteredObjectives = useMemo(() => {
    if (activeCategoryFilter === "all") return plan.objectives;
    return plan.objectives.filter((obj) => {
      if (activeCategoryFilter === "acquisition") return obj.id === "obj-1";
      if (activeCategoryFilter === "monetization") return obj.id === "obj-2";
      if (activeCategoryFilter === "economics") return obj.id === "obj-3";
      if (activeCategoryFilter === "quality") return obj.id === "obj-4";
      return true;
    });
  }, [plan.objectives, activeCategoryFilter]);

  return (
    <div id="section-okr" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-purple-600" />
              Module 15 • Objectifs OKR (30 Jours)
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Pilotage des KPIs d'Exécution Calés sur le Simulateur
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Indicateurs clés de performance calculés à partir de vos cibles CAC, CPI et LTV pour mesurer l'avancement concret de l'application sur 30 jours.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            title="Générer et exporter le rapport de progression hebdomadaire PDF avec graphiques intégrés"
          >
            <FileText className="w-3.5 h-3.5 text-purple-200" />
            <span>Rapport Hebdo PDF</span>
          </button>

          <button
            onClick={handleSyncWithSimulator}
            className="px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Re-synchroniser les cibles avec le Simulateur Financier"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            <span>Synchroniser avec le Simulateur</span>
          </button>

          {onRefine && (
            <button
              onClick={() => onRefine("okrPlan", JSON.stringify(plan, null, 2))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 text-purple-600" />
              <span>Affiner</span>
            </button>
          )}
        </div>
      </div>

      {/* Sync Banner Notification */}
      {syncSuccessMessage && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{syncSuccessMessage}</span>
        </div>
      )}

      {/* 30-Day Timeline & Global Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Timeline Slider Box */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Ligne de Temps • Sprint de Lancement 30 Jours
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Jour {plan.currentDay} / 30
            </span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Lancement (J1)</span>
              <span className="font-bold text-white">Semaine {Math.ceil(plan.currentDay / 7)} en cours</span>
              <span>Bilan Clôture (J30)</span>
            </div>
            {/* Range input */}
            <input
              type="range"
              min="1"
              max="30"
              value={plan.currentDay}
              onChange={(e) => handleDayChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center">
            <div className={`p-2 rounded-xl text-xs transition-colors ${plan.currentDay <= 7 ? "bg-purple-900/50 border border-purple-500/40" : "bg-slate-800/40 text-slate-400"}`}>
              <div className="font-bold">S1 : J1-J7</div>
              <div className="text-[10px] text-slate-400 truncate">Calibration & CPI</div>
            </div>
            <div className={`p-2 rounded-xl text-xs transition-colors ${plan.currentDay > 7 && plan.currentDay <= 14 ? "bg-purple-900/50 border border-purple-500/40" : "bg-slate-800/40 text-slate-400"}`}>
              <div className="font-bold">S2 : J8-J14</div>
              <div className="text-[10px] text-slate-400 truncate">Cohorte Essai</div>
            </div>
            <div className={`p-2 rounded-xl text-xs transition-colors ${plan.currentDay > 14 && plan.currentDay <= 21 ? "bg-purple-900/50 border border-purple-500/40" : "bg-slate-800/40 text-slate-400"}`}>
              <div className="font-bold">S3 : J15-J21</div>
              <div className="text-[10px] text-slate-400 truncate">1ers Paiements</div>
            </div>
            <div className={`p-2 rounded-xl text-xs transition-colors ${plan.currentDay > 21 ? "bg-purple-900/50 border border-purple-500/40" : "bg-slate-800/40 text-slate-400"}`}>
              <div className="font-bold">S4 : J22-J30</div>
              <div className="text-[10px] text-slate-400 truncate">Bilan MRR & CAC</div>
            </div>
          </div>
        </div>

        {/* Global Health Score */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Santé Globale des OKRs
              </span>
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {stats.avgProgress}%
              </span>
              <span className="text-xs text-slate-500 font-medium">de complétion moyenne</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.avgProgress >= 80
                    ? "bg-emerald-500"
                    : stats.avgProgress >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, stats.avgProgress)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-200">
            <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
              <div className="text-sm font-bold text-emerald-600">
                {stats.achievedCount + stats.onTrackCount}
              </div>
              <div className="text-[10px] text-slate-500 font-medium uppercase">En bonne voie</div>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
              <div className="text-sm font-bold text-amber-600">
                {stats.atRiskCount}
              </div>
              <div className="text-[10px] text-slate-500 font-medium uppercase">À surveiller</div>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
              <div className="text-sm font-bold text-rose-600">
                {stats.behindCount}
              </div>
              <div className="text-[10px] text-slate-500 font-medium uppercase">En retard</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pr-1">Filtrer :</span>
        {[
          { id: "all", label: "Tous les Objectifs" },
          { id: "acquisition", label: "1. Traction & CPI" },
          { id: "monetization", label: "2. Paywall & Essais" },
          { id: "economics", label: "3. Unit Economics & CAC" },
          { id: "quality", label: "4. Qualité & Rétention" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategoryFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategoryFilter === tab.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Objectives & Key Results Cards */}
      <div className="space-y-6 mb-8">
        {filteredObjectives.map((obj) => (
          <div
            key={obj.id}
            className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs hover:border-slate-300 transition-colors"
          >
            {/* Objective Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  {obj.theme}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{obj.title}</h4>
                <p className="text-xs text-slate-500">{obj.description}</p>
              </div>
            </div>

            {/* Key Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {obj.keyResults.map((kr) => {
                const { pct, status } = getKrProgress(kr);
                const isEditing = editingKrId === kr.id;

                return (
                  <div
                    key={kr.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* KR Title & Status Pill */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="text-xs font-bold text-slate-900 leading-tight">
                          {kr.title}
                        </h5>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                            status === "achieved"
                              ? "bg-emerald-100 text-emerald-800"
                              : status === "on_track"
                              ? "bg-purple-100 text-purple-800"
                              : status === "at_risk"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {status === "achieved" && <Check className="w-2.5 h-2.5" />}
                          {status === "on_track" && <TrendingUp className="w-2.5 h-2.5" />}
                          {status === "at_risk" && <Clock className="w-2.5 h-2.5" />}
                          {status === "behind" && <AlertCircle className="w-2.5 h-2.5" />}
                          <span>
                            {status === "achieved"
                              ? "Atteint"
                              : status === "on_track"
                              ? "En voie"
                              : status === "at_risk"
                              ? "Risque"
                              : "Retard"}
                          </span>
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 mb-3 min-h-[30px] line-clamp-2">
                        {kr.metricLabel}
                      </p>

                      {/* Values comparison */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400 text-[11px]">Actuel mesuré :</span>
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveKrValue(kr.id);
                                  if (e.key === "Escape") setEditingKrId(null);
                                }}
                                className="w-20 px-1.5 py-0.5 text-xs font-bold text-slate-900 border border-purple-400 rounded-md focus:outline-hidden"
                              />
                              <button
                                onClick={() => handleSaveKrValue(kr.id)}
                                className="p-1 rounded-md bg-purple-600 text-white hover:bg-purple-700"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingKrId(kr.id);
                                setEditValue(String(kr.currentValue));
                              }}
                              className="group flex items-center gap-1 text-slate-900 font-bold hover:text-purple-600 transition-colors"
                              title="Cliquer pour saisir votre progression réelle"
                            >
                              <span>
                                {kr.currentValue} {kr.unit}
                              </span>
                              <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-purple-600" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="text-[11px]">Cible J+30 :</span>
                          <span className="font-semibold text-slate-700">
                            {kr.targetValue} {kr.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>Progression</span>
                        <span className="font-bold text-slate-800">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            status === "achieved"
                              ? "bg-emerald-500"
                              : status === "on_track"
                              ? "bg-purple-500"
                              : status === "at_risk"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Sprints & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Jalons Hebdomadaires (Checklist d'Exécution)
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-semibold">
                {stats.completedMilestones} / {plan.weeklyMilestones.length} validés
              </span>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline transition-colors"
              >
                <FileText className="w-3 h-3 text-purple-600" />
                <span>Rapport PDF</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {plan.weeklyMilestones.map((milestone) => (
              <div
                key={milestone.week}
                onClick={() => handleToggleMilestone(milestone.week)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  milestone.completed
                    ? "bg-emerald-50/60 border-emerald-200 text-slate-800"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={milestone.completed}
                  onChange={() => {}} // Handled by parent div
                  className="mt-0.5 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="grow">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${milestone.completed ? "line-through text-slate-500" : "text-slate-900"}`}>
                      {milestone.title}
                    </span>
                    {milestone.completed && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Validé
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{milestone.focus}</p>
                  <div className="text-[11px] font-medium text-purple-700 mt-1">
                    Cible clé : {milestone.targetMetric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical recommendations */}
        <div className="border border-purple-200 rounded-2xl p-5 bg-gradient-to-br from-purple-50/60 via-white to-purple-50/30">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
              Recommandations tactiques (Basées sur vos KPIs)
            </h4>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Ajustements recommandés pour corriger les écarts entre les chiffres actuels et les projections du simulateur :
          </p>

          <div className="space-y-3">
            {tacticalRecommendations.map((rec, i) => (
              <div key={i} className="p-3.5 bg-white rounded-xl border border-purple-100 shadow-2xs">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <ChevronRight className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>{rec.title}</span>
                </div>
                <p className="text-xs text-slate-600 mb-2 pl-5">{rec.advice}</p>
                <div className="pl-5">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Impact visé : {rec.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly OKR PDF Report Modal */}
      <OkrReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        plan={plan}
        appName={session.appOverview?.detectedName || "Application"}
      />
    </div>
  );
}
