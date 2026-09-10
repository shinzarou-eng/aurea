import React, { useState, useMemo } from "react";
import { OkrPlan30Days, KeyResult, ObjectiveOkr } from "../types";
import { generateOkrWeeklyPdf } from "../utils/generateOkrPdf";
import {
  FileText,
  X,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Target,
  Star,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  Copy,
  Check
} from "lucide-react";

interface OkrReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: OkrPlan30Days;
  appName: string;
}

export default function OkrReportModal({
  isOpen,
  onClose,
  plan,
  appName,
}: OkrReportModalProps) {
  // Current active week in report (1, 2, 3, 4, or 0 for 30J consolidated)
  const defaultWeek = useMemo(() => {
    if (plan.currentDay <= 7) return 1;
    if (plan.currentDay <= 14) return 2;
    if (plan.currentDay <= 21) return 3;
    return 4;
  }, [plan.currentDay]);

  const [selectedWeek, setSelectedWeek] = useState<number>(defaultWeek);
  const [executiveNotes, setExecutiveNotes] = useState<string>(
    "Campagne de soft-launch prometteuse. Première itération sur le paywall déployée avec succès. Focalisation de la semaine prochaine sur l'optimisation du tunnel d'onboarding et l'accélération des vidéos UGC."
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen) return null;

  // Helper for computing KR status
  const getKrStats = (kr: KeyResult) => {
    let pct = 0;
    if (kr.type === "higher_is_better") {
      pct = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
    } else {
      if (kr.currentValue <= kr.targetValue) {
        pct = 100;
      } else {
        const excess = kr.currentValue - kr.targetValue;
        pct = Math.max(0, 100 - (excess / kr.targetValue) * 100);
      }
    }
    const expectedPct = (plan.currentDay / 30) * 100;
    let status: "achieved" | "on_track" | "at_risk" | "behind" = "on_track";
    if (pct >= 100) status = "achieved";
    else if (pct >= expectedPct * 0.85) status = "on_track";
    else if (pct >= expectedPct * 0.6) status = "at_risk";
    else status = "behind";

    return { pct: Math.min(150, Math.round(pct)), status };
  };

  // Pillar scores for Radar Chart
  const pillarScores = useMemo(() => {
    return plan.objectives.map((obj) => {
      let sum = 0;
      obj.keyResults.forEach((kr) => {
        const { pct } = getKrStats(kr);
        sum += Math.min(100, pct);
      });
      const avg = Math.round(sum / (obj.keyResults.length || 1));
      return {
        id: obj.id,
        title: obj.title.split(":")[1]?.trim() || obj.title,
        theme: obj.theme,
        score: avg,
      };
    });
  }, [plan]);

  // Status distributions
  const statusCounts = useMemo(() => {
    let achieved = 0;
    let onTrack = 0;
    let atRisk = 0;
    let behind = 0;
    let totalKrs = 0;
    let sumPct = 0;

    plan.objectives.forEach((obj) => {
      obj.keyResults.forEach((kr) => {
        totalKrs++;
        const { pct, status } = getKrStats(kr);
        sumPct += Math.min(100, pct);
        if (status === "achieved") achieved++;
        else if (status === "on_track") onTrack++;
        else if (status === "at_risk") atRisk++;
        else behind++;
      });
    });

    const globalPct = totalKrs > 0 ? Math.round(sumPct / totalKrs) : 0;
    return { achieved, onTrack, atRisk, behind, totalKrs, globalPct };
  }, [plan]);

  // Week meta info
  const weekInfo = useMemo(() => {
    switch (selectedWeek) {
      case 1:
        return {
          title: "Semaine 1 : Calibration & Test de Friction",
          period: "Jours 1 à 7",
          focus: "Soft launch, tracking analytics, CPI de référence et premiers tests de paywall.",
          milestone: plan.weeklyMilestones.find((m) => m.week === 1),
        };
      case 2:
        return {
          title: "Semaine 2 : Cohorte Essai & Feedback Utilisateurs",
          period: "Jours 8 à 14",
          focus: "Analyse des premières activations d'essai et optimisation du flow d'onboarding.",
          milestone: plan.weeklyMilestones.find((m) => m.week === 2),
        };
      case 3:
        return {
          title: "Semaine 3 : Première Vague de Paiements & Scaling Ads",
          period: "Jours 15 à 21",
          focus: "Fin de la période d'essai S1, calcul du taux de transformation réel et amplification.",
          milestone: plan.weeklyMilestones.find((m) => m.week === 3),
        };
      case 4:
        return {
          title: "Semaine 4 : Bilan CAC Réel & Atteinte du Palier MRR",
          period: "Jours 22 à 30",
          focus: "Calcul du blended CAC définitif, validation du ratio LTV:CAC et projection.",
          milestone: plan.weeklyMilestones.find((m) => m.week === 4),
        };
      default:
        return {
          title: "Bilan Consolidé : Sprint 30 Jours",
          period: "Jours 1 à 30",
          focus: "Synthèse globale des performances, économie unitaire et rentabilité.",
          milestone: undefined,
        };
    }
  }, [selectedWeek, plan]);

  // Handle PDF Download
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateOkrWeeklyPdf(plan, {
        appName,
        selectedWeek,
        executiveNotes,
      });
    } catch (err) {
      console.error("Error generating OKR PDF:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle Copy text summary
  const handleCopySummary = () => {
    const summary = `📊 RAPPORT HEBDOMADAIRE OKR (30 JOURS) - ${appName}
Semaine : ${weekInfo.title} (${weekInfo.period})
Progression globale : ${statusCounts.globalPct}% (Jour ${plan.currentDay}/30)
KRs en bonne voie / atteints : ${statusCounts.achieved + statusCounts.onTrack} / ${statusCounts.totalKrs}
Points de vigilance : ${statusCounts.atRisk} à surveiller | ${statusCounts.behind} en retard

Piliers :
${pillarScores.map((p) => `- ${p.title} : ${p.score}%`).join("\n")}

Notes de direction :
${executiveNotes}`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Native Print
  const handlePrint = () => {
    window.print();
  };

  // Radar chart coordinates helper (4 axes)
  // Axis 0: Top (0, -R), Axis 1: Right (R, 0), Axis 2: Bottom (0, R), Axis 3: Left (-R, 0)
  const radarCenter = { x: 130, y: 110 };
  const radarRadius = 75;
  const radarAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];

  const radarPolygonPoints = pillarScores.map((p, idx) => {
    const angle = radarAngles[idx] ?? 0;
    const r = (p.score / 100) * radarRadius;
    const x = radarCenter.x + r * Math.cos(angle);
    const y = radarCenter.y + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto print:max-h-none print:border-none print:shadow-none print:w-full">
        
        {/* Modal Header (Hidden during native print) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Rapport de Progression OKR Hebdomadaire
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  PDF & Graphiques Intégrés
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Production de la synthèse décisionnelle pour l'équipe, les associés ou les investisseurs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Copier la synthèse texte"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedSummary ? "Copié !" : "Copier résumé"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Aperçu d'impression navigateur"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Imprimer</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-purple-200" />
              <span>{isGeneratingPdf ? "Production en cours..." : "Télécharger PDF (A4)"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Report Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-800 print:p-0 print:overflow-visible">
          
          {/* Week Selector Tabs (Hidden in Print) */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100 print:hidden">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              Période du rapport :
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { week: 1, label: "Semaine 1 (J1-7)" },
                { week: 2, label: "Semaine 2 (J8-14)" },
                { week: 3, label: "Semaine 3 (J15-21)" },
                { week: 4, label: "Semaine 4 (J22-30)" },
                { week: 0, label: "Consolidé 30J" },
              ].map((tab) => (
                <button
                  key={tab.week}
                  onClick={() => setSelectedWeek(tab.week)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    selectedWeek === tab.week
                      ? "bg-white text-purple-800 font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Printable Report Header */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 print:bg-white print:text-slate-900 print:border print:border-slate-300 print:p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-400/30 print:border-purple-600 print:text-purple-800 print:bg-purple-50">
                    Rapport Exécutif
                  </span>
                  <span className="text-xs text-slate-400">
                    Application : <strong className="text-white print:text-slate-900">{appName}</strong>
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold mt-2 text-white print:text-slate-900">
                  {weekInfo.title}
                </h1>
                <p className="text-xs text-slate-300 print:text-slate-600 mt-1 max-w-2xl">
                  {weekInfo.focus}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 print:bg-slate-100 p-3.5 rounded-xl border border-white/10 print:border-slate-200 backdrop-blur-xs">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-300 print:text-slate-500 uppercase">
                    Avancement Sprint
                  </div>
                  <div className="text-2xl font-extrabold text-purple-300 print:text-purple-700">
                    Jour {plan.currentDay} <span className="text-xs font-normal text-slate-400">/ 30</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-purple-400/30 print:border-purple-600 flex items-center justify-center font-bold text-sm text-purple-200 print:text-purple-800 bg-purple-900/40 print:bg-purple-50">
                  {statusCounts.globalPct}%
                </div>
              </div>
            </div>
          </div>

          {/* 4 Scorecard KPI Boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
                Taux de Réalisation
              </span>
              <div className="text-xl font-bold text-purple-900">{statusCounts.globalPct}%</div>
              <p className="text-[11px] text-purple-600 mt-0.5">Sur l'ensemble des 12 KRs</p>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                En Bonne Voie / Atteints
              </span>
              <div className="text-xl font-bold text-emerald-900">
                {statusCounts.achieved + statusCounts.onTrack} <span className="text-xs font-normal text-emerald-600">/ {statusCounts.totalKrs}</span>
              </div>
              <p className="text-[11px] text-emerald-600 mt-0.5">Alignés sur la trajectoire</p>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                Points de Vigilance
              </span>
              <div className="text-xl font-bold text-amber-900">{statusCounts.atRisk}</div>
              <p className="text-[11px] text-amber-600 mt-0.5">Écart modéré par rapport au tempo</p>
            </div>

            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
                Retard Critique
              </span>
              <div className="text-xl font-bold text-rose-900">{statusCounts.behind}</div>
              <p className="text-[11px] text-rose-600 mt-0.5">Nécessite action corrective</p>
            </div>
          </div>

          {/* SECTION GRAPHIQUES RÉCAPITULATIFS INTÉGRÉS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Graphique 1: Radar Chart des 4 Piliers Stratégiques (SVG) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-purple-600" />
                    Équilibre des 4 Piliers Stratégiques
                  </h3>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                    Radar 100%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Alignement entre Traction, Paywall, Economics et Qualité Produit.
                </p>
              </div>

              {/* Vector SVG Radar */}
              <div className="relative flex items-center justify-center my-2">
                <svg width="260" height="220" viewBox="0 0 260 220" className="overflow-visible">
                  {/* Concentric grid circles */}
                  {[0.25, 0.5, 0.75, 1.0].map((level, i) => (
                    <circle
                      key={i}
                      cx={radarCenter.x}
                      cy={radarCenter.y}
                      r={radarRadius * level}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeDasharray={level < 1 ? "2,2" : "none"}
                      strokeWidth={level === 1 ? 1.5 : 1}
                    />
                  ))}

                  {/* Radial Axis lines */}
                  {radarAngles.map((ang, i) => {
                    const x2 = radarCenter.x + radarRadius * Math.cos(ang);
                    const y2 = radarCenter.y + radarRadius * Math.sin(ang);
                    return (
                      <line
                        key={i}
                        x1={radarCenter.x}
                        y1={radarCenter.y}
                        x2={x2}
                        y2={y2}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Filled Data Polygon */}
                  <polygon
                    points={radarPolygonPoints}
                    fill="rgba(147, 51, 234, 0.22)"
                    stroke="#7e22ce"
                    strokeWidth="2.5"
                  />

                  {/* Data Points / Markers */}
                  {pillarScores.map((p, idx) => {
                    const angle = radarAngles[idx] ?? 0;
                    const r = (p.score / 100) * radarRadius;
                    const x = radarCenter.x + r * Math.cos(angle);
                    const y = radarCenter.y + r * Math.sin(angle);
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="4" fill="#7e22ce" stroke="#ffffff" strokeWidth="2" />
                      </g>
                    );
                  })}

                  {/* Labels on each axis */}
                  {/* Top: Traction */}
                  <text x={radarCenter.x} y={radarCenter.y - radarRadius - 10} textAnchor="middle" className="text-[10px] font-bold fill-slate-800">
                    Traction ({pillarScores[0]?.score}%)
                  </text>
                  {/* Right: Paywall */}
                  <text x={radarCenter.x + radarRadius + 10} y={radarCenter.y + 4} textAnchor="start" className="text-[10px] font-bold fill-slate-800">
                    Paywall ({pillarScores[1]?.score}%)
                  </text>
                  {/* Bottom: Economics */}
                  <text x={radarCenter.x} y={radarCenter.y + radarRadius + 16} textAnchor="middle" className="text-[10px] font-bold fill-slate-800">
                    Economics ({pillarScores[2]?.score}%)
                  </text>
                  {/* Left: Qualité */}
                  <text x={radarCenter.x - radarRadius - 10} y={radarCenter.y + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-800">
                    Rétention ({pillarScores[3]?.score}%)
                  </text>
                </svg>
              </div>

              {/* Pillar Score Bars */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
                {pillarScores.map((p) => (
                  <div key={p.id} className="bg-slate-50 p-2 rounded-lg text-left">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span className="truncate">{p.title}</span>
                      <span className="font-bold text-purple-700">{p.score}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, p.score)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Graphique 2: Performance par Résultat Clé (Bar Chart Cibles vs Réalisé) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Comparatif Cibles Simulateur vs Réalisé (12 KRs)
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    % d'atteinte
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Visualisation du taux de complétion de chaque résultat clé avec code couleur de statut.
                </p>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {plan.objectives.flatMap((o) => o.keyResults).map((kr) => {
                  const { pct, status } = getKrStats(kr);
                  return (
                    <div key={kr.id} className="text-xs">
                      <div className="flex items-center justify-between text-slate-700 font-medium mb-1">
                        <span className="truncate max-w-[280px] text-[11px]">{kr.title}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-500">
                            {kr.currentValue} / {kr.targetValue} {kr.unit}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              status === "achieved"
                                ? "bg-emerald-100 text-emerald-800"
                                : status === "on_track"
                                ? "bg-purple-100 text-purple-800"
                                : status === "at_risk"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                        {/* Target marker line (100%) */}
                        <div className="absolute left-[66.6%] top-0 bottom-0 w-0.5 bg-slate-400 z-10" title="Cible 100%" />
                        <div
                          className={`h-full rounded-full transition-all ${
                            status === "achieved"
                              ? "bg-emerald-500"
                              : status === "on_track"
                              ? "bg-purple-600"
                              : status === "at_risk"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, (pct / 150) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-3 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Atteint (≥100%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-600" /> En bonne voie
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> À surveiller
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Retard
                  </span>
                </div>
                <span className="text-slate-400 italic">Ligne grise = Cible 100%</span>
              </div>
            </div>

          </div>

          {/* SECTION JALON DE LA SEMAINE & ACTIONS RECOMMANDÉES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Jalon Opérationnel de la Semaine */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                Jalon Prioritaire de la Semaine
              </h3>
              {weekInfo.milestone ? (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        Semaine {weekInfo.milestone.week}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">
                        {weekInfo.milestone.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {weekInfo.milestone.focus}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        weekInfo.milestone.completed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {weekInfo.milestone.completed ? "Validé" : "En cours"}
                    </span>
                  </div>
                  <div className="mt-3 text-[11px] font-semibold text-purple-800 bg-purple-50 p-2 rounded-lg">
                    Objectif quantitatif : {weekInfo.milestone.targetMetric}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white rounded-xl text-xs text-slate-500 text-center">
                  Bilan de fin de sprint : consolidation des 4 semaines d'acquisition et de monétisation.
                </div>
              )}
            </div>

            {/* Recommandations Tactiques pour la Semaine Suivante */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-purple-600" />
                Plan d'Action Immédiat (3 Priorités)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block text-[11px]">1. A/B Testing du Paywall</strong>
                  <span className="text-slate-600 text-[11px]">
                    Tester la variante de réassurance sans risque pour maintenir le taux d'opt-in supérieur à la cible simulateur.
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block text-[11px]">2. Optimisation Créatifs UGC</strong>
                  <span className="text-slate-600 text-[11px]">
                    Couper les variantes publicitaires avec un CPI supérieur au plafond et réinjecter le budget sur les 2 hooks les plus performants.
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block text-[11px]">3. Notification D2 Anti-Churn</strong>
                  <span className="text-slate-600 text-[11px]">
                    Rappeler la valeur clé de l'app à 48h du téléchargement pour sécuriser l'activation et la note store ≥ 4.7.
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* NOTES EXÉCUTIVES ÉDITABLES (Incluses dans le PDF) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 print:border-none print:p-0">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Commentaires & Synthèse Personnalisée de l'Équipe (Inclus dans le PDF exporté) :
            </label>
            <textarea
              value={executiveNotes}
              onChange={(e) => setExecutiveNotes(e.target.value)}
              rows={3}
              className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              placeholder="Rédigez ici vos faits marquants, victoires de la semaine ou arbitrages budgétaires..."
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Ces notes apparaîtront dans la section 'Notes & Commentaires' du document PDF téléchargé.
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            Format : Document PDF A4 prêt pour comités de direction et investisseurs.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-purple-200" />
              <span>{isGeneratingPdf ? "Création du document..." : "Télécharger le Rapport PDF"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
