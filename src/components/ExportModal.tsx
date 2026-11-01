import React, { useState } from 'react';
import { HEIGHT_TIERS, HeightTierId, PlotData } from '../types/survey';
import { X, Download, Copy, Check, FileSpreadsheet, Printer } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plot: PlotData;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, plot }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate CSV content
  const generateCSV = (): string => {
    const headers = [
      'Plot Name',
      'Date',
      'Surveyor',
      'Dimensions',
      'Species Name',
      'Botanic Code',
      'Growth Form',
      ...HEIGHT_TIERS.map((t) => `"${t.label}"`),
      'Species Total',
    ];

    const rows = plot.speciesList.map((sp) => {
      const counts = HEIGHT_TIERS.map((t) => sp.counts[t.id] || 0);
      const total = counts.reduce((a, b) => a + b, 0);
      return [
        `"${plot.name.replace(/"/g, '""')}"`,
        `"${plot.date}"`,
        `"${plot.surveyor || ''}"`,
        `"${plot.dimensions || ''}"`,
        `"${sp.name.replace(/"/g, '""')}"`,
        `"${sp.code || ''}"`,
        `"${sp.growthForm || ''}"`,
        ...counts,
        total,
      ].join(',');
    });

    // Summary totals row
    const tierTotals = HEIGHT_TIERS.map((t) =>
      plot.speciesList.reduce((sum, sp) => sum + (sp.counts[t.id] || 0), 0)
    );
    const grandTotal = tierTotals.reduce((a, b) => a + b, 0);
    const summaryRow = [
      `"${plot.name}"`,
      `"${plot.date}"`,
      '"TOTALS"',
      '""',
      '"CATEGORY TOTAL"',
      '""',
      '""',
      ...tierTotals,
      grandTotal,
    ].join(',');

    return [headers.join(','), ...rows, summaryRow].join('\n');
  };

  const handleDownloadCSV = () => {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `${plot.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_survey_${plot.date}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateTextSummary = (): string => {
    let text = `SURVEY PLOT: ${plot.name}\nDate: ${plot.date}\nSurveyor: ${plot.surveyor || 'N/A'}\n\n`;
    text += `SPECIES BREAKDOWN:\n`;
    text += `---------------------------------------------------------\n`;

    plot.speciesList.forEach((sp) => {
      const spTotal = Object.values(sp.counts).reduce((a, b) => a + b, 0);
      text += `• ${sp.name} (${sp.code || 'N/A'}) - Total: ${spTotal}\n`;
      HEIGHT_TIERS.forEach((t) => {
        const c = sp.counts[t.id] || 0;
        if (c > 0) {
          text += `    ${t.label.padEnd(10)}: ${c}\n`;
        }
      });
      text += `\n`;
    });

    text += `CATEGORY TOTALS ACROSS PLOT:\n`;
    text += `---------------------------------------------------------\n`;
    let grandTotal = 0;
    HEIGHT_TIERS.forEach((t) => {
      const total = plot.speciesList.reduce((s, sp) => s + (sp.counts[t.id] || 0), 0);
      grandTotal += total;
      text += `${t.label.padEnd(12)}: ${total}\n`;
    });
    text += `---------------------------------------------------------\n`;
    text += `GRAND TOTAL VEGETATION COUNT: ${grandTotal}\n`;

    return text;
  };

  const handleCopyClipboard = async () => {
    try {
      const summary = generateTextSummary();
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-6 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Export Survey Data</h3>
              <p className="text-xs text-slate-400">{plot.name} &bull; {plot.date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <button
            onClick={handleDownloadCSV}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Download CSV Datasheet</div>
                <div className="text-xs text-slate-400">Formatted spreadsheet compatible with Excel, R, QGIS</div>
              </div>
            </div>
          </button>

          <button
            onClick={handleCopyClipboard}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-slate-950 transition">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {copied ? 'Copied to Clipboard!' : 'Copy Formatted Text Summary'}
                </div>
                <div className="text-xs text-slate-400">Paste directly into field notes, emails, or reports</div>
              </div>
            </div>
          </button>

          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-slate-950 transition">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Print / PDF Datasheet</div>
                <div className="text-xs text-slate-400">Printer-friendly report for physical archive or binders</div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
