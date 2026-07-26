'use client';

import { useEffect } from 'react';

const VISUAL_AGENT_PORT = process.env.NEXT_PUBLIC_VISUAL_AGENT_PORT || 3001;

export default function VisualAgentOverlay() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'development') return;

    const loadOverlay = async () => {
      try {
        const script = document.createElement('script');
        script.src = `/__visual-agent/index.js`;
        script.onload = () => {
          window.__VISUAL_AGENT_INIT__({ port: VISUAL_AGENT_PORT });
        };
        script.onerror = () => {
          console.warn('[Visual Agent] Server not running. Start with: visual-agent start');
        };
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `/__visual-agent/styles.css`;
        document.head.appendChild(link);
      } catch (error) {
        console.warn('[Visual Agent] Failed to load:', error);
      }
    };

    loadOverlay();
  }, []);

  return null;
}
