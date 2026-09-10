import { CompetitorAnalysis, MarketingSession } from "../types";

export function generateDefaultCompetitors(session: MarketingSession): CompetitorAnalysis {
  const category = session?.appOverview?.category?.toLowerCase() || "";
  const appName = session?.appOverview?.detectedName || "Notre application";
  const uvp = session?.appOverview?.uniqueValueProposition || "Une solution moderne et intuitive";

  if (category.includes("financ") || category.includes("budget") || category.includes("crypto")) {
    return {
      unfairAdvantageMoat: `Expérience sans friction : automatisation visuelle des flux financiers sans interface bancaire complexe ni jargon technique.`,
      counterPositioningStrategy: `Se positionner comme l'alternative chaleureuse, visuelle et instantanée face aux néobanques devenues des 'usines à gaz' pleines de frais cachés.`,
      targetMarketShareGoal: `Capter 3 à 5% des jeunes actifs déçus par l'austérité de leurs applications bancaires traditionnelles.`,
      competitors: [
        {
          name: "Revolut / N26",
          category: "Néobanque généraliste",
          theirWeakness: "Interface surchargée d'onglets (crypto, actions, assurances), support client automatisé impersonnel.",
          ourAdvantage: `Focus laser sur la clarté : ${appName} permet de comprendre son budget en 5 secondes sans complexité.`,
          pricingComparison: "Leurs abonnements Premium coûtent 9,99€ à 16,99€/mois avec engagement. Notre offre est 50% plus accessible.",
          poachingAngle: "Vous n'avez pas besoin de 40 fonctionnalités inutiles pour gérer votre argent. Passez à la clarté absolue.",
        },
        {
          name: "Bankin' / Linxo",
          category: "Agrégateur bancaire historique",
          theirWeakness: "Publicités intrusives pour du crédit, synchronisations bancaires qui sautent fréquemment, design vieillissant.",
          ourAdvantage: `Interface moderne et fluide, respect strict de la confidentialité sans revente de données d'achat.`,
          pricingComparison: "Version gratuite polluée de bannières vs notre expérience 100% propre et fluide.",
          poachingAngle: "Marre de voir des pubs de rachat de crédit quand vous voulez juste voir votre solde ?",
        },
        {
          name: "Finary / Budgetbakers",
          category: "Gestion de patrimoine",
          theirWeakness: "Trop technique pour les débutants, orienté gros patrimoines et investisseurs experts.",
          ourAdvantage: `${appName} démocratise la maîtrise financière quotidienne pour tout le monde avec bienveillance.`,
          pricingComparison: "Finary Plus à 120€+/an vs notre tarification légère et transparente.",
          poachingAngle: "Pourquoi payer pour des graphiques d'actifs complexes quand vous voulez juste épargner 200€ de plus par mois ?",
        },
      ],
    };
  }

  if (category.includes("sant") || category.includes("fit") || category.includes("sport") || category.includes("nutrition")) {
    return {
      unfairAdvantageMoat: `Approche motivationnelle non-culpabilisante : micro-engagements de 5 minutes personnalisés plutôt que des programmes rigides.`,
      counterPositioningStrategy: `Contre-positionnement direct face aux applications 'militaires' et anxiogènes : ici, la progression est fluide et gratifiante.`,
      targetMarketShareGoal: `Devenir l'application de référence pour les 70% de sportifs amateurs qui abandonnent au bout de 3 semaines.`,
      competitors: [
        {
          name: "Strava / Nike Training",
          category: "Réseau social sportif",
          theirWeakness: "Pression sociale toxique, axé sur la performance brute, décourage les pratiquants modérés.",
          ourAdvantage: `${appName} valorise la régularité personnelle sans comparaison toxique avec des athlètes professionnels.`,
          pricingComparison: "Strava à 9,99€/mois avec fonctionnalités masquées vs notre proposition de valeur directe.",
          poachingAngle: "Le sport sans la pression du regard des autres : progressez à votre rythme.",
        },
        {
          name: "MyFitnessPal",
          category: "Comptage de calories & nutrition",
          theirWeakness: "Scan de codes-barres devenu payant, saisie manuelle fastidieuse, bugs fréquents.",
          ourAdvantage: `Saisie ultra-rapide et visuelle, notre moteur simplifie le suivi sans prise de tête.`,
          pricingComparison: "Leur abonnement est monté à 19,99€/mois : nous offrons une meilleure expérience pour le tiers du prix.",
          poachingAngle: "Plus besoin de passer 15 minutes à peser votre salade. Suivez vos progrès en un clin d'œil.",
        },
        {
          name: "Freeletics / FizzUp",
          category: "Coaching fitness automatisé",
          theirWeakness: "Séances souvent trop intenses dès le départ, risque de blessure et taux d'abandon élevé.",
          ourAdvantage: `Adaptabilité temps-réel à votre état de forme et à votre énergie du jour.`,
          pricingComparison: "Abonnements annuels chers avec prélèvement automatique difficile à résilier.",
          poachingAngle: "Et si votre entraînement s'adaptait à votre journée, et non l'inverse ?",
        },
      ],
    };
  }

  if (category.includes("éduc") || category.includes("lang") || category.includes("appren")) {
    return {
      unfairAdvantageMoat: `Pédagogie active par micro-défis contextualisés ancrés dans la vraie vie plutôt que des phrases absurdes répétées en boucle.`,
      counterPositioningStrategy: `Mettre en avant l'utilité concrète immédiate dès le premier jour face à la gamification superficielle de Duolingo.`,
      targetMarketShareGoal: `Séduire les apprenants sérieux qui ont passé des mois sur Duolingo sans jamais réussir à tenir une conversation réelle.`,
      competitors: [
        {
          name: "Duolingo",
          category: "Application de langues gamifiée",
          theirWeakness: "Phrases ridicules ('Le canard mange une pomme verte'), addiction aux séries (streaks) plutôt qu'aux vrais acquis.",
          ourAdvantage: `${appName} enseigne le vocabulaire et les tournures dont vous avez réellement besoin au quotidien.`,
          pricingComparison: "Duolingo Max à 29,99€/mois : hors de prix pour des exercices robotiques.",
          poachingAngle: "Vous avez 450 jours de streak sur Duolingo mais vous ne savez pas commander un café à Madrid ? Changez de méthode.",
        },
        {
          name: "Babbel",
          category: "Méthode linguistique classique",
          theirWeakness: "Format très académique et monotone, peu engageant sur mobile sur la durée.",
          ourAdvantage: `Rythme dynamique, design contemporain et récompenses instantanées.`,
          pricingComparison: "Abonnement rigide par langue unique vs flexibilité totale sur notre app.",
          poachingAngle: "Apprenez comme dans la vraie vie, pas comme dans un manuel scolaire des années 90.",
        },
        {
          name: "Busuu / Memrise",
          category: "Flashcards & communauté",
          theirWeakness: "Expérience fragmentée, vidéos d'utilisateurs de qualité inégale.",
          ourAdvantage: `Parcours guidé cohérent et validation automatique des compétences.`,
          pricingComparison: "Tarification opaque avec promotions constantes déroutantes.",
          poachingAngle: "La méthode la plus rapide pour enfin maîtriser vos compétences clés.",
        },
      ],
    };
  }

  // Default / Productivity & General apps
  return {
    unfairAdvantageMoat: `Simplicité radicale : zéro friction de configuration, prise en main en moins de 60 secondes chrono.`,
    counterPositioningStrategy: `L'antidote aux logiciels complexes sur-paramétrables qui demandent des heures de tutoriels YouTube avant de servir.`,
    targetMarketShareGoal: `Devenir le premier choix des utilisateurs débordés qui veulent de l'efficacité immédiate.`,
    competitors: [
      {
        name: "Notion / Obsidian",
        category: "Espace de travail tout-en-un",
        theirWeakness: "Courbe d'apprentissage intimidante, syndrome de la page blanche, lenteur sur mobile.",
        ourAdvantage: `${appName} est prêt immédiatement. Aucune formule ni base de données à construire.`,
        pricingComparison: "Nombreux add-ons payants vs notre tarif tout inclus sans surprise.",
        poachingAngle: "Vous passez plus de temps à configurer votre outil qu'à faire votre travail ? Voici la solution.",
      },
      {
        name: "Todoist / Things 3",
        category: "Gestionnaire de tâches classique",
        theirWeakness: "Interfaces austères et monotones, pas d'automatisation intelligente ni d'aide au passage à l'action.",
        ourAdvantage: `Design inspirant, guidage visuel dynamique et fonctionnalités adaptées au mobile moderne.`,
        pricingComparison: "Things 3 facture chaque appareil séparément (iPhone, iPad, Mac) vs notre synchronisation universelle.",
        poachingAngle: "Une liste de tâches ne suffit plus. Découvrez l'application qui vous aide vraiment à avancer.",
      },
      {
        name: "Trello / Asana",
        category: "Gestion de projet d'équipe",
        theirWeakness: "Pensé pour le desktop en entreprise, ergonomie mobile très lourde et dégradée.",
        ourAdvantage: `Conçu mobile-first : gestes fluides, notifications intelligentes et confort d'utilisation au pouce.`,
        pricingComparison: "Abonnements par utilisateur coûteux avec minimum de sièges vs licence mobile flexible.",
        poachingAngle: "Gérez vos priorités en 3 tapes, où que vous soyez.",
      },
    ],
  };
}
