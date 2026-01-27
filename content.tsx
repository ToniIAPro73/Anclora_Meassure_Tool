
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootId = 'vintage-ruler-extension-root';
let root: ReactDOM.Root | null = null;
let container: HTMLDivElement | null = null;
let isVisible = false;

const toggleRuler = () => {
  if (!container) {
    container = document.createElement('div');
    container.id = rootId;
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '2147483647'; // Max z-index
    container.style.pointerEvents = 'none'; // Background transparent to clicks
    
    // Create a shadow root to isolate styles
    const shadow = container.attachShadow({ mode: 'open' });
    
    // In v4, we need to inject the CSS into the shadow DOM manually
    // or let crxjs handle it (if it supports shadow DOM out of the box).
    // For now, let's create a container inside shadow
    const reactRoot = document.createElement('div');
    reactRoot.id = 'react-root';
    reactRoot.style.pointerEvents = 'auto'; // Re-enable clicks for our app
    shadow.appendChild(reactRoot);

    // Inject styles (simplified for now)
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    // This is a bit of a hack, in production we'd use the bundled CSS
    styleLink.href = chrome.runtime.getURL('index.css'); 
    shadow.appendChild(styleLink);

    document.body.appendChild(container);
    root = ReactDOM.createRoot(reactRoot);
  }

  isVisible = !isVisible;
  if (isVisible) {
    container.style.display = 'block';
    root?.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    container.style.display = 'none';
    // We keep it in DOM but hidden
  }
};

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'toggle-ruler') {
    toggleRuler();
  }
});

// Initial toggle if needed or just wait for message
console.log('Vintage Ruler Content Script Loaded');
