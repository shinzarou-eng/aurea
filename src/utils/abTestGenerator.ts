import { 
  MarketingSession, 
  AbTestPlan, 
  AbTestVariantTitle, 
  AbTestVariantIcon, 
  AbTestVariantDescription 
} from "../types";

/**
 * Generates initial, high-quality contextual A/B test variants based on extracted session data.
 */
export function generateDefaultAbTestPlan(
  session: Pick<MarketingSession, "appOverview" | "appStoreOptimization" | "targetPersonas" | "monetization">,
  focusAngle: string = "cvr"
): AbTestPlan {
  const appName = session.appOverview?.detectedName || "Application";
  const category = session.appOverview?.category || "Productivité";
  const uvp = session.appOverview?.uniqueValueProposition || "Gagnez du temps et boostez vos résultats";
  const aso = session.appStoreOptimization;
  const primaryColor = session.appOverview?.colorPalette?.[0] || "#10B981";
  const secondaryColor = session.appOverview?.colorPalette?.[1] || "#059669";
  const targetPersona = session.targetPersonas?.[0]?.personaName || "Utilisateurs actifs";

  const originalTitle = aso?.storeTitle || `${appName} : ${category}`;
  const originalSubtitle = aso?.subtitle || uvp.slice(0, 30);
  const originalShortDesc = aso?.shortDescription || uvp;

  // 1. Title Variants
  const titleVariants: AbTestVariantTitle[] = [
    {
      id: "title-control",
      name: "Original (Contrôle A)",
      appleTitle: originalTitle.slice(0, 30),
      appleSubtitle: originalSubtitle.slice(0, 30),
      googleTitle: (aso?.storeTitle || originalTitle).slice(0, 30),
      hypothesis: "Version de référence basée sur l'ASO initiale et les fonctionnalités clés détectées.",
      psychologicalTrigger: "Clarté descriptive",
      expectedImpact: "Base de mesure (100% CVR)",
      iceScore: { impact: 6, confidence: 7, ease: 10 },
    },
    {
      id: "title-benefit",
      name: "Variante B • Bénéfice Direct & Rapidité",
      appleTitle: `${appName} : Résultats en 5 min`.slice(0, 30),
      appleSubtitle: "Moins d'effort, plus d'impact".slice(0, 30),
      googleTitle: `${appName} - Simple, Rapide, Efficace`.slice(0, 30),
      hypothesis: "Mettre l'accent sur la gratification immédiate et l'effort minimal réduira la friction au téléchargement.",
      psychologicalTrigger: "Gratification instantanée (Effort min)",
      expectedImpact: "+14% à +22% de conversions",
      iceScore: { impact: 8, confidence: 8, ease: 9 },
    },
    {
      id: "title-social-proof",
      name: "Variante C • Preuve Sociale & Statut",
      appleTitle: `${appName} : Le Choix #1`.slice(0, 30),
      appleSubtitle: "Adopté par les experts & pros".slice(0, 30),
      googleTitle: `${appName} : App Préférée du Moment`.slice(0, 30),
      hypothesis: "Activer le conformisme social et la réassurance d'élite pour les utilisateurs hésitants.",
      psychologicalTrigger: "Preuve sociale & Rassurance",
      expectedImpact: "+10% à +16% de conversions",
      iceScore: { impact: 7, confidence: 8, ease: 9 },
    },
    {
      id: "title-loss-aversion",
      name: "Variante D • Évitement de la Douleur",
      appleTitle: `Stop au Chaos avec ${appName}`.slice(0, 30),
      appleSubtitle: "Reprenez le contrôle total".slice(0, 30),
      googleTitle: `${appName} : Ne perdez plus de temps`.slice(0, 30),
      hypothesis: "L'aversion à la perte est 2x plus puissante que le désir de gain : appuyer sur le soulagement d'un problème quotidien.",
      psychologicalTrigger: "Aversion à la perte (Loss Aversion)",
      expectedImpact: "+18% à +26% de clics Store",
      iceScore: { impact: 9, confidence: 7, ease: 8 },
    },
  ];

  // 2. Icon Variants
  const iconVariants: AbTestVariantIcon[] = [
    {
      id: "icon-minimalist",
      name: "Concept 1 • Minimaliste & Haute Lisibilité",
      styleTheme: "Minimal Flat & Contraste Élevé",
      backgroundGradient: "from-slate-900 via-slate-800 to-black",
      accentColor: primaryColor,
      iconSymbol: "Sparkles",
      conceptDescription: `Fond sombre profond très épuré faisant ressortir un glyphe central ${primaryColor} ultra net sans aucun élément superflu.`,
      rationale: "Maximise le taux de clic (TTR) sur fond blanc de l'App Store grâce à un contraste de luminance supérieur à 12:1.",
      bestForAudience: "Utilisateurs tech, adeptes de design moderne et d'applications haut de gamme.",
      visualPreview: {
        bgColor: "#0f172a",
        iconColor: primaryColor,
        shape: "rounded-squircle",
        badgeText: "PRO",
      },
    },
    {
      id: "icon-vibrant-3d",
      name: "Concept 2 • 3D Tactile & Dégradé Énergique",
      styleTheme: "Néo-Gradients & Effet de Relief",
      backgroundGradient: "from-emerald-500 via-teal-600 to-cyan-700",
      accentColor: "#ffffff",
      iconSymbol: "Zap",
      conceptDescription: `Dégradé dynamique lumineux (${primaryColor} vers cyan) avec un symbole en relief 3D doux et une subtile lueur interne.`,
      rationale: "Attire immédiatement le regard dans les grilles de recherche et transmet une sensation d'énergie et de fluidité.",
      bestForAudience: "Public jeune, mobile-first, sensible aux apps ludiques et vibrantes.",
      visualPreview: {
        bgColor: primaryColor,
        iconColor: "#ffffff",
        shape: "rounded-squircle",
      },
    },
    {
      id: "icon-metaphor",
      name: "Concept 3 • Métaphore de Succès / Action",
      styleTheme: "Symbole Vectoriel & Bénéfice",
      backgroundGradient: "from-indigo-600 via-violet-600 to-purple-700",
      accentColor: "#fbbf24",
      iconSymbol: "Target",
      conceptDescription: "Symbole iconographique incarnant le résultat final (cible parfaite, coche validée ou fusée en envolée) avec touche dorée.",
      rationale: "Communique instantanément la promesse de valeur avant même que l'utilisateur ne lise le titre.",
      bestForAudience: `${targetPersona} cherchant à accomplir un objectif concret.`,
      visualPreview: {
        bgColor: "#4f46e5",
        iconColor: "#fbbf24",
        shape: "rounded-squircle",
        badgeText: "★ NEW",
      },
    },
    {
      id: "icon-lettermark",
      name: "Concept 4 • Initiale Stylisée 'Brandmark'",
      styleTheme: "Typographique & Signature Forte",
      backgroundGradient: "from-amber-500 via-orange-600 to-rose-600",
      accentColor: "#ffffff",
      iconSymbol: "Award",
      conceptDescription: `Initiale monumentale "${appName.charAt(0).toUpperCase()}" stylisée en courbes géométriques sur fond chaud et enveloppant.`,
      rationale: "Développe la mémorisation de marque à long terme (Top-of-Mind) et l'identification visuelle immédiate.",
      bestForAudience: "Positionnement marque établi, applications de confiance et outils quotidiens.",
      visualPreview: {
        bgColor: "#ea580c",
        iconColor: "#ffffff",
        shape: "rounded-squircle",
      },
    },
  ];

  // 3. Description & Hooks Variants
  const descriptionVariants: AbTestVariantDescription[] = [
    {
      id: "desc-control",
      name: "Approche 1 • Descriptive & Fonctionnalités (Contrôle)",
      hookHeadline: `${appName} est l'outil complet conçu pour transformer votre quotidien.`,
      shortDescriptionGoogle: originalShortDesc.slice(0, 80),
      bulletPoints: [
        "Interface intuitive et prise en main en quelques secondes",
        "Fonctionnalités avancées pensées pour votre confort",
        "Synchronisation fluide et protection de vos données",
      ],
      ctaClosing: "Téléchargez dès aujourd'hui et commencez gratuitement.",
      hypothesis: "Présentation claire et rassurante axée sur la complétude du produit.",
      conversionFocus: "Clarté générale & Exhaustivité",
    },
    {
      id: "desc-pas",
      name: "Approche 2 • Méthode P.A.S. (Problème - Agitation - Solution)",
      hookHeadline: `Marre de perdre du temps et de la clarté ? Vous n'êtes plus seul.`,
      shortDescriptionGoogle: `Fini les frictions inutiles. Découvrez la méthode la plus fluide pour vos objectifs.`.slice(0, 80),
      bulletPoints: [
        "Éliminez 90% des tracas habituels dès votre première session",
        "Retrouvez l'esprit tranquille grâce à une automatisation intelligente",
        "Rejoignez des milliers d'utilisateurs qui ont franchi le pas",
      ],
      ctaClosing: "Ne laissez plus le stress s'accumuler : activez votre accès maintenant.",
      hypothesis: "Formule copywriting la plus efficace pour déclencher l'action en soulignant la douleur avant le remède.",
      conversionFocus: "Émotion & Résolution de problème",
    },
    {
      id: "desc-transformation",
      name: "Approche 3 • Transformation Personnelle & Chiffres",
      hookHeadline: `Passez au niveau supérieur : +40% d'efficacité mesurée en moins de 7 jours.`,
      shortDescriptionGoogle: `L'outil n°1 plébiscité pour maximiser vos résultats sans effort. Essai gratuit.`.slice(0, 80),
      bulletPoints: [
        "Un gain moyen constaté de 3 heures par semaine",
        "98% de satisfaction dès la première semaine d'utilisation",
        "Zéro configuration complexe : opérationnel en 60 secondes chrono",
      ],
      ctaClosing: "Commencez votre métamorphose : essai sans engagement.",
      hypothesis: "Les statistiques et promesses chiffrées augmentent la crédibilité et le passage à l'acte.",
      conversionFocus: "Preuve quantitative & ROI personnel",
    },
  ];

  return {
    testName: `Test ASO / CRO : ${appName} • Optimisation Taux de Téléchargement`,
    objective: focusAngle === "viral" 
      ? "Maximiser la viralité et le taux de clic des jeunes utilisateurs" 
      : focusAngle === "premium" 
      ? "Positionner l'application sur un segment haut de gamme et maximiser le panier moyen" 
      : "Augmenter le taux de conversion global Store (CVR) de +15% à +30%",
    recommendedPlatform: "Apple Product Page Optimization (PPO)",
    sampleSizeRecommendation: "2 500 impressions minimum par variante (95% seuil de confiance statistique)",
    estimatedDuration: "10 à 14 jours (incluant 2 week-ends complets)",
    keyMetric: "Conversion Rate (CVR) : Visiteurs Store ➔ Installations Réalisées",
    titleVariants,
    iconVariants,
    descriptionVariants,
    testingTips: [
      "Isolez les variables : testez soit l'icône, soit le titre, mais évitez de changer les deux en même temps sur le même test.",
      "Laissez tourner le test au minimum 7 jours complets pour éviter le biais des comportements du week-end vs semaine.",
      "Sur iOS (Product Page Optimization), vous pouvez tester jusqu'à 3 traitements contre la version originale.",
      "Sur Google Play Store Experiments, testez sur le marché principal d'abord (ex: France) avant de généraliser à l'international.",
      "Surveillez également la rétention J1 et J7 : un boost de conversion ne doit pas dégrader la qualité des utilisateurs acquis.",
    ],
  };
}
