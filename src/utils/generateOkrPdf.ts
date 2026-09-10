import { jsPDF } from "jspdf";
import { OkrPlan30Days, KeyResult, ObjectiveOkr } from "../types";

export interface OkrPdfReportOptions {
  appName: string;
  selectedWeek: number; // 1, 2, 3, 4 or 0 for global
  executiveNotes?: string;
  highlightWins?: string[];
  blockers?: string[];
}

export function generateOkrWeeklyPdf(
  plan: OkrPlan30Days,
  options: OkrPdfReportOptions
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Week description
  const weekLabels: Record<number, { title: string; subtitle: string; days: string }> = {
    1: { title: "Semaine 1 : Calibration & Test de Friction", subtitle: "Soft launch, tracking analytics, CPI de référence et premiers tests de paywall.", days: "Jours 1 à 7" },
    2: { title: "Semaine 2 : Cohorte Essai & Feedback Utilisateurs", subtitle: "Analyse des premières activations d'essai et optimisation du flow d'onboarding.", days: "Jours 8 à 14" },
    3: { title: "Semaine 3 : Première Vague de Paiements & Scaling Ads", subtitle: "Fin de la période d'essai S1, calcul du taux de transformation réel et amplification.", days: "Jours 15 à 21" },
    4: { title: "Semaine 4 : Bilan CAC Réel & Atteinte du Palier MRR", subtitle: "Calcul du blended CAC définitif, validation du ratio LTV:CAC et projection.", days: "Jours 22 à 30" },
    0: { title: "Bilan Consolidé : Sprint de Lancement 30 Jours", subtitle: "Synthèse globale des performances, économie unitaire et rentabilité.", days: "Jours 1 à 30" },
  };

  const currentWeekInfo = weekLabels[options.selectedWeek] || weekLabels[0];

  // Helper to compute progress
  const getKrProgress = (kr: KeyResult) => {
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

  // Stats
  let totalKrs = 0;
  let sumPct = 0;
  let achieved = 0;
  let onTrack = 0;
  let atRisk = 0;
  let behind = 0;

  plan.objectives.forEach((obj) => {
    obj.keyResults.forEach((kr) => {
      totalKrs++;
      const { pct, status } = getKrProgress(kr);
      sumPct += Math.min(100, pct);
      if (status === "achieved") achieved++;
      else if (status === "on_track") onTrack++;
      else if (status === "at_risk") atRisk++;
      else behind++;
    });
  });

  const avgProgress = totalKrs > 0 ? Math.round(sumPct / totalKrs) : 0;

  // ---- PAGE 1 : COUVERTURE ET SYNTHÈSE EXÉCUTIVE ----
  let y = margin;

  // Header Bar Top
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("RAPPORT HEBDOMADAIRE D'EXÉCUTION OKR (30 JOURS)", margin + 6, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Application : ${options.appName}  •  ${currentWeekInfo.days} (Jour ${plan.currentDay}/30)  •  Produit le ${new Date().toLocaleDateString("fr-FR")}`, margin + 6, y + 17);

  y += 30;

  // Subtitle Banner
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(109, 40, 217); // purple-700
  doc.text(currentWeekInfo.title, margin + 4, y + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(currentWeekInfo.subtitle, margin + 4, y + 12);

  y += 22;

  // 4 Top Metric Cards
  const cardWidth = (contentWidth - 9) / 4;
  const cards = [
    { label: "SANTÉ GLOBALE", value: `${avgProgress}%`, sub: "Objectifs atteints", color: [109, 40, 217] },
    { label: "EN BONNE VOIE", value: `${achieved + onTrack}`, sub: `sur ${totalKrs} KRs`, color: [16, 185, 129] },
    { label: "POINTS DE VIGILANCE", value: `${atRisk}`, sub: "KRs à surveiller", color: [245, 158, 11] },
    { label: "RETARD CRITIQUE", value: `${behind}`, sub: "KRs hors trajectoire", color: [239, 68, 68] },
  ];

  cards.forEach((c, idx) => {
    const cx = margin + idx * (cardWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cx, y, cardWidth, 20, 2, 2, "FD");

    // Top indicator line
    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.rect(cx, y, cardWidth, 1.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(c.label, cx + 3, y + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(c.color[0], c.color[1], c.color[2]);
    doc.text(c.value, cx + 3, y + 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(c.sub, cx + 3, y + 17.5);
  });

  y += 26;

  // SECTION 1: MATRICE DES OBJECTIFS & RÉSULTATS CLÉS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Suivi des 12 Indicateurs Clés (Cibles Simulateur vs Réalisé)", margin, y + 2);
  y += 6;

  plan.objectives.forEach((obj) => {
    // Header for Objective
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, y, contentWidth, 7, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`${obj.title}  —  ${obj.theme}`, margin + 3, y + 4.8);
    y += 8.5;

    // Table rows for KRs
    obj.keyResults.forEach((kr) => {
      const { pct, status } = getKrProgress(kr);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 7, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(kr.title.substring(0, 38), margin + 3, y + 4.5);

      // Target vs Actual
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(`Actuel : ${kr.currentValue} ${kr.unit}`, margin + 70, y + 4.5);
      doc.text(`Cible : ${kr.targetValue} ${kr.unit}`, margin + 105, y + 4.5);

      // Progress bar vector
      const barX = margin + 135;
      const barW = 28;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(barX, y + 2, barW, 3, 1, 1, "F");

      const fillW = Math.max(1, Math.min(barW, (pct / 100) * barW));
      if (status === "achieved") doc.setFillColor(16, 185, 129);
      else if (status === "on_track") doc.setFillColor(139, 92, 246);
      else if (status === "at_risk") doc.setFillColor(245, 158, 11);
      else doc.setFillColor(239, 68, 68);
      doc.roundedRect(barX, y + 2, fillW, 3, 1, 1, "F");

      // Percentage text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text(`${pct}%`, barX + barW + 2, y + 4.5);

      // Status Tag
      const statusLabels = { achieved: "Atteint", on_track: "En voie", at_risk: "Risque", behind: "Retard" };
      const statusLabel = statusLabels[status];
      const tagX = margin + contentWidth - 14;

      if (status === "achieved") doc.setTextColor(5, 150, 105);
      else if (status === "on_track") doc.setTextColor(109, 40, 217);
      else if (status === "at_risk") doc.setTextColor(217, 119, 6);
      else doc.setTextColor(220, 38, 38);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text(statusLabel, tagX, y + 4.5);

      y += 7.5;
    });

    y += 2;
  });

  // Footer Page 1
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Rapport hebdomadaire OKR • Page 1/2 • App Marketing Studio`, margin, pageHeight - 8);

  // ---- PAGE 2 : JALONS, DIAGNOSTIC TACTIQUE & PLAN D'ACTION ----
  doc.addPage();
  y = margin;

  // Header Page 2
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 12, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("SYNTHÈSE OPÉRATIONNELLE & ACTIONS RECOMMANDÉES", margin + 5, y + 7.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Semaine ${options.selectedWeek > 0 ? options.selectedWeek : "Consolidée"} • Direction Produit & Growth`, margin + contentWidth - 70, y + 7.5);

  y += 18;

  // SECTION 2: JALONS HEBDOMADAIRES
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("2. État d'Avancement des Jalons Opérationnels (Checklist)", margin, y);
  y += 5;

  plan.weeklyMilestones.forEach((m) => {
    const isCurrent = options.selectedWeek === m.week;
    doc.setFillColor(m.completed ? 240 : isCurrent ? 250 : 255, m.completed ? 253 : isCurrent ? 245 : 255, m.completed ? 244 : isCurrent ? 255 : 255);
    doc.setDrawColor(m.completed ? 187 : 226, m.completed ? 247 : 232, m.completed ? 208 : 240);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "FD");

    // Checkmark box
    doc.setFillColor(m.completed ? 16 : 241, m.completed ? 185 : 245, m.completed ? 129 : 249);
    doc.roundedRect(margin + 3, y + 3, 4, 4, 0.8, 0.8, "F");

    if (m.completed) {
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text("v", margin + 4, y + 6);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${m.title} ${isCurrent ? "(Semaine active)" : ""}`, margin + 10, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(m.focus, margin + 10, y + 9.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(109, 40, 217);
    doc.text(`Cible : ${m.targetMetric}`, margin + 10, y + 13);

    // Badge Right
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    if (m.completed) {
      doc.setTextColor(5, 150, 105);
      doc.text("[VALIDÉ]", margin + contentWidth - 20, y + 5.5);
    } else {
      doc.setTextColor(148, 163, 184);
      doc.text("[EN COURS]", margin + contentWidth - 22, y + 5.5);
    }

    y += 16;
  });

  y += 4;

  // SECTION 3: RECOMMANDATIONS TACTIQUES & ACTIONS IMMÉDIATES
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("3. Recommandations Tactiques (Basées sur les écarts KPIs)", margin, y);
  y += 5;

  const recommendations = [
    {
      title: "Optimisation de la diffusion publicitaire (CPI)",
      desc: "Réduire les audiences larges sur Meta au profit de lookalikes basés sur les utilisateurs ayant complété l'onboarding. Réallouer 40% du budget vers les créatifs UGC à forte conversion.",
      impact: "Objectif : ramener le CPI en dessous de la cible simulateur.",
    },
    {
      title: "Test A/B sur le Paywall & Réassurance Essai",
      desc: "Tester une variante de paywall avec un badge de rappel 'Annulation facile en 1 clic dans les réglages de votre smartphone' afin de lever le frein au démarrage de l'essai gratuit.",
      impact: "Objectif : hausse de +1.5 à +2.5% du taux d'opt-in essai.",
    },
    {
      title: "Boucle de Réengagement & Notification J+2",
      desc: "Activer une séquence push automatisée à J+2 proposant le cas d'usage phare de l'application pour consolider la rétention D7 et éviter le churn silencieux.",
      impact: "Objectif : franchir le palier des 35% de rétention à 7 jours.",
    },
  ];

  recommendations.forEach((rec) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "FD");

    // Indicator
    doc.setFillColor(139, 92, 246); // purple-500
    doc.circle(margin + 4, y + 4.5, 1.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(rec.title, margin + 8, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(rec.desc, margin + 8, y + 9);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(5, 150, 105);
    doc.text(`Impact visé : ${rec.impact}`, margin + 8, y + 13);

    y += 17.5;
  });

  // SECTION 4: NOTES EXÉCUTIVES PERSONNALISÉES
  if (options.executiveNotes && options.executiveNotes.trim().length > 0) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("4. Notes & Commentaires de l'Équipe", margin, y);
    y += 4.5;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "FD");

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    const splitText = doc.splitTextToSize(options.executiveNotes, contentWidth - 6);
    doc.text(splitText, margin + 3, y + 5);

    y += 20;
  }

  // Footer Page 2
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Rapport hebdomadaire OKR • Page 2/2 • Document confidentiel d'équipe • App Marketing Studio`, margin, pageHeight - 8);

  // Save the PDF directly to client's browser
  const filename = `Rapport-Hebdomadaire-OKR-S${options.selectedWeek > 0 ? options.selectedWeek : "Global"}-${options.appName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
  doc.save(filename);
}
