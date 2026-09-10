import { useState } from "react";
import { 
  CreditCard, 
  Crown, 
  Star, 
  Check, 
  Copy, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  Flame, 
  X, 
  Clock, 
  TrendingUp,
  Code,
  CheckCircle2,
  Lock,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { MarketingSession, CustomPaywallConfig, PaywallLayoutType, PaywallTheme } from "../types";
import { generateDefaultPaywallConfig } from "../utils/paywallDefaults";

interface PaywallStudioSectionProps {
  session: MarketingSession;
  onRefine?: (sectionKey: string, content: any) => void;
  onUpdatePaywall?: (config: CustomPaywallConfig) => void;
}

export default function PaywallStudioSection({
  session,
  onRefine,
  onUpdatePaywall,
}: PaywallStudioSectionProps) {
  const [config, setConfig] = useState<CustomPaywallConfig>(() => {
    return session.customPaywall || generateDefaultPaywallConfig(session);
  });

  const appName = session.appOverview?.detectedName || "Notre App";
  const [selectedTier, setSelectedTier] = useState<number>(config.selectedTierIndex || 0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [codeLanguage, setCodeLanguage] = useState<"react_native" | "swift_ui" | "flutter">("react_native");

  const updateConfig = (updates: Partial<CustomPaywallConfig>) => {
    const next = { ...config, ...updates };
    setConfig(next);
    onUpdatePaywall?.(next);
  };

  // Pricing models
  const pricingOptions = [
    {
      id: "yearly",
      name: "Annuel (Offre Star)",
      price: "39,99 € / an",
      equivalent: "3,33 € / mois",
      badge: "ÉCONOMISEZ 60%",
      trial: "7 jours gratuits",
    },
    {
      id: "monthly",
      name: "Mensuel (Sans engagement)",
      price: "8,99 € / mois",
      equivalent: "Facturé chaque mois",
      badge: undefined,
      trial: "Sans essai",
    },
    {
      id: "lifetime",
      name: "Accès à Vie (Unique)",
      price: "89,99 €",
      equivalent: "Paiement unique à vie",
      badge: "ACHAT UNIQUE",
      trial: "Aucun abonnement",
    },
  ];

  // Theme styling helpers
  const getThemeClasses = (theme: PaywallTheme) => {
    switch (theme) {
      case "dark_luxury":
        return {
          bg: "bg-slate-950 text-white",
          headerColor: "text-white",
          subColor: "text-slate-400",
          cardBg: "bg-slate-900/90 border-slate-800 text-white",
          cardActiveBg: "bg-gradient-to-b from-purple-950/60 to-slate-900 border-purple-500 shadow-purple-500/20",
          ctaBtn: "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20",
          timelineBg: "bg-slate-900/80 border-slate-800",
          accentBadge: "bg-amber-400/20 text-amber-300 border-amber-400/40",
        };
      case "clean_light":
        return {
          bg: "bg-white text-slate-900",
          headerColor: "text-slate-950",
          subColor: "text-slate-500",
          cardBg: "bg-slate-50 border-slate-200 text-slate-900",
          cardActiveBg: "bg-blue-50/70 border-blue-600 shadow-blue-500/10",
          ctaBtn: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20",
          timelineBg: "bg-slate-50 border-slate-200",
          accentBadge: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "vibrant_gradient":
        return {
          bg: "bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white",
          headerColor: "text-white",
          subColor: "text-purple-200",
          cardBg: "bg-white/10 backdrop-blur-md border-white/10 text-white",
          cardActiveBg: "bg-white/20 border-white/40 shadow-xl ring-2 ring-purple-400",
          ctaBtn: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-purple-500/30",
          timelineBg: "bg-white/10 border-white/10",
          accentBadge: "bg-pink-500/30 text-pink-200 border-pink-400/40",
        };
      case "minimal_slate":
        return {
          bg: "bg-slate-900 text-slate-100",
          headerColor: "text-white",
          subColor: "text-slate-400",
          cardBg: "bg-slate-800/80 border-slate-700 text-slate-200",
          cardActiveBg: "bg-slate-800 border-emerald-500 shadow-lg",
          ctaBtn: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20",
          timelineBg: "bg-slate-800/60 border-slate-700",
          accentBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        };
    }
  };

  const themeStyle = getThemeClasses(config.theme);

  // Generated code snippets for developers
  const getCodeSnippet = (lang: string) => {
    if (lang === "react_native") {
      return `// React Native / Expo with RevenueCat (Purchases)
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Purchases from 'react-native-purchases';

export default function MobilePaywall({ onClose, onSubscribed }) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // 1. Fetch current offering from RevenueCat
      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current[selectedPlan]) {
        const { customerInfo } = await Purchases.purchasePackage(offerings.current[selectedPlan]);
        if (customerInfo.entitlements.active['pro']) {
          onSubscribed?.();
        }
      }
    } catch (e) {
      if (!e.userCancelled) console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>${config.headline}</Text>
      <Text style={styles.subheadline}>${config.subheadline}</Text>
      {/* Plan selection & Purchase Button */}
      <TouchableOpacity onPress={handlePurchase} style={styles.ctaButton}>
        <Text style={styles.ctaText}>${config.ctaButtonText}</Text>
      </TouchableOpacity>
    </View>
  );
}`;
    } else if (lang === "swift_ui") {
      return `// SwiftUI StoreKit 2 Implementation
import SwiftUI
import StoreKit

struct AppPaywallView: View {
    @Environment(\\.dismiss) var dismiss
    @State private var selectedProduct: Product?

    var body: some View {
        SubscriptionStoreView(groupID: "pro_group") {
            VStack(spacing: 12) {
                Text("${config.headline}")
                    .font(.title2.bold())
                    .multilineTextAlignment(.center)
                Text("${config.subheadline}")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .subscriptionStoreControlStyle(.picker)
        .storeButton(.visible, for: .restorePurchases)
    }
}`;
    } else {
      return `// Flutter Purchases implementation
import 'package:flutter/material.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

class MobilePaywallScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              Text('${config.headline}', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              SizedBox(height: 8),
              Text('${config.subheadline}'),
              Spacer(),
              ElevatedButton(
                onPressed: () => /* trigger purchase */ null,
                child: Text('${config.ctaButtonText}'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`;
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(codeLanguage);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section id="section-paywall-studio" className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden mb-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Module Monétisation & CRO
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Simulateur en direct de conversion In-App
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Studio & Prévisualisateur de Paywall Mobile
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulez, personnalisez et exportez des écrans de vente testés pour maximiser le taux de conversion d'essai gratuit.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Code className="w-3.5 h-3.5 text-slate-600" />
            <span>Exporter Code Mobile</span>
          </button>

          {onRefine && (
            <button
              onClick={() => onRefine("monetization", config)}
              className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 text-amber-600" />
              <span>Affiner</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Controls Left (7 cols) & Phone Live Preview Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Customization Studio Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Architecture Layout Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Architecture & Stratégie du Paywall :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "trial_timeline", label: "Essai Timeline", desc: "Le plus convertissant" },
                { id: "hard_paywall", label: "Hard Paywall", desc: "Post-onboarding direct" },
                { id: "soft_freemium", label: "Soft Freemium", desc: "Avec croix de fermeture" },
                { id: "comparison_table", label: "Grille vs Gratuit", desc: "Comparatif complet" },
              ].map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => updateConfig({ layout: layout.id as PaywallLayoutType })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    config.layout === layout.id
                      ? "border-amber-500 bg-amber-50/60 ring-1 ring-amber-500 text-amber-950 font-bold shadow-2xs"
                      : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  <div className="text-xs">{layout.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{layout.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Thème Visuel & Palette :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "dark_luxury", label: "Dark Luxury", swatch: "bg-slate-950 border-amber-400" },
                { id: "clean_light", label: "Apple Light", swatch: "bg-white border-slate-300" },
                { id: "vibrant_gradient", label: "Vibrant Indigo", swatch: "bg-gradient-to-r from-purple-700 to-indigo-700 border-white" },
                { id: "minimal_slate", label: "Slate Minimal", swatch: "bg-slate-800 border-emerald-400" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateConfig({ theme: t.id as PaywallTheme })}
                  className={`p-2 rounded-xl border flex items-center gap-2 transition-all text-xs font-semibold ${
                    config.theme === t.id
                      ? "border-amber-500 bg-amber-50/50 ring-1 ring-amber-500 text-slate-900"
                      : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border shadow-2xs shrink-0 ${t.swatch}`} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Headline & Subheadline Editor */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <span>Textes & Arguments de Vente :</span>
            </h4>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Titre d'accroche du Paywall :
              </label>
              <input
                type="text"
                value={config.headline}
                onChange={(e) => updateConfig({ headline: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-amber-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Sous-titre explicatif :
              </label>
              <input
                type="text"
                value={config.subheadline}
                onChange={(e) => updateConfig({ subheadline: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-amber-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Badge promotionnel :
                </label>
                <input
                  type="text"
                  value={config.badgeText}
                  onChange={(e) => updateConfig({ badgeText: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Bouton d'action principal (CTA) :
                </label>
                <input
                  type="text"
                  value={config.ctaButtonText}
                  onChange={(e) => updateConfig({ ctaButtonText: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Trial Timeline Toggle */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Timeline de Transparence Essai Gratuit (7 Jours)
                </span>
                <span className="text-[10px] text-slate-500">
                  {"Affiche la timeline : Aujourd'hui → J-2 Rappel → J+7 Premier Débit"}
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              checked={config.showTrialTimeline}
              onChange={(e) => updateConfig({ showTrialTimeline: e.target.checked })}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Side: LIVE SMARTPHONE PAYWALL MOCKUP (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-center mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Aperçu en Direct sur Smartphone
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-[320px] h-[640px] rounded-[48px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col justify-between overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-24 h-6 bg-black rounded-full flex items-center justify-end px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            </div>

            {/* Paywall Container Canvas */}
            <div className={`relative z-10 w-full h-full rounded-[38px] p-4 flex flex-col justify-between overflow-y-auto no-scrollbar ${themeStyle.bg}`}>
              {/* Top Navigation / Close Button */}
              <div className="flex items-center justify-between pt-6 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${themeStyle.accentBadge}`}>
                  {config.badgeText}
                </span>

                {config.layout === "soft_freemium" && (
                  <button className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Paywall Header */}
              <div className="text-center my-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg mx-auto mb-2 shadow-md">
                  <Crown className="w-5 h-5" />
                </div>
                <h4 className={`text-base font-black leading-tight ${themeStyle.headerColor}`}>
                  {config.headline}
                </h4>
                <p className={`text-[11px] mt-1 leading-snug ${themeStyle.subColor}`}>
                  {config.subheadline}
                </p>
              </div>

              {/* Value Bullet points */}
              <div className="space-y-1.5 my-2">
                {config.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-[11px] leading-tight opacity-90">{feat.text}</span>
                  </div>
                ))}
              </div>

              {/* Trial Timeline (If active) */}
              {config.showTrialTimeline && config.layout === "trial_timeline" && (
                <div className={`my-2 p-2.5 rounded-xl border text-[10px] space-y-1.5 ${themeStyle.timelineBg}`}>
                  <div className="flex items-start gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <strong className="block text-emerald-400">Aujourd'hui : Accès Illimité</strong>
                      <span className="opacity-75">Profitez de toutes les fonctionnalités Pro sans payer.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      !
                    </div>
                    <div>
                      <strong className="block text-amber-300">Dans 5 jours : Notification de Rappel</strong>
                      <span className="opacity-75">Un email vous prévient 48h avant la fin de l'essai.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-500 text-white font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      ★
                    </div>
                    <div>
                      <strong className="block opacity-90">Dans 7 jours : Début de l'abonnement</strong>
                      <span className="opacity-75">Annulable en 1 clic avant cette date.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing Cards Selector */}
              <div className="space-y-1.5 my-2">
                {pricingOptions.map((tier, idx) => {
                  const isSelected = selectedTier === idx;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(idx)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected ? themeStyle.cardActiveBg : themeStyle.cardBg
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-amber-400 bg-amber-400" : "border-slate-400"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold">{tier.name}</span>
                            {tier.badge && (
                              <span className="text-[8px] font-black uppercase px-1 rounded bg-amber-400 text-slate-950">
                                {tier.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] opacity-70 block">{tier.equivalent}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black">{tier.price}</span>
                        <span className="text-[9px] opacity-70 block text-emerald-400 font-semibold">{tier.trial}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <div className="mt-2 space-y-1.5">
                <button className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-1.5 ${themeStyle.ctaBtn}`}>
                  <span>{config.ctaButtonText}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <p className="text-[9px] text-center opacity-60 leading-tight">
                  {config.billingTermsText}
                </p>
              </div>

              {/* Reassurance Footer */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-around text-[8px] opacity-70 text-center">
                <span>🛡️ Annulation en 1 clic</span>
                <span>•</span>
                <span>🔒 Paiement Sécurisé</span>
                <span>•</span>
                <span>⭐️ Restaurer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Export Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Code Mobile Prêt à l'Emploi
                </h4>
              </div>
              <button
                onClick={() => setIsCodeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex items-center gap-2 mb-3">
              {[
                { id: "react_native", label: "React Native / Expo (RevenueCat)" },
                { id: "swift_ui", label: "SwiftUI (StoreKit 2)" },
                { id: "flutter", label: "Flutter (Purchases)" },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setCodeLanguage(lang.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    codeLanguage === lang.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed">
                {getCodeSnippet(codeLanguage)}
              </pre>
              <button
                onClick={() => handleCopyCode(getCodeSnippet(codeLanguage))}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                {copiedCode === codeLanguage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === codeLanguage ? "Copié !" : "Copier"}</span>
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsCodeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
