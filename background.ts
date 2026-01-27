
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle-ruler' }).catch((err) => {
      console.log('Content script not ready or not allowed on this page:', err);
    });
  }
});
