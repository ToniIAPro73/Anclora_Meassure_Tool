
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';



const rootId = 'vintage-ruler-extension-root';
let root: ReactDOM.Root | null = null;
let container: HTMLDivElement | null = null;
let isVisible = false;

import styles from './index.css?inline';

const toggleRuler = () => {
  if (!container) {
    container = document.createElement('div');
    container.id = rootId;
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '2147483647';
    container.style.pointerEvents = 'none';
    
    const shadow = container.attachShadow({ mode: 'open' });
    
    // Inject styles directly
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    shadow.appendChild(styleSheet);
    
    const reactRoot = document.createElement('div');
    reactRoot.id = 'react-root';
    reactRoot.style.pointerEvents = 'auto';
    shadow.appendChild(reactRoot);

    document.body.appendChild(container);
    root = ReactDOM.createRoot(reactRoot);
  }

  isVisible = !isVisible;
  if (isVisible) {
    container.style.display = 'block';
    container.style.width = '100vw';
    container.style.height = '100vh';
    root?.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    container.style.display = 'none';
    container.style.width = '0';
    container.style.height = '0';
  }
};

console.log('Vintage Ruler Content Script Loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script:', request);
  if (request.action === 'ping') {
    sendResponse({ status: 'pong' });
    return;
  }
  if (request.action === 'toggle-ruler') {
    toggleRuler();
    sendResponse({ status: 'success' });
  }
});
