import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const CONFIRM_MODAL_STYLES = `
.confirm-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.confirm-modal-box {
  width: 100%;
  max-width: 420px;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  overflow: hidden;
}

.confirm-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.confirm-modal-header h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.confirm-modal-body {
  padding: 1.25rem 1.5rem;
  font-size: 0.92rem;
  color: #475569;
  line-height: 1.6;
}

.confirm-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.confirm-modal-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.1rem;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #ffffff;
  color: #0f172a;
}

.confirm-modal-btn:hover {
  background-color: #f1f5f9;
}

.confirm-modal-btn.danger {
  background-color: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
}

.confirm-modal-btn.danger:hover {
  background-color: #b91c1c;
}

.confirm-modal-btn.primary {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.confirm-modal-btn.primary:hover {
  background-color: #1d4ed8;
}

.confirm-modal-close {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.confirm-modal-close:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}
`;

if (typeof document !== 'undefined') {
  const styleId = 'confirm-modal-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = CONFIRM_MODAL_STYLES;
    document.head.appendChild(style);
  }
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-backdrop" onClick={onClose}>
      <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3>
            <AlertTriangle size={20} style={{ color: variant === 'danger' ? '#dc2626' : '#2563eb' }} />
            {title}
          </h3>
          <button
            type="button"
            className="confirm-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="confirm-modal-body">{message}</div>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-btn"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-modal-btn ${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

