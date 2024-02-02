export {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, content } = message;
  if (type === "load") {
    console.log("load from -> ", content);
    const { url } = content;
    fetch(url).then((response) => {
      response.text().then((text) => {
        const payload = { status: response.status, text };
        console.log("load response -> ", payload);
        sendResponse(payload);
      });
    });
  }
  return true;
});
