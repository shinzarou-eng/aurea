import { useState } from "react";
import { SocialMediaLaunch } from "../types";
import { Copy, Check, Star, Video, Share2, MessageSquare } from "lucide-react";
import Markdown from "react-markdown";

interface SocialCampaignSectionProps {
  social: SocialMediaLaunch;
  onRefine: (sectionKey: string, content: any) => void;
}

export default function SocialCampaignSection({ social, onRefine }: SocialCampaignSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<"twitter" | "linkedin" | "tiktok" | "producthunt">("twitter");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div id="section-social" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
              Module 6
            </span>
            <h3 className="text-lg font-bold text-slate-900">Campagne de Lancement & Réseaux Sociaux</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Contenus viraux et publications prêtes à poster pour amorcer vos premiers téléchargements.
          </p>
        </div>

        <button
          onClick={() => onRefine("Campagne Réseaux Sociaux", social)}
          className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
        >
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span>Affiner</span>
        </button>
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <button
          onClick={() => setActivePlatform("twitter")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
            activePlatform === "twitter"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>𝕏 Thread Twitter</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
            {social.twitterThread?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActivePlatform("linkedin")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
            activePlatform === "linkedin"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>in Post LinkedIn</span>
        </button>

        <button
          onClick={() => setActivePlatform("tiktok")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
            activePlatform === "tiktok"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>TikTok / Reels (Hooks)</span>
        </button>

        <button
          onClick={() => setActivePlatform("producthunt")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
            activePlatform === "producthunt"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>Product Hunt Kit</span>
        </button>
      </div>

      {/* Tab Contents */}
      {/* 1. Twitter Thread */}
      {activePlatform === "twitter" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Thread complet prêt à publier pour capter l'attention de la communauté Tech & Early Adopters
            </span>
            <button
              onClick={() => copyToClipboard((social?.twitterThread || []).join("\n\n---\n\n"), "full-thread")}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-medium flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === "full-thread" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "full-thread" ? "Thread copié !" : "Copier tout le thread"}</span>
            </button>
          </div>

          <div className="space-y-3">
            {(social?.twitterThread || []).map((tweet, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative group transition-colors hover:border-slate-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500">
                    Tweet {idx + 1}/{(social?.twitterThread || []).length}
                  </span>
                  <button
                    onClick={() => copyToClipboard(tweet, `tweet-${idx}`)}
                    className="text-slate-400 hover:text-slate-700 p-1 flex items-center gap-1 text-[11px]"
                  >
                    {copiedKey === `tweet-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === `tweet-${idx}` ? "Copié" : "Copier"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                  {tweet}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. LinkedIn Post */}
      {activePlatform === "linkedin" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Post axé Founder Journey & Résolution d'un problème concret
            </span>
            <button
              onClick={() => copyToClipboard(social?.linkedInPost || "", "linkedin-post")}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === "linkedin-post" ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "linkedin-post" ? "Post copié !" : "Copier le post"}</span>
            </button>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 max-h-[460px] overflow-y-auto">
            <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
              {social?.linkedInPost || "Publication en cours de rédaction..."}
            </div>
          </div>
        </div>
      )}

      {/* 3. TikTok / Reels Hooks */}
      {activePlatform === "tiktok" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Concepts de formats courts (15 à 30 secondes). Les 3 premières secondes déterminent 90% de la viralité :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(social?.tiktokReelsHooks || []).map((hook, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                      Concept #{idx + 1}
                    </span>
                    <button
                      onClick={() => copyToClipboard(`[Visuel 0-3s]: ${hook?.hookVisual || ""}\n[Audio]: ${hook?.hookAudio || ""}\n[Concept]: ${hook?.concept || ""}`, `hook-${idx}`)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedKey === `hook-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="font-bold text-rose-600 block mb-1 text-[11px]">
                        👁️ Ce qu'on montre (0-3s)
                      </span>
                      <p className="text-slate-700">{hook?.hookVisual || "Démonstration visuelle de l'application"}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="font-bold text-amber-600 block mb-1 text-[11px]">
                        🎙️ Phrase choc audio
                      </span>
                      <p className="text-slate-700 italic">"{hook?.hookAudio || "Découvrez comment cette app simplifie votre quotidien"}"</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="font-bold text-indigo-600 block mb-1 text-[11px]">
                        🎬 Déroulement vidéo (15-30s)
                      </span>
                      <p className="text-slate-700 leading-relaxed">{hook?.concept || "Présentation claire des bénéfices et call-to-action de fin."}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Product Hunt Kit */}
      {activePlatform === "producthunt" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Tagline Product Hunt (max 60 car.)</span>
              <button
                onClick={() => copyToClipboard(social?.productHuntKit?.tagline || "", "ph-tagline")}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
              >
                {copiedKey === "ph-tagline" ? "Copié !" : "Copier"}
              </button>
            </div>
            <p className="text-sm font-bold text-slate-900">{social?.productHuntKit?.tagline || "Le nouveau standard pour simplifier votre quotidien"}</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
              <span>Premier Commentaire du Maker (Story, Vision & Offre spéciale)</span>
              <button
                onClick={() => copyToClipboard(social?.productHuntKit?.makerComment || "", "ph-comment")}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
              >
                {copiedKey === "ph-comment" ? "Copié !" : "Copier le commentaire"}
              </button>
            </div>
            <div className="p-4 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
              {social?.productHuntKit?.makerComment || "Hello Product Hunt ! Nous avons développé cette app pour vous simplifier la vie. N'hésitez pas à nous donner vos retours !"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
