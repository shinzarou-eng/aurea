import { CustomPaywallConfig, MarketingSession } from "../types";

export function generateDefaultPaywallConfig(session: Partial<MarketingSession>): CustomPaywallConfig {
  const appName = session.appOverview?.detectedName || "Notre Application";
  const usp = session.appOverview?.uniqueValueProposition || "Débloquez tout votre potentiel sans limite.";
  const bullets = session.monetization?.paywallCopy?.bulletBenefits || [
    "Accès illimité à toutes les fonctionnalités intelligentes",
    "Synchronisation automatique et sauvegarde sécurisée",
    "Analyses avancées et rapports détaillés personnalisés",
    "Support prioritaire 7j/7 et mises à jour exclusives",
  ];

  return {
    layout: "trial_timeline",
    theme: "dark_luxury",
    headline: `Passez à la vitesse supérieure avec ${appName} Pro`,
    subheadline: usp,
    badgeText: "🔥 OFFRE DE LANCEMENT -50%",
    showTrialTimeline: true,
    trialDurationDays: 7,
    selectedTierIndex: 0, // 0 = Annuel
    features: bullets.map((b, i) => ({
      icon: i === 0 ? "Zap" : i === 1 ? "ShieldCheck" : i === 2 ? "TrendingUp" : "Star",
      text: b,
      highlight: i === 0,
    })),
    ctaButtonText: "Commencer mes 7 jours d'essai gratuit",
    reassuranceItems: [
      "Annulation facile en 1 clic dans les Réglages Apple / Google",
      "Aucun débit aujourd'hui - Rappel automatique à J-2",
      "Paiement 100% sécurisé via les stores officiels",
    ],
    billingTermsText: "Après vos 7 jours d'essai, abonnement annuel facturé 39,99 €/an (soit 3,33 €/mois) renouvelable automatiquement. Sans engagement.",
  };
}
