import { MarketingSession } from "../types";
import { generateDefaultCompetitors } from "../utils/competitorDefaults";
import { generateDefaultAbTestPlan } from "../utils/abTestGenerator";
import { generateDefaultUgcScripts } from "../utils/ugcDefaults";
import { generateDefaultRetentionPlan } from "../utils/retentionDefaults";
import { generateDefaultPaywallConfig } from "../utils/paywallDefaults";
import { generateDefaultOkrPlan } from "../utils/okrDefaults";
import { generateDefaultAdCreatives } from "../utils/adCreativeDefaults";
import { generateDefaultMultiMarketPlan } from "../utils/localizationDefaults";

export const DEMO_APP_NAME = "FitPulse Pro";

const base: MarketingSession = {
  appOverview: {
    detectedName: DEMO_APP_NAME,
    catchphrase: "Votre coach personnel en 5 minutes par jour",
    uniqueValueProposition:
      "Des micro-séances cardio et HIIT adaptées à votre forme du moment, sans équipement, avec un suivi biométrique simple et motivant.",
    category: "Santé, Fitness & Coaching",
    primaryFeaturesDetected: [
      "Suivi cardio en temps réel",
      "Séances HIIT personnalisées",
      "Analyse du sommeil",
      "Objectifs journaliers adaptatifs",
      "Historique visuel de progression",
    ],
    colorPalette: ["#10B981", "#0F172A", "#F59E0B", "#3B82F6", "#EF4444"],
    brandVoice:
      "Énergique, bienveillant et motivant. Jamais culpabilisant, toujours tourné vers la régularité et le progrès personnel.",
  },
  targetPersonas: [
    {
      personaName: "Julie, 28 ans, employée",
      corePainPoint:
        "Je veux bouger mais je n'ai pas 1h de libre et les salles de sport me démotivent.",
      triggerMoment:
        "Elle découvre l'app après une journée stressante et lance une séance de 7 min.",
      keyBenefitExpected:
        "Retrouver de l'énergie et un sentiment d'accomplissement quotidien sans matériel.",
    },
    {
      personaName: "Marc, 35 ans, père actif",
      corePainPoint:
        "Je ne tiens jamais les programmes longs et je me décourage vite.",
      triggerMoment:
        "Il cherche une solution rapide entre deux réunions ou après le coucher des enfants.",
      keyBenefitExpected:
        "Rester en forme, réduire le stress et tenir un rythme régulier sans pression.",
    },
  ],
  swotAndTrends: {
    strengths: [
      "Interface épurée et rapide",
      "Séances sans équipement",
      "Suivi biométrique intégré",
      "Gamification douce et bienveillante",
      "Objectifs adaptatifs en temps réel",
    ],
    weaknesses: [
      "Moins de contenu long que les leaders",
      "Marque encore jeune",
      "Absence de communauté intégrée",
      "Nombre de programmes limité au lancement",
    ],
    opportunities: [
      "Boom du fitness à domicile",
      "Intégration montres connectées (Apple Watch, Garmin)",
      "Partenariats avec créateurs fitness",
      "Expansion corporate wellness",
      "Localisation sur marchés premium (DACH, Japon)",
    ],
    threats: [
      "Strava, Nike Training et Freeletics dominent",
      "Coût d'acquisition publicitaire en hausse",
      "Saturation des stores fitness",
      "Cycles de rétention courts des apps sport",
    ],
    marketTrends: [
      {
        trendName: "Micro-workouts quotidiens",
        impactScore: "9/10",
        description:
          "Les utilisateurs recherchent des séances de moins de 10 min faciles à intégrer.",
        actionableAdvice:
          "Positionner FitPulse Pro comme l'application de la 'minute sportive' quotidienne.",
      },
      {
        trendName: "Suivi biométrique grand public",
        impactScore: "8/10",
        description:
          "Fréquence cardiaque, sommeil et HRV deviennent des indicateurs accessibles.",
        actionableAdvice:
          "Afficher un 'score de récupération' simple basé sur le repos et le cardio.",
      },
      {
        trendName: "Anti-perfectionnisme & bienveillance",
        impactScore: "7/10",
        description:
          "Les utilisateurs fuient les apps culpabilisantes et cherchent du soutien.",
        actionableAdvice:
          "Insister sur 'zéro culpabilité' et célébrer la régularité plutôt que la performance.",
      },
    ],
    strategicSummary:
      "FitPulse Pro doit capitaliser sur sa simplicité et son suivi biométrique pour se différencier des mastodontes complexes. La croissance passera par une rétention D7 solide, des preuves sociales authentiques et une intégration montre rapide.",
  },
  monetization: {
    recommendedModel: "Freemium avec essai gratuit de 7 jours",
    freeTierFeatures: [
      "3 séances courtes par semaine",
      "Suivi cardio de base",
      "1 objectif hebdomadaire",
      "Historique 7 jours",
    ],
    premiumTierFeatures: [
      "Séances illimitées et programmes personnalisés",
      "Analyse du sommeil et récupération",
      "Objectifs adaptatifs et défis 30 jours",
      "Historique illimité et export CSV",
      "Support prioritaire",
    ],
    pricingTiers: [
      {
        name: "Mensuel Pro",
        price: "9,99 € / mois",
        badge: "Flexible",
        trialDays: "Essai 7 jours",
      },
      {
        name: "Annuel Pro",
        price: "39,99 € / an",
        badge: "-67%",
        trialDays: "Essai 7 jours",
      },
    ],
    paywallCopy: {
      headline: "Débloquez votre potentiel avec FitPulse Pro",
      subheadline:
        "Des séances illimitées, un suivi du sommeil et des programmes qui s'adaptent à vous.",
      bulletBenefits: [
        "Séances HIIT et cardio illimitées",
        "Analyse du sommeil et récupération",
        "Programmes adaptatifs sur 30 jours",
        "Support prioritaire",
      ],
      ctaButtonText: "Commencer mon essai gratuit",
      reassuranceText: "Annulation facile à tout moment. Aucun débit pendant 7 jours.",
    },
    paywallTriggers: [
      "Fin de la 3ème séance gratuite",
      "Première victoire d'objectif hebdomadaire",
      "Bilan de la première semaine",
      "Nouvelle fonctionnalité Premium découverte",
    ],
  },
  appStoreOptimization: {
    storeTitle: "FitPulse Pro : HIIT & Cardio",
    subtitle: "Séances courtes, résultats concrets",
    shortDescription:
      "Votre coach sportif personnel pour des séances de cardio et HIIT ultra-rapides, sans équipement.",
    fullDescription:
      "FitPulse Pro vous accompagne chaque jour avec des micro-séances de 5 à 20 minutes conçues pour votre niveau et votre énergie du moment. Suivez votre fréquence cardiaque, votre sommeil et votre progression dans une interface épurée. Que vous soyez débutant ou sportif régulier, restez motivé grâce à des objectifs adaptatifs et une approche sans culpabilité.",
    keywords: [
      "fitness",
      "hiit",
      "cardio",
      "entraînement",
      "sport",
      "maison",
      "perte de poids",
      "suivi",
      "coach",
      "santé",
    ],
    screenshotCaptions: [
      {
        screenNumber: 1,
        headline: "Votre tableau de bord en un coup d'œil",
        subtext: "Suivez calories, fréquence cardiaque et objectifs quotidiens.",
      },
      {
        screenNumber: 2,
        headline: "Séances HIIT guidées",
        subtext: "5 à 20 min, adaptées à votre niveau et à votre temps disponible.",
      },
    ],
  },
  socialMediaLaunch: {
    twitterThread: [
      "🚀 J'ai testé @FitPulsePro pendant 7 jours. Résultat : 3 séances de 10 min/jour, zéro culpabilité, une énergie dingue.",
      "Le concept est simple : l'app s'adapte à TA forme du jour. Pas de programme militariste, pas de pression. Juste du progrès.",
      "Le meilleur ? L'analyse du sommeil qui ajuste l'intensité. C'est comme avoir un coach personnel dans la poche. #fitness #wellness",
    ],
    linkedInPost:
      "Le marché du fitness est saturé d'applications complexes et culpabilisantes. FitPulse Pro propose une approche radicalement différente : des micro-séances adaptatives, un suivi biométrique simple et une expérience bienveillante. En 2026, la rétention passe par la régularité, pas par la perfection.",
    tiktokReelsHooks: [
      {
        hookVisual: "Selfie serré, visage sceptique",
        hookAudio: "Son 'wait for it' tendance",
        concept: "J'ai remplacé mes 45 min de sport par 7 min/jour — voici ce qui s'est passé.",
      },
      {
        hookVisual: "Screen record de l'app avec progression",
        hookAudio: "Beat motivant lo-fi",
        concept: "Cette app s'adapte à ton sommeil. Trop underrated !",
      },
    ],
    productHuntKit: {
      tagline: "Votre coach personnel en 5 minutes par jour",
      makerComment:
        "On a construit FitPulse Pro parce qu'on en avait marre des apps de fitness qui culpabilisent. Notre mission : une minute de sport positive, chaque jour.",
    },
  },
  advertisingAngles: [
    {
      angleName: "Gratification immédiate",
      hookText: "5 minutes. C'est tout ce qu'il faut pour sentir la différence.",
      bodyCopy:
        "Pas besoin d'équipement, pas besoin de 1h. FitPulse Pro vous offre une séance ciblée qui s'adapte à votre niveau et à votre temps.",
      ctaButton: "Essayer gratuitement",
      recommendedVisualConcept:
        "Selfie dynamique avant/après, timer 5:00 en gros plan, fond vert énergisant.",
    },
    {
      angleName: "Bienveillance & anti-culpabilisation",
      hookText: "Aujourd'hui, on bouge. Demain, on verra. Et c'est parfait.",
      bodyCopy:
        "Vous n'avez pas à être parfait pour progresser. FitPulse Pro célèbre chaque minute de mouvement, sans jugement.",
      ctaButton: "Reprendre doucement",
      recommendedVisualConcept:
        "Ambiance chaleureuse, sourire authentique, pas de chiffre de poids.",
    },
    {
      angleName: "Science du sommeil",
      hookText: "Votre app de sport est la seule qui lit votre récupération.",
      bodyCopy:
        "FitPulse Pro ajuste l'intensité de votre séance selon votre sommeil et votre fréquence cardiaque. Moins de risque de blessure, plus de résultats.",
      ctaButton: "Découvrir",
      recommendedVisualConcept:
        "Graphique cardio + montre connectée, tons bleu nuit et émeraude.",
    },
  ],
  prAndOutreach: {
    elevatorPitch30s:
      "FitPulse Pro, c'est l'application de fitness qui s'adapte à votre forme du jour en 5 minutes. Contrairement aux apps qui vous culpabilisent, on célèbre la régularité avec un suivi biométrique simple.",
    pressReleaseEmail:
      "Objet : FitPulse Pro lève le frein du temps pour faire du sport\n\nParis, 10 septembre 2026 — FitPulse Pro propose une nouvelle approche du fitness digital : des micro-séances de 5 à 20 minutes, sans équipement, personnalisées en temps réel grâce aux données de sommeil et de fréquence cardiaque. L'application est disponible gratuitement sur iOS et Android avec un essai Premium de 7 jours.",
    influencerDm:
      "Salut [Prénom], j'adore ton approche du fitness bienveillant. On vient de lancer FitPulse Pro, une app de micro-séances adaptatives sans culpabilité. Je me disais que ça pouvait vraiment plaire à ta communauté. Ça te dit de tester 7 jours en accès Pro offert ?",
  },
  actionPlan7Days: [
    { day: "Jour 1", task: "Publier le teaser TikTok + Instagram Reels", channel: "Réseaux sociaux" },
    { day: "Jour 2", task: "Lancer le Product Hunt avec la communauté beta", channel: "Product Hunt / Email" },
    { day: "Jour 3", task: "Envoyer le kit presse aux journalistes tech & wellness", channel: "Relations presse" },
    { day: "Jour 4", task: "Activer 3 micro-influenceurs fitness", channel: "TikTok / YouTube Shorts" },
    { day: "Jour 5", task: "Lancer une campagne ASA sur mot-clé 'HIIT 10 min'", channel: "Apple Search Ads" },
    { day: "Jour 6", task: "Envoyer push in-app bilan J+5 aux testeurs", channel: "Push & CRM" },
    { day: "Jour 7", task: "Analyser les premiers metrics et ajuster les créas", channel: "Analytics" },
  ],
};

export const DEMO_SESSION: MarketingSession = {
  ...base,
  abTesting: generateDefaultAbTestPlan(base),
  competitorAnalysis: generateDefaultCompetitors(base),
  ugcScripts: generateDefaultUgcScripts(base),
  localizedAso: {
    FR: {
      storeTitle: "FitPulse Pro : HIIT & Cardio",
      subtitle: "Séances courtes, résultats concrets",
      shortDescription:
        "Votre coach sportif personnel pour des séances de cardio et HIIT ultra-rapides, sans équipement.",
      keywords: ["fitness", "hiit", "cardio", "entraînement", "sport", "maison", "perte de poids", "suivi", "coach"],
    },
    US: {
      storeTitle: "FitPulse Pro: HIIT & Cardio",
      subtitle: "Short workouts, real results",
      shortDescription:
        "Your personal fitness coach for quick cardio and HIIT sessions, no equipment needed.",
      keywords: ["fitness", "hiit", "cardio", "workout", "home", "health", "coach", "training", "quick", "burn"],
    },
  },
  okrPlan: generateDefaultOkrPlan(base),
  retentionSequence: generateDefaultRetentionPlan(base),
  customPaywall: generateDefaultPaywallConfig(base),
  adCreatives: generateDefaultAdCreatives(base),
  multiMarketPlan: generateDefaultMultiMarketPlan(base),
};
