import { OkrPlan30Days, MarketingSession } from "../types";

export interface SimulatorGrowthInputs {
  monthlyInstalls: number;
  cpi: number;
  paywallViewRate: number;
  trialConversionRate: number;
  trialToPaidRate: number;
  monthlySubscriptionPrice: number;
  newPayingSubscribers: number;
  addedMrr: number;
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  totalAdBudget: number;
}

export function generateDefaultOkrPlan(
  session: MarketingSession,
  simMetrics?: Partial<SimulatorGrowthInputs>
): OkrPlan30Days {
  // Use simulator inputs if provided, else reasonable defaults based on session pricing
  const defaultPrice = (() => {
    const rawPrice = session.monetization?.pricingTiers?.[0]?.price;
    if (rawPrice) {
      const match = rawPrice.match(/(\d+[\.,]?\d*)/);
      if (match) return parseFloat(match[1].replace(",", "."));
    }
    return 9.99;
  })();

  const monthlyInstalls = simMetrics?.monthlyInstalls ?? 3000;
  const cpi = simMetrics?.cpi ?? 1.60;
  const paywallViewRate = simMetrics?.paywallViewRate ?? 85;
  const trialConversionRate = simMetrics?.trialConversionRate ?? 7.5;
  const trialToPaidRate = simMetrics?.trialToPaidRate ?? 65;
  const price = simMetrics?.monthlySubscriptionPrice ?? defaultPrice;
  const totalAdBudget = simMetrics?.totalAdBudget ?? (monthlyInstalls * cpi);
  const newPayingSubscribers = simMetrics?.newPayingSubscribers ?? Math.round(
    monthlyInstalls * (paywallViewRate / 100) * (trialConversionRate / 100) * (trialToPaidRate / 100)
  );
  const addedMrr = simMetrics?.addedMrr ?? Math.round(newPayingSubscribers * price);
  const cac = simMetrics?.cac ?? (newPayingSubscribers > 0 ? totalAdBudget / newPayingSubscribers : 29.0);
  const ltvCacRatio = simMetrics?.ltvCacRatio ?? (cac > 0 ? (price * 6.5) / cac : 2.5);

  return {
    startDate: new Date().toISOString().split("T")[0],
    currentDay: 12, // Default to Day 12 to provide realistic preview data
    objectives: [
      {
        id: "obj-1",
        theme: "Traction & Acquisition",
        title: "Objectif 1 : Amorcer une traction payante rentable",
        description: "Générer du volume d'installations qualifié tout en contrôlant rigoureusement le coût par téléchargement.",
        keyResults: [
          {
            id: "kr-1-1",
            title: "Volume d'installations mensuelles",
            metricLabel: "Téléchargements cumulés (App Store & Play Store)",
            targetValue: monthlyInstalls,
            currentValue: Math.round(monthlyInstalls * 0.42), // 42% on day 12
            unit: "installs",
            type: "higher_is_better",
            baseline: 0,
            category: "acquisition",
          },
          {
            id: "kr-1-2",
            title: "Plafond du CPI Blended",
            metricLabel: "Coût moyen par installation (Meta, TikTok, ASA)",
            targetValue: Number(cpi.toFixed(2)),
            currentValue: Number((cpi * 0.94).toFixed(2)), // Slightly below target is great!
            unit: "€",
            type: "lower_is_better",
            baseline: cpi * 1.3,
            category: "acquisition",
          },
          {
            id: "kr-1-3",
            title: "Budget d'acquisition maîtrisé",
            metricLabel: "Dépense publicitaire totale engagée",
            targetValue: Math.round(totalAdBudget),
            currentValue: Math.round(totalAdBudget * 0.38),
            unit: "€",
            type: "lower_is_better",
            baseline: 0,
            category: "acquisition",
          },
        ],
      },
      {
        id: "obj-2",
        theme: "Conversion & Paywall",
        title: "Objectif 2 : Maximiser la conversion du Paywall",
        description: "Transformer les nouveaux utilisateurs en abonnés actifs grâce à un onboarding et un paywall optimisés.",
        keyResults: [
          {
            id: "kr-2-1",
            title: "Taux d'exposition au Paywall",
            metricLabel: "% d'utilisateurs qui voient le paywall après onboarding",
            targetValue: paywallViewRate,
            currentValue: Math.min(100, Math.round(paywallViewRate * 0.96)),
            unit: "%",
            type: "higher_is_better",
            baseline: 50,
            category: "monetization",
          },
          {
            id: "kr-2-2",
            title: "Taux de démarrage d'essai gratuit (Trial CVR)",
            metricLabel: "% de visiteurs du paywall qui activent l'essai",
            targetValue: Number(trialConversionRate.toFixed(1)),
            currentValue: Number((trialConversionRate * 0.90).toFixed(1)),
            unit: "%",
            type: "higher_is_better",
            baseline: 3.0,
            category: "monetization",
          },
          {
            id: "kr-2-3",
            title: "Conversion Essai -> Abonné Payant",
            metricLabel: "% d'utilisateurs d'essai qui confirment le prélèvement",
            targetValue: trialToPaidRate,
            currentValue: Math.round(trialToPaidRate * 0.92),
            unit: "%",
            type: "higher_is_better",
            baseline: 40,
            category: "monetization",
          },
        ],
      },
      {
        id: "obj-3",
        theme: "Unit Economics & MRR",
        title: "Objectif 3 : Valider la rentabilité unitaire (CAC/LTV)",
        description: "Assurer la viabilité financière de chaque euro investi et constituer une base solide de MRR.",
        keyResults: [
          {
            id: "kr-3-1",
            title: "Nouveaux abonnés payants à J+30",
            metricLabel: "Total des abonnements confirmés après la période d'essai",
            targetValue: newPayingSubscribers,
            currentValue: Math.round(newPayingSubscribers * 0.39),
            unit: "abonnés",
            type: "higher_is_better",
            baseline: 0,
            category: "economics",
          },
          {
            id: "kr-3-2",
            title: "MRR Récurrent Net Ajouté",
            metricLabel: "Revenus mensuels récurrents additionnels à 30 jours",
            targetValue: addedMrr,
            currentValue: Math.round(addedMrr * 0.39),
            unit: "€",
            type: "higher_is_better",
            baseline: 0,
            category: "economics",
          },
          {
            id: "kr-3-3",
            title: "Ratio de Rentabilité LTV : CAC",
            metricLabel: "Multiple de valeur client par rapport au coût d'acquisition",
            targetValue: Number(ltvCacRatio.toFixed(1)),
            currentValue: Number((ltvCacRatio * 0.95).toFixed(1)),
            unit: "x",
            type: "higher_is_better",
            baseline: 1.0,
            category: "economics",
          },
        ],
      },
      {
        id: "obj-4",
        theme: "Qualité & Rétention",
        title: "Objectif 4 : Sécuriser la rétention et l'amour produit",
        description: "Bâtir des signaux de confiance forts sur les stores pour soutenir l'organique et le bouche-à-oreille.",
        keyResults: [
          {
            id: "kr-4-1",
            title: "Note moyenne sur les Stores",
            metricLabel: "Note publique minimale sur l'App Store et Google Play",
            targetValue: 4.7,
            currentValue: 4.8,
            unit: "/5",
            type: "higher_is_better",
            baseline: 0,
            category: "quality",
          },
          {
            id: "kr-4-2",
            title: "Rétention J+7 (D7 Retention)",
            metricLabel: "% d'utilisateurs actifs encore présents après 7 jours",
            targetValue: 35,
            currentValue: 31,
            unit: "%",
            type: "higher_is_better",
            baseline: 15,
            category: "quality",
          },
          {
            id: "kr-4-3",
            title: "Taux de crash de session",
            metricLabel: "% de sessions interrompues par un bug critique",
            targetValue: 0.5,
            currentValue: 0.2,
            unit: "%",
            type: "lower_is_better",
            baseline: 2.0,
            category: "quality",
          },
        ],
      },
    ],
    weeklyMilestones: [
      {
        week: 1,
        title: "Semaine 1 : Calibration & Test de Friction",
        focus: "Soft launch, tracking analytics, CPI de référence et premiers tests de paywall.",
        targetMetric: "500 premiers téléchargements avec CPI < 2.00 €",
        completed: true,
      },
      {
        week: 2,
        title: "Semaine 2 : Cohorte Essai & Feedback Utilisateurs",
        focus: "Analyse des premières activations d'essai, optimisation du flow d'onboarding.",
        targetMetric: "Taux d'opt-in essai > 6% sur les premiers arrivants",
        completed: true,
      },
      {
        week: 3,
        title: "Semaine 3 : Première Vague de Paiements & Scaling Ads",
        focus: "Fin de la période d'essai de la cohorte S1, calcul du taux de transformation réel.",
        targetMetric: "Taux de rétention essai vers payé > 60%",
        completed: false,
      },
      {
        week: 4,
        title: "Semaine 4 : Bilan CAC Réel & Atteinte du Palier MRR",
        focus: "Calcul du blended CAC définitif, validation du ratio LTV:CAC et projection S2.",
        targetMetric: `Atteinte de l'objectif cible de ${Math.round(addedMrr)} € de MRR`,
        completed: false,
      },
    ],
    notes: "Suivi basé sur la première campagne de lancement. Révisez vos créatifs Meta/TikTok dès qu'un canal dépasse le CPI plafond.",
  };
}
