import { useState } from "react";
import { FolderSearch, Copy, Check, Lightbulb, AlertTriangle, Target, Rocket, FlaskConical, TrendingUp, Shield, Zap, DollarSign, Map, Users, BarChart3 } from "lucide-react";
import Markdown from "react-markdown";
import { ProjectAudit, ScoreReview } from "../types";

interface ProjectAuditSectionProps {
  audit: ProjectAudit;
  language: "fr" | "en";
}

const ScoreBar = ({ score, label, color = "emerald" }: { score: number; label: string; color?: string }) => {
  const width = Math.max(0, Math.min(100, Math.round(score)));
  const colorClass =
    width >= 75 ? `bg-${color}-500` : width >= 50 ? `bg-amber-500` : `bg-rose-500`;
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
        <span>{label}</span>
        <span className={`text-${color}-600`}>{width}/100</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};

const SectionCard = ({ title, icon: Icon, children, className = "" }: { title: string; icon: any; children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5" />
      {title}
    </h4>
    {children}
  </div>
);

const ReviewBlock = ({ title, review, icon: Icon, color = "emerald" }: { title: string; review: ScoreReview; icon: any; color?: string }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className={`text-xs font-bold uppercase tracking-wider text-${color}-700 flex items-center gap-1.5`}>
        <Icon className="w-3.5 h-3.5" />
        {title}
      </h4>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-${color}-50 text-${color}-700`}>{review.score}/100</span>
    </div>
    <p className="text-xs text-slate-700 leading-relaxed mb-3"><Markdown>{review.summary || "—"}</Markdown></p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ListBlock title="Quick wins" icon={Lightbulb} items={review.quickWins} color="emerald" />
      <ListBlock title="Critical issues" icon={AlertTriangle} items={review.criticalIssues} color="rose" />
    </div>
  </div>
);

const ListBlock = ({ title, icon: Icon, items, color = "emerald" }: { title: string; icon: any; items: string[]; color?: string }) => (
  <div>
    {title && (
      <h5 className={`text-[10px] font-bold uppercase tracking-wider text-${color}-700 mb-2 flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {title}
      </h5>
    )}
    {items.length > 0 ? (
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-[11px] text-slate-700 leading-relaxed flex items-start gap-2">
            <span className={`w-1 h-1 rounded-full bg-${color}-500 mt-1.5 shrink-0`} />
            <span><Markdown>{item}</Markdown></span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-[11px] text-slate-400 italic">—</p>
    )}
  </div>
);

const CompetitorCard = ({ competitor, language }: { competitor: ProjectAudit["competitorPositioning"]["competitors"][0]; language: "fr" | "en" }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <h5 className="text-sm font-bold text-slate-900 mb-2">{competitor.name}</h5>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
      <ListBlock title={language === "en" ? "Strengths" : "Forces"} icon={TrendingUp} items={competitor.strengths} color="emerald" />
      <ListBlock title={language === "en" ? "Weaknesses" : "Faiblesses"} icon={AlertTriangle} items={competitor.weaknesses} color="rose" />
    </div>
    {competitor.howToBeat && (
      <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
        <span className="text-[10px] font-bold uppercase text-emerald-700 flex items-center gap-1 mb-1">
          <Target className="w-3 h-3" />
          {language === "en" ? "How to beat them" : "Comment les battre"}
        </span>
        <p className="text-[11px] text-slate-700 leading-relaxed"><Markdown>{competitor.howToBeat}</Markdown></p>
      </div>
    )}
  </div>
);

const RoadmapCard = ({ phase, timeline, actions }: { phase: string; timeline: string; actions: string[] }) => (
  <div className="relative pl-4 border-l-2 border-emerald-200 pb-5 last:pb-0">
    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500" />
    <div className="rounded-xl border border-slate-200 bg-white p-4 -mt-2">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-xs font-bold text-slate-900">{phase}</h5>
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{timeline}</span>
      </div>
      <ListBlock title="" icon={Rocket} items={actions} color="emerald" />
    </div>
  </div>
);

export default function ProjectAuditSection({ audit, language }: ProjectAuditSectionProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "market" | "ux" | "code" | "security" | "monetization" | "roadmap" | "tests">("summary");
  const [copied, setCopied] = useState(false);

  const t = {
    fr: {
      title: `Audit : ${audit.appName || "Application"}`,
      subtitle: "Compte-rendu stratégique complet basé sur l’analyse du code, de l’UX et du marché.",
      summary: "Synthèse",
      market: "Marché & Concurrents",
      ux: "UX",
      code: "Code",
      security: "Sécurité & Perf",
      monetization: "Monétisation",
      roadmap: "Roadmap",
      tests: "Tests & Next",
      copy: "Copier le rapport",
      copied: "Copié !",
      stack: "Stack",
      architecture: "Architecture",
      elevator: "Elevator pitch",
    },
    en: {
      title: `Audit: ${audit.appName || "Application"}`,
      subtitle: "Complete strategic report based on code, UX and market analysis.",
      summary: "Summary",
      market: "Market & Competitors",
      ux: "UX",
      code: "Code",
      security: "Security & Perf",
      monetization: "Monetization",
      roadmap: "Roadmap",
      tests: "Tests & Next",
      copy: "Copy report",
      copied: "Copied!",
      stack: "Stack",
      architecture: "Architecture",
      elevator: "Elevator pitch",
    },
  }[language];

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(audit, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const tabs: { id: typeof activeTab; label: string; icon: any }[] = [
    { id: "summary", label: t.summary, icon: BarChart3 },
    { id: "market", label: t.market, icon: Users },
    { id: "ux", label: t.ux, icon: Target },
    { id: "code", label: t.code, icon: FolderSearch },
    { id: "security", label: t.security, icon: Shield },
    { id: "monetization", label: t.monetization, icon: DollarSign },
    { id: "roadmap", label: t.roadmap, icon: Map },
    { id: "tests", label: t.tests, icon: FlaskConical },
  ];

  return (
    <section id="section-project-audit" className="p-5 md:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden mb-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <FolderSearch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.title}</h2>
            <p className="text-xs text-slate-500">{t.subtitle}</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="self-start px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? t.copied : t.copy}
        </button>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <ScoreBar score={audit.uxReview?.score || 0} label={t.ux} color="emerald" />
        <ScoreBar score={audit.codeQuality?.score || 0} label={t.code} color="blue" />
        <ScoreBar score={audit.securityReview?.score || 0} label={language === "en" ? "Security" : "Sécurité"} color="rose" />
        <ScoreBar score={audit.performanceReview?.score || 0} label={language === "en" ? "Perf" : "Perf"} color="amber" />
        <ScoreBar score={audit.marketFit?.score || 0} label={language === "en" ? "Market" : "Marché"} color="indigo" />
        <ScoreBar score={audit.launchReadiness?.score || 0} label={language === "en" ? "Launch" : "Lancement"} color="teal" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 min-h-[12rem]">
        {activeTab === "summary" && (
          <div className="space-y-4">
            {audit.elevatorPitch && (
              <SectionCard title={t.elevator} icon={Lightbulb}>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">{audit.elevatorPitch}</p>
              </SectionCard>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SectionCard title={t.stack} icon={Zap}>
                <div className="flex flex-wrap gap-1.5">
                  {audit.detectedTechStack.length > 0 ? audit.detectedTechStack.map((tech) => (
                    <span key={tech} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-semibold">{tech}</span>
                  )) : <span className="text-[11px] text-slate-400">—</span>}
                </div>
              </SectionCard>
              <SectionCard title={t.architecture} icon={FolderSearch}>
                <p className="text-xs text-slate-700 leading-relaxed"><Markdown>{audit.architectureSummary || "—"}</Markdown></p>
              </SectionCard>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ListBlock title={language === "en" ? "Strengths" : "Forces"} icon={TrendingUp} items={audit.strengths} color="emerald" />
              <ListBlock title={language === "en" ? "Weaknesses" : "Faiblesses"} icon={AlertTriangle} items={audit.weaknesses} color="rose" />
              <ListBlock title={language === "en" ? "Opportunities" : "Opportunités"} icon={Lightbulb} items={audit.opportunities} color="amber" />
              <ListBlock title={language === "en" ? "Threats" : "Menaces"} icon={Shield} items={audit.threats} color="indigo" />
            </div>
          </div>
        )}

        {activeTab === "market" && (
          <div className="space-y-4">
            <SectionCard title={language === "en" ? "Market fit" : "Adéquation marché"} icon={Users}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${audit.marketFit.score >= 75 ? "bg-emerald-50 text-emerald-700" : audit.marketFit.score >= 50 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
                  {audit.marketFit.score}/100
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-3"><Markdown>{audit.marketFit.summary || "—"}</Markdown></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ListBlock title={language === "en" ? "Target audience" : "Audience cible"} icon={Users} items={audit.marketFit.targetAudience} color="indigo" />
                <ListBlock title={language === "en" ? "Best channels" : "Meilleurs canaux"} icon={TrendingUp} items={audit.marketFit.bestChannels} color="emerald" />
              </div>
            </SectionCard>
            <SectionCard title={language === "en" ? "Competitive positioning" : "Positionnement concurrentiel"} icon={Target}>
              <p className="text-xs text-slate-700 leading-relaxed mb-3"><Markdown>{audit.competitorPositioning.summary || "—"}</Markdown></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <ListBlock title={language === "en" ? "Differentiators" : "Différenciateurs"} icon={TrendingUp} items={audit.competitorPositioning.differentiators} color="emerald" />
                <ListBlock title={language === "en" ? "Risks" : "Risques"} icon={AlertTriangle} items={audit.competitorPositioning.risks} color="rose" />
              </div>
            </SectionCard>
            {audit.competitorPositioning.competitors.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{language === "en" ? "Competitor benchmark" : "Benchmark concurrentiel"}</h4>
                {audit.competitorPositioning.competitors.map((c, i) => <CompetitorCard key={i} competitor={c} language={language} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === "ux" && <ReviewBlock title={t.ux} review={audit.uxReview} icon={Target} color="emerald" />}

        {activeTab === "code" && <ReviewBlock title={t.code} review={audit.codeQuality} icon={FolderSearch} color="blue" />}

        {activeTab === "security" && (
          <div className="space-y-4">
            <ReviewBlock title={language === "en" ? "Security" : "Sécurité"} review={audit.securityReview} icon={Shield} color="rose" />
            <ReviewBlock title={language === "en" ? "Performance" : "Performance"} review={audit.performanceReview} icon={Zap} color="amber" />
          </div>
        )}

        {activeTab === "monetization" && (
          <div className="space-y-4">
            {audit.monetizationSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {audit.monetizationSuggestions.map((m, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-bold text-slate-900">{m.model}</h5>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.estimatedImpact.toLowerCase().includes("high") || m.estimatedImpact.toLowerCase().includes("fort") ? "bg-emerald-50 text-emerald-700" : m.estimatedImpact.toLowerCase().includes("medium") || m.estimatedImpact.toLowerCase().includes("moyen") ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {m.estimatedImpact}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed mb-2"><Markdown>{m.description}</Markdown></p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">—</p>
            )}
            {audit.localizationOpportunities.length > 0 && (
              <SectionCard title={language === "en" ? "Localization opportunities" : "Opportunités de localisation"} icon={Map}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {audit.localizationOpportunities.map((l, i) => (
                    <div key={i} className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">{l.language}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.priority.toLowerCase().includes("high") || l.priority.toLowerCase().includes("haute") ? "bg-emerald-50 text-emerald-700" : l.priority.toLowerCase().includes("medium") || l.priority.toLowerCase().includes("moyen") ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{l.priority}</span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-relaxed"><Markdown>{l.opportunity}</Markdown></p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {activeTab === "roadmap" && (
          <div className="space-y-2">
            {audit.roadmap.length > 0 ? audit.roadmap.map((p, i) => (
              <RoadmapCard key={i} phase={p.phase} timeline={p.timeline} actions={p.actions} />
            )) : <p className="text-sm text-slate-500 text-center py-8">—</p>}
          </div>
        )}

        {activeTab === "tests" && (
          <div className="space-y-4">
            <SectionCard title={language === "en" ? "Launch readiness" : "Prêt au lancement"} icon={Rocket}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${audit.launchReadiness.score >= 75 ? "bg-emerald-50 text-emerald-700" : audit.launchReadiness.score >= 50 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
                  {audit.launchReadiness.score}/100
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-3"><Markdown>{audit.launchReadiness.summary || "—"}</Markdown></p>
              <ListBlock title={language === "en" ? "Pre-launch checklist" : "Checklist pré-lancement"} icon={Rocket} items={audit.launchReadiness.todoBeforeLaunch} color="amber" />
            </SectionCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SectionCard title={language === "en" ? "Test plan" : "Plan de tests"} icon={FlaskConical}>
                <ListBlock title="" icon={FlaskConical} items={audit.testPlan} color="emerald" />
              </SectionCard>
              <SectionCard title={language === "en" ? "Next steps" : "Prochaines étapes"} icon={TrendingUp}>
                <ListBlock title="" icon={TrendingUp} items={audit.suggestedNextSteps} color="emerald" />
              </SectionCard>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
