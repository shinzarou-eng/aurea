import express from "express";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import os from "os";
import { spawn } from "child_process";
import { GoogleGenAI as GoogleGenaiClient, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with high limit for images (up to 50mb base64 payload)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Sanitize API keys to strictly prevent ByteString conversion failures (character > 255 like char 8217 '’', smart quotes, zero-width spaces, or newlines)
function sanitizeApiKey(key?: string): string {
  if (!key) return "";
  let clean = String(key).trim();
  // Strip enclosing quotes / smart quotes / backticks
  clean = clean.replace(/^['"`’‘“”«»\s]+|['"`’‘“”«»\s]+$/g, "");
  // Replace internal smart quotes if pasted
  clean = clean.replace(/[\u2018\u2019\u201A\u201B]/g, "");
  clean = clean.replace(/[\u201C\u201D\u201E\u201F]/g, "");
  // Remove zero-width spaces, non-breaking spaces, BOM
  clean = clean.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "");
  // Strictly enforce printable ASCII characters (33-126) for HTTP Authorization header ByteString safety
  clean = clean.replace(/[^\x21-\x7E]/g, "");
  return clean.trim();
}

// Lazy Google client initialization
function getGoogleClient(customKey?: string): GoogleGenaiClient {
  const apiKey = sanitizeApiKey(customKey) || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Aucune clé API Google trouvée (ni personnalisée, ni configurée sur le serveur).");
  }
  return new GoogleGenaiClient({ apiKey });
}

// Clean and extract JSON from model responses
function cleanAndParseJson(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

// Resilient Normalizer ensuring all properties and arrays conform strictly to MarketingSession
function normalizeMarketingSession(raw: any, fallbackAppName: string = "App"): any {
  if (!raw || typeof raw !== "object") raw = {};

  const overview = raw.appOverview || {};
  const appOverview = {
    detectedName: overview.detectedName || overview.name || fallbackAppName || "Mon Application",
    catchphrase: overview.catchphrase || overview.tagline || overview.slogan || "L'application conçue pour simplifier votre quotidien",
    uniqueValueProposition: overview.uniqueValueProposition || overview.uvp || "La solution mobile rapide, fluide et efficace.",
    category: overview.category || "Productivité & Utilitaires",
    primaryFeaturesDetected: Array.isArray(overview.primaryFeaturesDetected) && overview.primaryFeaturesDetected.length > 0 
      ? overview.primaryFeaturesDetected 
      : (Array.isArray(overview.features) ? overview.features : ["Interface épurée et intuitive", "Gestion rapide des données", "Tableau de bord personnalisé"]),
    colorPalette: Array.isArray(overview.colorPalette) && overview.colorPalette.length > 0 
      ? overview.colorPalette 
      : ["#10B981", "#0F172A", "#6366F1", "#F8FAFC"],
    brandVoice: overview.brandVoice || overview.tone || "Moderne, dynamique et accessible",
  };

  const rawPersonas = Array.isArray(raw.targetPersonas) ? raw.targetPersonas : (Array.isArray(raw.personas) ? raw.personas : []);
  const targetPersonas = rawPersonas.length > 0 ? rawPersonas.map((p: any, idx: number) => ({
    personaName: p.personaName || p.name || p.role || `Utilisateur type #${idx + 1}`,
    corePainPoint: p.corePainPoint || (Array.isArray(p.corePainPoints) ? p.corePainPoints.join(", ") : (p.painPoint || "Perte de temps sur les tâches répétitives")),
    triggerMoment: p.triggerMoment || p.acquisitionHook || "Recherche d'une solution simple et rapide après frustration",
    keyBenefitExpected: p.keyBenefitExpected || (Array.isArray(p.goals) ? p.goals.join(", ") : (p.benefit || "Gain de temps immédiat et sérénité")),
  })) : [
    {
      personaName: "Professionnel ou utilisateur actif",
      corePainPoint: "Manque d'organisation et perte de temps au quotidien",
      triggerMoment: "Besoin urgent d'une solution claire et sans friction",
      keyBenefitExpected: "Une expérience fluide et un gain d'efficacité mesurable",
    }
  ];

  const rawSwot = raw.swotAndTrends || raw.swot || {};
  const swotAndTrends = {
    strengths: Array.isArray(rawSwot.strengths) && rawSwot.strengths.length > 0 
      ? rawSwot.strengths 
      : ["Design soigné et moderne", "Parcours utilisateur direct et lisible"],
    weaknesses: Array.isArray(rawSwot.weaknesses) && rawSwot.weaknesses.length > 0 
      ? rawSwot.weaknesses 
      : ["Notoriété initiale à construire", "Base d'utilisateurs en phase de lancement"],
    opportunities: Array.isArray(rawSwot.opportunities) && rawSwot.opportunities.length > 0 
      ? rawSwot.opportunities 
      : ["Croissance du marché mobile", "Potentiel de viralité sur les réseaux sociaux"],
    threats: Array.isArray(rawSwot.threats) && rawSwot.threats.length > 0 
      ? rawSwot.threats 
      : ["Concurrence établie sur les stores", "Coût d'acquisition publicitaire en hausse"],
    marketTrends: Array.isArray(rawSwot.marketTrends) && rawSwot.marketTrends.length > 0 
      ? rawSwot.marketTrends.map((m: any) => typeof m === "string" ? {
          trendName: m,
          impactScore: "Élevé",
          description: m,
          actionableAdvice: "Capitaliser sur cette tendance dans la communication.",
        } : {
          trendName: m.trendName || m.name || "Tendance mobile clé",
          impactScore: m.impactScore || "Fort",
          description: m.description || "Évolution des usages vers plus de simplicité.",
          actionableAdvice: m.actionableAdvice || m.advice || "Intégrer ce bénéfice dès les premiers écrans.",
        }) 
      : [
        {
          trendName: "Micro-interactions et simplicité radicale",
          impactScore: "Majeur",
          description: "Les utilisateurs privilégient les interfaces épurées et sans friction.",
          actionableAdvice: "Mettre en avant la simplicité d'utilisation dans vos captures d'écran.",
        }
      ],
    strategicSummary: rawSwot.strategicSummary || "L'application dispose d'atouts visuels forts à exploiter dès l'onboarding et sur les stores.",
  };

  const rawMonetization = raw.monetization || {};
  const rawPricingTiers = Array.isArray(rawMonetization.pricingTiers) ? rawMonetization.pricingTiers : [];
  const pricingTiers = rawPricingTiers.length > 0 ? rawPricingTiers.map((t: any) => ({
    name: t.name || "Abonnement Pro",
    price: t.price || (t.period ? `9,99 € / ${t.period}` : "9,99 € / mois"),
    badge: t.badge || (t.recommended ? "Recommandé" : undefined),
    trialDays: t.trialDays || (t.period?.includes("an") ? "Essai gratuit 7 jours" : undefined),
  })) : [
    { name: "Mensuel Pro", price: "9,99 € / mois", trialDays: "Essai 7 jours" },
    { name: "Annuel Pro", price: "59,99 € / an", badge: "Économisez 50%" }
  ];

  const rawPaywallCopy = rawMonetization.paywallCopy || {};
  const bulletBenefits = Array.isArray(rawPaywallCopy.bulletBenefits) && rawPaywallCopy.bulletBenefits.length > 0
    ? rawPaywallCopy.bulletBenefits 
    : (Array.isArray(rawMonetization.paywallBullets) && rawMonetization.paywallBullets.length > 0
      ? rawMonetization.paywallBullets 
      : ["Accès illimité à toutes les fonctionnalités", "Synchronisation continue et sauvegarde", "Assistance prioritaire"]);
  
  const paywallCopy = {
    headline: rawPaywallCopy.headline || (Array.isArray(rawMonetization.paywallHeadlines) ? rawMonetization.paywallHeadlines[0] : null) || "Débloquez tout le potentiel de votre application",
    subheadline: rawPaywallCopy.subheadline || "Rejoignez les membres Pro et atteignez vos objectifs sans limite.",
    bulletBenefits,
    ctaButtonText: rawPaywallCopy.ctaButtonText || rawMonetization.paywallCTA || "Commencer l'essai gratuit",
    reassuranceText: rawPaywallCopy.reassuranceText || "Annulation possible à tout moment en 1 clic. Aucun engagement.",
  };

  const monetization = {
    recommendedModel: rawMonetization.recommendedModel || rawMonetization.recommendedStrategy || "Freemium avec période d'essai",
    freeTierFeatures: Array.isArray(rawMonetization.freeTierFeatures) && rawMonetization.freeTierFeatures.length > 0
      ? rawMonetization.freeTierFeatures 
      : ["Fonctionnalités de base", "Usage limité"],
    premiumTierFeatures: Array.isArray(rawMonetization.premiumTierFeatures) && rawMonetization.premiumTierFeatures.length > 0
      ? rawMonetization.premiumTierFeatures 
      : (Array.isArray(rawMonetization.paidTierFeatures) && rawMonetization.paidTierFeatures.length > 0
        ? rawMonetization.paidTierFeatures 
        : ["Fonctionnalités avancées débloquées", "Sans publicité", "Statistiques complètes"]),
    pricingTiers,
    paywallCopy,
    paywallTriggers: Array.isArray(rawMonetization.paywallTriggers) && rawMonetization.paywallTriggers.length > 0
      ? rawMonetization.paywallTriggers 
      : (Array.isArray(rawMonetization.psychologicalTriggers) && rawMonetization.psychologicalTriggers.length > 0
        ? rawMonetization.psychologicalTriggers 
        : ["Après avoir complété la première action clé", "Lors de la tentative d'accès à une fonctionnalité premium"]),
  };

  const rawAso = raw.appStoreOptimization || {};
  const appStoreOptimization = {
    storeTitle: rawAso.storeTitle || rawAso.appleTitle || `${appOverview.detectedName} : ${appOverview.category}`,
    subtitle: rawAso.subtitle || rawAso.appleSubtitle || appOverview.catchphrase.slice(0, 30),
    shortDescription: rawAso.shortDescription || rawAso.googleShortDesc || appOverview.uniqueValueProposition.slice(0, 80),
    fullDescription: rawAso.fullDescription || `${appOverview.detectedName} est la solution idéale pour votre quotidien.\n\n${appOverview.uniqueValueProposition}\n\nFonctionnalités clés :\n${appOverview.primaryFeaturesDetected.map((f: string) => `• ${f}`).join("\n")}`,
    keywords: Array.isArray(rawAso.keywords) && rawAso.keywords.length > 0 
      ? rawAso.keywords 
      : [appOverview.detectedName.toLowerCase(), "app", "mobile", "productivité", "rapide"],
    screenshotCaptions: Array.isArray(rawAso.screenshotCaptions) && rawAso.screenshotCaptions.length > 0
      ? rawAso.screenshotCaptions.map((c: any, i: number) => ({
          screenNumber: c.screenNumber || c.screenIndex || i + 1,
          headline: c.headline || `Écran ${i + 1}`,
          subtext: c.subtext || "Découvrez une expérience simple et efficace",
        })) 
      : [
        { screenNumber: 1, headline: "Simplifiez votre quotidien", subtext: "Tout au même endroit, en un clin d'œil" },
        { screenNumber: 2, headline: "Gagnez du temps précieux", subtext: "Des résultats concrets chaque jour" }
      ],
  };

  const rawSocial = raw.socialMediaLaunch || {};
  const rawTiktok = Array.isArray(rawSocial.tiktokReelsHooks) 
    ? rawSocial.tiktokReelsHooks 
    : (Array.isArray(rawSocial.tiktokVideoScripts) ? rawSocial.tiktokVideoScripts : []);
  const socialMediaLaunch = {
    twitterThread: Array.isArray(rawSocial.twitterThread) && rawSocial.twitterThread.length > 0
      ? rawSocial.twitterThread 
      : [
        `🚀 Lancement de ${appOverview.detectedName} : la solution pour ${appOverview.catchphrase}. Découverte en fil 🧵👇`,
        `1/ Le problème résolu : ${targetPersonas[0]?.corePainPoint || "La perte de temps"}.`,
        `2/ Notre approche : ${appOverview.uniqueValueProposition}.`,
        `3/ Téléchargez l'application dès maintenant et dites-nous ce que vous en pensez !`
      ],
    linkedInPost: rawSocial.linkedInPost || `Fier de vous présenter ${appOverview.detectedName} !\n\n${appOverview.uniqueValueProposition}\n\nUn projet pensé pour apporter une vraie valeur ajoutée aux utilisateurs.`,
    tiktokReelsHooks: rawTiktok.length > 0 
      ? rawTiktok.map((t: any) => ({
          hookVisual: t.hookVisual || "Montrer l'interface de l'application en action",
          hookAudio: t.hookAudio || "Si vous en avez marre de perdre du temps, regardez ça.",
          concept: t.concept || t.storyline || "Démonstration en 15 secondes de la fonctionnalité phare.",
        })) 
      : [
        {
          hookVisual: "Plan rapproché sur l'écran du smartphone montrant l'application",
          hookAudio: "Arrêtez de compliquer ce qui peut être simple.",
          concept: "Transition avant/après montrant le résultat en 5 secondes.",
        }
      ],
    productHuntKit: {
      tagline: rawSocial.productHuntKit?.tagline || rawSocial.productHuntTagline || appOverview.catchphrase.slice(0, 60),
      makerComment: rawSocial.productHuntKit?.makerComment || rawSocial.productHuntFirstComment || `Bonjour Product Hunt ! Nous avons créé ${appOverview.detectedName} pour ${appOverview.uniqueValueProposition}. Hâte d'avoir vos retours !`,
    },
  };

  const rawAngles = Array.isArray(raw.advertisingAngles) ? raw.advertisingAngles : [];
  const advertisingAngles = rawAngles.length > 0 
    ? rawAngles.map((a: any, idx: number) => ({
        angleName: a.angleName || `Angle #${idx + 1}`,
        hookText: a.hookText || a.headline || "Vous méritez une application plus rapide.",
        bodyCopy: a.bodyCopy || a.primaryText || appOverview.uniqueValueProposition,
        ctaButton: a.ctaButton || a.callToAction || "Installer l'app",
        recommendedVisualConcept: a.recommendedVisualConcept || a.visualConcept || "Capture d'écran épurée avec badge de notation 5 étoiles",
      })) 
    : [
      {
        angleName: "Bénéfice immédiat",
        hookText: "Gagnez 30 minutes par jour dès aujourd'hui",
        bodyCopy: appOverview.uniqueValueProposition,
        ctaButton: "Télécharger gratuitement",
        recommendedVisualConcept: "Visuel avant/après avec l'écran d'accueil",
      }
    ];

  const rawPr = raw.prAndOutreach || {};
  const prAndOutreach = {
    elevatorPitch30s: rawPr.elevatorPitch30s || rawPr.elevatorPitch || `${appOverview.detectedName} est l'application qui aide ${targetPersonas[0]?.personaName || "les utilisateurs"} à ${appOverview.catchphrase}.`,
    pressReleaseEmail: rawPr.pressReleaseEmail || rawPr.journalistEmailPitch || `Bonjour,\n\nJe vous contacte au sujet du lancement de ${appOverview.detectedName}...\n\n${appOverview.uniqueValueProposition}\n\nDisponible sur iOS et Android.`,
    influencerDm: rawPr.influencerDm || `Hello ! J'adore ton contenu. On vient de lancer ${appOverview.detectedName} (${appOverview.catchphrase}) et on aimerait beaucoup t'offrir un accès Pro pour que tu nous dises ce que tu en penses !`,
  };

  const rawPlan = Array.isArray(raw.actionPlan7Days) ? raw.actionPlan7Days : [];
  const actionPlan7Days = rawPlan.length > 0 
    ? rawPlan.map((d: any, idx: number) => ({
        day: typeof d.day === "string" ? d.day : `Jour ${d.day || idx + 1}`,
        task: d.task || (Array.isArray(d.tasks) ? d.tasks.join(" • ") : (d.focus || "Préparation du lancement")),
        channel: d.channel || d.deliverable || "Tous les canaux",
      })) 
    : [
      { day: "Jour 1", task: "Validation de la fiche ASO et des captures d'écran", channel: "App Store & Google Play" },
      { day: "Jour 2", task: "Publication du thread Twitter et du post LinkedIn", channel: "Réseaux Sociaux" },
      { day: "Jour 3", task: "Lancement sur Product Hunt et outreach communauté", channel: "Product Hunt" },
      { day: "Jour 4", task: "Prise de contact avec les premiers influenceurs et médias", channel: "Relations Presse" },
      { day: "Jour 5", task: "Lancement des premières campagnes publicitaires tests (Meta/TikTok)", channel: "Publicité" },
      { day: "Jour 6", task: "Analyse des premiers retours utilisateurs et optimisation des avis", channel: "ASO & Support" },
      { day: "Jour 7", task: "Bilan des conversions et itération sur le Paywall", channel: "Monétisation" },
    ];

  const competitorAnalysis = raw.competitorAnalysis && Array.isArray(raw.competitorAnalysis.competitors) && raw.competitorAnalysis.competitors.length > 0
    ? {
        unfairAdvantageMoat: raw.competitorAnalysis.unfairAdvantageMoat || "Simplicité radicale et prise en main instantanée sans courbe d'apprentissage.",
        counterPositioningStrategy: raw.competitorAnalysis.counterPositioningStrategy || "Positionnement axé sur la transparence et l'efficacité directe.",
        targetMarketShareGoal: raw.competitorAnalysis.targetMarketShareGoal || "Capter les utilisateurs frustrés par la complexité des applications historiques.",
        competitors: raw.competitorAnalysis.competitors.map((c: any) => ({
          name: c.name || "Concurrent direct",
          category: c.category || "Application concurrente",
          theirWeakness: c.theirWeakness || "Interface complexe et abonnements onéreux.",
          ourAdvantage: c.ourAdvantage || "Accès plus rapide et expérience sans friction.",
          pricingComparison: c.pricingComparison || "Offre plus avantageuse ou modèle plus équitable.",
          poachingAngle: c.poachingAngle || "Découvrez une alternative plus moderne et intuitive.",
        })),
      }
    : undefined;

  const ugcScripts = Array.isArray(raw.ugcScripts) && raw.ugcScripts.length > 0
    ? raw.ugcScripts.map((sc: any, idx: number) => ({
        id: sc.id || `ugc-${idx + 1}`,
        title: sc.title || `Format Vidéo #${idx + 1}`,
        targetEmotion: sc.targetEmotion || "Curiosité & Frustration résolue",
        musicTrend: sc.musicTrend || "Beat Lo-Fi / Son viral tendance",
        creatorTip: sc.creatorTip || "Plan serré selfie face caméra avec bonne lumière naturelle.",
        scenes: Array.isArray(sc.scenes) ? sc.scenes.map((s: any) => ({
          timeframe: s.timeframe || "0-3s",
          phase: s.phase || "Hook",
          visualAction: s.visualAction || "Montrer le problème à l'écran",
          audioVoiceover: s.audioVoiceover || "Vous utilisez encore cette méthode dépassée ?",
          onScreenText: s.onScreenText || "Arrêtez de faire ça !",
        })) : [],
      }))
    : undefined;

  return {
    appOverview,
    targetPersonas,
    swotAndTrends,
    monetization,
    appStoreOptimization,
    socialMediaLaunch,
    advertisingAngles,
    prAndOutreach,
    actionPlan7Days,
    abTesting: raw.abTesting || undefined,
    competitorAnalysis,
    ugcScripts,
    okrPlan: raw.okrPlan || undefined,
  };
}

// Helper to get provider defaults
function getProviderDefaults(provider: string, model?: string, customEndpoint?: string) {
  switch (provider) {
    case "deepseek": {
      let ep = (customEndpoint?.trim() || "https://api.deepseek.com/chat/completions").replace(/\/+$/, "");
      if (!ep.endsWith("/chat/completions")) {
        ep = ep.endsWith("/v1") ? `${ep}/chat/completions` : `${ep}/chat/completions`;
      }
      return {
        endpoint: ep,
        defaultModel: model || "deepseek-flash",
        isTextOnly: true, // DeepSeek direct API does not accept image_url in messages
      };
    }
    case "mistral":
      return {
        endpoint: customEndpoint || "https://api.mistral.ai/v1/chat/completions",
        defaultModel: model || "mistral-small-4",
        isTextOnly: false,
      };
    case "groq":
      return {
        endpoint: customEndpoint || "https://api.groq.com/openai/v1/chat/completions",
        defaultModel: model || "meta-llama/llama-4-scout-17b-16e-instruct",
        isTextOnly: false,
      };
    case "openrouter":
      return {
        endpoint: customEndpoint || "https://openrouter.ai/api/v1/chat/completions",
        defaultModel: model || "google/gemini-3.8-flash",
        isTextOnly: false,
      };
    case "perplexity":
      return {
        endpoint: customEndpoint || "https://api.perplexity.ai/chat/completions",
        defaultModel: model || "sonar-pro",
        isTextOnly: true,
      };
    case "openai":
      return {
        endpoint: customEndpoint || "https://api.openai.com/v1/chat/completions",
        defaultModel: model || "gpt-5.5",
        isTextOnly: false,
      };
    case "custom":
    default:
      return {
        endpoint: customEndpoint || "https://api.openai.com/v1/chat/completions",
        defaultModel: model || "gpt-5.5",
        isTextOnly: false,
      };
  }
}

// Helper: Call standard API-compatible endpoint
async function callStandardApi(params: {
  apiKey: string;
  provider?: string;
  endpoint?: string;
  model?: string;
  systemPrompt: string;
  userPrompt: string;
  images: { data: string; mimeType?: string }[];
  jsonMode?: boolean;
}): Promise<string> {
  const provider = params.provider || "openai";
  const defaults = getProviderDefaults(provider, params.model, params.endpoint);
  const url = defaults.endpoint;
  const model = params.model || defaults.defaultModel;
  const cleanKey = sanitizeApiKey(params.apiKey);

  if (!cleanKey) {
    throw new Error(`Clé API manquante ou invalide pour le fournisseur ${provider.toUpperCase()}. Assurez-vous d'avoir saisi votre clé.`);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cleanKey}`,
  };

  if (provider === "openrouter" || url.includes("openrouter.ai")) {
    headers["HTTP-Referer"] = "https://github.com/shinzarou-eng/aurea";
    headers["X-Title"] = "Aurea";
  }

  const messages: any[] = [];
  const isDeepSeekReasoner = model.toLowerCase().includes("reasoner");

  // Models like deepseek-reasoner have strict guidelines on roles
  if (!isDeepSeekReasoner) {
    messages.push({ role: "system", content: params.systemPrompt });
  }

  if (defaults.isTextOnly || params.images.length === 0) {
    let textContent = params.userPrompt;
    if (params.images.length > 0) {
      textContent = `[Interface visuelle de l'application: ${params.images.length} capture(s) d'écran transmise(s) pour analyse]\n\n${params.userPrompt}`;
    }
    if (isDeepSeekReasoner) {
      textContent = `${params.systemPrompt}\n\n${textContent}`;
    }
    messages.push({ role: "user", content: textContent });
  } else {
    // Multimodal payload
    const userContent: any[] = [];
    for (const img of params.images) {
      let rawBase64 = img.data;
      let mimeType = img.mimeType || "image/jpeg";
      if (rawBase64.includes(";base64,")) {
        const split = rawBase64.split(";base64,");
        const mimeMatch = split[0].match(/:(.*?);/);
        if (mimeMatch) mimeType = mimeMatch[1];
        rawBase64 = split[1];
      }
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${rawBase64}`,
        },
      });
    }
    userContent.push({
      type: "text",
      text: params.userPrompt,
    });
    messages.push({ role: "user", content: userContent });
  }

  const body: any = {
    model,
    messages,
  };

  if (params.jsonMode && !isDeepSeekReasoner && provider !== "perplexity") {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur API ${provider.toUpperCase()} (${response.status}) : ${errorText}`);
  }

  const data = (await response.json()) as any;
  const answer = data.choices?.[0]?.message?.content;
  if (!answer) {
    throw new Error(`Aucune réponse reçue du fournisseur ${provider}.`);
  }
  return answer;
}

// Helper: Call Anthropic Claude API
async function callAnthropic(params: {
  apiKey: string;
  model?: string;
  systemPrompt: string;
  userPrompt: string;
  images: { data: string; mimeType?: string }[];
}): Promise<string> {
  const url = "https://api.anthropic.com/v1/messages";
  const model = params.model || "claude-sonnet-5";

  const content: any[] = [];
  for (const img of params.images) {
    let rawBase64 = img.data;
    let mimeType = img.mimeType || "image/jpeg";
    if (rawBase64.includes(";base64,")) {
      const split = rawBase64.split(";base64,");
      const mimeMatch = split[0].match(/:(.*?);/);
      if (mimeMatch) mimeType = mimeMatch[1];
      rawBase64 = split[1];
    }
    const mediaType = mimeType === "image/png" ? "image/png" : "image/jpeg";
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType,
        data: rawBase64,
      },
    });
  }
  content.push({
    type: "text",
    text: params.userPrompt + "\n\nIMPORTANT: Réponds UNIQUEMENT avec l'objet JSON valide demandé, sans aucun mot avant ou après.",
  });

  const cleanKey = sanitizeApiKey(params.apiKey);
  if (!cleanKey) {
    throw new Error("Clé API Anthropic manquante ou invalide.");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": cleanKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      system: params.systemPrompt,
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur API Claude (${response.status}) : ${errorText}`);
  }

  const data = (await response.json()) as any;
  const answer = data.content?.find((c: any) => c.type === "text")?.text;
  if (!answer) {
    throw new Error("Aucune réponse reçue de l'API Claude.");
  }
  return answer;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Test API Key endpoint
app.post("/api/engine/test-key", async (req, res) => {
  try {
    const { provider = "gemini", apiKey, model, customEndpoint } = req.body;

    if (provider === "gemini") {
      const keyToUse = sanitizeApiKey(apiKey) || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
      if (!keyToUse) {
        return res.status(400).json({ error: "Aucune clé Google fournie ni configurée sur le serveur." });
      }
      const client = new GoogleGenaiClient({ apiKey: keyToUse });
      const resp = await client.models.generateContent({
        model: model || "gemini-3.8-flash",
        contents: "Réponds simplement par: OK",
      });
      return res.json({ success: true, message: `Connexion Google réussie (${model || "gemini-3.8-flash"}) !` });
    }

    if (provider === "anthropic") {
      const keyToUse = sanitizeApiKey(apiKey) || process.env.ANTHROPIC_API_KEY;
      if (!keyToUse) {
        return res.status(400).json({ error: "Aucune clé Anthropic fournie." });
      }
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": keyToUse,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: model || "claude-sonnet-5",
          max_tokens: 15,
          messages: [{ role: "user", content: "Réponds simplement par: OK" }],
        }),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        return res.status(400).json({ error: `Erreur Anthropic (${resp.status}): ${txt}` });
      }
      return res.json({ success: true, message: `Connexion Anthropic Claude validée avec succès !` });
    }

    // All standard API-compatible providers: deepseek, mistral, groq, openrouter, perplexity, openai, custom
    const defaults = getProviderDefaults(provider, model, customEndpoint);
    const rawKey = apiKey || (provider === "openai" ? process.env.OPENAI_API_KEY : "");
    const keyToUse = sanitizeApiKey(rawKey);
    if (!keyToUse) {
      return res.status(400).json({ 
        error: `Clé API manquante ou invalide pour le fournisseur ${provider.toUpperCase()}. Assurez-vous d'avoir saisi ou collé votre clé.` 
      });
    }

    const testHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${keyToUse}`,
    };
    if (provider === "openrouter" || defaults.endpoint.includes("openrouter.ai")) {
      testHeaders["HTTP-Referer"] = "https://github.com/shinzarou-eng/aurea";
      testHeaders["X-Title"] = "Aurea";
    }

    const isReasoner = (model || defaults.defaultModel).toLowerCase().includes("reasoner");

    const testResp = await fetch(defaults.endpoint, {
      method: "POST",
      headers: testHeaders,
      body: JSON.stringify({
        model: model || defaults.defaultModel,
        messages: [{ role: "user", content: "Réponds simplement par le mot: OK" }],
        max_tokens: isReasoner ? 250 : 25,
      }),
    });

    if (!testResp.ok) {
      const txt = await testResp.text();
      let readableError = txt;
      try {
        const parsed = JSON.parse(txt);
        readableError = parsed.error?.message || parsed.message || txt;
      } catch {}

      if (readableError.toLowerCase().includes("insufficient balance") || readableError.toLowerCase().includes("insufficient_balance")) {
        readableError = `Solde insuffisant sur votre compte ${provider.toUpperCase()}. Veuillez ajouter des crédits sur votre console ${provider.toUpperCase()}.`;
      } else if (readableError.toLowerCase().includes("invalid_api_key") || readableError.toLowerCase().includes("authentication fails") || readableError.toLowerCase().includes("unauthorized")) {
        readableError = `Clé API non reconnue par ${provider.toUpperCase()}. Vérifiez que vous avez copié la clé exacte sans omission.`;
      }

      return res.status(400).json({ error: `Erreur ${provider.toUpperCase()} (${testResp.status}): ${readableError}` });
    }

    return res.json({ 
      success: true, 
      message: `Connexion ${provider.toUpperCase()} validée avec succès (${model || defaults.defaultModel}) !` 
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Échec de connexion." });
  }
});

// API: Generate Complete Marketing Session from Screenshots
app.post("/api/marketing/analyze", async (req, res) => {
  try {
    const { 
      images, 
      appName, 
      targetAudience, 
      language = "fr", 
      tone = "dynamique", 
      pricingModel,
      engineConfig 
    } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Au moins une capture d'écran ou photo de l'application est requise." });
    }

    const userPrompt = `
Tu es un Directeur Marketing & Expert en Growth Hacking d'applications mobiles et web de renommée mondiale.
Analyse en profondeur les captures d'écran fournies de cette application et génère une SESSION MARKETING COMPLÈTE ET ULTRA PROFESSIONNELLE.
Inclus impérativement une ANALYSE SWOT APPROFONDIE (Forces, Faiblesses, Opportunités, Menaces), une veille des GRANDES TENDANCES DU MARCHÉ, ainsi qu'une STRATÉGIE DE MONÉTISATION & COPYWRITING DU PAYWALL complète (grille tarifaire, découpage gratuit/payant déduit des écrans, textes de conversion et déclencheurs psychologiques).

Informations complémentaires fournies par l'utilisateur :
- Nom indiqué de l'application : ${appName || "Non spécifié (à déduire des captures)"}
- Cible / Audience visée : ${targetAudience || "À déterminer d'après les visuels de l'app"}
- Tonalité souhaitée : ${tone || "Inspirante et percutante"}
- Modèle économique : ${pricingModel || "Freemium / Abonnement"}
- Langue demandée pour le contenu : ${language === "en" ? "Anglais" : "Français"}

Fournis un objet JSON rigoureusement structuré respectant fidèlement le schéma ci-dessous.
Sois précis, concret, moderne, sans jargon creux, et propose des copies immédiatement prêtes à être publiées ou intégrées sur les stores et les réseaux sociaux.
`;

    let rawJson = "";
    const provider = engineConfig?.provider || "gemini";

    if (provider === "gemini") {
      // Default: Google
      const client = getGoogleClient(engineConfig?.apiKey);
      const model = engineConfig?.model || "gemini-3.8-flash";

      // Prepare multimodal parts from images
      const imageParts = images.map((img: { data: string; mimeType?: string }) => {
        let rawBase64 = img.data;
        let mimeType = img.mimeType || "image/jpeg";
        if (rawBase64.includes(";base64,")) {
          const split = rawBase64.split(";base64,");
          const mimeMatch = split[0].match(/:(.*?);/);
          if (mimeMatch) mimeType = mimeMatch[1];
          rawBase64 = split[1];
        }
        return {
          inlineData: {
            mimeType,
            data: rawBase64,
          },
        };
      });

      const response = await client.models.generateContent({
        model,
        contents: {
          parts: [
            ...imageParts,
            { text: userPrompt },
          ],
        },
        config: {
        systemInstruction: "Tu es un stratège marketing mobile et SaaS d'élite. Tu analyses les interfaces graphiques, l'ergonomie, les fonctionnalités clés et tu conçois des plans marketing tactiques et opérationnels prêts à l'emploi. Réponds toujours en JSON strict.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            appOverview: {
              type: Type.OBJECT,
              properties: {
                detectedName: { type: Type.STRING, description: "Nom détecté ou optimisé de l'app" },
                catchphrase: { type: Type.STRING, description: "Slogan mémorable en une phrase percutante" },
                uniqueValueProposition: { type: Type.STRING, description: "Proposition de valeur unique (UVP)" },
                category: { type: Type.STRING, description: "Catégorie principale de l'app (ex: Productivité, Santé, Fintech)" },
                primaryFeaturesDetected: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Liste des 3 à 5 fonctionnalités majeures détectées directement sur les écrans"
                },
                colorPalette: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Codes couleurs hexadécimaux dominants perçus (3 à 5 couleurs ex: #10B981)"
                },
                brandVoice: { type: Type.STRING, description: "Description du ton de marque recommandé" },
              },
              required: ["detectedName", "catchphrase", "uniqueValueProposition", "category", "primaryFeaturesDetected", "colorPalette", "brandVoice"],
            },
            targetPersonas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  personaName: { type: Type.STRING, description: "Nom ou type de profil" },
                  corePainPoint: { type: Type.STRING, description: "Frustration ou problème majeur rencontré" },
                  triggerMoment: { type: Type.STRING, description: "Déclencheur d'adoption immédiate" },
                  keyBenefitExpected: { type: Type.STRING, description: "Bénéfice clé recherché" },
                },
                required: ["personaName", "corePainPoint", "triggerMoment", "keyBenefitExpected"],
              },
            },
            swotAndTrends: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                marketTrends: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      trendName: { type: Type.STRING },
                      impactScore: { type: Type.STRING },
                      description: { type: Type.STRING },
                      actionableAdvice: { type: Type.STRING },
                    },
                    required: ["trendName", "impactScore", "description", "actionableAdvice"],
                  },
                },
                strategicSummary: { type: Type.STRING },
              },
              required: ["strengths", "weaknesses", "opportunities", "threats", "marketTrends", "strategicSummary"],
            },
            monetization: {
              type: Type.OBJECT,
              properties: {
                recommendedModel: { type: Type.STRING },
                freeTierFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
                premiumTierFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
                pricingTiers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      price: { type: Type.STRING },
                      badge: { type: Type.STRING },
                      trialDays: { type: Type.STRING },
                    },
                    required: ["name", "price"],
                  },
                },
                paywallCopy: {
                  type: Type.OBJECT,
                  properties: {
                    headline: { type: Type.STRING },
                    subheadline: { type: Type.STRING },
                    bulletBenefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                    ctaButtonText: { type: Type.STRING },
                    reassuranceText: { type: Type.STRING },
                  },
                  required: ["headline", "subheadline", "bulletBenefits", "ctaButtonText", "reassuranceText"],
                },
                paywallTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["recommendedModel", "freeTierFeatures", "premiumTierFeatures", "pricingTiers", "paywallCopy", "paywallTriggers"],
            },
            appStoreOptimization: {
              type: Type.OBJECT,
              properties: {
                storeTitle: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                shortDescription: { type: Type.STRING },
                fullDescription: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                screenshotCaptions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      screenNumber: { type: Type.INTEGER },
                      headline: { type: Type.STRING },
                      subtext: { type: Type.STRING },
                    },
                    required: ["screenNumber", "headline", "subtext"],
                  },
                },
              },
              required: ["storeTitle", "subtitle", "shortDescription", "fullDescription", "keywords", "screenshotCaptions"],
            },
            socialMediaLaunch: {
              type: Type.OBJECT,
              properties: {
                twitterThread: { type: Type.ARRAY, items: { type: Type.STRING } },
                linkedinPost: { type: Type.STRING },
                tiktokReelsHooks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      hookVisual: { type: Type.STRING },
                      hookAudio: { type: Type.STRING },
                      concept: { type: Type.STRING },
                    },
                    required: ["hookVisual", "hookAudio", "concept"],
                  },
                },
                productHuntKit: {
                  type: Type.OBJECT,
                  properties: {
                    tagline: { type: Type.STRING },
                    makerComment: { type: Type.STRING },
                  },
                  required: ["tagline", "makerComment"],
                },
              },
              required: ["twitterThread", "linkedinPost", "tiktokReelsHooks", "productHuntKit"],
            },
            advertisingAngles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  angleName: { type: Type.STRING },
                  hookText: { type: Type.STRING },
                  bodyCopy: { type: Type.STRING },
                  ctaButton: { type: Type.STRING },
                  recommendedVisualConcept: { type: Type.STRING },
                },
                required: ["angleName", "hookText", "bodyCopy", "ctaButton", "recommendedVisualConcept"],
              },
            },
            prAndOutreach: {
              type: Type.OBJECT,
              properties: {
                elevatorPitch30s: { type: Type.STRING },
                pressReleaseEmail: { type: Type.STRING },
                influencerDm: { type: Type.STRING },
              },
              required: ["elevatorPitch30s", "pressReleaseEmail", "influencerDm"],
            },
            actionPlan7Days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  task: { type: Type.STRING },
                  channel: { type: Type.STRING },
                },
                required: ["day", "task", "channel"],
              },
            },
          },
          required: [
            "appOverview",
            "targetPersonas",
            "swotAndTrends",
            "monetization",
            "appStoreOptimization",
            "socialMediaLaunch",
            "advertisingAngles",
            "prAndOutreach",
            "actionPlan7Days",
          ],
        },
      },
      });

      rawJson = response.text || "";
    } else if (provider === "anthropic") {
      const apiKey = engineConfig?.apiKey?.trim() || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Clé API Anthropic requise pour utiliser ce modèle." });
      }
      rawJson = await callAnthropic({
        apiKey,
        model: engineConfig?.model || "claude-sonnet-5",
        systemPrompt: "Tu es un stratège marketing mobile et SaaS d'élite. Tu analyses les interfaces graphiques et conçois des plans marketing tactiques.",
        userPrompt: userPrompt + "\n\nRenvoie un JSON complet contenant toutes les clés : appOverview, targetPersonas, swotAndTrends, monetization, appStoreOptimization, socialMediaLaunch, advertisingAngles, prAndOutreach, actionPlan7Days.",
        images,
      });
    } else {
      // deepseek, mistral, groq, openrouter, perplexity, openai, custom
      const apiKey = engineConfig?.apiKey?.trim() || (provider === "openai" ? process.env.OPENAI_API_KEY : "");
      if (!apiKey) {
        return res.status(400).json({ error: `Clé API requise pour utiliser ${provider.toUpperCase()}. Rendez-vous dans les réglages pour la renseigner.` });
      }
      rawJson = await callStandardApi({
        apiKey,
        provider,
        endpoint: engineConfig?.customEndpoint?.trim(),
        model: engineConfig?.model,
        systemPrompt: "Tu es un stratège marketing mobile et SaaS d'élite. Tu analyses les interfaces graphiques et conçois des plans marketing tactiques. Réponds exclusivement avec un JSON valide respectant les spécifications demandées.",
        userPrompt: userPrompt + "\n\nRenvoie un JSON complet contenant toutes les clés : appOverview, targetPersonas, swotAndTrends, monetization, appStoreOptimization, socialMediaLaunch, advertisingAngles, prAndOutreach, actionPlan7Days.",
        images,
        jsonMode: true,
      });
    }

    if (!rawJson) {
      return res.status(500).json({ error: "Aucune réponse produite par le moteur." });
    }

    const parsedJson = cleanAndParseJson(rawJson);
    const marketingSession = normalizeMarketingSession(parsedJson, appName);
    return res.json({ success: true, session: marketingSession });
  } catch (error: any) {
    console.error("Erreur lors de l'analyse marketing :", error);
    return res.status(500).json({
      error: error.message || "Une erreur est survenue lors de la création de la session marketing."
    });
  }
});

// API: Generate A/B Testing & CRO Variants
app.post("/api/marketing/generate-ab-tests", async (req, res) => {
  try {
    const { sessionContext, focusAngle = "cvr", engineConfig } = req.body;
    const appName = sessionContext?.appOverview?.detectedName || "Application";
    const category = sessionContext?.appOverview?.category || "Productivité";
    const uvp = sessionContext?.appOverview?.uniqueValueProposition || "";
    const primaryColors = sessionContext?.appOverview?.colorPalette?.join(", ") || "#10B981";

    const prompt = `
Tu es un expert mondial en ASO (App Store Optimization) et en CRO (Conversion Rate Optimization) d'applications mobiles.
Génère une stratégie et un jeu complet d'expérimentations de tests A/B scientifiques pour maximiser le taux de conversion (téléchargements et installations) de l'application suivante :

Contexte de l'application :
- Nom : ${appName}
- Catégorie : ${category}
- Proposition de Valeur Unique : ${uvp}
- Palette de couleurs : ${primaryColors}
- Titre Store actuel : ${sessionContext?.appStoreOptimization?.appleTitle || appName}
- Sous-titre Store actuel : ${sessionContext?.appStoreOptimization?.appleSubtitle || ""}
- Description courte actuelle : ${sessionContext?.appStoreOptimization?.googleShortDesc || ""}
- Objectif prioritaire : ${
  focusAngle === "viral" ? "Viralité & Audience Jeune (FOMO)" :
  focusAngle === "premium" ? "Positionnement Premium & Haut de Gamme" :
  focusAngle === "enterprise" ? "B2B & Crédibilité Entreprise" :
  focusAngle === "urgency" ? "Aversion à la perte & Urgence" :
  "Maximisation du Taux de Conversion Pur (CVR)"
}

Renvoie un JSON strictement valide respectant la structure suivante :
{
  "testName": "Protocole de test ASO / CRO",
  "objective": "Objectif précis du test",
  "recommendedPlatform": "Apple Product Page Optimization (PPO)",
  "sampleSizeRecommendation": "2 500 impressions minimum par variante",
  "estimatedDuration": "10 à 14 jours",
  "keyMetric": "Taux de Conversion (CVR) : Visites -> Installations",
  "titleVariants": [
    {
      "id": "title-1",
      "name": "Variante A - Nom court",
      "appleTitle": "Titre iOS (max 30 car)",
      "appleSubtitle": "Sous-titre iOS (max 30 car)",
      "googleTitle": "Titre Google (max 30 car)",
      "hypothesis": "Hypothèse de conversion",
      "psychologicalTrigger": "Levier psychologique",
      "expectedImpact": "+15% CVR",
      "iceScore": { "impact": 8, "confidence": 8, "ease": 9 }
    }
  ],
  "iconVariants": [
    {
      "id": "icon-1",
      "name": "Concept 1 - Nom",
      "styleTheme": "Style (ex: Minimaliste & Contraste, 3D Vibrant)",
      "backgroundGradient": "from-slate-900 via-slate-800 to-black",
      "accentColor": "#10B981",
      "iconSymbol": "Sparkles",
      "conceptDescription": "Description visuelle de l'icône",
      "rationale": "Pourquoi cela convertit sur le store",
      "bestForAudience": "Audience cible",
      "visualPreview": {
        "bgColor": "#0f172a",
        "iconColor": "#10B981",
        "shape": "rounded-squircle",
        "badgeText": "PRO"
      }
    }
  ],
  "descriptionVariants": [
    {
      "id": "desc-1",
      "name": "Approche 1 - Nom",
      "hookHeadline": "Première phrase visible sans cliquer (max 100 car)",
      "shortDescriptionGoogle": "Description courte Google (max 80 car)",
      "bulletPoints": ["Puce 1", "Puce 2", "Puce 3"],
      "ctaClosing": "Appel à l'action final",
      "hypothesis": "Pourquoi cette formulation convertit",
      "conversionFocus": "Angle marketing"
    }
  ],
  "testingTips": [
    "Conseil 1",
    "Conseil 2",
    "Conseil 3",
    "Conseil 4"
  ]
}

Fournis 3 à 4 variantes de titres, 3 à 4 concepts d'icônes, et 3 variantes de descriptions.
`;

    const provider = engineConfig?.provider || "gemini";
    let rawJson = "";

    if (provider === "gemini") {
      const client = getGoogleClient(engineConfig?.apiKey);
      const model = engineConfig?.model || "gemini-3.8-flash";
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      rawJson = response.text || "";
    } else if (provider === "anthropic") {
      const apiKey = engineConfig?.apiKey?.trim() || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Clé API Anthropic requise." });
      }
      rawJson = await callAnthropic({
        apiKey,
        model: engineConfig?.model || "claude-sonnet-5",
        systemPrompt: "Tu es un expert mondial en ASO et CRO. Réponds exclusivement avec un JSON valide.",
        userPrompt: prompt,
        images: [],
      });
    } else {
      const apiKey = engineConfig?.apiKey?.trim() || (provider === "openai" ? process.env.OPENAI_API_KEY : "");
      if (!apiKey) {
        return res.status(400).json({ error: `Clé API ${provider.toUpperCase()} requise.` });
      }
      rawJson = await callStandardApi({
        apiKey,
        provider,
        endpoint: engineConfig?.customEndpoint?.trim(),
        model: engineConfig?.model,
        systemPrompt: "Tu es un expert mondial en ASO et CRO. Réponds exclusivement avec un JSON valide sans markdown.",
        userPrompt: prompt,
        images: [],
        jsonMode: true,
      });
    }

    const rawParsed = cleanAndParseJson(rawJson) || {};
    const abTesting = {
      testName: rawParsed.testName || "Protocole de test ASO / CRO",
      objective: rawParsed.objective || "Maximiser le taux de conversion",
      recommendedPlatform: rawParsed.recommendedPlatform || "Apple Product Page Optimization (PPO)",
      sampleSizeRecommendation: rawParsed.sampleSizeRecommendation || "2 500 impressions",
      estimatedDuration: rawParsed.estimatedDuration || "10 à 14 jours",
      keyMetric: rawParsed.keyMetric || "Taux de Conversion (CVR)",
      titleVariants: Array.isArray(rawParsed.titleVariants) ? rawParsed.titleVariants : [],
      iconVariants: Array.isArray(rawParsed.iconVariants) ? rawParsed.iconVariants : [],
      descriptionVariants: Array.isArray(rawParsed.descriptionVariants) ? rawParsed.descriptionVariants : [],
      testingTips: Array.isArray(rawParsed.testingTips) ? rawParsed.testingTips : [],
    };
    return res.json({ success: true, abTesting });
  } catch (err: any) {
    console.error("Erreur lors de la production des tests A/B :", err);
    return res.status(500).json({ error: err.message || "Erreur de production des tests A/B." });
  }
});

// API: Generate deep competitor analysis & strategic poaching angles
app.post("/api/marketing/generate-competitors", async (req, res) => {
  try {
    const { sessionContext, engineConfig } = req.body;
    const ov = sessionContext?.appOverview || {};
    const category = ov.category || "Productivité";
    const appName = ov.detectedName || "Notre Application";
    const usp = ov.uniqueValueProposition || "Solution mobile moderne et intuitive.";

    const prompt = `
Tu es un stratège marketing mobile d'élite spécialisé dans le contre-positionnement et l'acquisition offensive.
Analyse les concurrents de cette application :
- Nom : ${appName}
- Catégorie : ${category}
- Proposition de valeur unique : ${usp}

Génère une analyse concurrentielle chirurgicale au format JSON strict avec exactement cette structure :
{
  "unfairAdvantageMoat": "Explication claire du fossé défensif (Moat) de notre application",
  "counterPositioningStrategy": "Positionnement tactique face aux leaders historiques",
  "targetMarketShareGoal": "Cible précise d'utilisateurs insatisfaits à capturer",
  "competitors": [
    {
      "name": "Nom du concurrent leader 1",
      "category": "Catégorie",
      "theirWeakness": "Leur point de friction majeur ou ce qui agace leurs utilisateurs",
      "ourAdvantage": "Pourquoi notre application est supérieure",
      "pricingComparison": "Comparaison du tarif ou du modèle économique",
      "poachingAngle": "Accroche publicitaire directe pour attirer leurs utilisateurs mécontents"
    },
    {
      "name": "Nom du concurrent challenger 2",
      "category": "Catégorie",
      "theirWeakness": "Leur point de friction",
      "ourAdvantage": "Pourquoi notre application est supérieure",
      "pricingComparison": "Comparatif tarifaire",
      "poachingAngle": "Accroche pour braconner leurs utilisateurs"
    },
    {
      "name": "Nom du concurrent 3",
      "category": "Catégorie",
      "theirWeakness": "Leur point de friction",
      "ourAdvantage": "Pourquoi notre application est supérieure",
      "pricingComparison": "Comparatif tarifaire",
      "poachingAngle": "Accroche pour braconner leurs utilisateurs"
    }
  ]
}
`;

    const provider = engineConfig?.provider || "gemini";
    let rawText = "";

    if (provider === "anthropic") {
      const apiKey = engineConfig?.apiKey?.trim() || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return res.status(400).json({ error: "Clé Anthropic requise." });
      rawText = await callAnthropic({
        apiKey,
        model: engineConfig?.model || "claude-sonnet-5",
        systemPrompt: "Tu es un stratège marketing mobile d'élite. Réponds UNIQUEMENT en JSON valide.",
        userPrompt: prompt,
        images: [],
      });
    } else if (provider === "gemini") {
      const client = getGoogleClient(engineConfig?.apiKey);
      const model = engineConfig?.model || "gemini-3.8-flash";
      const resp = await client.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      rawText = resp.text || "{}";
    } else {
      const apiKey = engineConfig?.apiKey?.trim() || (provider === "openai" ? process.env.OPENAI_API_KEY : "");
      rawText = await callStandardApi({
        apiKey: apiKey || "dummy",
        provider,
        endpoint: engineConfig?.customEndpoint?.trim(),
        model: engineConfig?.model,
        systemPrompt: "Tu es un stratège marketing mobile d'élite. Réponds UNIQUEMENT en JSON valide.",
        userPrompt: prompt,
        images: [],
        jsonMode: true,
      });
    }

    const parsed = cleanAndParseJson(rawText) || {};
    return res.json({ success: true, competitorAnalysis: parsed });
  } catch (err: any) {
    console.error("Erreur d'analyse concurrentielle :", err);
    return res.status(500).json({ error: err.message || "Erreur d'analyse concurrentielle." });
  }
});

// API: Localize App Store / Google Play Optimization for global markets
app.post("/api/marketing/localize-aso", async (req, res) => {
  try {
    const { aso, targetLanguage = "en", engineConfig } = req.body;
    const langNames: Record<string, string> = {
      en: "Anglais (US)",
      es: "Espagnol",
      de: "Allemand",
      ja: "Japonais",
      fr: "Français",
    };
    const targetLangName = langNames[targetLanguage] || "Anglais (US)";

    const prompt = `
Tu es un expert mondial en ASO (App Store Optimization).
Traduis et adapte culturellement cette fiche d'application pour le marché cible : ${targetLangName}.

Fiche source :
- Titre : ${aso?.storeTitle || ""}
- Sous-titre : ${aso?.subtitle || ""}
- Description courte : ${aso?.shortDescription || ""}
- Mots-clés : ${(aso?.keywords || []).join(", ")}

Respecte impérativement les limites de caractères :
- storeTitle: max 30 caractères
- subtitle: max 30 caractères
- shortDescription: max 80 caractères
- keywords: 5 à 7 mots-clés optimisés pour les recherches natives dans cette langue

Réponds UNIQUEMENT en JSON strict au format :
{
  "storeTitle": "...",
  "subtitle": "...",
  "shortDescription": "...",
  "keywords": ["...", "..."]
}
`;

    const provider = engineConfig?.provider || "gemini";
    let rawText = "";

    if (provider === "anthropic") {
      const apiKey = engineConfig?.apiKey?.trim() || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return res.status(400).json({ error: "Clé Anthropic requise." });
      rawText = await callAnthropic({
        apiKey,
        model: engineConfig?.model || "claude-sonnet-5",
        systemPrompt: "Expert ASO international. Réponds UNIQUEMENT en JSON.",
        userPrompt: prompt,
        images: [],
      });
    } else if (provider === "gemini") {
      const client = getGoogleClient(engineConfig?.apiKey);
      const model = engineConfig?.model || "gemini-3.8-flash";
      const resp = await client.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      rawText = resp.text || "{}";
    } else {
      const apiKey = engineConfig?.apiKey?.trim() || (provider === "openai" ? process.env.OPENAI_API_KEY : "");
      rawText = await callStandardApi({
        apiKey: apiKey || "dummy",
        provider,
        endpoint: engineConfig?.customEndpoint?.trim(),
        model: engineConfig?.model,
        systemPrompt: "Expert ASO international. Réponds UNIQUEMENT en JSON.",
        userPrompt: prompt,
        images: [],
        jsonMode: true,
      });
    }

    const parsed = cleanAndParseJson(rawText) || {};
    return res.json({ success: true, localized: parsed });
  } catch (err: any) {
    console.error("Erreur localisation ASO :", err);
    return res.status(500).json({ error: err.message || "Erreur de localisation ASO." });
  }
});

// API: Refine a specific section or ask a marketing question
app.post("/api/marketing/refine", async (req, res) => {
  try {
    const { sectionKey, currentContent, userInstructions, language = "fr", engineConfig } = req.body;

    if (!userInstructions) {
      return res.status(400).json({ error: "Instructions manquantes." });
    }

    const prompt = `
Tu es un Directeur Marketing d'élite.
L'utilisateur souhaite ajuster ou améliorer une partie spécifique de sa session marketing.

Section concernée : ${sectionKey || "Générale"}
Contenu actuel :
${typeof currentContent === "object" ? JSON.stringify(currentContent, null, 2) : currentContent}

Demande d'ajustement de l'utilisateur :
"${userInstructions}"

Langue souhaitée : ${language === "en" ? "Anglais" : "Français"}

Donne une version révisée, ultra qualitative et percutante, prête à l'emploi. Réponds directement avec le texte ou le format adapté, en expliquant brièvement les améliorations apportées.
`;

    const provider = engineConfig?.provider || "gemini";

    if (provider === "anthropic") {
      const apiKey = engineConfig?.apiKey?.trim() || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Clé API Anthropic requise." });
      }
      const revisedContent = await callAnthropic({
        apiKey,
        model: engineConfig?.model || "claude-sonnet-5",
        systemPrompt: "Tu es un Directeur Marketing d'élite. Réponds directement avec la version révisée.",
        userPrompt: prompt,
        images: [],
      });
      return res.json({ success: true, revisedContent });
    } else if (provider === "gemini") {
      const client = getGoogleClient(engineConfig?.apiKey);
      const model = engineConfig?.model || "gemini-3.8-flash";
      const response = await client.models.generateContent({
        model,
        contents: prompt,
      });
      return res.json({ success: true, revisedContent: response.text });
    } else {
      // deepseek, mistral, groq, openrouter, perplexity, openai, custom
      const apiKey = engineConfig?.apiKey?.trim() || (provider === "openai" ? process.env.OPENAI_API_KEY : "");
      if (!apiKey) {
        return res.status(400).json({ error: `Clé API ${provider.toUpperCase()} requise pour la révision.` });
      }
      const revisedContent = await callStandardApi({
        apiKey,
        provider,
        endpoint: engineConfig?.customEndpoint?.trim(),
        model: engineConfig?.model,
        systemPrompt: "Tu es un Directeur Marketing d'élite. Réponds directement avec la version révisée.",
        userPrompt: prompt,
        images: [],
        jsonMode: false,
      });
      return res.json({ success: true, revisedContent });
    }
  } catch (error: any) {
    console.error("Erreur lors de la révision :", error);
    return res.status(500).json({
      error: error.message || "Erreur lors de la révision du contenu."
    });
  }
});

// API: Audit a project folder (code + UX + competitors + launch readiness)
app.post("/api/marketing/audit-project", async (req, res) => {
  try {
    const { files, appName, language = "fr", engineConfig } = req.body;

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "Aucun fichier de projet fourni." });
    }

    const budget = 120_000;
    let used = 0;
    const importantNames = ["package.json", "README.md", "vite.config.ts", "tsconfig.json", "index.html"];
    const sorted = [...files].sort((a, b) => {
      const aImportant = importantNames.includes(a.name.toLowerCase()) ? 1 : 0;
      const bImportant = importantNames.includes(b.name.toLowerCase()) ? 1 : 0;
      return bImportant - aImportant;
    });

    const fileParts: string[] = [];
    const treePaths: string[] = [];

    for (const f of sorted) {
      treePaths.push(`${f.path} (${f.isText ? f.size + " bytes" : "binaire"})`);
      if (f.isText && typeof f.content === "string" && f.content.length > 0) {
        const remaining = budget - used;
        if (remaining <= 0) break;
        const content = f.content.slice(0, Math.min(f.content.length, remaining));
        used += content.length;
        fileParts.push(`--- FICHIER: ${f.path} ---\n${content}\n--- FIN ---`);
      }
    }

    const projectContext = `Arborescence du projet (${files.length} fichiers) :\n${treePaths.join("\n")}\n\n${fileParts.join("\n\n")}`;

    const commonRules = language === "en"
      ? "Be ruthless but constructive. Prioritize by impact/effort. For each competitor, explain how the project can beat them. Use concrete, actionable language. Never be vague."
      : "Sois exigeant mais constructif. Privilégie les priorités par impact/effort. Pour chaque concurrent, explique comment le projet peut le battre. Utilise un langage concret et actionnable. Évite les généralités.";

    const prompt = language === "en"
      ? `You are an elite CTO, Head of Product, Growth Marketer and UX strategist. Analyze the project files below and produce a deep, actionable audit that would make this product better than its competitors.\n\n${projectContext}\n\n${commonRules}\n\nReturn a rigorous JSON object with exactly this structure:\n{\n  "appName": "detected app name or 'Unknown'",\n  "elevatorPitch": "one-sentence value proposition",\n  "detectedTechStack": ["tech1", "tech2"],\n  "architectureSummary": "concise summary of architecture and key dependencies",\n  "strengths": ["specific strength 1", "..."],\n  "weaknesses": ["specific weakness 1", "..."],\n  "opportunities": ["concrete opportunity 1", "..."],\n  "threats": ["threat 1", "..."],\n  "uxReview": { "score": 0-100, "summary": "...", "quickWins": ["..."], "criticalIssues": ["..."] },\n  "codeQuality": { "score": 0-100, "summary": "...", "quickWins": ["..."], "criticalIssues": ["..."] },\n  "securityReview": { "score": 0-100, "summary": "...", "quickWins": ["..."], "criticalIssues": ["..."] },\n  "performanceReview": { "score": 0-100, "summary": "...", "quickWins": ["..."], "criticalIssues": ["..."] },\n  "marketFit": { "score": 0-100, "summary": "...", "targetAudience": ["..."], "bestChannels": ["..."] },\n  "competitorPositioning": {\n    "summary": "...",\n    "differentiators": ["..."],\n    "risks": ["..."],\n    "competitors": [\n      {\n        "name": "Competitor name",\n        "strengths": ["..."],\n        "weaknesses": ["..."],\n        "howToBeat": "specific strategy"\n      }\n    ]\n  },\n  "launchReadiness": { "score": 0-100, "summary": "...", "todoBeforeLaunch": ["..."] },\n  "monetizationSuggestions": [\n    { "model": "Freemium / Subscription / Ads / ...", "description": "...", "estimatedImpact": "High/Medium/Low revenue potential" }\n  ],\n  "localizationOpportunities": [\n    { "language": "English / French / ...", "opportunity": "...", "priority": "High/Medium/Low" }\n  ],\n  "roadmap": [\n    { "phase": "Phase 1 - Foundation", "timeline": "Week 1-2", "actions": ["..."] }\n  ],\n  "testPlan": ["..."],\n  "suggestedNextSteps": ["..."]\n}`
      : `Tu es un CTO, Head of Product, Growth Hacker et stratège UX d'élite. Analyse les fichiers projet ci-dessous et produis un audit approfondi et actionnable pour rendre ce produit meilleur que ses concurrents.\n\n${projectContext}\n\n${commonRules}\n\nRéponds avec un objet JSON strict ayant exactement cette structure :\n{\n  "appName": "nom détecté ou 'Inconnu'",\n  "elevatorPitch": "accroche en une phrase",\n  "detectedTechStack": ["tech1", "tech2"],\n  "architectureSummary": "résumé concis de l'architecture et des dépendances clés",\n  "strengths": ["force spécifique 1", "..."],\n  "weaknesses": ["faiblesse spécifique 1", "..."],\n  "opportunities": ["opportunité concrète 1", "..."],\n  "threats": ["menace 1", "..."],\n  "uxReview": { "score": 0-100, "summary": "...", "quickWins": ["..."], "criticalIssues": ["..."] },\n  "codeQuality": { "score": 0-100, "summary": "...", "quickWins": ["..."], "criticalIssues": ["..."] },\n  "securityReview": { "score": 0-100, "summary": "...", "quickWins": ["..."], "criticalIssues": ["..."] },\n  "performanceReview": { "score": 0-100, "summary": "...", "quickWins": ["..."], "criticalIssues": ["..."] },\n  "marketFit": { "score": 0-100, "summary": "...", "targetAudience": ["..."], "bestChannels": ["..."] },\n  "competitorPositioning": {\n    "summary": "...",\n    "differentiators": ["..."],\n    "risks": ["..."],\n    "competitors": [\n      {\n        "name": "Nom du concurrent",\n        "strengths": ["..."],\n        "weaknesses": ["..."],\n        "howToBeat": "stratégie spécifique"\n      }\n    ]\n  },\n  "launchReadiness": { "score": 0-100, "summary": "...", "todoBeforeLaunch": ["..."] },\n  "monetizationSuggestions": [\n    { "model": "Freemium / Abonnement / Publicité / ...", "description": "...", "estimatedImpact": "Fort/Moyen/Faible potentiel de revenus" }\n  ],\n  "localizationOpportunities": [\n    { "language": "Anglais / Français / ...", "opportunity": "...", "priority": "Haute/Moyenne/Basse" }\n  ],\n  "roadmap": [\n    { "phase": "Phase 1 - Fondations", "timeline": "Semaine 1-2", "actions": ["..."] }\n  ],\n  "testPlan": ["..."],\n  "suggestedNextSteps": ["..."]\n}`;

    const provider = engineConfig?.provider || "gemini";
    let rawText = "";

    if (provider === "gemini") {
      const client = getGoogleClient(engineConfig?.apiKey);
      const model = engineConfig?.model || "gemini-3.8-flash";
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      rawText = response.text || "";
    } else if (provider === "anthropic") {
      const apiKey = engineConfig?.apiKey?.trim() || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Clé API Anthropic requise." });
      }
      rawText = await callAnthropic({
        apiKey,
        model: engineConfig?.model || "claude-sonnet-5",
        systemPrompt: "Tu es un CTO / Head of Product / Growth Marketing d'élite. Réponds uniquement en JSON strict.",
        userPrompt: prompt,
        images: [],
      });
    } else {
      const apiKey = engineConfig?.apiKey?.trim() || (provider === "openai" ? process.env.OPENAI_API_KEY : "");
      if (!apiKey) {
        return res.status(400).json({ error: `Clé API ${provider.toUpperCase()} requise.` });
      }
      rawText = await callStandardApi({
        apiKey,
        provider,
        endpoint: engineConfig?.customEndpoint?.trim(),
        model: engineConfig?.model,
        systemPrompt: "You are a CTO / Head of Product / Growth Marketing elite. Respond only with strict JSON.",
        userPrompt: prompt,
        images: [],
        jsonMode: true,
      });
    }

    const parsed = cleanAndParseJson(rawText);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Impossible de parser le JSON de l'audit.");
    }

    const audit = normalizeProjectAudit(parsed, appName || "Application");
    return res.json({ success: true, audit });
  } catch (err: any) {
    console.error("Erreur audit projet :", err);
    return res.status(500).json({ error: err.message || "Erreur lors de l'audit du projet." });
  }
});

// Normalize a project audit to guarantee all expected sections
function normalizeProjectAudit(raw: any, fallbackAppName: string): any {
  if (!raw || typeof raw !== "object") raw = {};

  const makeReview = (input: any): any => {
    const r = input || {};
    return {
      score: typeof r.score === "number" ? Math.max(0, Math.min(100, Math.round(r.score))) : 0,
      summary: r.summary || "",
      quickWins: Array.isArray(r.quickWins) ? r.quickWins : [],
      criticalIssues: Array.isArray(r.criticalIssues) ? r.criticalIssues : [],
    };
  };

  const competitorPositioning = raw.competitorPositioning || {};
  const competitors = Array.isArray(competitorPositioning.competitors)
    ? competitorPositioning.competitors.map((c: any) => ({
        name: c.name || "Concurrent",
        strengths: Array.isArray(c.strengths) ? c.strengths : [],
        weaknesses: Array.isArray(c.weaknesses) ? c.weaknesses : [],
        howToBeat: c.howToBeat || "",
      }))
    : [];

  return {
    appName: raw.appName || fallbackAppName,
    elevatorPitch: raw.elevatorPitch || "",
    detectedTechStack: Array.isArray(raw.detectedTechStack) ? raw.detectedTechStack : [],
    architectureSummary: raw.architectureSummary || "",
    strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
    weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses : [],
    opportunities: Array.isArray(raw.opportunities) ? raw.opportunities : [],
    threats: Array.isArray(raw.threats) ? raw.threats : [],
    uxReview: makeReview(raw.uxReview),
    codeQuality: makeReview(raw.codeQuality),
    securityReview: makeReview(raw.securityReview),
    performanceReview: makeReview(raw.performanceReview),
    marketFit: {
      score: typeof raw.marketFit?.score === "number" ? Math.max(0, Math.min(100, Math.round(raw.marketFit.score))) : 0,
      summary: raw.marketFit?.summary || "",
      targetAudience: Array.isArray(raw.marketFit?.targetAudience) ? raw.marketFit.targetAudience : [],
      bestChannels: Array.isArray(raw.marketFit?.bestChannels) ? raw.marketFit.bestChannels : [],
    },
    competitorPositioning: {
      summary: competitorPositioning.summary || "",
      differentiators: Array.isArray(competitorPositioning.differentiators) ? competitorPositioning.differentiators : [],
      risks: Array.isArray(competitorPositioning.risks) ? competitorPositioning.risks : [],
      competitors,
    },
    launchReadiness: {
      score: typeof raw.launchReadiness?.score === "number" ? Math.max(0, Math.min(100, Math.round(raw.launchReadiness.score))) : 0,
      summary: raw.launchReadiness?.summary || "",
      todoBeforeLaunch: Array.isArray(raw.launchReadiness?.todoBeforeLaunch) ? raw.launchReadiness.todoBeforeLaunch : [],
    },
    monetizationSuggestions: Array.isArray(raw.monetizationSuggestions)
      ? raw.monetizationSuggestions.map((m: any) => ({
          model: m.model || "",
          description: m.description || "",
          estimatedImpact: m.estimatedImpact || "",
        }))
      : [],
    localizationOpportunities: Array.isArray(raw.localizationOpportunities)
      ? raw.localizationOpportunities.map((l: any) => ({
          language: l.language || "",
          opportunity: l.opportunity || "",
          priority: l.priority || "",
        }))
      : [],
    roadmap: Array.isArray(raw.roadmap)
      ? raw.roadmap.map((p: any) => ({
          phase: p.phase || "",
          timeline: p.timeline || "",
          actions: Array.isArray(p.actions) ? p.actions : [],
        }))
      : [],
    testPlan: Array.isArray(raw.testPlan) ? raw.testPlan : [],
    suggestedNextSteps: Array.isArray(raw.suggestedNextSteps) ? raw.suggestedNextSteps : [],
  };
}

// Project testing sandbox helpers
function sanitizeProjectPath(tempDir: string, relativePath: string): string {
  const safe = path.normalize(relativePath).replace(/^(\\|\/)+/, "");
  if (safe.startsWith("..") || safe.includes(".." + path.sep) || safe.includes("/..")) {
    throw new Error("Chemin de fichier interdit détecté.");
  }
  const full = path.resolve(tempDir, safe);
  if (!full.startsWith(tempDir + path.sep) && full !== tempDir) {
    throw new Error("Tentative de sortie du dossier temporaire détectée.");
  }
  return full;
}

async function writeProjectFiles(tempDir: string, files: any[]) {
  for (const file of files) {
    if (!file.path) continue;
    const fullPath = sanitizeProjectPath(tempDir, file.path);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    if (file.isText && typeof file.content === "string") {
      await fs.writeFile(fullPath, file.content, "utf-8");
    } else if (file.isText) {
      await fs.writeFile(fullPath, "", "utf-8");
    } else {
      // Binary files are not transported with content, create placeholder
      await fs.writeFile(fullPath, Buffer.from([]));
    }
  }
}

function runNpmScript(script: string, cwd: string, timeoutMs: number): Promise<{ exitCode: number; stdout: string; stderr: string; duration: number }> {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const start = Date.now();
  return new Promise((resolve) => {
    const child = spawn(npmCmd, ["run", script], {
      cwd,
      env: { ...process.env, CI: "true", NODE_ENV: "development" },
      shell: true,
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout?.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr?.on("data", (chunk) => { stderr += chunk.toString(); });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ exitCode: code === null ? -1 : code, stdout, stderr, duration: Date.now() - start });
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ exitCode: -1, stdout, stderr: stderr || err.message, duration: Date.now() - start });
    });
  });
}

function runNpmInstall(cwd: string, timeoutMs: number): Promise<{ exitCode: number; stdout: string; stderr: string; duration: number }> {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const start = Date.now();
  return new Promise((resolve) => {
    const child = spawn(npmCmd, ["install"], {
      cwd,
      env: { ...process.env, CI: "true" },
      shell: true,
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout?.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr?.on("data", (chunk) => { stderr += chunk.toString(); });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ exitCode: code === null ? -1 : code, stdout, stderr, duration: Date.now() - start });
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ exitCode: -1, stdout, stderr: stderr || err.message, duration: Date.now() - start });
    });
  });
}

// Detect the likely framework and missing critical files
function detectProjectIssues(tempDir: string, packageJson: any, files: any[]) {
  const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
  const scripts = packageJson.scripts || {};
  const filePaths = files.map((f) => (f.path || "").replace(/\\/g, "/"));
  const hasFile = (name: string) => filePaths.some((p) => p.toLowerCase().endsWith(name.toLowerCase())) || fsSync.existsSync(path.join(tempDir, name));
  const hasVite = Boolean(deps.vite || hasFile("vite.config.ts") || hasFile("vite.config.js") || hasFile("vite.config.mjs"));
  const hasNext = Boolean(deps.next || hasFile("next.config.js") || hasFile("next.config.ts"));
  const hasCRA = Boolean(deps["react-scripts"]);
  const hasReact = Boolean(deps.react);

  let framework = "Node.js";
  if (hasNext) framework = "Next.js";
  else if (hasVite) framework = "Vite";
  else if (hasCRA) framework = "Create React App";
  else if (hasReact) framework = "React";

  const missingFiles: string[] = [];
  const warnings: string[] = [];
  const autoFixed: string[] = [];

  if (!hasFile("package.json")) missingFiles.push("package.json");

  if (hasVite && !hasFile("index.html")) {
    missingFiles.push("index.html");
    warnings.push("Vite a besoin d'un index.html pour le build.");
  }

  if (hasVite && !hasFile("vite.config.ts") && !hasFile("vite.config.js") && !hasFile("vite.config.mjs")) {
    warnings.push("Aucun vite.config trouvé, le build peut échouer si la configuration par défaut ne convient pas.");
  }

  if (hasReact && !hasFile("src/main.tsx") && !hasFile("src/main.jsx") && !hasFile("src/index.js") && !hasFile("src/index.ts")) {
    warnings.push("Aucun point d'entrée React (src/main.tsx|jsx|js|ts) détecté.");
  }

  if (!scripts.build && !scripts.test) {
    warnings.push("Aucun script 'build' ou 'test' défini dans package.json.");
  } else {
    if (!scripts.build) warnings.push("Aucun script 'build' dans package.json.");
    if (!scripts.test) warnings.push("Aucun script 'test' dans package.json.");
  }

  return { framework, missingFiles, warnings, autoFixed, hasVite, hasNext };
}

async function autoFixProject(tempDir: string, diagnostics: ReturnType<typeof detectProjectIssues>, files: any[]) {
  const autoFixed: string[] = [];
  const filePaths = files.map((f) => (f.path || "").replace(/\\/g, "/"));
  const hasFile = (name: string) => filePaths.some((p) => p.toLowerCase().endsWith(name.toLowerCase()));

  if (diagnostics.hasVite && !hasFile("index.html")) {
    // Detect entry file for Vite
    const entryCandidates = ["src/main.tsx", "src/main.jsx", "src/main.js", "src/main.ts", "src/index.tsx", "src/index.jsx", "src/index.js", "src/index.ts", "main.tsx", "main.jsx", "main.js", "main.ts", "index.tsx", "index.jsx", "index.js", "index.ts"];
    let entry = entryCandidates.find(hasFile) || "src/main.tsx";
    const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Application</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/${entry}"></script>
  </body>
</html>
`;
    await fs.writeFile(path.join(tempDir, "index.html"), indexHtml, "utf-8");
    autoFixed.push(`index.html créé automatiquement (entrée : /${entry}).`);
  }
  return autoFixed;
}

// API: Test a project in a temporary sandbox (npm install + build + test)
app.post("/api/marketing/test-project", async (req, res) => {
  let tempDir = "";
  try {
    const { files } = req.body;
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "Aucun fichier de projet fourni." });
    }

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "marketing-test-"));
    await writeProjectFiles(tempDir, files);

    const packageJsonPath = path.join(tempDir, "package.json");
    let packageJson: any = {};
    try {
      packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
    } catch {
      return res.status(400).json({ error: "package.json introuvable ou invalide." });
    }

    const diagnostics = detectProjectIssues(tempDir, packageJson, files);
    const autoFixed = await autoFixProject(tempDir, diagnostics, files);
    diagnostics.autoFixed = autoFixed;

    const scripts = packageJson.scripts || {};
    const result: any = { install: null, build: null, test: null, summary: "", diagnostics };

    // Always try to install dependencies
    result.install = await runNpmInstall(tempDir, 240_000);

    if (scripts.build) {
      result.build = await runNpmScript("build", tempDir, 180_000);
    }

    if (scripts.test && !scripts.test.toLowerCase().includes("exit 1")) {
      result.test = await runNpmScript("test", tempDir, 180_000);
    }

    // Build a human readable summary
    const parts: string[] = [];
    if (result.install) {
      parts.push(`npm install : ${result.install.exitCode === 0 ? "succès" : "échec"} (${result.install.duration}ms)`);
    }
    if (result.build) {
      parts.push(`npm run build : ${result.build.exitCode === 0 ? "succès" : "échec"} (${result.build.duration}ms)`);
    }
    if (result.test) {
      parts.push(`npm run test : ${result.test.exitCode === 0 ? "succès" : "échec"} (${result.test.duration}ms)`);
    }
    if (!result.build && !result.test) {
      parts.push("Aucun script build/test détecté dans package.json.");
    }
    result.summary = parts.join(" | ");

    return res.json({ success: true, result });
  } catch (err: any) {
    console.error("Erreur test projet :", err);
    return res.status(500).json({ error: err.message || "Erreur lors du test du projet." });
  } finally {
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
    }
  }
});

// Setup Vite middleware for development or static files for production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
});
