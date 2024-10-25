export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'greet') {
      console.log('Received message from content script:', message);
      sendResponse({ response: 'Hello from background script!' });
    }
  });

  // Example of setting up an event listener for browser tab updates
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.includes('linkedin.com')) {
      console.log('LinkedIn tab updated:', tab.url);
    }
  });
});