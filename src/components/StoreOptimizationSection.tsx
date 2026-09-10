import { useState, useMemo } from "react";
import { AppStoreOptimization, LocalizedAso, EngineConfig } from "../types";
import { 
  Copy, 
  Check, 
  Star, 
  Smartphone, 
  Hash, 
  Globe, 
  Gauge, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw 
} from "lucide-react";
import Markdown from "react-markdown";

interface StoreOptimizationSectionProps {
  aso: AppStoreOptimization;
  engineConfig?: EngineConfig;
  onRefine: (sectionKey: string, content: any) => void;
  localizedAso?: Record<string, LocalizedAso>;
  onUpdateLocalizedAso?: (lang: string, data: LocalizedAso) => void;
}

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English (US)", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

export default function StoreOptimizationSection({ 
  aso, 
  engineConfig,
  onRefine,
  localizedAso = {},
  onUpdateLocalizedAso
}: StoreOptimizationSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"copy" | "international" | "screenshots">("copy");
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [isLocalizing, setIsLocalizing] = useState(false);
  const [localMap, setLocalMap] = useState<Record<string, LocalizedAso>>(localizedAso);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Live ASO Health Score calculation
  const asoAudit = useMemo(() => {
    let score = 0;
    const checks: { label: string; pass: boolean; note: string }[] = [];

    // Title check (ideal 15 to 30 chars)
    const titleLen = (aso?.storeTitle || "").length;
    const titlePass = titleLen >= 12 && titleLen <= 30;
    score += titlePass ? 25 : (titleLen > 0 && titleLen < 12 ? 15 : 10);
    checks.push({
      label: "Titre Store (12-30 car.)",
      pass: titlePass,
      note: `${titleLen}/30 caractères`,
    });

    // Subtitle check (ideal 15 to 30 chars)
    const subLen = (aso?.subtitle || "").length;
    const subPass = subLen >= 15 && subLen <= 30;
    score += subPass ? 25 : (subLen > 0 ? 15 : 0);
    checks.push({
      label: "Sous-titre accrocheur (15-30 car.)",
      pass: subPass,
      note: `${subLen}/30 caractères`,
    });

    // Short description check (ideal 40 to 80 chars)
    const shortLen = (aso?.shortDescription || "").length;
    const shortPass = shortLen >= 30 && shortLen <= 80;
    score += shortPass ? 20 : (shortLen > 0 ? 10 : 0);
    checks.push({
      label: "Description courte Google Play",
      pass: shortPass,
      note: `${shortLen}/80 caractères`,
    });

    // Keywords density check
    const kwCount = (aso?.keywords || []).length;
    const kwPass = kwCount >= 4;
    score += kwPass ? 15 : 8;
    checks.push({
      label: "Mots-clés ASO stratégiques",
      pass: kwPass,
      note: `${kwCount} mots-clés indexés`,
    });

    // Full description depth
    const descLen = (aso?.fullDescription || "").length;
    const descPass = descLen >= 200;
    score += descPass ? 15 : 8;
    checks.push({
      label: "Description complète riche & structurée",
      pass: descPass,
      note: `${descLen} caractères avec puces`,
    });

    return { score: Math.min(100, score), checks };
  }, [aso]);

  // Handle instant localization
  const handleLocalize = async (langCode: string) => {
    setIsLocalizing(true);
    try {
      const res = await fetch("/api/marketing/localize-aso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aso,
          targetLanguage: langCode,
          engineConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.localized) {
        setLocalMap((prev) => ({ ...prev, [langCode]: data.localized }));
        if (onUpdateLocalizedAso) onUpdateLocalizedAso(langCode, data.localized);
      }
    } catch (err) {
      console.error("Erreur lors de la localisation :", err);
    } finally {
      setIsLocalizing(false);
    }
  };

  const activeLocalized = localMap[selectedLang] || {
    storeTitle: selectedLang === "en" ? `${aso?.storeTitle || "App"} - Mobile Experience` : aso?.storeTitle || "",
    subtitle: selectedLang === "en" ? "Fast, Simple & Secure" : aso?.subtitle || "",
    shortDescription: selectedLang === "en" ? "The modern mobile solution to simplify your life." : aso?.shortDescription || "",
    keywords: selectedLang === "en" ? ["mobile app", "fast", "tracker", "productivity", "best tools"] : aso?.keywords || [],
  };

  return (
    <div id="section-aso" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              Module 5
            </span>
            <h3 className="text-lg font-bold text-slate-900">ASO : Fiches App Store & Google Play</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Optimisez le référencement naturel, la visibilité de recherche et le taux de conversion sur les magasins d'applications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle View */}
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab("copy")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "copy" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"
              }`}
            >
              Fiche Store
            </button>
            <button
              onClick={() => setActiveTab("international")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                activeTab === "international" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"
              }`}
            >
              <Globe className="w-3 h-3 text-indigo-500" />
              <span>Multi-Langues</span>
            </button>
            <button
              onClick={() => setActiveTab("screenshots")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "screenshots" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"
              }`}
            >
              Titres Captures
            </button>
          </div>

          <button
            onClick={() => onRefine("App Store Optimization", aso)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Affiner</span>
          </button>
        </div>
      </div>

      {/* Live ASO Audit Bar */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-extrabold text-lg shadow-2xs ${
            asoAudit.score >= 85 
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : asoAudit.score >= 70
              ? "bg-blue-100 text-blue-800 border border-blue-300"
              : "bg-amber-100 text-amber-800 border border-amber-300"
          }`}>
            {asoAudit.score}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">Score de Qualité ASO :</span>
              <span className={`text-xs font-extrabold ${asoAudit.score >= 85 ? "text-emerald-700" : "text-blue-700"}`}>
                {asoAudit.score >= 85 ? "Excellent (Store-Ready)" : "Très Bon (Optimisé)"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Mesure en temps réel du respect des limites App Store & Google Play et de la densité de mots-clés.
            </p>
          </div>
        </div>

        {/* Audit Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {asoAudit.checks.map((chk, idx) => (
            <span 
              key={idx}
              className={`text-[10px] font-semibold px-2 py-1 rounded-md border flex items-center gap-1 ${
                chk.pass 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {chk.pass ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-amber-600" />}
              <span>{chk.label}</span>
            </span>
          ))}
        </div>
      </div>

      {activeTab === "copy" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Metadata Inputs */}
          <div className="lg:col-span-5 space-y-4">
            {/* Store Title */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Titre App Store (max 30 car.)</span>
                <span className={`text-[11px] font-mono ${(aso?.storeTitle || "").length > 30 ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                  {(aso?.storeTitle || "").length}/30
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{aso?.storeTitle || "Mon Application"}</span>
                <button
                  onClick={() => copyToClipboard(aso?.storeTitle || "", "title")}
                  className="text-xs text-slate-500 hover:text-slate-900 p-1"
                  title="Copier le titre"
                >
                  {copiedKey === "title" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Subtitle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Sous-titre iOS (max 30 car.)</span>
                <span className={`text-[11px] font-mono ${(aso?.subtitle || "").length > 30 ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                  {(aso?.subtitle || "").length}/30
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">{aso?.subtitle || ""}</span>
                <button
                  onClick={() => copyToClipboard(aso?.subtitle || "", "sub")}
                  className="text-xs text-slate-500 hover:text-slate-900 p-1"
                  title="Copier le sous-titre"
                >
                  {copiedKey === "sub" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Short Description */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Description Courte Google Play (max 80 car.)</span>
                <span className={`text-[11px] font-mono ${(aso?.shortDescription || "").length > 80 ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                  {(aso?.shortDescription || "").length}/80
                </span>
              </div>
              <div className="flex items-start justify-between">
                <p className="text-xs text-slate-700 leading-relaxed pr-2">{aso?.shortDescription || ""}</p>
                <button
                  onClick={() => copyToClipboard(aso?.shortDescription || "", "shortDesc")}
                  className="text-xs text-slate-500 hover:text-slate-900 p-1 shrink-0"
                  title="Copier la description courte"
                >
                  {copiedKey === "shortDesc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Keywords */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2.5">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  Mots-clés ASO Stratégiques
                </span>
                <button
                  onClick={() => copyToClipboard((aso?.keywords || []).join(", "), "keywords")}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {copiedKey === "keywords" ? "Copié !" : "Copier la liste"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(aso?.keywords || []).map((kw, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Full Store Description */}
          <div className="lg:col-span-7">
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 h-full flex flex-col">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
                <span className="font-semibold text-slate-700">Description Complète Optimisée (Conversion & SEO)</span>
                <button
                  onClick={() => copyToClipboard(aso?.fullDescription || "", "fullDesc")}
                  className="text-xs px-2.5 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1 shadow-2xs"
                >
                  {copiedKey === "fullDesc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "fullDesc" ? "Copié !" : "Copier tout le texte"}</span>
                </button>
              </div>

              <div className="grow bg-white rounded-lg p-4 border border-slate-200 overflow-y-auto max-h-[420px] text-xs text-slate-700 leading-relaxed font-sans prose prose-slate prose-xs">
                <Markdown>{aso?.fullDescription || ""}</Markdown>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "international" ? (
        /* Multi-Language Internationalization Tab */
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <div>
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 mb-0.5">
                <Globe className="w-4 h-4 text-indigo-600" />
                Localisation Internationale des Stores
              </span>
              <p className="text-xs text-indigo-800">
                Générez des fiches traduites et adaptées aux intentions de recherche des marchés anglophones, hispanophones, germaniques et asiatiques.
              </p>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-indigo-200 shadow-2xs">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    selectedLang === lang.code
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="hidden md:inline">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Localized content display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Titre Traduit & Adapté</span>
                <button
                  onClick={() => copyToClipboard(activeLocalized.storeTitle, "loc-title")}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  {copiedKey === "loc-title" ? "Copié !" : "Copier"}
                </button>
              </div>
              <p className="text-sm font-bold text-slate-900">{activeLocalized.storeTitle}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700">Sous-titre Localisé</span>
                <button
                  onClick={() => copyToClipboard(activeLocalized.subtitle, "loc-sub")}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  {copiedKey === "loc-sub" ? "Copié !" : "Copier"}
                </button>
              </div>
              <p className="text-xs font-semibold text-slate-800">{activeLocalized.subtitle}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700">Description Courte</span>
                <button
                  onClick={() => copyToClipboard(activeLocalized.shortDescription, "loc-short")}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  {copiedKey === "loc-short" ? "Copié !" : "Copier"}
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{activeLocalized.shortDescription}</p>
            </div>

            {/* Localized keywords */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Mots-clés ASO Locaux</span>
                  <button
                    onClick={() => copyToClipboard(activeLocalized.keywords.join(", "), "loc-kw")}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    {copiedKey === "loc-kw" ? "Copié !" : "Copier la liste"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {activeLocalized.keywords.map((k, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-800 font-medium">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleLocalize(selectedLang)}
                  disabled={isLocalizing}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLocalizing ? "animate-spin" : ""}`} />
                  <span>{isLocalizing ? "Traduction en cours..." : `Régénérer la version ${LANGUAGES.find(l => l.code === selectedLang)?.label} avec le moteur`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Screenshots Recommendations Tab */
        <div>
          <p className="text-xs text-slate-600 mb-4">
            Sur l'App Store et Google Play, 70% des utilisateurs téléchargent une application uniquement sur la base des visuels et des gros titres en haut de chaque capture. Voici les textes recommandés pour votre galerie :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(aso?.screenshotCaptions || []).map((cap, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      Capture {cap.screenNumber || i + 1}
                    </span>
                    <button
                      onClick={() => copyToClipboard(`${cap.headline} - ${cap.subtext}`, `screen-${i}`)}
                      className="text-slate-400 hover:text-slate-700"
                      title="Copier"
                    >
                      {copiedKey === `screen-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{cap.headline}</h4>
                  <p className="text-xs text-slate-600">{cap.subtext}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  <span>À placer au sommet de l'image</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
