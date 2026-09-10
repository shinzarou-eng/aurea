import { UgcScript, MarketingSession } from "../types";

export function generateDefaultUgcScripts(session: MarketingSession): UgcScript[] {
  const appName = session?.appOverview?.detectedName || "notre application";
  const catchphrase = session?.appOverview?.catchphrase || "simplifier votre quotidien";
  const pain = session?.targetPersonas?.[0]?.corePainPoint || "perdre du temps chaque jour";
  const feature = session?.appOverview?.primaryFeaturesDetected?.[0] || "l'analyse instantanée";

  return [
    {
      id: "ugc-1",
      title: "Format 'Ne fais plus jamais cette erreur' (Pattern Interrupt)",
      targetEmotion: "Curiosité & Électrochoc",
      musicTrend: "Son mystérieux tendance TikTok / ASMR tapotement doux",
      creatorTip: "Regarde droit dans la caméra à 20cm max au début, avec un regard perplexe ou agacé. Le premier mot doit sortir en moins de 0.8 seconde.",
      scenes: [
        {
          timeframe: "0:00 - 0:03",
          phase: "Hook Visuel & Audio",
          visualAction: "Plan très serré (selfie). Tu secoues la tête avec les sourcils froncés en tenant ton téléphone.",
          audioVoiceover: `Si tu continues à faire ça sur ton téléphone, tu perds littéralement des heures chaque semaine.`,
          onScreenText: "🚨 ARRÊTE DE FAIRE ÇA IMMÉDIATEMENT",
        },
        {
          timeframe: "0:03 - 0:14",
          phase: "Agitation du Problème",
          visualAction: "Changement d'angle. Tu montres la méthode habituelle fastidieuse (noter sur papier ou ouvrir 3 applis lentes).",
          audioVoiceover: `Pendant des mois, je galérais avec ${pain}. C'était l'enfer : désorganisé, stressant et aucune régularité.`,
          onScreenText: `❌ Moi avant : ${pain.slice(0, 35)}...`,
        },
        {
          timeframe: "0:14 - 0:28",
          phase: "La Découverte Magique",
          visualAction: "Screen record de l'app ou gros plan sur l'écran du smartphone : tu tapes sur l'écran et le résultat s'affiche instantanément.",
          audioVoiceover: `Puis un pote m'a fait tester ${appName}. Regarde bien : en un seul geste, ${feature}. Tout est automatisé.`,
          onScreenText: `✨ La découverte qui change tout : ${appName}`,
        },
        {
          timeframe: "0:28 - 0:38",
          phase: "Résultat Concret & Preuve",
          visualAction: "Sourire détendu, tu montres l'écran avec le tableau de bord terminé et propre.",
          audioVoiceover: `Résultat ? En 3 jours j'ai gagné un temps fou et j'ai l'esprit 100% libéré.`,
          onScreenText: "✅ Résultat : 0 stress, 100% clair",
        },
        {
          timeframe: "0:38 - 0:45",
          phase: "Call to Action Efficace",
          visualAction: "Tu pointes ton doigt vers le bas de l'écran en souriant.",
          audioVoiceover: `L'application est encore gratuite en ce moment, teste-la par toi-même avec le lien juste ici.`,
          onScreenText: "📲 Teste-la gratuitement (Lien en bio)",
        },
      ],
    },
    {
      id: "ugc-2",
      title: "Format 'POV / 3 Apps indispensables que personne ne connaît'",
      targetEmotion: "Découverte secrète / Avantage injuste",
      musicTrend: "Lo-fi Chill upbeat ou beat Phonk discret en fond",
      creatorTip: "Parle avec un ton confiant de partage de 'secret d'initié'. Le rythme de cut doit être rapide (coupe toutes les respirations).",
      scenes: [
        {
          timeframe: "0:00 - 0:03",
          phase: "Hook Curiosité",
          visualAction: "Tu chuchotes presque vers le micro en mode confession exclusive.",
          audioVoiceover: `Voici l'application secrète que les personnes les plus productives gardent pour elles.`,
          onScreenText: "🤫 L'app secrète dont personne ne parle...",
        },
        {
          timeframe: "0:03 - 0:15",
          phase: "Le 'Pourquoi'",
          visualAction: "Tu fais défiler ton écran d'accueil avec les grosses applications classiques.",
          audioVoiceover: `Oublie les applications lourdes et compliquées qui te demandent 2 heures de tutoriels.`,
          onScreenText: "❌ Trop lourd / Trop complexe",
        },
        {
          timeframe: "0:15 - 0:30",
          phase: "Démonstration Feature Star",
          visualAction: "Enregistrement d'écran fluide avec curseur de doigt montrant la navigation ultra rapide dans l'app.",
          audioVoiceover: `Elle s'appelle ${appName}. Elle est faite pour ${catchphrase}. Tu l'ouvres, tu cliques, c'est fait. Zéro blabla.`,
          onScreenText: `📱 ${appName} : Ultra simple & fluide`,
        },
        {
          timeframe: "0:30 - 0:42",
          phase: "Appel à l'action immédiat",
          visualAction: "Tu montres la fiche de téléchargement de l'App Store / Google Play avec les 5 étoiles.",
          audioVoiceover: `Dispo sur iPhone et Android. Enregistre ce TikTok avant qu'elle ne devienne payante !`,
          onScreenText: "⭐ 4.9/5 sur le Store • Enregistre ce TikTok !",
        },
      ],
    },
    {
      id: "ugc-3",
      title: "Format 'Avant / Après' Défi 7 Jours",
      targetEmotion: "Transformation & Preuve sociale",
      musicTrend: "Son montée en puissance (Build-up) vers un drop satisfaisant",
      creatorTip: "Mets un vrai contraste d'attitude entre le Jour 1 (débordé, cheveux en bataille) et le Jour 7 (lumineux, calme et efficace).",
      scenes: [
        {
          timeframe: "0:00 - 0:03",
          phase: "Contraste Immédiat",
          visualAction: "Écran scindé ou transition rapide entre visage fatigué et visage rayonnant.",
          audioVoiceover: `J'ai testé ${appName} pendant 7 jours et voilà exactement ce qui s'est passé.`,
          onScreenText: "🗓️ Mon Défi 7 Jours avec cette app",
        },
        {
          timeframe: "0:03 - 0:16",
          phase: "Jour 1 à 3 : La Frustration",
          visualAction: "Tu montres l'accumulation de tâches et le stress quotidien.",
          audioVoiceover: `Au début j'étais sceptique. J'avais déjà essayé plein d'outils et j'abandonnais toujours.`,
          onScreenText: "Jour 1 : Franchement sceptique...",
        },
        {
          timeframe: "0:16 - 0:30",
          phase: "Jour 4 à 7 : Le Déclic",
          visualAction: "Animation de l'app avec les notifications positives et le temps gagné.",
          audioVoiceover: `Mais l'interface est tellement fluide que c'est devenu automatique. Dès le quatrième jour, tout était réglé en 3 minutes par jour.`,
          onScreenText: `Jour 4 : Déclic total ! 🚀`,
        },
        {
          timeframe: "0:30 - 0:45",
          phase: "Verdict & CTA",
          visualAction: "Clin d'œil ou pouce levé, écran de l'app en fond vert derrière toi.",
          audioVoiceover: `Si tu veux toi aussi ${catchphrase}, fonce la tester. Le lien est directement en bio.`,
          onScreenText: "🔥 Verdict : 10/10 • Télécharge là maintenant",
        },
      ],
    },
  ];
}
