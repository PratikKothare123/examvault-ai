import React from 'react';
import { FileText, Bell, BookOpen, Users, CheckCircle2, Inbox, Search } from 'lucide-react';

const ICON_MAP = {
  papers: FileText,
  notifications: Bell,
  subjects: BookOpen,
  faculty: Users,
  pending: CheckCircle2,
  empty: Inbox,
  search: Search,
};

const EMPTY_STATE_STYLES = `
.empty-state-component {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  color: #64748b;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.empty-state-icon {
  margin-bottom: 1rem;
  color: #94a3b8;
}

.empty-state-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.4rem 0;
}

.empty-state-message {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 1.5rem 0;
  max-width: 400px;
  line-height: 1.5;
}

.empty-state-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  font-size: 0.88rem;
  font-weight: 600;
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.empty-state-action:hover {
  background-color: #1d4ed8;
}
`;

if (typeof document !== 'undefined') {
  const styleId = 'empty-state-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = EMPTY_STATE_STYLES;
    document.head.appendChild(style);
  }
}

export default function EmptyState({
  icon = 'empty',
  title = 'Nothing Found',
  message = 'No items to display at the moment.',
  actionLabel,
  onAction,
}) {
  const IconComponent = ICON_MAP[icon] || Inbox;

  return (
    <div className="empty-state-component" role="status">
      <div className="empty-state-icon">
        <IconComponent size={48} strokeWidth={1.2} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="empty-state-action"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

