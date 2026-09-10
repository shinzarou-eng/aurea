import { useState } from "react";
import { UgcScript, MarketingSession } from "../types";
import { generateDefaultUgcScripts } from "../utils/ugcDefaults";
import { 
  Video, 
  Copy, 
  Check, 
  Music, 
  Star, 
  Clock, 
  Film, 
  UserCheck, 
  Smartphone,
  CheckCircle2
} from "lucide-react";

interface UgcStoryboardSectionProps {
  session: MarketingSession;
  onRefine: (sectionKey: string, content: any) => void;
}

export default function UgcStoryboardSection({ session, onRefine }: UgcStoryboardSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeScriptIndex, setActiveScriptIndex] = useState<number>(0);

  const rawScripts = session.ugcScripts || generateDefaultUgcScripts(session);
  const scripts: UgcScript[] = Array.isArray(rawScripts) && rawScripts.length > 0 
    ? rawScripts 
    : generateDefaultUgcScripts(session);

  const activeScript = scripts[activeScriptIndex] || scripts[0];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyEntireScript = (script: UgcScript) => {
    const formatted = `=== SCRIPT VIDÉO UGC : ${script.title} ===
Émotion cible : ${script.targetEmotion}
Ambiance sonore : ${script.musicTrend}
Conseil tournage : ${script.creatorTip}

DÉROULÉ SCÈNE PAR SCÈNE :
${script.scenes.map((s) => `[${s.timeframe}] ${s.phase}
- Visuel : ${s.visualAction}
- Audio (Voix-off) : "${s.audioVoiceover}"
- Texte à l'écran : [${s.onScreenText}]`).join("\n\n")}
`;
    copyToClipboard(formatted, `script-full-${script.id}`);
  };

  return (
    <div id="section-ugc" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-purple-600" />
              Module 7 • Studio Créateurs & Vidéo
            </span>
            <h3 className="text-lg font-bold text-slate-900">Scripts & Storyboards UGC (TikTok, Reels, Shorts)</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Scripts minutés seconde par seconde prêts à envoyer à des créateurs de contenu ou à tourner vous-même.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyEntireScript(activeScript)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors flex items-center gap-1.5"
          >
            {copiedKey === `script-full-${activeScript.id}` ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedKey === `script-full-${activeScript.id}` ? "Script Copié !" : "Copier le Script Complet"}</span>
          </button>

          <button
            onClick={() => onRefine("Scripts Vidéo UGC", scripts)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Affiner</span>
          </button>
        </div>
      </div>

      {/* Script Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-5 border-b border-slate-100">
        {scripts.map((sc, idx) => (
          <button
            key={sc.id || idx}
            onClick={() => setActiveScriptIndex(idx)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeScriptIndex === idx
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <Film className="w-3.5 h-3.5 opacity-70" />
            <span>Format #{idx + 1} : {sc.title.split("(")[0]}</span>
          </button>
        ))}
      </div>

      {/* Active Script Details */}
      <div className="space-y-5">
        {/* Top Briefing Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Émotion & Raccrochage Cible
            </span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              {activeScript.targetEmotion}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Musique / Audio Tendance
            </span>
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              {activeScript.musicTrend}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Conseil Cadre & Acting
            </span>
            <p className="text-slate-600 text-[11px] leading-snug">
              {activeScript.creatorTip}
            </p>
          </div>
        </div>

        {/* Scene-by-Scene Timeline */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Découpage Séquence par Séquence (0 à 45 secondes)
          </span>

          <div className="grid grid-cols-1 gap-3">
            {activeScript.scenes.map((scene, sIdx) => (
              <div 
                key={sIdx}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center gap-4"
              >
                {/* Timestamp & Phase */}
                <div className="md:w-48 shrink-0">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-900 text-white mb-1.5">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    {scene.timeframe}
                  </span>
                  <h5 className="text-xs font-bold text-slate-900">{scene.phase}</h5>
                </div>

                {/* Visual Action */}
                <div className="md:flex-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    🎬 Direction Visuelle / Ce qu'on voit :
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {scene.visualAction}
                  </p>
                </div>

                {/* Audio Voiceover */}
                <div className="md:flex-1 text-xs p-3 rounded-lg bg-indigo-50/60 border border-indigo-100">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                      🎙️ Voix-Off (Ce qu'on dit) :
                    </span>
                    <button
                      onClick={() => copyToClipboard(scene.audioVoiceover, `voice-${sIdx}`)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      {copiedKey === `voice-${sIdx}` ? "Copié !" : "Copier"}
                    </button>
                  </div>
                  <p className="text-indigo-950 italic font-medium leading-relaxed">
                    "{scene.audioVoiceover}"
                  </p>
                </div>

                {/* Text Sticker Overlay */}
                <div className="md:w-44 shrink-0 text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Texte affiché (Sticker)
                  </span>
                  <span className="text-[11px] font-extrabold text-slate-900 block font-mono">
                    {scene.onScreenText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
