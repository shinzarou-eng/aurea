import { useState } from "react";
import { MonetizationAndPaywall } from "../types";
import { 
  Star, 
  Crown, 
  Check, 
  Lock, 
  Copy, 
  ShieldCheck, 
  Clock, 
  Zap, 
  X,
  CreditCard
} from "lucide-react";

interface MonetizationSectionProps {
  monetization: MonetizationAndPaywall;
  onRefine: (sectionKey: string, content: any) => void;
}

export default function MonetizationSection({ monetization, onRefine }: MonetizationSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const paywall = monetization?.paywallCopy || {
    headline: "Débloquez la version Pro",
    subheadline: "Accédez à toutes les fonctionnalités sans limite.",
    bulletBenefits: ["Accès illimité", "Synchronisation complète", "Support prioritaire"],
    ctaButtonText: "Commencer l'essai gratuit",
    reassuranceText: "Annulation en 1 clic sans frais."
  };

  const {
    headline = "Débloquez la version Pro",
    subheadline = "Accédez à toutes les fonctionnalités sans limite.",
    bulletBenefits = ["Accès illimité", "Synchronisation complète", "Support prioritaire"],
    ctaButtonText = "Commencer l'essai gratuit",
    reassuranceText = "Annulation en 1 clic sans frais."
  } = paywall;

  const copyPaywallCopy = () => {
    const text = `
=== TEXTES POUR L'ÉCRAN DE PAYWALL ===

TITRE : ${headline}
SOUS-TITRE : ${subheadline}

AVANTAGES CLÉS :
${(bulletBenefits || []).map((b) => `✓ ${b}`).join("\n")}

BOUTON D'ACHAT (CTA) : ${ctaButtonText}

RÉASSURANCE & CONDITIONS : ${reassuranceText}

TARIFS RECOMMANDÉS :
${(monetization?.pricingTiers || []).map((t) => `- ${t.name} : ${t.price} (${t.badge || ""} ${t.trialDays || ""})`).join("\n")}

DÉCLENCHEURS DE PAYWALL :
${(monetization?.paywallTriggers || []).map((tr) => `• ${tr}`).join("\n")}
`;
    copyToClipboard(text, "paywall-all");
  };

  return (
    <div id="section-monetization" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md flex items-center gap-1">
              <span>Module 4</span>
              <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-extrabold">Paywall</span>
            </span>
            <h3 className="text-lg font-bold text-slate-900">Stratégie de Monétisation & Textes de Paywall</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Découpage de l'offre (Gratuit vs Payant), grille tarifaire et copywriting haute conversion pour votre écran d'abonnement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyPaywallCopy}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            {copiedKey === "paywall-all" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "paywall-all" ? "Textes copiés !" : "Copier le Paywall"}</span>
          </button>

          <button
            onClick={() => onRefine("Monétisation et Paywall", monetization)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Affiner</span>
          </button>
        </div>
      </div>

      {/* Recommended Model Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              Modèle Économique Recommandé
            </span>
            <h4 className="text-sm font-bold text-slate-900">{monetization?.recommendedModel || "Freemium avec essai gratuit"}</h4>
          </div>
        </div>
        <span className="text-xs font-semibold text-amber-800 bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200 shadow-2xs self-start sm:self-auto">
          Optimisé pour le MRR et la rétention
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
        {/* Left 7 cols: Free vs Premium breakdown + Pricing tiers */}
        <div className="lg:col-span-7 space-y-6">
          {/* Feature Breakdown: Free vs Premium */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Découpage Stratégique des Fonctionnalités
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Free Tier */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    Offre Gratuite (Acquisition)
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Gratuit
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  {(monetization?.freeTierFeatures || []).map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium Tier */}
              <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/80">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-200/60">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-600" />
                    Offre Pro / Premium (Revenu)
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Payant
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {(monetization?.premiumTierFeatures || []).map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Pricing Tiers Cards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Grille Tarifaire Suggérée
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(monetization?.pricingTiers || []).map((tier, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedTierIndex(idx)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedTierIndex === idx
                      ? "bg-amber-50/60 border-amber-400 ring-2 ring-amber-300 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">{tier.name}</span>
                    </div>
                    {tier.badge && (
                      <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 mb-2">
                        {tier.badge}
                      </span>
                    )}
                    <p className="text-sm font-extrabold text-slate-900 mb-1">{tier.price}</p>
                  </div>
                  {tier.trialDays && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>{tier.trialDays}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Paywall Triggers */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Déclencheurs Psychologiques du Paywall (Moments d'Affichage Clés)
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Quand afficher l'écran d'abonnement pour convertir sans dégrader l'expérience utilisateur :
            </p>
            <div className="space-y-2">
              {(monetization?.paywallTriggers || []).map((trig, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                  <span className="font-bold text-amber-600 text-xs mt-0.5">#{idx + 1}</span>
                  <span className="leading-relaxed">{trig}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 cols: Interactive Live Paywall Mockup */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] rounded-[36px] bg-slate-950 p-5 text-white shadow-2xl border-4 border-slate-800 relative overflow-hidden">
            {/* Ambient Radial Glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-1/2 -left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Top Bar with Dismiss */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                PRO PASS
              </span>
              <button className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Icon & Title */}
            <div className="text-center mb-5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/25">
                <Crown className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-white leading-tight mb-1.5">
                {headline}
              </h4>
              <p className="text-[11px] text-slate-300 leading-snug px-2">
                {subheadline}
              </p>
            </div>

            {/* Bullet Points */}
            <div className="space-y-2 mb-5 relative z-10 px-1">
              {(bulletBenefits || []).map((benefit, idx) => (
                <div key={idx} className="flex items-center space-x-2.5 text-xs text-slate-200">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-[11px] leading-tight font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Pricing Options Selector */}
            <div className="space-y-2 mb-4 relative z-10">
              {(monetization?.pricingTiers || []).map((tier, idx) => {
                const isSelected = selectedTierIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedTierIndex(idx)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-white/10 border-amber-400 shadow-sm"
                        : "bg-white/5 border-white/10 hover:border-white/20 opacity-70"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{tier.name}</span>
                        {tier.badge && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                            {tier.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">{tier.trialDays || "Sans engagement"}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-white">{tier.price}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => copyToClipboard(ctaButtonText, "cta-btn")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/30 hover:opacity-95 transition-all mb-3 relative z-10 flex items-center justify-center gap-1.5"
            >
              <span>{ctaButtonText}</span>
              {copiedKey === "cta-btn" && <span className="text-[10px] bg-slate-950 text-white px-1.5 py-0.5 rounded">Copié</span>}
            </button>

            {/* Reassurance text */}
            <p className="text-[10px] text-slate-400 text-center leading-tight relative z-10 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{reassuranceText}</span>
            </p>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            Aperçu interactif haute conversion de votre Paywall.
          </p>
        </div>
      </div>
    </div>
  );
}
