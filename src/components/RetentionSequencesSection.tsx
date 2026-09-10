import { useState } from "react";
import { 
  Bell, 
  Mail, 
  Star, 
  Copy, 
  Check, 
  Smartphone, 
  Clock, 
  Target, 
  Flame, 
  ShieldCheck, 
  Award,
  ChevronRight,
  Send,
  Volume2,
  ExternalLink,
  RotateCcw
} from "lucide-react";
import Markdown from "react-markdown";
import { MarketingSession, RetentionSequencePlan, PushNotificationItem, OnboardingEmailItem } from "../types";
import { generateDefaultRetentionPlan } from "../utils/retentionDefaults";

interface RetentionSequencesSectionProps {
  session: MarketingSession;
  onRefine?: (sectionKey: string, content: any) => void;
  onUpdatePlan?: (plan: RetentionSequencePlan) => void;
}

export default function RetentionSequencesSection({
  session,
  onRefine,
  onUpdatePlan,
}: RetentionSequencesSectionProps) {
  const plan: RetentionSequencePlan = session.retentionSequence || generateDefaultRetentionPlan(session);
  const appName = session.appOverview?.detectedName || "Notre App";

  const [activeTab, setActiveTab] = useState<"push" | "email" | "strategy">("push");
  const [selectedPushIndex, setSelectedPushIndex] = useState<number>(0);
  const [selectedEmailIndex, setSelectedEmailIndex] = useState<number>(0);
  const [phoneOs, setPhoneOs] = useState<"ios" | "android">("ios");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activePush: PushNotificationItem = plan.pushNotifications[selectedPushIndex] || plan.pushNotifications[0];
  const activeEmail: OnboardingEmailItem = plan.emails[selectedEmailIndex] || plan.emails[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "activation":
        return { label: "Activation J+0", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "habit":
        return { label: "Habitude quotidienne", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "paywall":
        return { label: "Conversion Paywall", bg: "bg-amber-50 text-amber-700 border-amber-200" };
      case "retention":
        return { label: "Rétention D7/D14", bg: "bg-purple-50 text-purple-700 border-purple-200" };
      case "winback":
        return { label: "Parrainage & Churn", bg: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { label: cat, bg: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  return (
    <section id="section-retention" className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden mb-8">
      {/* Decorative Accent Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/50 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6 relative">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Module Rétention & Cycle de Vie
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Objectif : Booster la rétention D7/D30 & l'activation
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Séquences Push Notifications & Emails d'Onboarding
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulateur interactif écran verrouillé (iOS & Android) et parcours de réactivation automatisé J+0 à J+30.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {onRefine && (
            <button
              onClick={() => onRefine("retentionSequence", plan)}
              className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 text-blue-600" />
              <span>Affiner</span>
            </button>
          )}

          <button
            onClick={() => handleCopy(JSON.stringify(plan, null, 2), "plan-full")}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            {copiedId === "plan-full" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedId === "plan-full" ? "Copié !" : "Exporter JSON (OneSignal/Braze)"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("push")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "push"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Simulateur Push Écran Verrouillé ({plan.pushNotifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("email")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "email"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Séquence Emails d'Activation ({plan.emails.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("strategy")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "strategy"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Stratégie & Règles de Rétention</span>
        </button>
      </div>

      {/* TAB 1: PUSH NOTIFICATIONS SIMULATOR */}
      {activeTab === "push" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Timeline List (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Parcours chronologique des notifications :
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                Cliquez pour prévisualiser sur l'écran
              </span>
            </div>

            <div className="space-y-2.5">
              {plan.pushNotifications.map((notif, idx) => {
                const isSelected = selectedPushIndex === idx;
                const badge = getCategoryBadge(notif.category);
                return (
                  <div
                    key={notif.id}
                    onClick={() => setSelectedPushIndex(idx)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-1 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {notif.triggerTiming}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 mb-1">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.body}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {notif.recommendedTimeOfDay || "Conseillé"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3 h-3 text-slate-400" />
                          Son : {notif.sound}
                        </span>
                      </div>

                      <span className="text-blue-700 font-semibold flex items-center gap-0.5 group-hover:underline">
                        Tester <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Phone Mockup Lockscreen Simulator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Phone OS Toggle */}
            <div className="flex items-center gap-2 mb-3 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setPhoneOs("ios")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  phoneOs === "ios" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                iPhone (iOS 18)
              </button>
              <button
                onClick={() => setPhoneOs("android")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  phoneOs === "android" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                Pixel (Android 15)
              </button>
            </div>

            {/* Smartphone Canvas */}
            <div className="w-[300px] h-[580px] rounded-[44px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col justify-between overflow-hidden">
              {/* Dynamic Island or Camera Punch Hole */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                {phoneOs === "ios" ? (
                  <div className="w-24 h-6 bg-black rounded-full flex items-center justify-end px-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80" />
                  </div>
                ) : (
                  <div className="w-3.5 h-3.5 bg-black rounded-full" />
                )}
              </div>

              {/* Wallpaper Background */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 opacity-95" />

              {/* Lock Screen Content */}
              <div className="relative z-10 pt-14 text-center text-white">
                <span className="text-[11px] font-medium text-slate-300 uppercase tracking-widest block">
                  Vendredi 12 Septembre
                </span>
                <div className="text-5xl font-extralight tracking-tight font-sans mt-0.5 text-white/95">
                  09:41
                </div>

                {/* Focus indicator or lock icon */}
                <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Notification active</span>
                </div>
              </div>

              {/* PUSH NOTIFICATION CARD (Animated on selection) */}
              <div className="relative z-10 px-1 my-auto">
                <div className="rounded-2xl p-3.5 bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl text-slate-900 transition-all transform hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                        {appName.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="text-[11px] font-bold tracking-tight text-slate-900">
                        {appName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      maintenant
                    </span>
                  </div>

                  <h5 className="text-xs font-black text-slate-900 leading-snug">
                    {activePush.title}
                  </h5>
                  <p className="text-[11px] text-slate-700 leading-relaxed mt-1">
                    {activePush.body}
                  </p>

                  {activePush.actionButton && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex justify-end">
                      <button className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-2xs flex items-center gap-1">
                        <span>{activePush.actionButton}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Target Strategy Note */}
                <div className="mt-3 p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/80 text-[10px] text-left leading-tight">
                  <strong className="text-blue-300 font-bold block mb-0.5">🎯 Déclencheur tactique :</strong>
                  {activePush.goal}
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="relative z-10 pb-2 flex flex-col items-center gap-2">
                <span className="text-[9px] text-white/50 tracking-wider uppercase font-semibold">
                  Balayer pour déverrouiller
                </span>
                <div className="w-28 h-1 bg-white/70 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ONBOARDING EMAILS */}
      {activeTab === "email" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Email Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Séquence d'activation par email :
            </h4>

            <div className="space-y-2">
              {plan.emails.map((email, idx) => {
                const isSelected = selectedEmailIndex === idx;
                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmailIndex(idx)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md">
                        {email.triggerTiming}
                      </span>
                      <span className="text-[10px] text-slate-400">Email #{idx + 1}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {email.subject}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {email.previewText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Email Previewer Client (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            {/* Email Client Header Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-slate-400 text-[11px] ml-2 font-mono">Boîte de réception • Client Email</span>
                </div>

                <button
                  onClick={() => handleCopy(activeEmail.bodyMarkdown, activeEmail.id)}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                >
                  {copiedId === activeEmail.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === activeEmail.id ? "Copié !" : "Copier le texte"}</span>
                </button>
              </div>

              <div className="space-y-1 pt-1">
                <div>
                  <strong className="text-slate-500">De :</strong>{" "}
                  <span className="text-slate-900 font-semibold">{activeEmail.senderName} &lt;contact@{appName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&gt;</span>
                </div>
                <div>
                  <strong className="text-slate-500">Objet :</strong>{" "}
                  <span className="text-slate-900 font-bold">{activeEmail.subject}</span>
                </div>
                <div>
                  <strong className="text-slate-500">Pré-en-tête :</strong>{" "}
                  <span className="text-slate-600 italic">{activeEmail.previewText}</span>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="p-6 md:p-8 max-w-xl mx-auto space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-base shadow-xs mb-2">
                {appName.slice(0, 1).toUpperCase()}
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                {activeEmail.heading}
              </h2>

              <div className="prose prose-slate prose-sm text-slate-700 leading-relaxed">
                <div className="markdown-body">
                  <Markdown>{activeEmail.bodyMarkdown}</Markdown>
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2">
                  <span>{activeEmail.ctaText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STRATEGY & BEST PRACTICES */}
      {activeTab === "strategy" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
              Synthèse de la stratégie rétention D7 / D30 :
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              {plan.strategySummary}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plan.bestPracticesTips.map((tip, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
