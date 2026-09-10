import { useState, useRef, useEffect } from "react";
import { UploadedImage, ScreenshotCaption } from "../types";
import { Download, Star, Smartphone, Sliders, Check } from "lucide-react";
import confetti from "canvas-confetti";

interface MockupStudioProps {
  images: UploadedImage[];
  suggestedCaptions: ScreenshotCaption[];
  defaultAppName: string;
}

const BG_GRADIENTS = [
  { id: "dark-navy", name: "Midnight Navy", css: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", top: "#0F172A", bottom: "#1E293B", text: "#FFFFFF" },
  { id: "emerald", name: "Emerald Pro", css: "linear-gradient(135deg, #064E3B 0%, #0F172A 100%)", top: "#064E3B", bottom: "#0F172A", text: "#FFFFFF" },
  { id: "indigo", name: "Cyber Indigo", css: "linear-gradient(135deg, #312E81 0%, #1E1B4B 100%)", top: "#312E81", bottom: "#1E1B4B", text: "#FFFFFF" },
  { id: "sunset", name: "Warm Sunset", css: "linear-gradient(135deg, #7C2D12 0%, #18181B 100%)", top: "#7C2D12", bottom: "#18181B", text: "#FFFFFF" },
  { id: "clean-light", name: "Pure Minimal Light", css: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)", top: "#F8FAFC", bottom: "#E2E8F0", text: "#0F172A" },
];

export default function MockupStudio({ images, suggestedCaptions, defaultAppName }: MockupStudioProps) {
  const safeCaptions = suggestedCaptions || [];
  const safeImages = images || [];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [headline, setHeadline] = useState(safeCaptions[0]?.headline || "Votre application, réinventée");
  const [subheadline, setSubheadline] = useState(safeCaptions[0]?.subtext || "Simple, rapide et conçu pour votre quotidien");
  const [selectedBg, setSelectedBg] = useState(BG_GRADIENTS[0]);
  const [deviceColor, setDeviceColor] = useState<"dark" | "silver">("dark");
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentImage = safeImages[selectedImageIndex] || safeImages[0];

  // Update headline when captions change
  useEffect(() => {
    if (safeCaptions && safeCaptions.length > 0) {
      setHeadline(safeCaptions[0].headline);
      setSubheadline(safeCaptions[0].subtext);
    }
  }, [suggestedCaptions]);

  const applyCaption = (cap: ScreenshotCaption) => {
    setHeadline(cap.headline);
    setSubheadline(cap.subtext);
  };

  const handleDownloadMockup = () => {
    setIsExporting(true);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx || !currentImage) {
      setIsExporting(false);
      return;
    }

    const width = 1200;
    const height = 1600;
    canvas.width = width;
    canvas.height = height;

    // Draw background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, selectedBg.top);
    grad.addColorStop(1, selectedBg.bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient glow circle behind device
    const radialGlow = ctx.createRadialGradient(width / 2, height * 0.65, 50, width / 2, height * 0.65, 500);
    radialGlow.addColorStop(0, "rgba(255, 255, 255, 0.08)");
    radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, height);

    // Text configuration
    ctx.textAlign = "center";
    ctx.fillStyle = selectedBg.text;

    // Headline
    ctx.font = "bold 56px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(headline, width / 2, 140);

    // Subheadline
    ctx.font = "500 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = selectedBg.id === "clean-light" ? "#475569" : "#94A3B8";
    ctx.fillText(subheadline, width / 2, 205);

    // Phone Mockup Dimensions
    const phoneWidth = 620;
    const phoneHeight = 1280;
    const phoneX = (width - phoneWidth) / 2;
    const phoneY = 270;
    const borderRadius = 54;

    // Load image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Outer shadow
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
      ctx.shadowBlur = 60;
      ctx.shadowOffsetY = 30;

      // Phone Body
      ctx.beginPath();
      ctx.roundRect(phoneX, phoneY, phoneWidth, phoneHeight, borderRadius);
      ctx.fillStyle = deviceColor === "dark" ? "#18181B" : "#E2E8F0";
      ctx.fill();
      ctx.restore();

      // Phone Bezel Border
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(phoneX, phoneY, phoneWidth, phoneHeight, borderRadius);
      ctx.lineWidth = 14;
      ctx.strokeStyle = deviceColor === "dark" ? "#27272A" : "#CBD5E1";
      ctx.stroke();

      // Screen clipping
      const screenPadding = 14;
      const screenX = phoneX + screenPadding;
      const screenY = phoneY + screenPadding;
      const screenW = phoneWidth - screenPadding * 2;
      const screenH = phoneHeight - screenPadding * 2;
      const innerRadius = borderRadius - 10;

      ctx.beginPath();
      ctx.roundRect(screenX, screenY, screenW, screenH, innerRadius);
      ctx.clip();

      // Draw the app screenshot
      ctx.drawImage(img, screenX, screenY, screenW, screenH);

      // Dynamic Island / Speaker notch
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      const notchW = 150;
      const notchH = 34;
      ctx.roundRect(phoneX + (phoneWidth - notchW) / 2, phoneY + 22, notchW, notchH, 17);
      ctx.fillStyle = "#000000";
      ctx.fill();
      ctx.restore();

      // Trigger download
      const link = document.createElement("a");
      link.download = `mockup-${defaultAppName || "app"}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setIsExporting(false);

      // Confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {}
    };

    img.onerror = () => {
      setIsExporting(false);
      alert("Impossible de charger l'image pour le téléchargement.");
    };

    img.src = currentImage.dataUrl;
  };

  return (
    <div id="section-mockups" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              Module 10
            </span>
            <h3 className="text-lg font-bold text-slate-900">Studio de Maquettes Promotionnelles (Store Visuals)</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Générez des visuels de présentation prêts pour l'App Store, Product Hunt ou vos publicités en 1 clic.
          </p>
        </div>

        <button
          onClick={handleDownloadMockup}
          disabled={isExporting || !currentImage}
          className="text-xs px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm flex items-center gap-2"
        >
          {isExporting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Création PNG...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Télécharger le Visuel HD (PNG)</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customization Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Select Image */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              1. Choisir l'écran à mettre en valeur
            </label>
            <div className="grid grid-cols-4 gap-2">
              {safeImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`relative rounded-lg overflow-hidden aspect-9/16 border-2 transition-all ${
                    selectedImageIndex === i ? "border-emerald-500 scale-102 shadow-xs" : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.previewUrl} alt={img.name} className="w-full h-full object-cover object-top" />
                  {selectedImageIndex === i && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px]">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Suggested Headlines from ASO Module */}
          {safeCaptions.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                2. Titres d'accroche produits :
              </span>
              <div className="space-y-1.5">
                {safeCaptions.map((cap, i) => (
                  <button
                    key={i}
                    onClick={() => applyCaption(cap)}
                    className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs transition-colors flex items-start justify-between group"
                  >
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-emerald-700">{cap.headline}</p>
                      <p className="text-[11px] text-slate-500">{cap.subtext}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-semibold shrink-0 ml-2">
                      Appliquer
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Headline & Subheadline manual input */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Titre principal sur le visuel</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sous-titre descriptif</label>
              <input
                type="text"
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Background & Device Theme */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Arrière-plan du visuel</label>
              <div className="flex gap-2 flex-wrap">
                {BG_GRADIENTS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBg(bg)}
                    className={`h-8 px-3 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      selectedBg.id === bg.id ? "ring-2 ring-emerald-500 border-transparent shadow-xs" : "border-slate-200 opacity-80"
                    }`}
                    style={{ background: bg.css, color: bg.text }}
                  >
                    {selectedBg.id === bg.id && <Check className="w-3 h-3 shrink-0" />}
                    <span>{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Couleur du cadre smartphone</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeviceColor("dark")}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                    deviceColor === "dark" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  Gris Sidéral (Dark)
                </button>
                <button
                  onClick={() => setDeviceColor("silver")}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                    deviceColor === "silver" ? "bg-slate-200 text-slate-900 border-slate-300 font-bold" : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  Argenté (Silver)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mockup Canvas / Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div
            className="w-full max-w-[380px] rounded-3xl p-6 shadow-xl border border-slate-200/40 relative overflow-hidden transition-all"
            style={{ background: selectedBg.css }}
          >
            {/* Ambient inner radial light */}
            <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />

            {/* Title & Subtitle */}
            <div className="text-center mb-6 relative z-10">
              <h4
                className="font-extrabold text-lg leading-tight mb-1"
                style={{ color: selectedBg.text }}
              >
                {headline || "Titre de votre application"}
              </h4>
              <p
                className="text-xs font-medium"
                style={{ color: selectedBg.id === "clean-light" ? "#475569" : "#94A3B8" }}
              >
                {subheadline || "Sous-titre descriptif"}
              </p>
            </div>

            {/* Smartphone device frame */}
            <div className="relative mx-auto w-[240px] aspect-9/18 rounded-[36px] p-2.5 shadow-2xl transition-all"
                 style={{ backgroundColor: deviceColor === "dark" ? "#18181B" : "#E2E8F0", border: `3px solid ${deviceColor === "dark" ? "#27272A" : "#CBD5E1"}` }}>
              
              {/* Dynamic Island / Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20" />

              {/* Screen container */}
              <div className="w-full h-full rounded-[26px] overflow-hidden bg-black relative">
                {currentImage ? (
                  <img
                    src={currentImage.previewUrl}
                    alt="App Screenshot"
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                    Aucune capture
                  </div>
                )}
              </div>
            </div>

            {/* Store Badge Preview */}
            <div className="mt-5 text-center relative z-10">
              <span className="inline-block text-[10px] font-semibold px-3 py-1 rounded-full bg-black/40 text-white backdrop-blur-xs border border-white/10">
                ⭐ Disponible sur iOS & Android
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 text-center">
            Aperçu haute fidélité. Cliquez sur "Télécharger le Visuel HD" pour exporter le fichier PNG prêt à publier.
          </p>
        </div>
      </div>
    </div>
  );
}
