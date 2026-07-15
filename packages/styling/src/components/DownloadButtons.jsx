import React from 'react';
import { FileText, Table, Download } from 'lucide-react';
import Button from './Button';
import Tooltip from './Tooltip';

export default function DownloadButtons({
  onDownloadPDF,
  onDownloadExcel,
  pdfText = 'Download PDF Report',
  excelText = 'Download Excel Report'
}) {
  // If only PDF is provided, we might want to just show a simpler icon based on context,
  // but the instruction says to be consistent across all calculators and visualizers.
  // In visualizers, they use <Download> icon. We'll stick to FileText for PDF and Table for Excel as standard,
  // but allow an override or just use Download if it's the only one. Wait, let's use FileText and Table everywhere for consistency,
  // unless it's a generic download, then we can use Download icon.
  // But visualizers had "Download PDF" text. We will standardize to FileText for PDF.

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      {onDownloadPDF && (
        <Tooltip content={pdfText} className="flex-1 w-full">
          <Button
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 border-2 border-black"
            onClick={onDownloadPDF}
          >
            <FileText className="w-5 h-5" /> {pdfText}
          </Button>
        </Tooltip>
      )}
      {onDownloadExcel && (
        <Tooltip content={excelText} className="flex-1 w-full">
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2 border-2 border-black"
            onClick={onDownloadExcel}
          >
            <Table className="w-5 h-5" /> {excelText}
          </Button>
        </Tooltip>
      )}
    </div>
  );
}
