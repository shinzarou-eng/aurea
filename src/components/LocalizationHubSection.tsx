import { useState } from "react";
import { 
  Globe, 
  Star, 
  Copy, 
  Check, 
  Download, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2,
  ExternalLink,
  Flag
} from "lucide-react";
import { MarketingSession, MultiMarketPlan, LocalizedMarketData } from "../types";
import { generateDefaultMultiMarketPlan } from "../utils/localizationDefaults";

interface LocalizationHubSectionProps {
  session: MarketingSession;
  onRefine?: (sectionKey: string, content: any) => void;
  onUpdateMarkets?: (plan: MultiMarketPlan) => void;
}

export default function LocalizationHubSection({
  session,
  onRefine,
  onUpdateMarkets,
}: LocalizationHubSectionProps) {
  const [marketPlan, setMarketPlan] = useState<MultiMarketPlan>(() => {
    return session.multiMarketPlan || generateDefaultMultiMarketPlan(session);
  });

  const [selectedMarketCode, setSelectedMarketCode] = useState<string>("US");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const activeMarket: LocalizedMarketData = marketPlan.markets[selectedMarketCode] || marketPlan.markets["US"];
  const appName = session.appOverview?.detectedName || "Notre App";

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadAllMarketsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(marketPlan, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `localization-metadata-${appName.toLowerCase().replace(/[^a-z0-9]/g, "")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Apple App Store keyword string length calculation
  const keywordsString = activeMarket.keywords.join(",");
  const keywordsLength = keywordsString.length;

  return (
    <section id="section-localization-hub" className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden mb-8">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-teal-100/50 via-emerald-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6 relative">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Module International & ASO Global
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Adaptation culturelle & linguistique pour 5 marchés clés
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Hub de Localisation Internationale Multi-Marchés
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Métadonnées App Store, mots-clés 100 caractères, arguments de vente et nuances culturelles spécifiques par pays.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadAllMarketsJson}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter Pack Localisation (.JSON)</span>
          </button>

          {onRefine && (
            <button
              onClick={() => onRefine("localizedAso", activeMarket)}
              className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 text-teal-600" />
              <span>Affiner</span>
            </button>
          )}
        </div>
      </div>

      {/* Country Market Switcher Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        {Object.values(marketPlan.markets).map((m) => {
          const isSelected = selectedMarketCode === m.marketCode;
          return (
            <button
              key={m.marketCode}
              onClick={() => setSelectedMarketCode(m.marketCode)}
              className={`px-4 py-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 shrink-0 ${
                isSelected
                  ? "border-teal-600 bg-teal-50/70 ring-1 ring-teal-500 shadow-2xs text-teal-950 font-bold"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
              }`}
            >
              <span className="text-xl">{m.flag}</span>
              <div>
                <div className="text-xs leading-tight">{m.marketName}</div>
                <div className="text-[10px] text-slate-400 font-normal">{m.languageName} • {m.priceFormatted.split("(")[0]}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Market Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Localized App Store Metadata (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>Fiche Store Locale ({activeMarket.languageName})</span>
              </span>

              <button
                onClick={() => handleCopy(JSON.stringify(activeMarket, null, 2), "market-json")}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                {copiedField === "market-json" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedField === "market-json" ? "Copié !" : "Copier tout le pack"}</span>
              </button>
            </div>

            {/* Title (Max 30 chars for iOS) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Titre App Store (Max 30 caractères) :
                </label>
                <span className={`text-[10px] font-mono ${activeMarket.storeTitle.length > 30 ? "text-rose-600 font-bold" : "text-slate-400"}`}>
                  {activeMarket.storeTitle.length}/30 car.
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={activeMarket.storeTitle}
                  className="w-full text-xs p-2.5 pr-16 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                />
                <button
                  onClick={() => handleCopy(activeMarket.storeTitle, "title")}
                  className="absolute right-2 top-2 px-2 py-1 rounded-md text-[10px] font-semibold text-teal-700 hover:bg-teal-50"
                >
                  {copiedField === "title" ? "Copié !" : "Copier"}
                </button>
              </div>
            </div>

            {/* Subtitle (Max 30 chars for iOS) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Sous-titre App Store (Max 30 caractères) :
                </label>
                <span className={`text-[10px] font-mono ${activeMarket.subtitle.length > 30 ? "text-rose-600 font-bold" : "text-slate-400"}`}>
                  {activeMarket.subtitle.length}/30 car.
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={activeMarket.subtitle}
                  className="w-full text-xs p-2.5 pr-16 rounded-xl border border-slate-300 bg-white text-slate-800"
                />
                <button
                  onClick={() => handleCopy(activeMarket.subtitle, "sub")}
                  className="absolute right-2 top-2 px-2 py-1 rounded-md text-[10px] font-semibold text-teal-700 hover:bg-teal-50"
                >
                  {copiedField === "sub" ? "Copié !" : "Copier"}
                </button>
              </div>
            </div>

            {/* Keywords field (Strictly <= 100 characters on Apple Store) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <span>Mots-clés Apple Store (Champ 100 car. strict) :</span>
                </label>
                <span className={`text-[10px] font-mono ${keywordsLength > 100 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}`}>
                  {keywordsLength}/100 caractères
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={keywordsString}
                  className="w-full text-xs p-2.5 pr-16 rounded-xl border border-slate-300 bg-white font-mono text-slate-700 text-[11px]"
                />
                <button
                  onClick={() => handleCopy(keywordsString, "kw")}
                  className="absolute right-2 top-2 px-2 py-1 rounded-md text-[10px] font-semibold text-teal-700 hover:bg-teal-50"
                >
                  {copiedField === "kw" ? "Copié !" : "Copier"}
                </button>
              </div>
            </div>

            {/* Short Description (Google Play) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Description courte (Google Play - 80 car.) :
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeMarket.shortDescription.length}/80 car.
                </span>
              </div>
              <div className="relative">
                <textarea
                  rows={2}
                  readOnly
                  value={activeMarket.shortDescription}
                  className="w-full text-xs p-2.5 pr-16 rounded-xl border border-slate-300 bg-white text-slate-700 resize-none"
                />
                <button
                  onClick={() => handleCopy(activeMarket.shortDescription, "desc")}
                  className="absolute right-2 top-2 px-2 py-1 rounded-md text-[10px] font-semibold text-teal-700 hover:bg-teal-50"
                >
                  {copiedField === "desc" ? "Copié !" : "Copier"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cultural Nuances & Strategic Poaching (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Cultural Nuances Card */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Nuances Culturelles & Pièges à Éviter :</span>
            </h4>
            <p className="text-xs text-amber-950 leading-relaxed">
              {activeMarket.culturalNuances}
            </p>
          </div>

          {/* Value Proposition in local context */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Proposition de Valeur Locale (USP) :</span>
            </h4>
            <p className="text-xs text-teal-950 font-medium italic leading-relaxed">
              « {activeMarket.localizedUsp} »
            </p>
          </div>

          {/* Poaching & Competitor Angle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <span>Angle d'Attaque Concurrence Locale :</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeMarket.poachingAngleLocal}
            </p>
          </div>

          {/* Pricing Convention Note */}
          <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Tarification recommandée :</span>
            <span className="font-bold text-slate-900">{activeMarket.priceFormatted}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
