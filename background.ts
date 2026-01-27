
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url || tab.url.startsWith('chrome://')) return;

  console.log('Extension icon clicked on tab:', tab.id);

  try {
    // Try to send a message to see if it's already there
    await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
    console.log('Content script already active, toggling...');
    chrome.tabs.sendMessage(tab.id, { action: 'toggle-ruler' });
  } catch (error) {
    console.log('Content script not found, injecting...', error);
    // If it fails, it's not there, so we inject it
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.tsx']
      });
      // After injection, wait a bit and toggle
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id!, { action: 'toggle-ruler' });
      }, 100);
    } catch (injectError) {
      console.error('Failed to inject script:', injectError);
    }
  }
});
