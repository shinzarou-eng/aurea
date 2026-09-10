import { AdCreativeTemplate, MarketingSession } from "../types";

export function generateDefaultAdCreatives(session: Partial<MarketingSession>): AdCreativeTemplate[] {
  const appName = session.appOverview?.detectedName || "Notre Application";
  const usp = session.appOverview?.uniqueValueProposition || "La solution mobile moderne qui transforme votre quotidien.";
  const hookAngle = session.advertisingAngles?.[0]?.hookText || `L'application que tout le monde utilise pour ${appName}.`;

  return [
    {
      id: "ad-tiktok-story-1",
      format: "story_9_16",
      platform: "TikTok / Reels",
      hookHeadline: "« J'ai arrêté de perdre 2h par jour grâce à cette app »",
      subtext: usp,
      ctaText: "Télécharger gratuitement",
      badgeText: "🔥 Tendance N°1",
      appRatingText: "⭐️ 4.9/5 (15 000+ avis)",
      bgColor: "#0F172A",
      gradient: "from-purple-900 via-slate-900 to-black",
      screenshotIndex: 0,
      overlayStyle: "floating_card",
      aiPromptIdea: `High-converting TikTok ad frame for ${appName}, vibrant neon accents, smartphone mockup displaying user interface, dramatic lighting, modern minimalist design.`,
    },
    {
      id: "ad-meta-feed-1",
      format: "feed_1_1",
      platform: "Instagram / Meta Feed",
      hookHeadline: hookAngle,
      subtext: `Plus de 50 000 utilisateurs ont déjà adopté ${appName}. Rejoignez le mouvement aujourd'hui.`,
      ctaText: "Installer maintenant",
      badgeText: "🏆 App du Jour",
      appRatingText: "⭐️ 4.8/5 sur l'App Store",
      bgColor: "#1E1B4B",
      gradient: "from-indigo-950 via-slate-900 to-purple-950",
      screenshotIndex: 0,
      overlayStyle: "split_screen",
      aiPromptIdea: `Instagram square carousel visual for mobile application ${appName}, modern UI glassmorphism card, glowing purple accents, Apple design award aesthetics.`,
    },
    {
      id: "ad-landscape-google-1",
      format: "landscape_16_9",
      platform: "Twitter / LinkedIn",
      hookHeadline: `${appName} : La référence nouvelle version`,
      subtext: "Conçue pour les utilisateurs exigeants en quête de performance et de simplicité.",
      ctaText: "Découvrir l'application",
      badgeText: "Essai Gratuit 7 Jours",
      appRatingText: "⭐️ Top 10 Productivité",
      bgColor: "#064E3B",
      gradient: "from-emerald-950 via-slate-900 to-teal-950",
      screenshotIndex: 0,
      overlayStyle: "bold_typography",
      aiPromptIdea: `Landscape promotional banner for ${appName}, clean typography, emerald green gradients, dual phone perspective rendering.`,
    },
    {
      id: "ad-appstore-feature-1",
      format: "feature_banner_3_2",
      platform: "App Store Feature",
      hookHeadline: `L'expérience ${appName} réinventée`,
      subtext: "Une ergonomie millimétrée et des résultats immédiats dès votre première minute.",
      ctaText: "Disponible sur iOS & Android",
      badgeText: "Nouveauté 2026",
      appRatingText: "⭐️ Choix de la rédaction",
      bgColor: "#172554",
      gradient: "from-blue-950 via-slate-900 to-indigo-950",
      screenshotIndex: 0,
      overlayStyle: "badge_focus",
      aiPromptIdea: `Apple App Store hero feature banner art for ${appName}, clean premium 3D composition, minimalist elegance, soft studio glow.`,
    },
  ];
}
