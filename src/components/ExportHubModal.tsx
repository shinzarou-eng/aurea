import { useState } from "react";
import { MarketingSession } from "../types";
import { 
  FileText, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Star,
  Layers,
  Database,
  Target
} from "lucide-react";
import { generateMarketingMarkdown } from "../utils/exportMarkdown";
import { generateOkrWeeklyPdf } from "../utils/generateOkrPdf";
import { generateDefaultOkrPlan } from "../utils/okrDefaults";

interface ExportHubModalProps {
  session: MarketingSession;
  appName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportHubModal({ session, appName, isOpen, onClose }: ExportHubModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // 1. Download Markdown (.md)
  const handleDownloadMarkdown = () => {
    const md = generateMarketingMarkdown(session, appName);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Launch-Kit-${session.appOverview?.detectedName || appName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. Download CSV for Meta & TikTok Ads
  const handleDownloadAdsCsv = () => {
    const headers = ["Angle_Name", "Hook_Text", "Body_Copy", "CTA_Button", "Visual_Concept"];
    const rows = (session.advertisingAngles || []).map((a) => [
      `"${(a.angleName || "").replace(/"/g, '""')}"`,
      `"${(a.hookText || "").replace(/"/g, '""')}"`,
      `"${(a.bodyCopy || "").replace(/"/g, '""')}"`,
      `"${(a.ctaButton || "").replace(/"/g, '""')}"`,
      `"${(a.recommendedVisualConcept || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ads-Campaigns-${session.appOverview?.detectedName || appName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 3. Download Notion-formatted Markdown
  const handleDownloadNotionMd = () => {
    const ov = session.appOverview;
    const aso = session.appStoreOptimization;
    const notionMd = `# 🚀 Launch Hub : ${ov?.detectedName || appName}

> 💡 **Pitch :** ${ov?.uniqueValueProposition || ""}
> 🏷️ **Catégorie :** ${ov?.category || ""}
> 🎨 **Palette :** ${(ov?.colorPalette || []).join(", ")}

## 📌 Checklist de Lancement 7 Jours
${(session.actionPlan7Days || []).map((d) => `- [ ] **${d.day}** [${d.channel}] : ${d.task}`).join("\n")}

## 📱 Fiche Store ASO
- **Titre iOS :** \`${aso?.storeTitle || ""}\`
- **Sous-titre :** \`${aso?.subtitle || ""}\`
- **Keywords :** ${(aso?.keywords || []).map((k) => `\`${k}\``).join(", ")}

## 💰 Modèle de Monétisation
- **Modèle :** ${session.monetization?.recommendedModel || "Freemium"}
- **Accroche Paywall :** "${session.monetization?.paywallCopy?.headline || ""}"
${(session.monetization?.pricingTiers || []).map((t) => `- **${t.name}** : ${t.price}`).join("\n")}

## 🎯 Angles Publicitaires
${(session.advertisingAngles || []).map((a, i) => `### Angle ${i + 1} : ${a.angleName}
- **Accroche :** "${a.hookText}"
- **Texte :** ${a.bodyCopy}
- **CTA :** [${a.ctaButton}]
- **Visuel suggéré :** ${a.recommendedVisualConcept}
`).join("\n")}
`;
    const blob = new Blob([notionMd], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Notion-Workspace-${ov?.detectedName || appName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 4. Download OKRs CSV
  const handleDownloadOkrCsv = () => {
    if (!session.okrPlan) return;
    const headers = ["Objectif", "Resultat_Cle", "Cible_30J", "Actuel_Mesure", "Unite", "Type"];
    const rows: string[][] = [];
    session.okrPlan.objectives.forEach((obj) => {
      obj.keyResults.forEach((kr) => {
        rows.push([
          `"${obj.title.replace(/"/g, '""')}"`,
          `"${kr.title.replace(/"/g, '""')}"`,
          `"${kr.targetValue}"`,
          `"${kr.currentValue}"`,
          `"${kr.unit}"`,
          `"${kr.type === "higher_is_better" ? "Croissance" : "Plafond"}"`,
        ]);
      });
    });
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OKRs-KPIs-30J-${session.appOverview?.detectedName || appName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 5. Download OKR Weekly Report PDF
  const handleDownloadOkrPdf = () => {
    const plan = session.okrPlan || generateDefaultOkrPlan(session);
    generateOkrWeeklyPdf(plan, {
      appName: session.appOverview?.detectedName || appName,
      selectedWeek: plan.currentDay <= 7 ? 1 : plan.currentDay <= 14 ? 2 : plan.currentDay <= 21 ? 3 : 4,
    });
  };

  // 6. Print / PDF Export
  const handlePrint = () => {
    window.print();
  };

  // 5. Copy Executive 1-Pager Summary
  const handleCopy1Pager = () => {
    const ov = session.appOverview;
    const summary = `=== RÉSUMÉ EXÉCUTIF : ${ov?.detectedName || appName} ===
Catégorie : ${ov?.category}
Proposition de Valeur : ${ov?.uniqueValueProposition}
Slogan : "${ov?.catchphrase}"

PERSONAS CIBLES :
${(session.targetPersonas || []).map((p) => `- ${p.personaName} : Frustration "${p.corePainPoint}" -> Bénéfice "${p.keyBenefitExpected}"`).join("\n")}

ASO & POSITIONNEMENT :
- Titre Store : ${session.appStoreOptimization?.storeTitle}
- Sous-titre : ${session.appStoreOptimization?.subtitle}
- Mots-clés principaux : ${(session.appStoreOptimization?.keywords || []).slice(0, 5).join(", ")}

MONÉTISATION :
- Modèle : ${session.monetization?.recommendedModel}
- Tarifs : ${(session.monetization?.pricingTiers || []).map((t) => `${t.name} (${t.price})`).join(" | ")}

PLAN DE LANCEMENT (7 JOURS) :
${(session.actionPlan7Days || []).map((d) => `- ${d.day} [${d.channel}] : ${d.task}`).join("\n")}
`;
    copyToClipboard(summary, "1pager");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Centre d'Exportation & Partage</h3>
              <p className="text-xs text-slate-500">
                Téléchargez votre kit sous différents formats professionnels prêts à l'emploi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {/* 1. Markdown Full */}
          <button
            onClick={handleDownloadMarkdown}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">.MD</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Kit Markdown Complet
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tous les 13 modules formatés en Markdown pour vos notes ou GitHub.
              </p>
            </div>
          </button>

          {/* 2. CSV Ads */}
          <button
            onClick={handleDownloadAdsCsv}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">.CSV</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Fichier CSV Campagnes Publicitaires
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Angles, accroches et CTA prêts pour Meta Ads Manager & TikTok Ads.
              </p>
            </div>
          </button>

          {/* 3. OKRs 30J CSV */}
          <button
            onClick={handleDownloadOkrCsv}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OKRs .CSV</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                Tableau CSV Objectifs OKR (30 Jours)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Indicateurs clés, cibles et métriques actuelles pour tableur (Excel, Sheets).
              </p>
            </div>
          </button>

          {/* 4. OKR Weekly Report PDF */}
          <button
            onClick={handleDownloadOkrPdf}
            className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-600 text-white">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider bg-purple-100 px-1.5 py-0.5 rounded">Rapport PDF</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                Rapport Hebdomadaire OKR (PDF A4)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Document exécutif avec graphiques récapitulatifs, cibles vs réalisé et plan d'action.
              </p>
            </div>
          </button>

          {/* 4. Notion Markdown */}
          <button
            onClick={handleDownloadNotionMd}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notion</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Workspace Notion Prêt à Importer
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Avec cases à cocher, blocs d'alerte et base de lancement.
              </p>
            </div>
          </button>

          {/* 4. Print / PDF */}
          <button
            onClick={handlePrint}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-left transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                <Printer className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PDF</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                Imprimer ou Exporter en PDF
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Dossier de stratégie complet pour investisseurs ou équipe.
              </p>
            </div>
          </button>
        </div>

        {/* 1-Pager Quick Copy */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Résumé Exécutif 1-Page (Presse-papier)</span>
            <span className="text-[11px] text-slate-500">Copiez la synthèse condensée en texte brut en un clic.</span>
          </div>
          <button
            onClick={handleCopy1Pager}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            {copiedKey === "1pager" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "1pager" ? "Copié !" : "Copier"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
