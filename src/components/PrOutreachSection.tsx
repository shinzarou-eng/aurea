import { useState } from "react";
import { PrAndOutreach } from "../types";
import { Copy, Check, Star, Mic, Mail, Send } from "lucide-react";

interface PrOutreachSectionProps {
  pr: PrAndOutreach;
  onRefine: (sectionKey: string, content: any) => void;
}

export default function PrOutreachSection({ pr, onRefine }: PrOutreachSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const elevatorPitch = pr?.elevatorPitch30s || "Notre application apporte une solution innovante et rapide.";
  const pressEmail = pr?.pressReleaseEmail || "Bonjour,\n\nNous lançons aujourd'hui notre nouvelle application...";
  const influencerDm = pr?.influencerDm || "Hello ! J'adore ton contenu. On vient de sortir notre app et on adorerait te donner un accès exclusif...";

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div id="section-pr" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">
              Module 8
            </span>
            <h3 className="text-lg font-bold text-slate-900">Presse, Partenariats & Pitchs</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Modèles de prospection directe pour contacter journalistes, médias tech et créateurs influents.
          </p>
        </div>

        <button
          onClick={() => onRefine("Relations Presse et Pitchs", pr)}
          className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
        >
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span>Affiner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Elevator Pitch 30s */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-purple-600" />
                Elevator Pitch Oral (30s)
              </span>
              <button
                onClick={() => copyToClipboard(elevatorPitch, "pitch")}
                className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
              >
                {copiedKey === "pitch" ? "Copié !" : "Copier"}
              </button>
            </div>
            <div className="p-4 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
              "{elevatorPitch}"
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Idéal pour vos rencontres en salon, vidéos de présentation ou podcast.
          </p>
        </div>

        {/* 2. Press Email */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-600" />
                Email Froid Journalistes / Médias
              </span>
              <button
                onClick={() => copyToClipboard(pressEmail, "press")}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                {copiedKey === "press" ? "Copié !" : "Copier"}
              </button>
            </div>
            <div className="p-4 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-[300px] overflow-y-auto">
              {pressEmail}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Personnalisez le nom du média et joignez 2 captures d'écran clés.
          </p>
        </div>

        {/* 3. Influencer DM */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-emerald-600" />
                Message Privé (DM) Influenceurs
              </span>
              <button
                onClick={() => copyToClipboard(influencerDm, "influencer")}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                {copiedKey === "influencer" ? "Copié !" : "Copier"}
              </button>
            </div>
            <div className="p-4 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-[300px] overflow-y-auto">
              {influencerDm}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Proposez un accès VIP gratuit ou un code promo exclusif à sa communauté.
          </p>
        </div>
      </div>
    </div>
  );
}
