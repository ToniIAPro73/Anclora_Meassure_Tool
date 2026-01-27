
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked on tab:', tab.id);
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle-ruler' }).then(response => {
      console.log('Response from content script:', response);
    }).catch((err) => {
      console.error('Error sending message to content script:', err);
    });
  }
});
