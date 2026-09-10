import { useState, useMemo, useRef } from "react";
import {
  PenLine,
  X,
  Send,
  Copy,
  Check,
  AlertCircle,
  BookOpen,
  Flame,
  Target,
  Zap,
  Share2,
  Plus,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import Markdown from "react-markdown";
import { EngineConfig } from "../types";
import { parseApiResponse } from "../utils/parseApiResponse";
import { SMART_PROMPTS, SMART_PROMPT_CATEGORIES, SmartPrompt } from "../data/smartPrompts";

interface RefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionKey: string;
  currentContent: any;
  language: "fr" | "en";
  engineConfig?: EngineConfig;
}

export default function RefineModal({
  isOpen,
  onClose,
  sectionKey,
  currentContent,
  language,
  engineConfig,
}: RefineModalProps) {
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revisedContent, setRevisedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Smart Prompt Library States
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [insertionMode, setInsertionMode] = useState<"replace" | "append">("replace");
  const [lastAppliedPrompt, setLastAppliedPrompt] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filtered smart prompts
  const filteredPrompts = useMemo(() => {
    if (activeCategory === "all") return SMART_PROMPTS;
    return SMART_PROMPTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  if (!isOpen) return null;

  // Handles clicking a Smart Prompt button to adjust the input
  const handleApplySmartPrompt = (promptItem: SmartPrompt, executeImmediately = false) => {
    const promptText = language === "en" ? promptItem.promptEn : promptItem.promptFr;

    let nextValue = promptText;
    if (insertionMode === "append" && instructions.trim().length > 0) {
      nextValue = `${instructions.trim()}\n\n[Consigne additionnelle] : ${promptText}`;
    }

    setInstructions(nextValue);
    setLastAppliedPrompt(promptItem.label);

    // Focus textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Place cursor at the end
        textareaRef.current.selectionStart = textareaRef.current.value.length;
        textareaRef.current.selectionEnd = textareaRef.current.value.length;
      }
    }, 50);

    if (executeImmediately) {
      handleRefine(nextValue);
    }
  };

  const handleRefine = async (customPrompt?: string) => {
    const promptToUse = customPrompt || instructions;
    if (!promptToUse.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/marketing/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey,
          currentContent,
          userInstructions: promptToUse,
          language,
          engineConfig,
        }),
      });

      const data = await parseApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la révision");
      }

      setRevisedContent(data.revisedContent);
    } catch (err: any) {
      setError(err.message || "Impossible de contacter le moteur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (revisedContent) {
      navigator.clipboard.writeText(revisedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 md:p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <PenLine className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {language === "en" ? "Refine" : "Affiner"}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {sectionKey}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {language === "en"
                  ? "Select a Smart Prompt to instantly adjust inputs or write your custom instructions."
                  : "Sélectionnez un Smart Prompt pour ajuster la consigne en un clic ou rédigez librement."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* SMART PROMPT LIBRARY ACCORDION / CONTAINER */}
          <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-slate-50 to-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-emerald-100 text-emerald-800">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Smart Prompt Library</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    ({SMART_PROMPTS.length} ajustements d'experts)
                  </span>
                </h4>
              </div>

              {/* Insertion Mode Switcher */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                <span>Action clic :</span>
                <button
                  type="button"
                  onClick={() => setInsertionMode("replace")}
                  className={`px-1.5 py-0.5 rounded font-semibold transition-colors ${
                    insertionMode === "replace"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Remplacer
                </button>
                <button
                  type="button"
                  onClick={() => setInsertionMode("append")}
                  className={`px-1.5 py-0.5 rounded font-semibold transition-colors ${
                    insertionMode === "append"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Ajouter à la suite de votre texte actuel"
                >
                  + Combiner
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2.5 scrollbar-none">
              {SMART_PROMPT_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                      isActive
                        ? "bg-slate-900 text-white font-bold shadow-2xs"
                        : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                    }`}
                  >
                    {cat.id === "tone" && <Flame className="w-3 h-3 text-amber-500" />}
                    {cat.id === "audience" && <Target className="w-3 h-3 text-purple-500" />}
                    {cat.id === "conversion" && <Zap className="w-3 h-3 text-emerald-500" />}
                    {cat.id === "platform" && <Share2 className="w-3 h-3 text-blue-500" />}
                    <span>{language === "en" ? cat.labelEn : cat.labelFr}</span>
                  </button>
                );
              })}
            </div>

            {/* Smart Prompt Interactive Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredPrompts.map((prompt) => {
                const isRecentlyApplied = lastAppliedPrompt === prompt.label;
                return (
                  <div
                    key={prompt.id}
                    className={`group relative p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isRecentlyApplied
                        ? "border-emerald-500 bg-emerald-50/70 shadow-2xs"
                        : "border-slate-200/90 bg-white hover:border-emerald-400 hover:bg-slate-50/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <button
                          type="button"
                          onClick={() => handleApplySmartPrompt(prompt, false)}
                          className="font-bold text-xs text-slate-800 group-hover:text-emerald-800 transition-colors text-left flex-1"
                        >
                          "{prompt.label}"
                        </button>

                        {prompt.badge && (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                            {prompt.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                        {prompt.description}
                      </p>
                    </div>

                    {/* Bottom Action Bar for this Prompt */}
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleApplySmartPrompt(prompt, false)}
                        className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                      >
                        {isRecentlyApplied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Appliqué</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Insérer</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleApplySmartPrompt(prompt, true)}
                        className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                        title="Remplir et lancer directement"
                      >
                        <span>⚡ Lancer</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Notification when prompt is applied */}
            {lastAppliedPrompt && (
              <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-100/70 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  Consigne ajustée avec le Smart Prompt : <strong>"{lastAppliedPrompt}"</strong>
                </span>
                <span className="text-[10px] text-emerald-700">
                  Prêt à envoyer ou modifiable ci-dessous
                </span>
              </div>
            )}
          </div>

          {/* CUSTOM PROMPT INPUT / ADJUSTED INSTRUCTIONS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>Consigne d'ajustement envoyée à le moteur :</span>
              </label>

              {instructions.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setInstructions("");
                    setLastAppliedPrompt(null);
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Effacer</span>
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={
                  language === "en"
                    ? "Click any Smart Prompt above or type specific instructions (e.g., Target Gen Z, make it punchier for TikTok)..."
                    : "Cliquez sur un Smart Prompt ci-dessus ou écrivez votre demande (ex: Fais-moi 3 variantes plus agressives pour TikTok)..."
                }
                className="w-full text-xs p-3 pr-24 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none text-slate-900 bg-white leading-relaxed transition-all shadow-2xs"
              />

              <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRefine()}
                  disabled={isSubmitting || !instructions.trim()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 text-white transition-all ${
                    isSubmitting || !instructions.trim()
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Révision...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Générer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Revised Content Display */}
          {revisedContent && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4.5 flex flex-col shadow-2xs">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-800">
                    Proposition révisée par{" "}
                    {engineConfig?.provider ? engineConfig.provider.toUpperCase() : "Aurea"} :
                  </span>
                </div>

                <button
                  onClick={handleCopy}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copié !" : "Copier le texte"}</span>
                </button>
              </div>

              <div className="text-xs text-slate-800 leading-relaxed font-sans max-h-72 overflow-y-auto">
                <div className="markdown-body">
                  <Markdown>{revisedContent}</Markdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2 shrink-0">
          <span className="text-[11px] text-slate-400">
            {engineConfig?.model ? `Modèle actif : ${engineConfig.model}` : "Moteur multi-modèles"}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
