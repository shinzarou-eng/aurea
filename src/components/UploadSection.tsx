import { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  Upload,
  Plus,
  X,
  Image as ImageIcon,
  Rocket,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Key,
  Trash2,
} from "lucide-react";
import { UploadedImage, PresetApp, EngineConfig } from "../types";
import { PRESET_APPS } from "../data/presets";

interface UploadSectionProps {
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  appName: string;
  setAppName: (name: string) => void;
  targetAudience: string;
  setTargetAudience: (aud: string) => void;
  tone: string;
  setTone: (tone: string) => void;
  pricingModel: string;
  setPricingModel: (pricing: string) => void;
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  onGenerate: () => void;
  engineConfig: EngineConfig;
  onOpenEngineSettings: () => void;
}

export default function UploadSection({
  images,
  setImages,
  appName,
  setAppName,
  targetAudience,
  setTargetAudience,
  tone,
  setTone,
  pricingModel,
  setPricingModel,
  isLoading,
  loadingStep,
  error,
  onGenerate,
  engineConfig,
  onOpenEngineSettings,
}: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [modalImage, setModalImage] = useState<UploadedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("Not an image"));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = async (files: FileList | null, replace = false) => {
    if (!files || files.length === 0) return;

    const currentIsAllPresets = images.length > 0 && images.every((img) => img.isPreset);
    const shouldReplace = replace || currentIsAllPresets;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    try {
      const dataUrls = await Promise.all(imageFiles.map(readFileAsDataUrl));
      const newImages: UploadedImage[] = dataUrls.map((dataUrl, i) => ({
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${i}`,
        name: imageFiles[i].name,
        dataUrl,
        previewUrl: dataUrl,
        tag: i === 0 ? "Accueil" : `Écran ${i + 1}`,
        isPreset: false,
      }));

      if (shouldReplace) {
        setImages(newImages);
        if (currentIsAllPresets) {
          setAppName("");
          setTargetAudience("");
        }
      } else {
        setImages((prev) => [
          ...prev,
          ...newImages.map((img, i) => ({
            ...img,
            tag: `Écran ${prev.length + i + 1}`,
          })),
        ]);
      }
    } catch {
      // ignore read errors
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files, true);
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files, true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const clearImages = () => setImages([]);

  const loadPreset = (preset: PresetApp) => {
    setImages(preset.images);
    setAppName(preset.name);
    setTargetAudience(preset.audience);
    setTone("Dynamique & Inspirant");
    setPricingModel("Freemium / Abonnement");
  };

  const providerDisplay = {
    gemini: `Google (${engineConfig.model || "gemini-3.8-flash"})`,
    deepseek: `DeepSeek (${engineConfig.model || "deepseek-flash"})`,
    openai: `OpenAI (${engineConfig.model || "gpt-5.5"})`,
    anthropic: `Anthropic (${engineConfig.model || "claude-sonnet-5"})`,
    groq: `Groq (${engineConfig.model || "llama-4-scout"})`,
    mistral: `Mistral (${engineConfig.model || "mistral-small-4"})`,
    openrouter: `OpenRouter (${engineConfig.model || "auto"})`,
    perplexity: `Perplexity (${engineConfig.model || "sonar-pro"})`,
    custom: `Custom (${engineConfig.model || "standard"})`,
  }[engineConfig.provider] || `Google (${engineConfig.model || "gemini-3.8-flash"})`;

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6 sm:p-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left column: upload + context + action */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              Photos & captures d'écran
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Jusqu'à 6 visuels de votre application. L'analyse porte sur le design, les flux et le concept.
            </p>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-slate-900 bg-slate-50"
                : "border-slate-300 hover:border-slate-500 bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileInputChange}
              multiple
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Glissez-déposez vos captures, ou <span className="underline decoration-slate-400 underline-offset-2">parcourez vos fichiers</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG ou WebP · max 15 Mo par image</p>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Exemples :</span>
            {PRESET_APPS.map((preset) => (
              <button
                key={preset.id}
                id={`btn-preset-${preset.id}`}
                onClick={() => loadPreset(preset)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
              >
                <ImageIcon className="w-3 h-3 text-slate-400" />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>

          {/* Context inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom de l'application</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="Ex: FitPulse Pro"
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900 placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Audience cible</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Sportifs, freelances, étudiants..."
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900 placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tonalité</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900"
              >
                <option value="Dynamique & Inspirant">Dynamique & Inspirant</option>
                <option value="Professionnel & Rassurant">Professionnel & Rassurant</option>
                <option value="Audacieux & Disruptif">Audacieux & Disruptif</option>
                <option value="Minimaliste & Zen">Minimaliste & Zen</option>
                <option value="Accessible & Chaleureux">Accessible & Chaleureux</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Modèle économique</label>
              <select
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900"
              >
                <option value="Freemium / In-App Purchases">Freemium / Achats intégrés</option>
                <option value="Abonnement mensuel/annuel">Abonnement (SaaS / App)</option>
                <option value="Application payante directe">Payante au téléchargement</option>
                <option value="100% Gratuit / Open Source">100% Gratuit</option>
              </select>
            </div>
          </div>

          {/* Engine status */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">Moteur actif</p>
                <p className="text-[11px] text-slate-500 truncate">{providerDisplay}</p>
              </div>
            </div>
            <button
              id="btn-quick-change-engine"
              type="button"
              onClick={onOpenEngineSettings}
              className="shrink-0 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Configurer</span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Une erreur est survenue</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            id="btn-start-marketing-session"
            disabled={images.length === 0 || isLoading}
            onClick={onGenerate}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              images.length === 0 || isLoading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 active:scale-[0.99]"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{loadingStep || "Analyse en cours..."}</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>Lancer la session marketing</span>
              </>
            )}
          </button>
        </div>

        {/* Right column: preview gallery */}
        <div className="lg:col-span-2">
          <div className="h-full min-h-[320px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Aperçu</h3>
              {images.length > 0 && (
                <button
                  onClick={clearImages}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Tout effacer
                </button>
              )}
            </div>

            {images.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-300">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 max-w-[200px]">
                  Les captures importées apparaîtront ici pour un aperçu rapide.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white aspect-[9/16] shadow-sm"
                  >
                    <img
                      src={img.previewUrl}
                      alt={img.name}
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalImage(img);
                        }}
                        className="w-7 h-7 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-colors"
                        title="Agrandir"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        id={`btn-remove-img-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        className="w-7 h-7 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                        title="Supprimer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-2.5 text-white">
                      <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-sm mb-0.5">
                        Écran {idx + 1}
                      </span>
                      <p className="text-[11px] font-medium truncate">{img.tag || img.name}</p>
                    </div>
                  </div>
                ))}

                {images.length < 6 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addMoreInputRef.current?.click();
                    }}
                    className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-2xl aspect-[9/16] flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white transition-all bg-white/50"
                  >
                    <input
                      type="file"
                      ref={addMoreInputRef}
                      onChange={(e) => {
                        handleFiles(e.target.files, false);
                        if (addMoreInputRef.current) addMoreInputRef.current.value = "";
                      }}
                      multiple
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                    />
                    <Plus className="w-5 h-5 mb-1" />
                    <span className="text-xs font-semibold">Ajouter</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image modal */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 p-2 text-white flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between px-3 py-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-semibold text-slate-300 truncate">{modalImage.name}</span>
              <button
                onClick={() => setModalImage(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={modalImage.previewUrl}
              alt={modalImage.name}
              className="max-h-[70vh] w-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
