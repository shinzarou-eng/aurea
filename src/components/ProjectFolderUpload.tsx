import { useRef, useState } from "react";
import { FolderOpen, Upload, X, FileCode, Loader2, Search, AlertCircle, Terminal } from "lucide-react";
import { ProjectFile } from "../types";

const TEXT_EXTENSIONS = new Set([
  "ts", "tsx", "js", "jsx", "json", "md", "mdx", "css", "scss", "sass", "html", "htm",
  "yml", "yaml", "toml", "xml", "svg", "txt", "env", "example", "gitignore", "lock",
]);

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "out", ".next", "coverage", ".cache", "tmp", "temp"]);

const MAX_FILES = 120;
const MAX_TOTAL_CHARS = 200_000;
const MAX_FILE_CHARS = 25_000;

interface ProjectFolderUploadProps {
  onAudit: (files: ProjectFile[]) => void;
  onTest: (files: ProjectFile[]) => void;
  isAuditLoading: boolean;
  isTestLoading: boolean;
  language: "fr" | "en";
}

export default function ProjectFolderUpload({ onAudit, onTest, isAuditLoading, isTestLoading, language }: ProjectFolderUploadProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const isTextFile = (name: string): boolean => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    return TEXT_EXTENSIONS.has(ext);
  };

  const readFileContent = (file: File): Promise<string | undefined> => {
    if (!isTextFile(file.name) || file.size > MAX_FILE_CHARS) return Promise.resolve(undefined);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsText(file);
    });
  };

  const processFile = async (file: File, path: string): Promise<ProjectFile | null> => {
    if (!isTextFile(file.name)) {
      return {
        path,
        name: file.name,
        size: file.size,
        isText: false,
        extension: file.name.split(".").pop()?.toLowerCase() || "",
      };
    }
    const content = await readFileContent(file);
    return {
      path,
      name: file.name,
      size: file.size,
      isText: true,
      content,
      extension: file.name.split(".").pop()?.toLowerCase() || "",
    };
  };

  const collectFallbackFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsScanning(true);
    setError(null);
    try {
      const collected: ProjectFile[] = [];
      let totalChars = 0;
      for (let i = 0; i < Math.min(fileList.length, MAX_FILES); i++) {
        const file = fileList[i];
        const relativePath = (file as any).webkitRelativePath || file.name;
        if ([...SKIP_DIRS].some((d) => relativePath.includes(`/${d}/`))) continue;
        const pf = await processFile(file, relativePath);
        if (pf) {
          if (pf.content) totalChars += pf.content.length;
          if (totalChars > MAX_TOTAL_CHARS) break;
          collected.push(pf);
        }
      }
      setFiles(collected);
      setFolderName(language === "en" ? "Selected folder" : "Dossier sélectionné");
    } catch (e: any) {
      setError(e.message || "Erreur lors du scan du dossier.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDirectoryPicker = async () => {
    const picker = (window as any).showDirectoryPicker;
    if (!picker) {
      fallbackInputRef.current?.click();
      return;
    }
    setIsScanning(true);
    setError(null);
    try {
      const dirHandle = await picker();
      setFolderName(dirHandle.name);
      const collected: ProjectFile[] = [];
      let totalChars = 0;

      async function traverse(handle: any, path: string) {
        if (collected.length >= MAX_FILES || totalChars >= MAX_TOTAL_CHARS) return;
        for await (const entry of handle.values()) {
          const entryPath = `${path}/${entry.name}`;
          if (entry.kind === "directory") {
            if (SKIP_DIRS.has(entry.name)) continue;
            await traverse(entry, entryPath);
          } else if (entry.kind === "file") {
            if (!isTextFile(entry.name)) {
              collected.push({
                path: entryPath,
                name: entry.name,
                size: 0,
                isText: false,
                extension: entry.name.split(".").pop()?.toLowerCase() || "",
              });
              continue;
            }
            const file = await entry.getFile();
            const content = await readFileContent(file);
            if (content) totalChars += content.length;
            if (totalChars > MAX_TOTAL_CHARS) break;
            collected.push({
              path: entryPath,
              name: entry.name,
              size: file.size,
              isText: true,
              content,
              extension: entry.name.split(".").pop()?.toLowerCase() || "",
            });
          }
        }
      }

      await traverse(dirHandle, dirHandle.name);
      setFiles(collected);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setError(e.message || "Erreur d'accès au dossier.");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleClear = () => {
    setFiles([]);
    setFolderName(null);
    setError(null);
    if (fallbackInputRef.current) fallbackInputRef.current.value = "";
  };

  const textCount = files.filter((f) => f.isText).length;
  const binaryCount = files.length - textCount;

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6 sm:p-8 mb-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-slate-700" />
            Auditer un dossier projet
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            {language === "en"
              ? "Select your app folder to review code, UX, competitors, and run build & tests."
              : "Sélectionnez le dossier de votre app pour auditer le code, l'UX, les concurrents et lancer les tests de build."}
          </p>
        </div>

        {files.length > 0 && (
          <button
            onClick={handleClear}
            disabled={isAuditLoading || isTestLoading}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 self-start"
          >
            <X className="w-3.5 h-3.5" />
            {language === "en" ? "Clear" : "Effacer"}
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fallbackInputRef}
        // @ts-ignore — webkitdirectory / directory are non-standard but supported in modern browsers
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={(e) => collectFallbackFiles(e.target.files)}
      />

      {/* File picker and actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          onClick={handleDirectoryPicker}
          disabled={isScanning || isAuditLoading || isTestLoading}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            isScanning || isAuditLoading || isTestLoading
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {language === "en" ? "Scanning..." : "Analyse du dossier..."}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {language === "en" ? "Choose folder" : "Choisir un dossier"}
            </>
          )}
        </button>

        {files.length > 0 && (
          <>
            <button
              onClick={() => onAudit(files)}
              disabled={isAuditLoading || isTestLoading || isScanning}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors border ${
                isAuditLoading || isTestLoading || isScanning
                  ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-white text-slate-900 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {isAuditLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {language === "en" ? "Run audit" : "Lancer l'audit"}
            </button>

            <button
              onClick={() => onTest(files)}
              disabled={isAuditLoading || isTestLoading || isScanning}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors border ${
                isAuditLoading || isTestLoading || isScanning
                  ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-white text-slate-900 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {isTestLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Terminal className="w-4 h-4" />
              )}
              {language === "en" ? "Build & tests" : "Build & tests"}
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {folderName && files.length > 0 && (
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-slate-600" />
              {folderName}
            </span>
            <span className="text-xs text-slate-500">
              {files.length} fichier{files.length > 1 ? "s" : ""} ({textCount} texte{binaryCount > 0 ? `, ${binaryCount} binaire` : ""})
            </span>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
            {files.slice(0, 50).map((f) => (
              <div key={f.path} className="text-[11px] text-slate-600 font-mono truncate flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                {f.path}
              </div>
            ))}
            {files.length > 50 && (
              <div className="text-[11px] text-slate-400">... {files.length - 50} autres fichiers</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
