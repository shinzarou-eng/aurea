import { useState, useMemo, useEffect } from "react";
import { MarketingSession } from "../types";
import { SimulatorGrowthInputs } from "../utils/okrDefaults";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Star,
  Target,
  Check
} from "lucide-react";

interface GrowthCalculatorSectionProps {
  session: MarketingSession;
  onSyncToOkr?: (metrics: SimulatorGrowthInputs) => void;
  onMetricsChange?: (metrics: SimulatorGrowthInputs) => void;
}

export default function GrowthCalculatorSection({ 
  session,
  onSyncToOkr,
  onMetricsChange
}: GrowthCalculatorSectionProps) {
  const [syncFeedback, setSyncFeedback] = useState(false);
  // Extract initial pricing from session if available
  const defaultPrice = useMemo(() => {
    const rawPrice = session.monetization?.pricingTiers?.[0]?.price;
    if (rawPrice) {
      const match = rawPrice.match(/(\d+[\.,]?\d*)/);
      if (match) return parseFloat(match[1].replace(",", "."));
    }
    return 9.99;
  }, [session]);

  // Interactive state
  const [monthlyInstalls, setMonthlyInstalls] = useState<number>(3000);
  const [cpi, setCpi] = useState<number>(1.60); // Cost per install in €
  const [paywallViewRate, setPaywallViewRate] = useState<number>(85); // % users who see paywall
  const [trialConversionRate, setTrialConversionRate] = useState<number>(7.5); // % who start trial
  const [trialToPaidRate, setTrialToPaidRate] = useState<number>(65); // % who convert to paid
  const [monthlySubscriptionPrice, setMonthlySubscriptionPrice] = useState<number>(defaultPrice);
  const [avgRetentionMonths, setAvgRetentionMonths] = useState<number>(6.5); // Avg lifetime months

  // Preset handlers
  const applyPreset = (preset: "indie" | "growth" | "scale") => {
    if (preset === "indie") {
      setMonthlyInstalls(1000);
      setCpi(1.40);
      setTrialConversionRate(8);
      setTrialToPaidRate(60);
    } else if (preset === "growth") {
      setMonthlyInstalls(5000);
      setCpi(1.70);
      setTrialConversionRate(7.5);
      setTrialToPaidRate(65);
    } else if (preset === "scale") {
      setMonthlyInstalls(20000);
      setCpi(2.10);
      setTrialConversionRate(7.0);
      setTrialToPaidRate(68);
    }
  };

  // Unit Economics Calculations
  const metrics = useMemo(() => {
    const totalAdBudget = monthlyInstalls * cpi;
    const usersSeeingPaywall = monthlyInstalls * (paywallViewRate / 100);
    const trialsStarted = usersSeeingPaywall * (trialConversionRate / 100);
    const newPayingSubscribers = trialsStarted * (trialToPaidRate / 100);
    
    // Overall Install-to-Paid conversion rate
    const installToPaidConversion = monthlyInstalls > 0 ? (newPayingSubscribers / monthlyInstalls) * 100 : 0;
    
    // Blended CAC (Cost to acquire 1 paying customer)
    const cac = newPayingSubscribers > 0 ? totalAdBudget / newPayingSubscribers : 0;
    
    // Customer Lifetime Value (LTV)
    const ltv = monthlySubscriptionPrice * avgRetentionMonths;
    
    // LTV : CAC Ratio
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;
    
    // Monthly Recurring Revenue added per month
    const addedMrr = newPayingSubscribers * monthlySubscriptionPrice;
    const addedArr = addedMrr * 12;

    // Payback period (months to break even on acquisition cost)
    const paybackMonths = monthlySubscriptionPrice > 0 ? cac / monthlySubscriptionPrice : 0;

    return {
      totalAdBudget,
      newPayingSubscribers: Math.round(newPayingSubscribers),
      installToPaidConversion,
      cac,
      ltv,
      ltvCacRatio,
      addedMrr,
      addedArr,
      paybackMonths,
    };
  }, [monthlyInstalls, cpi, paywallViewRate, trialConversionRate, trialToPaidRate, monthlySubscriptionPrice, avgRetentionMonths]);

  // Current inputs package for OKR synchronization
  const currentInputs: SimulatorGrowthInputs = useMemo(() => ({
    monthlyInstalls,
    cpi,
    paywallViewRate,
    trialConversionRate,
    trialToPaidRate,
    monthlySubscriptionPrice,
    newPayingSubscribers: metrics.newPayingSubscribers,
    addedMrr: metrics.addedMrr,
    cac: metrics.cac,
    ltv: metrics.ltv,
    ltvCacRatio: metrics.ltvCacRatio,
    totalAdBudget: metrics.totalAdBudget,
  }), [monthlyInstalls, cpi, paywallViewRate, trialConversionRate, trialToPaidRate, monthlySubscriptionPrice, metrics]);

  useEffect(() => {
    if (onMetricsChange) {
      onMetricsChange(currentInputs);
    }
  }, [currentInputs, onMetricsChange]);

  const handleSyncToOkr = () => {
    if (onSyncToOkr) {
      onSyncToOkr(currentInputs);
      setSyncFeedback(true);
      setTimeout(() => setSyncFeedback(false), 2500);
    }
  };

  return (
    <div id="section-growth-calculator" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              Module 13 • Simulateur Financier & ROI
            </span>
            <h3 className="text-lg font-bold text-slate-900">Calculateur de Budget d'Acquisition, CAC & LTV</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Modélisez en direct la rentabilité de votre acquisition payante (Apple Search Ads, Meta, TikTok) et vos prévisions de MRR.
          </p>
        </div>

        {/* Action Buttons & Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSyncToOkr && (
            <button
              onClick={handleSyncToOkr}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                syncFeedback
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
              title="Caler les indicateurs du module Objectifs OKR sur ces valeurs simulées"
            >
              {syncFeedback ? <Check className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{syncFeedback ? "OKRs Mis à Jour !" : "Transférer aux OKRs 30J"}</span>
            </button>
          )}

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 hidden md:inline">Profils :</span>
            <button
              onClick={() => applyPreset("indie")}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-800 shadow-2xs transition-colors"
            >
              Indie (1k)
            </button>
            <button
              onClick={() => applyPreset("growth")}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-800 shadow-2xs transition-colors"
            >
              Croissance (5k)
            </button>
            <button
              onClick={() => applyPreset("scale")}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-800 shadow-2xs transition-colors"
            >
              Scale (20k)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-6 space-y-4 bg-slate-50/70 p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Paramètres d'Acquisition & Entonnoir (Funnel)
          </span>

          {/* Monthly Installs */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium mb-1">
              <span className="text-slate-700">Volume de téléchargements cibles / mois :</span>
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                {monthlyInstalls.toLocaleString("fr-FR")} installs
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={50000}
              step={500}
              value={monthlyInstalls}
              onChange={(e) => setMonthlyInstalls(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Average CPI */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium mb-1">
              <span className="text-slate-700">Coût moyen par téléchargement (CPI) :</span>
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                {cpi.toFixed(2)} € / install
              </span>
            </div>
            <input
              type="range"
              min={0.4}
              max={5.0}
              step={0.1}
              value={cpi}
              onChange={(e) => setCpi(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Paywall View Rate */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                <span className="text-slate-600">Vu Paywall :</span>
                <span className="font-bold text-slate-800 font-mono">{paywallViewRate}%</span>
              </div>
              <input
                type="range"
                min={40}
                max={100}
                step={5}
                value={paywallViewRate}
                onChange={(e) => setPaywallViewRate(Number(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Trial conversion */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                <span className="text-slate-600">Opt-in Essai :</span>
                <span className="font-bold text-slate-800 font-mono">{trialConversionRate}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                step={0.5}
                value={trialConversionRate}
                onChange={(e) => setTrialConversionRate(Number(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Trial to paid retention */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                <span className="text-slate-600">Rétention Essai -&gt; Payé :</span>
                <span className="font-bold text-slate-800 font-mono">{trialToPaidRate}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={90}
                step={5}
                value={trialToPaidRate}
                onChange={(e) => setTrialToPaidRate(Number(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Price */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                <span className="text-slate-600">Prix Abonnement :</span>
                <span className="font-bold text-slate-800 font-mono">{monthlySubscriptionPrice.toFixed(2)} €/m</span>
              </div>
              <input
                type="range"
                min={2.99}
                max={29.99}
                step={1}
                value={monthlySubscriptionPrice}
                onChange={(e) => setMonthlySubscriptionPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Retention duration */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs font-medium mb-1">
              <span className="text-slate-700">Durée de vie moyenne client (LTV curve) :</span>
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                {avgRetentionMonths.toFixed(1)} mois
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={24}
              step={0.5}
              value={avgRetentionMonths}
              onChange={(e) => setAvgRetentionMonths(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Live Calculated Dashboard */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Total Budget Needed */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Budget Ads Requis
              </span>
              <span className="text-lg font-extrabold text-white font-mono mt-0.5 block">
                {Math.round(metrics.totalAdBudget).toLocaleString("fr-FR")} €
              </span>
              <span className="text-[10px] text-slate-400">/ mois</span>
            </div>

            {/* New Paying Subscribers */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Nouveaux Payants
              </span>
              <span className="text-lg font-extrabold text-emerald-950 font-mono mt-0.5 block">
                +{metrics.newPayingSubscribers.toLocaleString("fr-FR")}
              </span>
              <span className="text-[10px] text-emerald-700">abonnés / mois</span>
            </div>

            {/* Added MRR */}
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                MRR Généré
              </span>
              <span className="text-lg font-extrabold text-indigo-950 font-mono mt-0.5 block">
                +{Math.round(metrics.addedMrr).toLocaleString("fr-FR")} €
              </span>
              <span className="text-[10px] text-indigo-700 font-mono">ARR: ~{Math.round(metrics.addedArr).toLocaleString("fr-FR")} €</span>
            </div>
          </div>

          {/* Unit Economics Comparison: CAC vs LTV */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">Unit Economics & Ratio LTV / CAC</span>
              
              {/* Ratio Badge */}
              <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                metrics.ltvCacRatio >= 3.0
                  ? "bg-emerald-100 text-emerald-900"
                  : metrics.ltvCacRatio >= 2.0
                  ? "bg-amber-100 text-amber-900"
                  : "bg-rose-100 text-rose-900"
              }`}>
                {metrics.ltvCacRatio >= 3.0 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>Ratio {metrics.ltvCacRatio.toFixed(1)}x</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CAC Moyen</span>
                <span className="text-sm font-bold text-slate-900 font-mono">{metrics.cac.toFixed(2)} €</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LTV Estimée</span>
                <span className="text-sm font-bold text-emerald-700 font-mono">{metrics.ltv.toFixed(2)} €</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rentabilité (Payback)</span>
                <span className="text-sm font-bold text-slate-900 font-mono">{metrics.paybackMonths.toFixed(1)} mois</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {metrics.ltvCacRatio >= 3.0 ? (
                <span className="text-emerald-800 font-medium">
                  🟢 <strong>Rentabilité excellente :</strong> Chaque euro investi en publicité rapporte plus de 3 fois sa valeur sur la durée de vie de l'abonné. Vous pouvez scaler votre acquisition sereinement.
                </span>
              ) : metrics.ltvCacRatio >= 2.0 ? (
                <span className="text-amber-800 font-medium">
                  🟡 <strong>Modèle viable mais marge d'optimisation :</strong> Améliorez le taux de conversion du Paywall ou testez un forfait annuel à prix attractif pour rentabiliser l'acquisition plus rapidement.
                </span>
              ) : (
                <span className="text-rose-800 font-medium">
                  🔴 <strong>Attention au coût d'acquisition :</strong> Le CAC est trop proche de la LTV. Travaillez votre rétention, augmentez le prix ou renforcez le trafic organique (ASO & réseaux sociaux) pour faire baisser le coût blended.
                </span>
              )}
            </p>
          </div>

          {/* Recommended Channel Budget Allocation */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <PieChart className="w-3.5 h-3.5 text-indigo-600" />
              Répartition Recommandée du Budget Publicitaire :
            </span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="block font-bold text-slate-900">40%</span>
                <span className="text-[10px] text-slate-500">Meta Ads</span>
                <span className="text-[10px] text-emerald-700 font-mono block mt-0.5">
                  {Math.round(metrics.totalAdBudget * 0.40)} €
                </span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="block font-bold text-slate-900">35%</span>
                <span className="text-[10px] text-slate-500">Apple Search</span>
                <span className="text-[10px] text-emerald-700 font-mono block mt-0.5">
                  {Math.round(metrics.totalAdBudget * 0.35)} €
                </span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="block font-bold text-slate-900">15%</span>
                <span className="text-[10px] text-slate-500">TikTok Ads</span>
                <span className="text-[10px] text-emerald-700 font-mono block mt-0.5">
                  {Math.round(metrics.totalAdBudget * 0.15)} €
                </span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="block font-bold text-slate-900">10%</span>
                <span className="text-[10px] text-slate-500">Influence/UGC</span>
                <span className="text-[10px] text-emerald-700 font-mono block mt-0.5">
                  {Math.round(metrics.totalAdBudget * 0.10)} €
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
