export interface SmartPrompt {
  id: string;
  label: string;
  badge?: string;
  category: "tone" | "audience" | "conversion" | "platform";
  description: string;
  promptFr: string;
  promptEn: string;
}

export const SMART_PROMPT_CATEGORIES = [
  { id: "all", labelFr: "Tous les prompts", labelEn: "All Prompts", icon: "Sparkles" },
  { id: "tone", labelFr: "Tonalité & Style", labelEn: "Tone & Style", icon: "Flame" },
  { id: "audience", labelFr: "Audience & Cibles", labelEn: "Audience & Target", icon: "Target" },
  { id: "conversion", labelFr: "Psychologie & Vente", labelEn: "Conversion & Psychology", icon: "Zap" },
  { id: "platform", labelFr: "Viralité & Formats", labelEn: "Virality & Platforms", icon: "Share2" },
] as const;

export const SMART_PROMPTS: SmartPrompt[] = [
  // Tone & Style
  {
    id: "more-aggressive",
    label: "Make it more aggressive",
    badge: "Populaire",
    category: "tone",
    description: "Élimine les hésitations, ton percutant et sans concession pour capter l'attention.",
    promptFr: "Rends le texte nettement plus percutant, affirmé et agressif. Élimine toute hésitation, adopte un ton tranchant, direct et sans concession pour imposer la valeur de l'application.",
    promptEn: "Make it much more aggressive, bold, and high-impact. Cut all hesitations, adopt a sharp, direct, no-nonsense tone, and command immediate attention.",
  },
  {
    id: "tone-down-corporate",
    label: "Tone down the corporate speak",
    badge: "Essentiel",
    category: "tone",
    description: "Bannit le jargon corpo et les buzzwords pour un style humain et conversationnel.",
    promptFr: "Adoucis le ton corporate. Supprime tout le jargon institutionnel, les buzzwords creux et les formules administratives. Rends le texte chaleureux, accessible, fluide et parlé comme à un ami.",
    promptEn: "Tone down the corporate speak. Remove buzzwords, jargon, and overly stiff formal phrasing. Make it conversational, warm, relatable, and genuinely human.",
  },
  {
    id: "ultra-minimalist",
    label: "Ultra-minimalist & punchy",
    category: "tone",
    description: "Divise la longueur par deux, garde uniquement des punchlines mémorables.",
    promptFr: "Raccourcis drastiquement : divise le texte par deux. Garde uniquement des punchlines percutantes de moins de 10 mots avec zéro superflu.",
    promptEn: "Cut the length in half. Keep only punchy, memorable one-liners with zero fluff or filler words.",
  },
  {
    id: "provocative-polarizing",
    label: "Provocative & contrarian",
    category: "tone",
    description: "Prend le contre-pied des clichés de l'industrie pour créer un débat.",
    promptFr: "Prends une posture provocatrice et à contre-courant des clichés de notre secteur. Casse les idées reçues pour forcer la curiosité.",
    promptEn: "Take a provocative and contrarian stance against industry clichés. Challenge traditional norms to spark curiosity and conversation.",
  },

  // Audience & Target
  {
    id: "target-gen-z",
    label: "Target Gen Z",
    badge: "TikTok Ready",
    category: "audience",
    description: "Codes visuels et sémantiques 18-25 ans, rythme rapide, zéro condescendance.",
    promptFr: "Adapte le message spécifiquement pour la Gen Z (18-25 ans). Utilise des tournures modernes, un rythme ultra-dynamique, un ton authentique et mobile-first, sans jargon pompeux.",
    promptEn: "Tailor the messaging specifically for Gen Z (ages 18-25). Use a fast-paced, authentic, mobile-first tone, culturally relevant phrasing, and zero cringe corporate talk.",
  },
  {
    id: "target-b2b-executives",
    label: "Target busy B2B founders",
    category: "audience",
    description: "Focus direct sur le gain de temps, la productivité et le ROI mesurable.",
    promptFr: "Cible des fondateurs et professionnels occupés (B2B). Reste synthétique, focalisé sur le gain de temps mesurable, la productivité et la rentabilité immédiate.",
    promptEn: "Target busy executives and founders: ultra-concise, emphasizing workflow velocity, automation, and effortless scaling.",
  },
  {
    id: "target-skeptics",
    label: "Target skeptical buyers",
    category: "audience",
    description: "Désamorce la méfiance des utilisateurs déçus par des apps concurrentes.",
    promptFr: "Cible les utilisateurs sceptiques qui ont déjà essayé des applications similaires sans succès. Désamorce les doutes avec des preuves concrètes et une réassurance sans risque.",
    promptEn: "Target skeptical users who have been burned by competing apps. Overcome doubts with tangible proof, transparency, and zero-risk reassurance.",
  },
  {
    id: "target-busy-parents",
    label: "Target overwhelmed parents",
    category: "audience",
    description: "Soulage la charge mentale avec empathie et simplicité absolue.",
    promptFr: "Adapte pour des parents débordés : ton empathique, centré sur le soulagement de la charge mentale, la rapidité d'exécution et la tranquillité d'esprit.",
    promptEn: "Tailor for busy, overwhelmed parents: deeply empathetic, focusing on cutting mental load, effortless setup, and immediate peace of mind.",
  },

  // Psychology & Conversion
  {
    id: "max-urgency-fomo",
    label: "Maximum Urgency & FOMO",
    badge: "Conversion",
    category: "conversion",
    description: "Leviers psychologiques de rareté et coût de l'inaction pour déclencher l'action.",
    promptFr: "Injecte une forte urgence psychologique et un sentiment d'opportunité limitée (FOMO). Souligne le coût de l'inaction et incite à agir immédiatement.",
    promptEn: "Inject high psychological urgency and FOMO. Highlight the hidden cost of inaction and give compelling reasons to act today rather than tomorrow.",
  },
  {
    id: "overcome-price",
    label: "Overcome price objections",
    category: "conversion",
    description: "Recadre le prix de l'abonnement par rapport à des micro-dépenses du quotidien.",
    promptFr: "Désamorce les objections de prix en comparant le coût à une dépense quotidienne dérisoire (moins d'un café par jour) face à un bénéfice disproportionné.",
    promptEn: "Neutralize pricing friction by reframing subscription cost against everyday trivial expenses (less than a daily coffee) with obvious outsized payoff.",
  },
  {
    id: "high-converting-ctas",
    label: "3 High-converting CTAs",
    category: "conversion",
    description: "Génère 3 variantes d'appels à l'action : engagement doux, curiosité et valeur.",
    promptFr: "Propose 3 variantes irrésistibles d'appels à l'action (CTA) : un axé sur le bénéfice immédiat, un à engagement sans risque (essai gratuit), et un fondé sur la curiosité.",
    promptEn: "Craft 3 high-converting Call-to-Action (CTA) variants: one value-driven, one low-friction/risk-free, and one curiosity-driven.",
  },
  {
    id: "storytelling-pain-relief",
    label: "Pain-to-Relief Storytelling",
    category: "conversion",
    description: "Structure Problème-Agitation-Solution pour toucher l'émotion avant la vente.",
    promptFr: "Utilise la structure narrative Problème-Agitation-Solution (PAS). Décris la douleur quotidienne avec précision avant d'introduire l'app comme le soulagement naturel.",
    promptEn: "Structure using Problem-Agitate-Solution (PAS). Vividly describe the daily frustration before positioning the app as the undeniable relief.",
  },

  // Platforms & Virality
  {
    id: "viral-tiktok-hook",
    label: "TikTok / Reels Hook Focus",
    badge: "Viral",
    category: "platform",
    description: "Création d'accroches de 3 secondes à fort taux de rétention vidéo.",
    promptFr: "Optimise pour les formats vidéo courts (TikTok / Reels / Shorts). Conçois 3 accroches visuelles et verbales de 3 secondes qui stoppent net le scroll.",
    promptEn: "Optimize for short-form video algorithms (TikTok / Reels / Shorts). Design 3 high-retention 3-second pattern interrupts that stop users from scrolling.",
  },
  {
    id: "app-store-aso-focus",
    label: "App Store ASO / Keyword density",
    category: "platform",
    description: "Optimisé pour l'algorithme des stores et la lecture rapide en diagonale.",
    promptFr: "Optimise pour les algorithmes Apple App Store et Google Play : intègre naturellement les mots-clés de recherche tout en maximisant la lisibilité en diagonale.",
    promptEn: "Optimize for Apple App Store and Google Play search ranking: naturally weave in high-intent keywords while keeping text instantly scannable.",
  },
  {
    id: "localize-us-uk",
    label: "Localize for US/UK market",
    category: "platform",
    description: "Traduction culturelle native avec les expressions de référence du marché américain.",
    promptFr: "Traduis et adapte pour le marché anglophone américain (US/UK). Utilise des idiomes naturels, le rythme culturel natif et les standards des meilleures apps californiennes.",
    promptEn: "Localize specifically for the US/UK tech consumer market using authentic native idioms, crisp cadence, and Silicon Valley launch standards.",
  },
];
