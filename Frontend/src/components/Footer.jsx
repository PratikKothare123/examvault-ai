import React from 'react';
import { ExternalLink, Heart } from 'lucide-react';

const FOOTER_STYLES = `
.app-footer {
  background-color: #1e293b;
  color: #94a3b8;
  padding: 1rem 1.5rem;
  text-align: center;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  border-top: 1px solid #334155;
  width: 100%;
  box-sizing: border-box;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.88rem;
}

.footer-heart {
  color: #ef4444;
  display: inline-flex;
  align-items: center;
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #60a5fa;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #93c5fd;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .footer-content {
    font-size: 0.8rem;
    gap: 0.35rem;
  }
}
`;

if (typeof document !== 'undefined') {
  const styleId = 'footer-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = FOOTER_STYLES;
    document.head.appendChild(style);
  }
}

export default function Footer() {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-content">
        <span>Made with</span>
        <span className="footer-heart">
          <Heart size={14} fill="currentColor" />
        </span>
        <span>by</span>
        <a
          href="https://github.com/PratikKothare123"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
          aria-label="Visit Pratik Kothare's GitHub profile"
        >
          <ExternalLink size={16} />
          PratikKothare
        </a>
      </div>
    </footer>
  );
}
