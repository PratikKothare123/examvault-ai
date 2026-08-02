import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ExternalLink, Download, Loader2, AlertCircle } from 'lucide-react';
import { downloadPaperFile } from '../utils/paperDownload.js';

const PDF_VIEWER_STYLES = `
.pdf-viewer-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.pdf-viewer-container {
  width: 100%;
  max-width: 1000px;
  height: 90vh;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pdf-viewer-header {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pdf-viewer-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.pdf-viewer-header-left h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.pdf-viewer-meta {
  font-size: 0.78rem;
  color: #64748b;
}

.pdf-viewer-controls {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.pdf-viewer-control-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.4rem 0.7rem;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #0f172a;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s;
}

.pdf-viewer-control-btn:hover {
  background-color: #e2e8f0;
}

.pdf-viewer-control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pdf-viewer-control-btn.primary {
  background-color: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.pdf-viewer-control-btn.primary:hover {
  background-color: #1d4ed8;
}

.pdf-viewer-control-btn.danger {
  background-color: #fef2f2;
  color: #dc2626;
  border-color: #fca5a5;
}

.pdf-viewer-control-btn.danger:hover {
  background-color: #fee2e2;
}

.pdf-viewer-body {
  flex: 1;
  background-color: #cbd5e1;
  position: relative;
  overflow: hidden;
}

.pdf-viewer-body iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.pdf-viewer-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  gap: 1rem;
}

.pdf-viewer-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fef2f2;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.pdf-viewer-error h3 {
  color: #991b1b;
  margin: 0;
}

.pdf-viewer-error p {
  color: #b91c1c;
  font-size: 0.9rem;
  max-width: 400px;
}

.zoom-level {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  min-width: 45px;
  text-align: center;
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

.page-nav input {
  width: 40px;
  text-align: center;
  padding: 0.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.8rem;
  outline: none;
}

.page-nav input:focus {
  border-color: #2563eb;
}

@media (max-width: 768px) {
  .pdf-viewer-modal {
    padding: 0;
  }
  
  .pdf-viewer-container {
    max-width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .pdf-viewer-header {
    padding: 0.65rem 0.85rem;
  }

  .pdf-viewer-header-left h3 {
    font-size: 0.85rem;
  }

  .pdf-viewer-controls {
    gap: 0.25rem;
  }

  .pdf-viewer-control-btn {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'pdf-viewer-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = PDF_VIEWER_STYLES;
    document.head.appendChild(style);
  }
}

export default function PDFViewer({ paper, onClose, onDownload }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(!paper?._id);
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const previewTimeoutRef = useRef(null);

  const token = localStorage.getItem('token') || '';
  const previewUrl = paper?._id
    ? `/api/v1/papers/${paper._id}/download?inline=true${token ? `&token=${encodeURIComponent(token)}` : ''}`
    : paper?.fileUrl || '';

  useEffect(() => {
    if (!previewUrl) {
      setLoading(false);
      setError(true);
      return undefined;
    }

    setLoading(true);
    setError(false);
    previewTimeoutRef.current = window.setTimeout(() => {
      setLoading(false);
      setError(true);
    }, 12000);

    return () => window.clearTimeout(previewTimeoutRef.current);
  }, [previewUrl]);

  const handleIframeLoad = useCallback(() => {
    window.clearTimeout(previewTimeoutRef.current);
    setLoading(false);
  }, []);

  const handleIframeError = useCallback(() => {
    window.clearTimeout(previewTimeoutRef.current);
    setLoading(false);
    setError(true);
  }, []);

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 25));

  const handlePageChange = (e) => {
    const val = parseInt(e.target.value) || 1;
    setPage(Math.max(1, val));
  };

  const deptCode = paper?.departmentId?.deptCode || '';
  const semNum = paper?.semester ? paper.semester.replace('Semester ', 'Sem_') : '';
  const subCode = paper?.subjectId?.subjectCode || '';
  const year = paper?.academicYear ? paper.academicYear.split('-')[0] : '';
  const examType = paper?.examType || '';
  const fileName = deptCode ? `${deptCode}_${semNum}_${subCode}_${year}_${examType}.pdf` : 'paper.pdf';

  const handleDownload = () => {
    if (onDownload) {
      onDownload(paper, fileName);
    } else {
      downloadPaperFile(paper, fileName);
    }
  };

  const handleOpenNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  return (
    <div className="pdf-viewer-modal" onClick={onClose}>
      <div className="pdf-viewer-container" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-header-left">
            <h3>{paper?.subjectId?.subjectName} ({paper?.subjectId?.subjectCode})</h3>
            <span className="pdf-viewer-meta">
              {deptCode} • {paper?.semester} • {examType} ({paper?.academicYear})
            </span>
          </div>

          <div className="pdf-viewer-controls">
            <button
              type="button"
              className="pdf-viewer-control-btn"
              onClick={zoomOut}
              disabled={zoom <= 25}
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="zoom-level">{zoom}%</span>
            <button
              type="button"
              className="pdf-viewer-control-btn"
              onClick={zoomIn}
              disabled={zoom >= 200}
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn size={16} />
            </button>

            <div className="page-nav">
              <button
                type="button"
                className="pdf-viewer-control-btn"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <input
                type="number"
                value={page}
                onChange={handlePageChange}
                min={1}
                aria-label="Current page number"
              />
              <button
                type="button"
                className="pdf-viewer-control-btn"
                onClick={() => setPage(p => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <button
              type="button"
              className="pdf-viewer-control-btn"
              onClick={handleOpenNewTab}
              title="Open in New Tab"
              aria-label="Open PDF in new tab"
            >
              <ExternalLink size={16} />
            </button>

            <button
              type="button"
              className="pdf-viewer-control-btn primary"
              onClick={handleDownload}
              title="Download PDF"
              aria-label="Download PDF"
            >
              <Download size={16} />
              Download
            </button>

            <button
              type="button"
              className="pdf-viewer-control-btn danger"
              onClick={onClose}
              title="Close Preview"
              aria-label="Close preview"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="pdf-viewer-body">
          {loading && (
            <div className="pdf-viewer-loading">
              <Loader2 size={40} className="spinner" style={{ color: '#2563eb', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#64748b', fontWeight: 600 }}>Loading PDF preview...</p>
            </div>
          )}

          {error && (
            <div className="pdf-viewer-error">
              <AlertCircle size={48} style={{ color: '#dc2626' }} />
              <h3>We can not open this file</h3>
              <p>Something went wrong while loading the PDF preview. Please try downloading the paper or contact an admin if the file still does not open.</p>
              <button
                type="button"
                className="pdf-viewer-control-btn primary"
                onClick={handleDownload}
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
          )}

          <iframe
            src={previewUrl}
            title={`${paper?.subjectId?.subjectName} PDF Preview`}
            style={{
              width: zoom === 100 ? '100%' : `${zoom}%`,
              height: '100%',
              border: 'none',
              transform: zoom !== 100 ? `scale(${zoom / 100})` : 'none',
              transformOrigin: 'top left',
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      </div>
    </div>
  );
}
