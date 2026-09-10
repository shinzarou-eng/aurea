import { MarketingSession } from "../types";

export function generateMarketingMarkdown(session: MarketingSession, appName: string): string {
  const { appOverview, targetPersonas, swotAndTrends, monetization, appStoreOptimization, socialMediaLaunch, advertisingAngles, prAndOutreach, actionPlan7Days } = session;

  return `# Kit & Session Marketing : ${appOverview.detectedName || appName}

> Kit de lancement et audit produit — ${appOverview.detectedName || appName}
> Date : ${new Date().toLocaleDateString("fr-FR")}

---

## 1. Analyse de Marque & Positionnement

- **Nom de l'application :** ${appOverview.detectedName}
- **Slogan / Tagline :** "${appOverview.catchphrase}"
- **Proposition de Valeur Unique (UVP) :** ${appOverview.uniqueValueProposition}
- **Catégorie principale :** ${appOverview.category}
- **Tonalité de marque :** ${appOverview.brandVoice}
- **Palette de couleurs perçue :** ${appOverview.colorPalette.join(", ")}

### Fonctionnalités Clés Détectées :
${appOverview.primaryFeaturesDetected.map((f) => `- ${f}`).join("\n")}

---

## 2. Personas Cibles

${targetPersonas
  .map(
    (p, i) => `### Persona #${i + 1} : ${p.personaName}
- **Frustration majeure :** ${p.corePainPoint}
- **Moment déclencheur :** ${p.triggerMoment}
- **Bénéfice recherché :** ${p.keyBenefitExpected}
`
  )
  .join("\n")}

---

## 3. Analyse SWOT & Tendances du Marché

### Forces (Strengths) :
${swotAndTrends?.strengths ? swotAndTrends.strengths.map((s) => `- ${s}`).join("\n") : "Non spécifié"}

### Faiblesses (Weaknesses) :
${swotAndTrends?.weaknesses ? swotAndTrends.weaknesses.map((w) => `- ${w}`).join("\n") : "Non spécifié"}

### Opportunités (Opportunities) :
${swotAndTrends?.opportunities ? swotAndTrends.opportunities.map((o) => `- ${o}`).join("\n") : "Non spécifié"}

### Menaces (Threats) :
${swotAndTrends?.threats ? swotAndTrends.threats.map((t) => `- ${t}`).join("\n") : "Non spécifié"}

### Grandes Tendances de Marché :
${swotAndTrends?.marketTrends ? swotAndTrends.marketTrends.map((m) => `- **${m.trendName}** [Impact : ${m.impactScore}] : ${m.description}\n  *Action recommandée :* ${m.actionableAdvice}`).join("\n\n") : "Non spécifié"}

### Synthèse Stratégique :
"${swotAndTrends?.strategicSummary || ""}"

---

## 4. Stratégie de Monétisation & Paywall

- **Modèle Recommandé :** ${monetization?.recommendedModel || "Freemium"}

### Fonctionnalités Gratuites (Acquisition) :
${monetization?.freeTierFeatures ? monetization.freeTierFeatures.map((f) => `- ${f}`).join("\n") : "Non spécifié"}

### Fonctionnalités Premium (Conversion MRR) :
${monetization?.premiumTierFeatures ? monetization.premiumTierFeatures.map((f) => `- [PRO] ${f}`).join("\n") : "Non spécifié"}

### Grille Tarifaire Suggérée :
${monetization?.pricingTiers ? monetization.pricingTiers.map((t) => `- **${t.name}** : ${t.price} (${t.badge || ""} ${t.trialDays || ""})`).join("\n") : "Non spécifié"}

### Textes Clés du Paywall :
- **Titre d'Accroche :** "${monetization?.paywallCopy?.headline || ""}"
- **Sous-titre :** "${monetization?.paywallCopy?.subheadline || ""}"
- **Bénéfices Listés :**
${monetization?.paywallCopy?.bulletBenefits ? monetization.paywallCopy.bulletBenefits.map((b) => `  ✓ ${b}`).join("\n") : ""}
- **Bouton d'Achat (CTA) :** "${monetization?.paywallCopy?.ctaButtonText || ""}"
- **Réassurance Légale :** "${monetization?.paywallCopy?.reassuranceText || ""}"

### Déclencheurs Psychologiques du Paywall :
${monetization?.paywallTriggers ? monetization.paywallTriggers.map((tr) => `- ${tr}`).join("\n") : "Non spécifié"}

---

## 5. Optimisation App Store & Google Play (ASO)

- **Titre Store :** ${appStoreOptimization.storeTitle}
- **Sous-titre :** ${appStoreOptimization.subtitle}
- **Description Courte :** ${appStoreOptimization.shortDescription}
- **Mots-clés ASO :** ${appStoreOptimization.keywords.join(", ")}

### Description Complète :
${appStoreOptimization.fullDescription}

### Recommandations pour les Captures d'Écran du Store :
${appStoreOptimization.screenshotCaptions
  .map((c) => `- **Écran ${c.screenNumber} :** "${c.headline}" — *${c.subtext}*`)
  .join("\n")}

---

## 6. A/B Test Generator & Optimisation du Taux de Conversion (CRO)

${session.abTesting ? `
- **Protocole :** ${session.abTesting.testName}
- **Objectif CRO :** ${session.abTesting.objective}
- **Plateforme recommandée :** ${session.abTesting.recommendedPlatform}
- **Volume d'échantillon :** ${session.abTesting.sampleSizeRecommendation}
- **Durée estimée :** ${session.abTesting.estimatedDuration}
- **Métrique clé :** ${session.abTesting.keyMetric}

### Variantes de Titres & Sous-titres :
${session.abTesting.titleVariants.map((t) => `#### ${t.name} (Impact: ${t.expectedImpact})
- **Titre iOS :** ${t.appleTitle}
- **Sous-titre iOS :** ${t.appleSubtitle}
- **Titre Google Play :** ${t.googleTitle}
- **Hypothèse :** ${t.hypothesis}
- **Levier psychologique :** ${t.psychologicalTrigger}
`).join("\n")}

### Concepts d'Icônes d'Application :
${session.abTesting.iconVariants.map((ic) => `#### ${ic.name} [${ic.styleTheme}]
- **Description visuelle :** ${ic.conceptDescription}
- **Couleur d'accent :** ${ic.accentColor}
- **Justification CRO :** ${ic.rationale}
- **Public cible :** ${ic.bestForAudience}
`).join("\n")}

### Variantes de Descriptions & Accroches :
${session.abTesting.descriptionVariants.map((d) => `#### ${d.name} (${d.conversionFocus})
- **Accroche visible :** "${d.hookHeadline}"
- **Court Google Play :** "${d.shortDescriptionGoogle}"
- **Bénéfices clés :** ${d.bulletPoints.join(" | ")}
- **CTA :** ${d.ctaClosing}
- **Hypothèse :** ${d.hypothesis}
`).join("\n")}
` : "Test A/B disponible dans le tableau de bord interactif."}

---

## 7. Campagne de Lancement & Réseaux Sociaux

### Thread X / Twitter :
${socialMediaLaunch.twitterThread.map((t, i) => `**Tweet ${i + 1} :**\n${t}\n`).join("\n")}

### Post LinkedIn Storytelling :
${socialMediaLaunch.linkedInPost}

### Concepts Vidéos TikTok & Instagram Reels :
${socialMediaLaunch.tiktokReelsHooks
  .map(
    (h, i) => `#### Concept #${i + 1}
- **Visuel 0-3s :** ${h.hookVisual}
- **Accroche Audio :** "${h.hookAudio}"
- **Déroulement :** ${h.concept}
`
  )
  .join("\n")}

### Kit Product Hunt :
- **Tagline :** ${socialMediaLaunch.productHuntKit.tagline}
- **Commentaire du Maker :**
${socialMediaLaunch.productHuntKit.makerComment}

---

## 7. Angles Publicitaires (Paid Ads)

${advertisingAngles
  .map(
    (a, i) => `### Angle #${i + 1} : ${a.angleName}
- **Titre Accroche :** ${a.hookText}
- **Texte Publicitaire (Copy) :**
${a.bodyCopy}
- **Bouton CTA :** ${a.ctaButton}
- **Idée de visuel :** ${a.recommendedVisualConcept}
`
  )
  .join("\n")}

---

## 8. Relations Presse & Pitchs

### Elevator Pitch Oral (30 secondes) :
"${prAndOutreach.elevatorPitch30s}"

### Email Froid Médias / Journalistes :
${prAndOutreach.pressReleaseEmail}

### DM Influenceurs & Partenaires :
${prAndOutreach.influencerDm}

---

## 9. Plan d'Action de Lancement (7 Jours)

${actionPlan7Days.map((d) => `- **${d.day}** [${d.channel}] : ${d.task}`).join("\n")}

${session.competitorAnalysis ? `---

## 10. Analyse Concurrentielle & Avantage Déloyal (Moat)

**Avantage Déloyal / Moat :**
${session.competitorAnalysis.unfairAdvantageMoat}

**Stratégie de Contre-positionnement :**
${session.competitorAnalysis.counterPositioningStrategy}

**Cible de Part de Marché :** ${session.competitorAnalysis.targetMarketShareGoal}

### Comparatif Concurrents :
${session.competitorAnalysis.competitors.map((c) => `- **${c.name}** (${c.category}) :
  - *Leur faiblesse :* ${c.theirWeakness}
  - *Notre avantage :* ${c.ourAdvantage}
  - *Angle de conquête :* ${c.poachingAngle}
  - *Tarification :* ${c.pricingComparison}`).join("\n")}
` : ""}

${session.ugcScripts && session.ugcScripts.length > 0 ? `---

## 11. Scripts Vidéo UGC (TikTok / Reels / Shorts)

${session.ugcScripts.map((script, idx) => `### Script #${idx + 1} : ${script.title} (Émotion : ${script.targetEmotion})
*Tendance Sonore recommandée :* ${script.musicTrend}
*Conseil Réalisateur :* ${script.creatorTip}

| Phase | Timecode | Action Visuelle | Voix-off (Audio) | Texte Écran |
|---|---|---|---|---|
${script.scenes.map((s) => `| ${s.phase} | ${s.timeframe} | ${s.visualAction.replace(/\|/g, "-")} | ${s.audioVoiceover.replace(/\|/g, "-")} | ${s.onScreenText.replace(/\|/g, "-")} |`).join("\n")}
`).join("\n")}
` : ""}

${session.okrPlan ? `---

## 12. Objectifs OKR (KPIs d'Exécution sur 30 Jours)
*Avancement actuel : Jour ${session.okrPlan.currentDay} / 30*

${session.okrPlan.objectives.map((obj) => `### ${obj.title}
*${obj.description}*

| Résultat Clé (KR) | Cible 30J | Actuel Mesuré | Type |
|---|---|---|---|
${obj.keyResults.map((kr) => `| ${kr.title} | ${kr.targetValue} ${kr.unit} | ${kr.currentValue} ${kr.unit} | ${kr.type === "higher_is_better" ? "Croissance" : "Plafond/Limite"} |`).join("\n")}
`).join("\n")}

### Jalons Hebdomadaires :
${session.okrPlan.weeklyMilestones.map((m) => `- [${m.completed ? "x" : " "}] **${m.title}** : ${m.focus} *(Cible : ${m.targetMetric})*`).join("\n")}
` : ""}

${session.retentionSequence ? `---

## 13. Séquences de Rétention Push & Emails d'Onboarding
*${session.retentionSequence.strategySummary}*

### Notifications Push Écran Verrouillé :
${session.retentionSequence.pushNotifications.map((p) => `#### ${p.triggerTiming} [${p.category.toUpperCase()}]
- **Titre :** ${p.title}
- **Message :** ${p.body}
- **Heure conseillée :** ${p.recommendedTimeOfDay || "N/A"}
- **Objectif :** ${p.goal}
`).join("\n")}

### Emails d'Activation :
${session.retentionSequence.emails.map((e) => `#### ${e.triggerTiming} : ${e.subject}
*Expéditeur : ${e.senderName}*
*Pré-en-tête : ${e.previewText}*
*Bouton CTA : ${e.ctaText}*

${e.bodyMarkdown}
`).join("\n")}
` : ""}

${session.customPaywall ? `---

## 14. Architecture & Configuration du Paywall Mobile
- **Modèle :** ${session.customPaywall.layout} (${session.customPaywall.theme})
- **Titre :** "${session.customPaywall.headline}"
- **Sous-titre :** "${session.customPaywall.subheadline}"
- **Badge promo :** ${session.customPaywall.badgeText}
- **Bouton CTA :** ${session.customPaywall.ctaButtonText}
- **Essai gratuit :** ${session.customPaywall.showTrialTimeline ? `${session.customPaywall.trialDurationDays} jours` : "Désactivé"}
- **Arguments clés :** ${session.customPaywall.features.map(f => f.text).join(" • ")}
` : ""}

${session.adCreatives && session.adCreatives.length > 0 ? `---

## 15. Bannières & Visuels Publicitaires Multi-Plateformes
${session.adCreatives.map((ad) => `### Format ${ad.format.toUpperCase()} (${ad.platform})
- **Accroche (Hook) :** "${ad.hookHeadline}"
- **Texte principal :** "${ad.subtext}"
- **CTA :** "${ad.ctaText}"
- **Badge :** "${ad.badgeText}"
- **Idée visuelle :** *${ad.aiPromptIdea || "N/A"}*
`).join("\n")}
` : ""}

${session.multiMarketPlan ? `---

## 16. Localisation Internationale Multi-Marchés
${Object.values(session.multiMarketPlan.markets).map((m) => `### ${m.flag} ${m.marketName} (${m.languageName})
- **Titre Store :** ${m.storeTitle}
- **Sous-titre Store :** ${m.subtitle}
- **Tarif local :** ${m.priceFormatted}
- **Mots-clés (100 car.) :** \`${m.keywords.join(",")}\`
- **USP locale :** ${m.localizedUsp}
- **Nuances culturelles :** ${m.culturalNuances}
- **Angle concurrence locale :** ${m.poachingAngleLocal}
`).join("\n")}
` : ""}

---
*Document produit par Aurea*
`;
}
