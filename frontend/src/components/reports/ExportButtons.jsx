import { useState } from 'react';
import { Button } from '../ui/Button.jsx';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { exportOverviewCsv, exportWorkoutCsv, exportNutritionCsv, exportProgressCsv } from '../../utils/csvExport.js';
import { exportOverviewPdf, exportWorkoutPdf, exportNutritionPdf, exportProgressPdf } from '../../utils/pdfExport.js';

const CSV_EXPORTERS = {
    overview: exportOverviewCsv,
    workout: exportWorkoutCsv,
    nutrition: exportNutritionCsv,
    progress: exportProgressCsv,
};

const PDF_EXPORTERS = {
    overview: exportOverviewPdf,
    workout: exportWorkoutPdf,
    nutrition: exportNutritionPdf,
    progress: exportProgressPdf,
};

export function ExportButtons({ reportType, data, dateRange, userName }) {
    const [exporting, setExporting] = useState(null);
    const [failedType, setFailedType] = useState(null);
    const [announce, setAnnounce] = useState('');

    async function handleExport(type) {
        setFailedType(null);
        setExporting(type);
        setAnnounce('');
        try {
            const exporter = type === 'csv' ? CSV_EXPORTERS[reportType] : PDF_EXPORTERS[reportType];
            if (!exporter) throw new Error(`No exporter for ${reportType}/${type}`);
            exporter(data, dateRange, userName);
            setAnnounce(`${reportType} report exported as ${type.toUpperCase()}`);
        } catch (err) {
            setFailedType(type);
            setAnnounce(`Export ${type.toUpperCase()} failed`);
        } finally {
            setExporting(null);
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div aria-live="polite" className="sr-only">{announce}</div>
            <Button
                variant="secondary"
                size="sm"
                icon={<FileSpreadsheet className="h-4 w-4" />}
                isLoading={exporting === 'csv'}
                onClick={() => void handleExport('csv')}
                disabled={!!exporting}
            >
                {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button
                variant="secondary"
                size="sm"
                icon={<FileText className="h-4 w-4" />}
                isLoading={exporting === 'pdf'}
                onClick={() => void handleExport('pdf')}
                disabled={!!exporting}
            >
                {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
            </Button>
            {failedType && (
                <div className="flex items-center gap-3 rounded-xl border border-error/30 bg-error/10 px-4 py-2">
                    <p className="text-sm text-error" role="alert">
                        Export {failedType.toUpperCase()} failed. No file was downloaded.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => void handleExport(failedType)}>
                        Retry
                    </Button>
                </div>
            )}
        </div>
    );
}