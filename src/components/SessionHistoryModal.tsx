import { useEffect, useState } from "react";
import {
  History,
  X,
  Trash2,
  Download,
  Upload,
  FolderOpen,
  AlertCircle,
  Clock,
} from "lucide-react";
import { MarketingSession } from "../types";
import {
  SessionHistoryEntry,
  loadSessionHistory,
  deleteSessionFromHistory,
  clearSessionHistory,
  exportSessionAsJson,
} from "../utils/sessionHistory";

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSession: (session: MarketingSession, appName: string) => void;
}

export default function SessionHistoryModal({
  isOpen,
  onClose,
  onLoadSession,
}: SessionHistoryModalProps) {
  const [entries, setEntries] = useState<SessionHistoryEntry[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEntries(loadSessionHistory());
      setImportError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    setEntries(deleteSessionFromHistory(id));
  };

  const handleClearAll = () => {
    clearSessionHistory();
    setEntries([]);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const session: MarketingSession = parsed.session || parsed;
        if (!session || !session.appOverview) {
          throw new Error("Format de session invalide.");
        }
        onLoadSession(session, parsed.appName || session.appOverview.detectedName || "Import");
        onClose();
      } catch (err: any) {
        setImportError(err.message || "Fichier invalide.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Historique des sessions</h3>
              <p className="text-xs text-slate-500">
                {entries.length} session{entries.length > 1 ? "s" : ""} sauvegardée{entries.length > 1 ? "s" : ""} localement
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

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {entries.length === 0 && (
            <div className="text-center py-10 text-sm text-slate-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Aucune session sauvegardée. Générez une session pour la retrouver ici.
            </div>
          )}

          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-emerald-300 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{entry.appName}</p>
                <p className="text-[11px] text-slate-500">{formatDate(entry.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    onLoadSession(entry.session, entry.appName);
                    onClose();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Charger
                </button>
                <button
                  onClick={() => exportSessionAsJson(entry)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
                  title="Exporter en JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {importError && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {importError}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-4">
          <label className="cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Importer un JSON
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </label>
          {entries.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Tout effacer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
