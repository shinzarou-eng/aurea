import { useState, useRef } from "react";
import { 
  Palette, 
  Star, 
  Download, 
  Copy, 
  Check, 
  Smartphone, 
  Share2, 
  Flame, 
  Layers, 
  Type, 
  ExternalLink,
  Eye,
  Sliders
} from "lucide-react";
import { MarketingSession, AdCreativeTemplate, AdFormatType } from "../types";
import { generateDefaultAdCreatives } from "../utils/adCreativeDefaults";

interface AdCreativesSectionProps {
  session: MarketingSession;
  onRefine?: (sectionKey: string, content: any) => void;
  onUpdateCreatives?: (creatives: AdCreativeTemplate[]) => void;
}

export default function AdCreativesSection({
  session,
  onRefine,
  onUpdateCreatives,
}: AdCreativesSectionProps) {
  const [creatives, setCreatives] = useState<AdCreativeTemplate[]>(() => {
    return session.adCreatives || generateDefaultAdCreatives(session);
  });

  const [selectedFormat, setSelectedFormat] = useState<AdFormatType>("story_9_16");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Background style presets
  const bgThemes = [
    { id: "dark_purple", label: "Néon Violet", grad: "from-purple-900 via-slate-950 to-black", text: "text-white" },
    { id: "emerald_glow", label: "Émeraude Pro", grad: "from-emerald-950 via-slate-900 to-teal-950", text: "text-white" },
    { id: "sunset_orange", label: "Sunset Énergie", grad: "from-amber-600 via-rose-700 to-slate-950", text: "text-white" },
    { id: "midnight_blue", label: "Bleu Nuit Tech", grad: "from-blue-950 via-slate-900 to-indigo-950", text: "text-white" },
    { id: "clean_white", label: "Blanc Minimal", grad: "from-slate-50 to-slate-100", text: "text-slate-900" },
  ];

  const [activeTheme, setActiveTheme] = useState(bgThemes[0]);

  const activeCreative = creatives.find((c) => c.format === selectedFormat) || creatives[0];
  const appName = session.appOverview?.detectedName || "Notre App";

  const handleUpdateActive = (updates: Partial<AdCreativeTemplate>) => {
    const next = creatives.map((c) => (c.id === activeCreative.id ? { ...c, ...updates } : c));
    setCreatives(next);
    onUpdateCreatives?.(next);
  };

  const handleCopyAdCopy = () => {
    const text = `Titre d'accroche : ${activeCreative.hookHeadline}\nTexte principal : ${activeCreative.subtext}\nAppel à l'action : ${activeCreative.ctaText}\nPreuve sociale : ${activeCreative.appRatingText || "⭐️ 4.9/5"}`;
    navigator.clipboard.writeText(text);
    setCopiedId(activeCreative.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSvg = () => {
    // Generate a downloadable SVG representation of the creative
    const width = selectedFormat === "story_9_16" ? 1080 : selectedFormat === "feed_1_1" ? 1080 : selectedFormat === "landscape_16_9" ? 1920 : 1200;
    const height = selectedFormat === "story_9_16" ? 1920 : selectedFormat === "feed_1_1" ? 1080 : selectedFormat === "landscape_16_9" ? 1080 : 800;

    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3B0764"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <text x="${width/2}" y="${height * 0.2}" font-family="-apple-system, sans-serif" font-size="${width * 0.05}" font-weight="900" fill="#F8FAFC" text-anchor="middle">
    ${activeCreative.hookHeadline}
  </text>
  <text x="${width/2}" y="${height * 0.28}" font-family="-apple-system, sans-serif" font-size="${width * 0.03}" fill="#CBD5E1" text-anchor="middle">
    ${activeCreative.subtext}
  </text>
  <rect x="${width/2 - 180}" y="${height * 0.85}" width="360" height="80" rx="40" fill="#10B981"/>
  <text x="${width/2}" y="${height * 0.85 + 50}" font-family="-apple-system, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF" text-anchor="middle">
    ${activeCreative.ctaText}
  </text>
</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-${appName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${selectedFormat}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="section-ad-creatives" className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Module Créatifs & Bannières Publicitaires
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Meta Ads, TikTok, Google UAC & App Store
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Générateur de Bannières & Visuels Publicitaires
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Composez des visuels d'annonces haute conversion adaptés aux formats Story 9:16, Carré 1:1 et Paysage 16:9.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadSvg}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger l'Asset Vectoriel (SVG)</span>
          </button>

          <button
            onClick={handleCopyAdCopy}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            {copiedId === activeCreative.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedId === activeCreative.id ? "Copié !" : "Copier le texte publicitaire"}</span>
          </button>

          {onRefine && (
            <button
              onClick={() => onRefine("advertisingAngles", activeCreative)}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 text-rose-600" />
              <span>Affiner</span>
            </button>
          )}
        </div>
      </div>

      {/* Format Selector Pills */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: "story_9_16", label: "Format Story 9:16", desc: "TikTok / Reels / Shorts", ratio: "Aspect 9:16" },
          { id: "feed_1_1", label: "Format Carré 1:1", desc: "Instagram & Meta Feed", ratio: "Aspect 1:1" },
          { id: "landscape_16_9", label: "Format Paysage 16:9", desc: "Google UAC / Twitter / X", ratio: "Aspect 16:9" },
          { id: "feature_banner_3_2", label: "Bannière Store 3:2", desc: "App Store Feature Banner", ratio: "Aspect 3:2" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFormat(f.id as AdFormatType)}
            className={`p-2.5 rounded-2xl border text-left transition-all shrink-0 ${
              selectedFormat === f.id
                ? "border-rose-500 bg-rose-50/60 ring-1 ring-rose-500 shadow-2xs"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${selectedFormat === f.id ? "text-rose-950" : "text-slate-800"}`}>
                {f.label}
              </span>
              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                {f.ratio}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{f.desc}</div>
          </button>
        ))}
      </div>

      {/* Main Studio Grid: Controls Left (6 cols), Visual Canvas Right (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Text and Style Editor (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-rose-600" />
              <span>Contenu Textuel de l'Annonce :</span>
            </h4>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Accroche principale (Hook Headline) :
              </label>
              <textarea
                rows={2}
                value={activeCreative.hookHeadline}
                onChange={(e) => handleUpdateActive({ hookHeadline: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-rose-500 resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Sous-texte explicatif (Primary Copy) :
              </label>
              <textarea
                rows={2}
                value={activeCreative.subtext}
                onChange={(e) => handleUpdateActive({ subtext: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-rose-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Bouton CTA :
                </label>
                <input
                  type="text"
                  value={activeCreative.ctaText}
                  onChange={(e) => handleUpdateActive({ ctaText: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Badge de mise en avant :
                </label>
                <input
                  type="text"
                  value={activeCreative.badgeText}
                  onChange={(e) => handleUpdateActive({ badgeText: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Background Gradient Palette */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Ambiance & Dégradé d'Arrière-Plan :
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {bgThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeTheme.id === theme.id
                      ? "border-rose-500 ring-1 ring-rose-500 bg-rose-50/50 text-slate-950 font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${theme.grad} border shadow-2xs`} />
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Concept prompt note */}
          {activeCreative.aiPromptIdea && (
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs">
              <strong className="text-purple-900 font-bold block mb-1 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-purple-700" />
                Prompt de conception visuelle :
              </strong>
              <p className="text-[11px] text-purple-800 font-mono italic leading-relaxed">
                "{activeCreative.aiPromptIdea}"
              </p>
            </div>
          )}
        </div>

        {/* Right Side: LIVE AD CREATIVE CANVAS (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="text-center mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Aperçu en Direct du Visuel Publicitaire
            </span>
          </div>

          {/* Dynamic Aspect Ratio Canvas Container */}
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border-4 border-slate-800 relative flex flex-col justify-between overflow-hidden bg-gradient-to-b ${activeTheme.grad} ${activeTheme.text} transition-all`}
            style={{
              minHeight: selectedFormat === "story_9_16" ? "560px" : selectedFormat === "feed_1_1" ? "380px" : "320px",
            }}
          >
            {/* Top Badge & Rating */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider border border-white/30 text-white shadow-2xs">
                {activeCreative.badgeText}
              </span>

              {activeCreative.appRatingText && (
                <div className="flex items-center gap-1 text-[10px] font-bold bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-amber-300">
                  <span>{activeCreative.appRatingText}</span>
                </div>
              )}
            </div>

            {/* Middle: Headline & App Mockup Framing */}
            <div className="relative z-10 my-auto text-center space-y-3 py-4">
              <h3 className="text-xl md:text-2xl font-black leading-tight tracking-tight drop-shadow-md text-white">
                {activeCreative.hookHeadline}
              </h3>

              <p className="text-xs leading-relaxed opacity-90 max-w-xs mx-auto drop-shadow-xs">
                {activeCreative.subtext}
              </p>

              {/* Floating Phone or App Card Visual */}
              <div className="mx-auto w-48 p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-left space-y-2 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-md">
                    {appName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white">{appName}</span>
                    <span className="text-[9px] opacity-70 block text-slate-200">Téléchargement gratuit</span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-3/4 rounded-full" />
                </div>
              </div>
            </div>

            {/* Bottom CTA Bar */}
            <div className="relative z-10 space-y-2 pt-3 border-t border-white/10 text-center">
              <button className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-95">
                <span>{activeCreative.ctaText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-center gap-3 text-[9px] opacity-75">
                <span> App Store</span>
                <span>•</span>
                <span>Google Play</span>
                <span>•</span>
                <span>Sans engagement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
