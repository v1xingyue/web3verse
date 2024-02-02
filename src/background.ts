export {};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const { type, content } = message;
  if (type === "load") {
    const { url } = content;
    const response = await fetch(url);
    const text = await response.text();
    sendResponse({ status: response.status, text });
  }
});
