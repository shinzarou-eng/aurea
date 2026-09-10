export interface AppOverview {
  detectedName: string;
  catchphrase: string;
  uniqueValueProposition: string;
  category: string;
  primaryFeaturesDetected: string[];
  colorPalette: string[];
  brandVoice: string;
}

export interface TargetPersona {
  personaName: string;
  corePainPoint: string;
  triggerMoment: string;
  keyBenefitExpected: string;
}

export interface ScreenshotCaption {
  screenNumber: number;
  headline: string;
  subtext: string;
}

export interface AppStoreOptimization {
  storeTitle: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  keywords: string[];
  screenshotCaptions: ScreenshotCaption[];
}

export interface TikTokReelHook {
  hookVisual: string;
  hookAudio: string;
  concept: string;
}

export interface ProductHuntKit {
  tagline: string;
  makerComment: string;
}

export interface SocialMediaLaunch {
  twitterThread: string[];
  linkedInPost: string;
  tiktokReelsHooks: TikTokReelHook[];
  productHuntKit: ProductHuntKit;
}

export interface AdvertisingAngle {
  angleName: string;
  hookText: string;
  bodyCopy: string;
  ctaButton: string;
  recommendedVisualConcept: string;
}

export interface PrAndOutreach {
  elevatorPitch30s: string;
  pressReleaseEmail: string;
  influencerDm: string;
}

export interface ActionPlanDay {
  day: string;
  task: string;
  channel: string;
}

export interface MarketTrendItem {
  trendName: string;
  impactScore: string;
  description: string;
  actionableAdvice: string;
}

export interface SwotAndTrends {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  marketTrends: MarketTrendItem[];
  strategicSummary: string;
}

export interface PricingTier {
  name: string;
  price: string;
  badge?: string;
  trialDays?: string;
}

export interface PaywallCopy {
  headline: string;
  subheadline: string;
  bulletBenefits: string[];
  ctaButtonText: string;
  reassuranceText: string;
}

export interface MonetizationAndPaywall {
  recommendedModel: string;
  freeTierFeatures: string[];
  premiumTierFeatures: string[];
  pricingTiers: PricingTier[];
  paywallCopy: PaywallCopy;
  paywallTriggers: string[];
}

export interface AbTestVariantTitle {
  id: string;
  name: string;
  appleTitle: string;
  appleSubtitle: string;
  googleTitle: string;
  hypothesis: string;
  psychologicalTrigger: string;
  expectedImpact: string;
  iceScore: { impact: number; confidence: number; ease: number };
}

export interface AbTestVariantIcon {
  id: string;
  name: string;
  styleTheme: string;
  backgroundGradient: string;
  accentColor: string;
  iconSymbol: string;
  conceptDescription: string;
  rationale: string;
  bestForAudience: string;
  visualPreview: {
    bgColor: string;
    iconColor: string;
    shape: "rounded-squircle" | "pill" | "circle";
    badgeText?: string;
  };
}

export interface AbTestVariantDescription {
  id: string;
  name: string;
  hookHeadline: string;
  shortDescriptionGoogle: string;
  bulletPoints: string[];
  ctaClosing: string;
  hypothesis: string;
  conversionFocus: string;
}

export interface AbTestPlan {
  testName: string;
  objective: string;
  recommendedPlatform: string;
  sampleSizeRecommendation: string;
  estimatedDuration: string;
  keyMetric: string;
  titleVariants: AbTestVariantTitle[];
  iconVariants: AbTestVariantIcon[];
  descriptionVariants: AbTestVariantDescription[];
  testingTips: string[];
}

export interface CompetitorItem {
  name: string;
  category: string;
  theirWeakness: string;
  ourAdvantage: string;
  pricingComparison: string;
  poachingAngle: string;
}

export interface CompetitorAnalysis {
  competitors: CompetitorItem[];
  unfairAdvantageMoat: string;
  counterPositioningStrategy: string;
  targetMarketShareGoal: string;
}

export interface UgcScene {
  timeframe: string;
  phase: string;
  visualAction: string;
  audioVoiceover: string;
  onScreenText: string;
}

export interface UgcScript {
  id: string;
  title: string;
  targetEmotion: string;
  scenes: UgcScene[];
  musicTrend: string;
  creatorTip: string;
}

export interface LocalizedAso {
  storeTitle: string;
  subtitle: string;
  shortDescription: string;
  keywords: string[];
}

export interface KeyResult {
  id: string;
  title: string;
  metricLabel: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  type: "higher_is_better" | "lower_is_better";
  baseline: number;
  category: "acquisition" | "monetization" | "economics" | "quality";
}

export interface ObjectiveOkr {
  id: string;
  title: string;
  description: string;
  theme: string;
  keyResults: KeyResult[];
}

export interface OkrWeeklyMilestone {
  week: number;
  title: string;
  focus: string;
  targetMetric: string;
  completed: boolean;
}

export interface OkrPlan30Days {
  startDate: string;
  currentDay: number; // 1 to 30
  objectives: ObjectiveOkr[];
  weeklyMilestones: OkrWeeklyMilestone[];
  notes?: string;
}

// 1. Séquences Push & Emails d'onboarding
export interface PushNotificationItem {
  id: string;
  triggerTiming: string; // e.g. "J+0 (10 min après install)"
  dayOffset: number;
  category: "activation" | "habit" | "paywall" | "retention" | "winback";
  title: string;
  body: string;
  sound?: string;
  badgeCount?: number;
  actionButton?: string;
  recommendedTimeOfDay?: string;
  goal: string;
}

export interface OnboardingEmailItem {
  id: string;
  triggerTiming: string; // e.g. "J+0", "J+2", "J+5"
  subject: string;
  previewText: string;
  senderName: string;
  heading: string;
  bodyMarkdown: string;
  ctaText: string;
  ctaUrlPlaceholder: string;
  goal: string;
}

export interface RetentionSequencePlan {
  pushNotifications: PushNotificationItem[];
  emails: OnboardingEmailItem[];
  strategySummary: string;
  bestPracticesTips: string[];
}

// 2. Studio Paywall Mobile Interactif
export type PaywallLayoutType = "trial_timeline" | "hard_paywall" | "soft_freemium" | "comparison_table";
export type PaywallTheme = "dark_luxury" | "clean_light" | "vibrant_gradient" | "minimal_slate";

export interface CustomPaywallConfig {
  layout: PaywallLayoutType;
  theme: PaywallTheme;
  headline: string;
  subheadline: string;
  badgeText: string;
  showTrialTimeline: boolean;
  trialDurationDays: number;
  selectedTierIndex: number;
  features: { icon: string; text: string; highlight?: boolean }[];
  ctaButtonText: string;
  reassuranceItems: string[];
  billingTermsText: string;
}

// 3. Générateur de Bannières & Visuels Publicitaires
export type AdFormatType = "story_9_16" | "feed_1_1" | "landscape_16_9" | "feature_banner_3_2";

export interface AdCreativeTemplate {
  id: string;
  format: AdFormatType;
  platform: "TikTok / Reels" | "Instagram / Meta Feed" | "App Store Feature" | "Twitter / LinkedIn";
  hookHeadline: string;
  subtext: string;
  ctaText: string;
  badgeText: string;
  appRatingText?: string;
  bgColor: string;
  gradient: string;
  screenshotIndex?: number;
  overlayStyle: "floating_card" | "bold_typography" | "split_screen" | "badge_focus";
  aiPromptIdea?: string;
}

// 4. Localisation Internationale Multi-Marchés
export interface LocalizedMarketData {
  marketCode: "US" | "DE" | "JP" | "ES" | "FR";
  marketName: string;
  flag: string;
  languageName: string;
  currencySymbol: string;
  priceFormatted: string;
  storeTitle: string;
  subtitle: string;
  shortDescription: string;
  keywords: string[];
  localizedUsp: string;
  culturalNuances: string;
  poachingAngleLocal: string;
}

export interface MultiMarketPlan {
  markets: Record<string, LocalizedMarketData>;
  globalStrategyAdvice: string;
}

export interface MarketingSession {
  appOverview: AppOverview;
  targetPersonas: TargetPersona[];
  swotAndTrends: SwotAndTrends;
  monetization: MonetizationAndPaywall;
  appStoreOptimization: AppStoreOptimization;
  socialMediaLaunch: SocialMediaLaunch;
  advertisingAngles: AdvertisingAngle[];
  prAndOutreach: PrAndOutreach;
  actionPlan7Days: ActionPlanDay[];
  abTesting?: AbTestPlan;
  competitorAnalysis?: CompetitorAnalysis;
  ugcScripts?: UgcScript[];
  localizedAso?: Record<string, LocalizedAso>;
  okrPlan?: OkrPlan30Days;
  retentionSequence?: RetentionSequencePlan;
  customPaywall?: CustomPaywallConfig;
  adCreatives?: AdCreativeTemplate[];
  multiMarketPlan?: MultiMarketPlan;
}

export interface UploadedImage {
  id: string;
  name: string;
  dataUrl: string; // base64
  previewUrl: string;
  tag?: string; // e.g., "Accueil", "Onboarding", "Profil", "Détail"
  isPreset?: boolean;
}

export interface ProjectFile {
  path: string;
  name: string;
  size: number;
  isText: boolean;
  content?: string;
  extension: string;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}

export interface ProjectTestResult {
  install: CommandResult | null;
  build: CommandResult | null;
  test: CommandResult | null;
  summary: string;
  diagnostics?: {
    framework: string;
    missingFiles: string[];
    warnings: string[];
    autoFixed: string[];
  };
}

export interface ScoreReview {
  score: number;
  summary: string;
  quickWins: string[];
  criticalIssues: string[];
}

export interface ProjectAudit {
  appName: string;
  elevatorPitch: string;
  detectedTechStack: string[];
  architectureSummary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  uxReview: ScoreReview;
  codeQuality: ScoreReview;
  securityReview: ScoreReview;
  performanceReview: ScoreReview;
  marketFit: {
    score: number;
    summary: string;
    targetAudience: string[];
    bestChannels: string[];
  };
  competitorPositioning: {
    summary: string;
    differentiators: string[];
    risks: string[];
    competitors: { name: string; strengths: string[]; weaknesses: string[]; howToBeat: string }[];
  };
  launchReadiness: {
    score: number;
    summary: string;
    todoBeforeLaunch: string[];
  };
  monetizationSuggestions: { model: string; description: string; estimatedImpact: string }[];
  localizationOpportunities: { language: string; opportunity: string; priority: string }[];
  roadmap: { phase: string; timeline: string; actions: string[] }[];
  testPlan: string[];
  suggestedNextSteps: string[];
}

export interface PresetApp {
  id: string;
  name: string;
  category: string;
  description: string;
  audience: string;
  images: UploadedImage[];
}

export type EngineProviderType =
  | "gemini"
  | "deepseek"
  | "openai"
  | "anthropic"
  | "mistral"
  | "groq"
  | "openrouter"
  | "perplexity"
  | "custom";

export interface EngineConfig {
  provider: EngineProviderType;
  apiKey?: string;
  model?: string;
  customEndpoint?: string;
}
