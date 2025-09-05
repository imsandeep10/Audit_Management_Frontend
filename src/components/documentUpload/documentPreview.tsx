import { Dialog, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Download, ExternalLink, FileText, File, Image, Table, FileType, X, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "../../components/ui/skeleton";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';


interface DocumentPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    document: {
        id: string;
        originalName: string;
        url: string;
        documentType: string;
        size: number;
    } | null;
}

export function DocumentPreview({ isOpen, onClose, document }: DocumentPreviewProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'pdf' | 'image' | 'text' | 'docx' | 'xlsx' | 'pptx' | 'google-viewer' | 'fallback' | null>(null);
    const [excelSheets, setExcelSheets] = useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = useState<string>('');

    useEffect(() => {
        if (isOpen && document) {
            // Check if document is PDF and open in new tab instead of preview
            const extension = document.originalName.split('.').pop()?.toLowerCase();
            if (extension === 'pdf') {
                window.open(document.url, '_blank');
                onClose(); // Close the dialog
                return;
            }
            
            determinePreviewMode();
        }
        return () => {
            // Clean up when component unmounts
            setPreviewContent(null);
            setPreviewMode(null);
        };
    }, [isOpen, document]);

    const determinePreviewMode = useCallback(() => {
        if (!document) return;

        setIsLoading(true);
        setError(null);

        const extension = document.originalName.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'pdf':
                // This case should not be reached anymore since we handle PDFs in useEffect
                // But keeping it as a fallback
                try {
                    setPreviewMode('pdf');
                    setIsLoading(true);
                } catch (error) {
                    console.warn('PDF preview not available, falling back to Google viewer:', error);
                    setPreviewMode('google-viewer');
                    setIsLoading(false);
                }
                break;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                setPreviewMode('image');
                setIsLoading(false);
                break;
            case 'txt':
            case 'md':
            case 'html':
            case 'css':
            case 'js':
            case 'json':
                setPreviewMode('text');
                fetchTextContent();
                break;
            case 'docx':
                setPreviewMode('docx');
                previewDocxDocument();
                break;
            case 'xls':
            case 'xlsx':
                setPreviewMode('xlsx');
                previewExcelDocument();
                break;
            case 'ppt':
            case 'pptx':
                setPreviewMode('pptx');
                setIsLoading(false);
                break;
            default:
                setPreviewMode('fallback');
                setIsLoading(false);
        }
    }, [document]);

    const fetchWithRetry = async (url: string, options = {}, retries = 3): Promise<Response> => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response;
            } catch (error) {
                if (i === retries - 1) throw error;
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
        throw new Error('All retries failed'); // This ensures we never return undefined
    };

    const fetchTextContent = async () => {
        if (!document) return;

        try {
            const response = await fetchWithRetry(document.url);
            const text = await response.text();
            setPreviewContent(text);
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to fetch text content:', err);
            setError('Failed to load document content. Please check your connection and try again.');
            setIsLoading(false);
        }
    };

    const previewDocxDocument = async () => {
        if (!document) return;

        try {
            const response = await fetchWithRetry(document.url);
            const arrayBuffer = await response.arrayBuffer();

            const result = await mammoth.convertToHtml({ arrayBuffer });
            setPreviewContent(result.value);

            setIsLoading(false);
        } catch (err) {
            console.error('Failed to convert Word document:', err);
            setError('Failed to preview Word document. The file may be corrupted or inaccessible.');
            setIsLoading(false);
        }
    };

    const previewExcelDocument = async () => {
        if (!document) return;

        try {
            const response = await fetchWithRetry(document.url);
            if (!response.ok) throw new Error('Failed to fetch document');
            
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });

            // Set available sheets
            setExcelSheets(workbook.SheetNames);
            setSelectedSheet(workbook.SheetNames[0] || '');

            // Convert first sheet to HTML
            if (workbook.SheetNames.length > 0) {
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const html = XLSX.utils.sheet_to_html(worksheet);
                setPreviewContent(html);
            }
            
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to convert Excel document:', err);
            setError('Failed to preview Excel document');
            setPreviewMode('google-viewer');
            setIsLoading(false);
        }
    };

    const changeExcelSheet = async (sheetName: string) => {
        if (!document) return;

        try {
            setIsLoading(true);
            const response = await fetchWithRetry(document.url);
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            const worksheet = workbook.Sheets[sheetName];
            const html = XLSX.utils.sheet_to_html(worksheet);
            
            setPreviewContent(html);
            setSelectedSheet(sheetName);
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to change Excel sheet:', err);
            setError('Failed to load Excel sheet');
            setIsLoading(false);
        }
    };


    const getDownloadUrl = () => {
        return document?.url || '';
    };

    const getFileType = () => {
        if (!document) return '';

        const extension = document.originalName.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'pdf':
                return 'PDF Document';
            case 'doc':
            case 'docx':
                return 'Word Document';
            case 'xls':
            case 'xlsx':
                return 'Excel Spreadsheet';
            case 'ppt':
            case 'pptx':
                return 'PowerPoint Presentation';
            case 'jpg':
            case 'jpeg':
                return 'JPEG Image';
            case 'png':
                return 'PNG Image';
            case 'gif':
                return 'GIF Image';
            case 'txt':
                return 'Text File';
            default:
                return 'Document';
        }
    };

    const renderPreviewContent = () => {
        if (!document) return null;

        switch (previewMode) {
            case 'pdf':
                // This case should not be reached anymore since we handle PDFs in useEffect
                return (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">PDF Opened in New Tab</h3>
                        <p className="text-muted-foreground mb-4">
                            The PDF document has been opened in a new browser tab.
                        </p>
                        <Button asChild>
                            <a
                                href={getDownloadUrl()}
                                download={document.originalName}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Download PDF
                            </a>
                        </Button>
                    </div>
                );

            case 'image':
                return (
                    <div className="flex-1 flex items-center justify-center overflow-auto">
                        <img
                            src={document.url}
                            alt={document.originalName}
                            className="max-w-full max-h-full object-contain"
                            onError={() => {
                                setError('Failed to load image');
                                setPreviewMode('fallback');
                            }}
                        />
                    </div>
                );

            case 'text':
                return (
                    <div className="flex-1 overflow-auto h-full">
                        <pre className="whitespace-pre-wrap p-4 bg-muted/50 rounded-md text-sm font-mono h-full overflow-auto">
                            {previewContent || 'Loading content...'}
                        </pre>
                    </div>
                );

            case 'docx':
                return (
                    <div className="flex-1 w-full h-full overflow-auto">
                        <div
                            className="p-4 bg-white docx-preview h-full overflow-auto"
                            dangerouslySetInnerHTML={{ __html: previewContent || 'Loading Word document...' }}
                        />
                    </div>
                );

            case 'xlsx':
                return (
                    <div className="flex-1 flex flex-col h-full">
                        {/* Excel Sheet Navigation */}
                        {excelSheets.length > 1 && (
                            <div className="flex items-center gap-2 p-2 border-b flex-shrink-0">
                                <span className="text-sm font-medium">Sheet:</span>
                                <Select value={selectedSheet} onValueChange={changeExcelSheet}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {excelSheets.map((sheet) => (
                                            <SelectItem key={sheet} value={sheet}>
                                                {sheet}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        
                        <div className="flex-1 overflow-auto h-full">
                            <div
                                className="p-4 excel-preview overflow-auto h-full"
                                dangerouslySetInnerHTML={{ __html: previewContent || 'Loading Excel document...' }}
                            />
                        </div>
                    </div>
                );

            case 'pptx':
                return (
                    <div className="flex-1 flex flex-col h-full">
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg">
                                <iframe
                                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.url)}`}
                                    width="100%"
                                    height="100%"
                                    className="rounded-lg"
                                    title={document.originalName}
                                />
                            </div>
                        </div>
                        <div className="p-2 border-t text-center text-sm text-muted-foreground flex-shrink-0">
                            PowerPoint presentation preview (Microsoft Office Online)
                        </div>
                    </div>
                );

            case 'google-viewer':
                return (
                    <div className="flex-1 flex flex-col h-full">
                        <div className="flex-1 overflow-hidden">
                            <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(document.url)}&embedded=true`}
                                width="100%"
                                height="100%"
                                title={document.originalName}
                                className="border-0"
                            />
                        </div>
                        <div className="p-2 border-t text-center text-sm text-muted-foreground flex-shrink-0">
                            Document preview powered by Google Docs Viewer
                        </div>
                    </div>
                );

            case 'fallback':
            default:
                return (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Preview Not Available</h3>
                        <p className="text-muted-foreground mb-4">
                            We couldn't generate a preview for this document type.
                            Please download it to view the contents.
                        </p>
                        <Button asChild>
                            <a
                                href={getDownloadUrl()}
                                download={document.originalName}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Download className="h-4 w-4 mr-1" />

                                Download Document
                            </a>
                        </Button>
                    </div>
                );
        }
    };

    const getFileIcon = () => {
        if (!document) return <File className="h-6 w-6" />;

        const extension = document.originalName.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'pdf':
                return <FileText className="h-6 w-6 text-red-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return <Image className="h-6 w-6 text-blue-500" />;
            case 'doc':
            case 'docx':
                return <FileType className="h-6 w-6 text-blue-600" />;
            case 'xls':
            case 'xlsx':
                return <Table className="h-6 w-6 text-green-600" />;
            case 'ppt':
            case 'pptx':
                return <FileType className="h-6 w-6 text-orange-600" />;
            default:
                return <File className="h-6 w-6" />;
        }
    };

    if (!document) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <div className="fixed inset-2 z-50 w-screen h-screen max-w-none max-h-none m-0  bg-gray-50 flex flex-col">
                <DialogHeader className="flex flex-row items-center justify-between pb-4 mr-10 ml-10 border-b flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        {getFileIcon()}
                        <span className="truncate max-w-md">{document.originalName}</span>
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        {/* <Button
                            variant="outline"
                            size="sm"
                            asChild
                        >
                            <a
                                href={getDownloadUrl()}
                                download={document.originalName}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                            </a>
                        </Button> */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => determinePreviewMode()}
                            disabled={isLoading}
                        >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Retry
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                            Close
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Skeleton className="h-8 w-8 mx-auto mb-2" />
                                <p>Loading preview...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-4">
                            <div className="text-center text-destructive">
                                <p className="font-medium">Error loading preview</p>
                                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                                <div className="mt-4 space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={determinePreviewMode}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        Try Again
                                    </Button>
                                    <Button
                                        asChild
                                    >
                                        <a
                                            href=""
                                            download={document.originalName}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            Download Instead
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        renderPreviewContent()
                    )}

                    <div className="mt-4 pt-2 border-t text-sm text-muted-foreground flex justify-between items-center px-4 pb-4 flex-shrink-0">
                        <span>{getFileType()} • {formatBytes(document.size)}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                        >
                            <a
                                href={getDownloadUrl()}
                                download={document.originalName}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                            >
                                <ExternalLink className="h-3 w-3" />
                                Open in new tab
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}