import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, Minimize2, Maximize2, Copy, Check } from "lucide-react";
import Markdown from "react-markdown";
import { EngineConfig, MarketingSession } from "../types";
import { parseApiResponse } from "../utils/parseApiResponse";

interface Message {
  id: string;
  role: "user" | "advisor" | "error";
  content: string;
  timestamp: number;
}

interface AdvisorChatProps {
  session: MarketingSession | null;
  appName: string;
  language: "fr" | "en";
  engineConfig: EngineConfig;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SUGGESTIONS_FR = [
  "Résume la session en 5 idées clés",
  "Propose 3 idées de campagne publicitaire low-budget",
  "Quels sont les plus gros risques sur les 30 prochains jours ?",
  "Rédige un pitch investisseur de 60 secondes",
];
const SUGGESTIONS_EN = [
  "Summarize the session in 5 key insights",
  "Suggest 3 low-budget ad campaign ideas",
  "What are the biggest risks in the next 30 days?",
  "Write a 60-second investor pitch",
];

export default function AdvisorChat({
  session,
  appName,
  language,
  engineConfig,
  open,
  onOpenChange,
}: AdvisorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = language === "en" ? SUGGESTIONS_EN : SUGGESTIONS_FR;

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);

  const setOpen = (next: boolean) => {
    setIsOpen(next);
    onOpenChange?.(next);
  };

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const buildContext = () => {
    if (!session) return "";
    const ctx: Record<string, any> = {
      appName: session.appOverview?.detectedName || appName,
      category: session.appOverview?.category,
      valueProposition: session.appOverview?.uniqueValueProposition,
      catchphrase: session.appOverview?.catchphrase,
      personas: session.targetPersonas?.map((p) => p.personaName),
      monetizationModel: session.monetization?.recommendedModel,
      swotSummary: session.swotAndTrends?.strategicSummary,
      asoTitle: session.appStoreOptimization?.storeTitle,
      okr: session.okrPlan?.objectives?.map((o) => o.title),
    };
    return JSON.stringify(ctx, null, 2);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    if (isLoading) return;
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInput("");
    setIsLoading(true);

    try {
      const sessionContext = buildContext();
      const prompt = session
        ? `Voici le contexte de la session marketing actuelle (JSON synthétique) :\n${sessionContext}\n\nQuestion / consigne de l'utilisateur : ${text.trim()}\n\nRéponds de manière ciblée, actionnable et concise en tant que Directeur Marketing d'élite. Si tu fais des recommandations, hiérarchise-les par impact / facilité.`
        : text.trim();

      const res = await fetch("/api/marketing/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey: "Conseiller Stratégique",
          currentContent: session ? { sessionContext } : "Aucune session chargée.",
          userInstructions: prompt,
          language,
          engineConfig,
        }),
      });

      const data = await parseApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur de contact avec le moteur.");
      }
      addMessage({
        id: `a_${Date.now()}`,
        role: "advisor",
        content: data.revisedContent || "Réponse vide.",
        timestamp: Date.now(),
      });
    } catch (err: any) {
      addMessage({
        id: `e_${Date.now()}`,
        role: "error",
        content: err.message || "Impossible de contacter le moteur.",
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed z-40 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        } right-4 bottom-4 w-14 h-14 bg-slate-900 text-white hover:bg-slate-800 active:scale-95`}
        title="Conseiller produit"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${
            isExpanded
              ? "right-4 bottom-4 w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] max-w-4xl"
              : "right-4 bottom-4 w-[22rem] sm:w-[26rem] h-[28rem]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Conseiller produit</h4>
                <p className="text-[10px] text-slate-400">Stratégie & recommandations</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
                title={isExpanded ? "Réduire" : "Agrandir"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center py-8 px-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  {language === "en" ? "Ask anything about your session" : "Posez une question sur votre session"}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  {language === "en"
                    ? "Your marketing session is used as context to answer your questions."
                    : "Votre session marketing sert de contexte pour répondre à vos questions."}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 transition-colors text-slate-600"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-md"
                      : msg.role === "error"
                      ? "bg-rose-50 text-rose-700 border border-rose-200 rounded-bl-md"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-md shadow-sm"
                  }`}
                >
                  {msg.role === "advisor" && (
                    <div className="markdown-body mb-2">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  )}
                  {msg.role !== "advisor" && <span>{msg.content}</span>}

                  {msg.role === "advisor" && (
                    <div className="flex items-center justify-end border-t border-slate-100 pt-2 mt-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="text-[10px] text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3" /> Copié
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copier
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    Rédaction en cours...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="relative">
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={
                  language === "en"
                    ? "Ask a question, get a strategy..."
                    : "Posez une question, obtenez une stratégie..."
                }
                className="w-full text-xs p-3 pr-12 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none bg-white"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className={`absolute right-2 bottom-2 p-2 rounded-lg text-white transition-colors ${
                  isLoading || !input.trim()
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
