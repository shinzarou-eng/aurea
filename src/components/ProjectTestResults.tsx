import { useState } from "react";
import { Terminal, Play, Loader2, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, RefreshCw, FileSearch, Wrench, AlertTriangle, Copy, Download } from "lucide-react";
import { ProjectTestResult } from "../types";

interface ProjectTestResultsProps {
  result: ProjectTestResult;
  isLoading: boolean;
  language: "fr" | "en";
  onRunTests: () => void;
}

function stripAnsi(str: string): string {
  return str.replace(/\u001b\[[0-9;]*m/g, "").replace(/\u001b\]8;[^;]*;[^\u0007]*\u0007/g, "").replace(/\u001b\]8;[^;]*;[^\u0007]*\u0007/g, "");
}

const StepCard = ({
  label,
  step,
  defaultOpen = true,
}: {
  label: string;
  step: { exitCode: number; stdout: string; stderr: string; duration: number } | null;
  defaultOpen?: boolean;
}) => {
  const [expanded, setExpanded] = useState(defaultOpen);
  if (!step) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-slate-300" />
        {label} — <span className="italic">non exécuté</span>
      </div>
    );
  }
  const success = step.exitCode === 0;
  const output = stripAnsi(step.stdout + "\n" + step.stderr).trim();
  const hasOutput = output.length > 0;

  return (
    <div className={`rounded-lg border ${success ? "border-emerald-200 bg-emerald-50/30" : "border-rose-200 bg-rose-50/30"}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        disabled={!hasOutput}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          {success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
          <span className={`text-sm font-semibold ${success ? "text-emerald-900" : "text-rose-900"}`}>{label}</span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">{step.duration}ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${success ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
            {success ? ("OK") : ("FAIL")}
          </span>
          {hasOutput && (expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />)}
        </div>
      </button>
      {expanded && hasOutput && (
        <div className="px-4 pb-3">
          <pre className="text-[11px] font-mono text-slate-200 bg-slate-950 rounded-md p-3 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

const Diagnostics = ({ diagnostics, language }: { diagnostics: ProjectTestResult["diagnostics"]; language: "fr" | "en" }) => {
  if (!diagnostics) return null;
  const t = language === "en" ? {
    framework: "Framework",
    missing: "Missing files",
    warnings: "Warnings",
    fixed: "Auto-fixed",
  } : {
    framework: "Framework",
    missing: "Fichiers manquants",
    warnings: "Avertissements",
    fixed: "Corrections automatiques",
  };

  const hasAny = diagnostics.framework || diagnostics.missingFiles.length || diagnostics.warnings.length || diagnostics.autoFixed.length;
  if (!hasAny) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <FileSearch className="w-4 h-4 text-slate-500" />
        {t.framework}: <span className="font-mono text-slate-600">{diagnostics.framework}</span>
      </div>
      {diagnostics.missingFiles.length > 0 && (
        <div className="rounded-md bg-rose-50 border border-rose-100 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-700 mb-2">
            <AlertTriangle className="w-3 h-3" />
            {t.missing}
          </div>
          <ul className="space-y-1">
            {diagnostics.missingFiles.map((f, i) => (
              <li key={i} className="text-xs text-rose-800 font-mono flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-rose-500" />{f}</li>
            ))}
          </ul>
        </div>
      )}
      {diagnostics.warnings.length > 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-100 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-2">
            <AlertCircle className="w-3 h-3" />
            {t.warnings}
          </div>
          <ul className="space-y-1">
            {diagnostics.warnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-800 flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5" />{w}</li>
            ))}
          </ul>
        </div>
      )}
      {diagnostics.autoFixed.length > 0 && (
        <div className="rounded-md bg-emerald-50 border border-emerald-100 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-2">
            <Wrench className="w-3 h-3" />
            {t.fixed}
          </div>
          <ul className="space-y-1">
            {diagnostics.autoFixed.map((f, i) => (
              <li key={i} className="text-xs text-emerald-800 flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5" />{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function ProjectTestResults({ result, isLoading, language, onRunTests }: ProjectTestResultsProps) {
  const t = {
    fr: {
      title: "Résultats des tests & build",
      rerun: "Relancer",
      running: "Exécution en cours...",
      install: "npm install",
      build: "npm run build",
      test: "npm run test",
      copy: "Copier les logs",
      download: "Télécharger",
    },
    en: {
      title: "Build & test results",
      rerun: "Run again",
      running: "Running...",
      install: "npm install",
      build: "npm run build",
      test: "npm run test",
      copy: "Copy logs",
      download: "Download",
    },
  }[language];

  const allSuccess = [result.install, result.build, result.test].every((s) => !s || s.exitCode === 0);
  const anyFailed = [result.install, result.build, result.test].some((s) => s && s.exitCode !== 0);

  const fullLog = [
    result.install ? `=== ${t.install} ===\n${result.install.stdout}\n${result.install.stderr}` : "",
    result.build ? `=== ${t.build} ===\n${result.build.stdout}\n${result.build.stderr}` : "",
    result.test ? `=== ${t.test} ===\n${result.test.stdout}\n${result.test.stderr}` : "",
  ].join("\n\n");

  const copyLogs = () => navigator.clipboard.writeText(fullLog);
  const downloadLogs = () => {
    const blob = new Blob([fullLog], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aurea-build-logs.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${anyFailed ? "bg-rose-100" : allSuccess ? "bg-emerald-100" : "bg-amber-100"}`}>
            {anyFailed ? <XCircle className="w-5 h-5 text-rose-700" /> : allSuccess ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : <AlertCircle className="w-5 h-5 text-amber-700" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t.title}</h3>
            {result.summary && <p className="text-xs text-slate-500 font-mono mt-0.5">{result.summary}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyLogs}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" /> {t.copy}
          </button>
          <button
            onClick={downloadLogs}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> {t.download}
          </button>
          <button
            onClick={onRunTests}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isLoading ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {isLoading ? t.running : t.rerun}
          </button>
        </div>
      </div>

      <Diagnostics diagnostics={result.diagnostics} language={language} />

      <div className="mt-4 space-y-3">
        <StepCard label={t.install} step={result.install} />
        <StepCard label={t.build} step={result.build} />
        <StepCard label={t.test} step={result.test} />
      </div>
    </div>
  );
}
