import { useState } from "react";
import { 
  Key, 
  Settings2, 
  Check, 
  AlertCircle, 
  X, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Cpu, 
  ShieldCheck,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { EngineConfig, EngineProviderType } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: EngineConfig;
  onSaveConfig: (newConfig: EngineConfig) => void;
}

const PROVIDERS: {
  id: EngineProviderType;
  name: string;
  badge: string;
  description: string;
  models: { id: string; name: string; tag?: string }[];
  keyPrefixPlaceholder: string;
  keyHelpUrl: string;
  keyHelpLabel: string;
}[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    badge: "Vision native & rapide",
    description: "Analyse visuelle haute performance de vos captures d'écran et réponses instantanées.",
    models: [
      { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", tag: "Par défaut & rapide" },
      { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash", tag: "Codage & agents" },
      { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", tag: "Raisonnement profond" },
      { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite", tag: "Ultra-léger" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", tag: "Capacité maximale" },
    ],
    keyPrefixPlaceholder: "Votre clé Google (laisser vide pour la clé du serveur)",
    keyHelpUrl: "https://makersuite.google.com/app/apikey",
    keyHelpLabel: "Obtenir une clé API Google (Gratuit)",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    badge: "V4.1 Flash natif",
    description: "Nouvelle architecture multimodale native, rapide et économique, idéale pour l'analyse visuelle.",
    models: [
      { id: "deepseek-flash", name: "DeepSeek-V4.1 Flash", tag: "Par défaut & multimodal" },
      { id: "deepseek-reasoner", name: "DeepSeek-R1 Reasoner", tag: "Raisonnement avancé" },
      { id: "deepseek-chat", name: "DeepSeek-V3 Chat", tag: "Polyvalent" },
    ],
    keyPrefixPlaceholder: "sk-...",
    keyHelpUrl: "https://platform.deepseek.com/api_keys",
    keyHelpLabel: "Obtenir une clé API DeepSeek",
  },
  {
    id: "openai",
    name: "OpenAI",
    badge: "GPT-5.5 & o-series",
    description: "Modèles de pointe avec vision, raisonnement et rédaction professionnelle.",
    models: [
      { id: "gpt-5.5", name: "GPT-5.5", tag: "Par défaut & haut de gamme" },
      { id: "gpt-5.4", name: "GPT-5.4", tag: "Rapide & abordable" },
      { id: "gpt-5.4-mini", name: "GPT-5.4 mini", tag: "Compacité & vision" },
      { id: "o3", name: "o3", tag: "Raisonnement complexe" },
      { id: "o4-mini", name: "o4-mini", tag: "Raisonnement agile" },
    ],
    keyPrefixPlaceholder: "sk-proj-... ou sk-...",
    keyHelpUrl: "https://platform.openai.com/api-keys",
    keyHelpLabel: "Obtenir une clé API OpenAI",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    badge: "Claude 5",
    description: "Excellence en copywriting, nuances littéraires et raisonnement profond.",
    models: [
      { id: "claude-sonnet-5", name: "Claude Sonnet 5", tag: "Par défaut & polyvalent" },
      { id: "claude-opus-5", name: "Claude Opus 5", tag: "Qualité supérieure" },
      { id: "claude-fable-5-1", name: "Claude Fable 5.1", tag: "Codage & agents" },
    ],
    keyPrefixPlaceholder: "sk-ant-api03-...",
    keyHelpUrl: "https://console.anthropic.com/settings/keys",
    keyHelpLabel: "Obtenir une clé API Anthropic",
  },
  {
    id: "groq",
    name: "Groq (LPU)",
    badge: "LPU ultra-rapide",
    description: "Inférence fulgurante sur puces LPU avec Llama 4, Qwen3 et Kimi K2.",
    models: [
      { id: "meta-llama/llama-4-maverick-17b-128e-instruct", name: "Llama 4 Maverick", tag: "Qualité & vitesse" },
      { id: "meta-llama/llama-4-scout-17b-16e-instruct", name: "Llama 4 Scout", tag: "Léger & rapide" },
      { id: "moonshotai/kimi-k2-instruct-0905", name: "Kimi K2", tag: "Long contexte" },
      { id: "qwen/qwen3-32b", name: "Qwen3 32B", tag: "Multilingue" },
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", tag: "Stable & éprouvé" },
    ],
    keyPrefixPlaceholder: "gsk_...",
    keyHelpUrl: "https://console.groq.com/keys",
    keyHelpLabel: "Obtenir une clé API Groq (Gratuit)",
  },
  {
    id: "mistral",
    name: "Mistral",
    badge: "Européen & multimodal",
    description: "Modèles ouverts et performants, avec vision native et un excellent français.",
    models: [
      { id: "mistral-small-4", name: "Mistral Small 4", tag: "Par défaut & multimodal" },
      { id: "mistral-medium-3-5", name: "Mistral Medium 3.5", tag: "Frontière & codage" },
      { id: "pixtral-large-latest", name: "Pixtral Large", tag: "Vision native" },
    ],
    keyPrefixPlaceholder: "...",
    keyHelpUrl: "https://console.mistral.ai/api-keys/",
    keyHelpLabel: "Obtenir une clé API Mistral",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    badge: "400+ modèles",
    description: "Routeur unifié vers les derniers modèles Gemini, Claude, Llama 4 et DeepSeek.",
    models: [
      { id: "google/gemini-3.8-flash", name: "Gemini 3.8 Flash", tag: "Vision & vitesse" },
      { id: "anthropic/claude-sonnet-5", name: "Claude Sonnet 5", tag: "Polyvalent" },
      { id: "meta-llama/llama-4-maverick-17b-128e-instruct", name: "Llama 4 Maverick", tag: "Open-weights d'élite" },
      { id: "deepseek/deepseek-flash", name: "DeepSeek-V4.1 Flash", tag: "Rapide & économique" },
      { id: "openrouter/auto", name: "Auto Router", tag: "Choix automatique" },
    ],
    keyPrefixPlaceholder: "sk-or-v1-...",
    keyHelpUrl: "https://openrouter.ai/keys",
    keyHelpLabel: "Obtenir une clé OpenRouter",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    badge: "Veille Web",
    description: "Réponses ancrées sur le web en temps réel pour la veille et la recherche.",
    models: [
      { id: "sonar-pro", name: "Sonar Pro", tag: "Recherche approfondie" },
      { id: "sonar-deep-research", name: "Sonar Deep Research", tag: "Étude poussée" },
      { id: "sonar-reasoning-pro", name: "Sonar Reasoning Pro", tag: "Raisonnement + web" },
      { id: "sonar", name: "Sonar", tag: "Réponses rapides" },
    ],
    keyPrefixPlaceholder: "pplx-...",
    keyHelpUrl: "https://www.perplexity.ai/settings/api",
    keyHelpLabel: "Obtenir une clé API Perplexity",
  },
  {
    id: "custom",
    name: "Passerelle Personnalisée",
    badge: "API standard",
    description: "Connectez n'importe quel proxy local (Ollama, LM Studio) ou passerelle compatible API standard.",
    models: [
      { id: "custom-model", name: "Modèle personnalisé", tag: "À spécifier" },
    ],
    keyPrefixPlaceholder: "sk-...",
    keyHelpUrl: "https://platform.openai.com/docs/api-reference",
    keyHelpLabel: "Documentation de l'API standard",
  },
];

// Helper to clean and sanitize API keys from copy-pasting issues (smart quotes, invisible non-ASCII chars)
function cleanKeyInput(val: string): string {
  if (!val) return "";
  let clean = val.trim();
  // Strip outer quotes / backticks / smart quotes
  clean = clean.replace(/^['"`’‘“”«»\s]+|['"`’‘“”«»\s]+$/g, "");
  // Replace smart quotes if present inside
  clean = clean.replace(/[\u2018\u2019\u201A\u201B]/g, "");
  clean = clean.replace(/[\u201C\u201D\u201E\u201F]/g, "");
  // Strip zero-width spaces, BOM, non-breaking space
  clean = clean.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "");
  // Remove non-ASCII characters that trigger ByteString errors
  clean = clean.replace(/[^\x21-\x7E]/g, "");
  return clean.trim();
}

export default function SettingsModal({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
}: SettingsModalProps) {
  const [provider, setProvider] = useState<EngineProviderType>(currentConfig.provider || "gemini");
  const [apiKey, setApiKey] = useState<string>(currentConfig.apiKey || "");
  const [model, setModel] = useState<string>(currentConfig.model || "gemini-3.8-flash");
  const [customEndpoint, setCustomEndpoint] = useState<string>(currentConfig.customEndpoint || "");
  const [showKey, setShowKey] = useState<boolean>(false);

  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const currentProviderData = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

  const handleProviderSelect = (newProvider: EngineProviderType) => {
    setProvider(newProvider);
    setTestResult(null);
    const pData = PROVIDERS.find((p) => p.id === newProvider);
    if (pData && pData.models.length > 0) {
      setModel(pData.models[0].id);
    }
  };

  const handleKeyChange = (val: string) => {
    // Automatically sanitize input when user pastes or types
    const cleaned = cleanKeyInput(val);
    setApiKey(cleaned);
    setTestResult(null);
  };

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    const sanitizedKey = cleanKeyInput(apiKey);

    try {
      const res = await fetch("/api/engine/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: sanitizedKey,
          model,
          customEndpoint: customEndpoint.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message || "Clé API validée avec succès !" });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Échec de validation de la clé API. Vérifiez vos crédits ou votre clé.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Erreur réseau lors de la validation.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const sanitizedKey = cleanKeyInput(apiKey);
    onSaveConfig({
      provider,
      apiKey: sanitizedKey,
      model,
      customEndpoint: customEndpoint.trim(),
    });
    onClose();
  };

  const handleResetToDefault = () => {
    setProvider("gemini");
    setApiKey("");
    setModel("gemini-3.8-flash");
    setCustomEndpoint("");
    setTestResult(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Key className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Fournisseur de modèle & Clé API</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  Personnalisable
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Utilisez le moteur de votre choix pour propulser l'analyse et la production marketing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Provider Selector Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              Choisissez votre modèle favorite
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PROVIDERS.map((p) => {
                const isSelected = provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderSelect(p.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        {p.name}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? "bg-emerald-600 text-white" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Modèle sélectionné
              </label>
              <span className="text-[11px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded">
                {model}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {currentProviderData.models.map((m) => {
                const isModelSelected = model === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModel(m.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isModelSelected
                        ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{m.name}</div>
                    {m.tag && (
                      <div className={`text-[10px] truncate ${isModelSelected ? "text-slate-300" : "text-slate-400"}`}>
                        {m.tag}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-2.5">
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ou saisissez un nom de modèle spécifique..."
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono text-slate-800 bg-slate-50/70"
              />
            </div>
          </div>

          {/* Custom Endpoint for Custom/OpenAI-compatible */}
          {provider === "custom" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                URL de l'Endpoint (Optionnel)
              </label>
              <input
                type="text"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="https://api.deepseek.com/v1/chat/completions"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono text-slate-800"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Laissez vide pour l'endpoint standard, ou saisissez l'URL de votre passerelle (DeepSeek, Groq, OpenRouter).
              </p>
            </div>
          )}

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span>Clé API Personnelle</span>
                {provider === "gemini" && !apiKey && (
                  <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Optionnelle (Clé serveur active)
                  </span>
                )}
              </label>

              <a
                href={currentProviderData.keyHelpUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 font-medium"
              >
                <span>{currentProviderData.keyHelpLabel}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder={currentProviderData.keyPrefixPlaceholder}
                className="w-full px-3.5 py-2.5 pr-20 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono text-slate-800 bg-white"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title={showKey ? "Masquer" : "Afficher"}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setApiKey("");
                      setTestResult(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Effacer la clé"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Filtrage actif : les guillemets et caractères invisibles de copier-coller sont automatiquement assainis.</span>
            </div>

            {provider === "gemini" && !apiKey && (
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Settings2 className="w-3 h-3 text-slate-500" />
                <span>Si vous ne saisissez aucune clé, la clé par défaut de l'application sera utilisée.</span>
              </p>
            )}
          </div>

          {/* Test connection button & feedback */}
          <div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testing}
                className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-100/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                    <span>Vérification en cours...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tester la connexion</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rétablir Google par défaut</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`mt-2.5 p-3 rounded-lg text-xs flex items-start gap-2 border ${
                  testResult.success
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Privacy & Security banner */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-slate-800">Confidentialité garantie : </span>
              Votre clé API est conservée uniquement dans le stockage local de votre navigateur (<code className="bg-slate-200/70 px-1 py-0.5 rounded text-[11px] font-mono">localStorage</code>). Elle n'est jamais stockée sur un serveur distant ni partagée avec des tiers.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Enregistrer la configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
}
