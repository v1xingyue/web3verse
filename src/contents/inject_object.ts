import type { PlasmoCSConfig } from "plasmo";

export {};

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start",
  world: "MAIN",
};

window.Web3CommentGlobal = {
  loadUrl: async (url: string) => {
    return new Promise((resolve, reject) => {
      const uniqueId = `${url}_${Date.now()}`;

      const handler = (e: any) => {
        console.log("app info : ", e);
        const { status, text } = e.detail;
        if (status == 200) {
          resolve(text);
        } else {
          reject();
        }
        document.removeEventListener(uniqueId, handler);
      };

      document.addEventListener(uniqueId, handler);
      document.dispatchEvent(
        new CustomEvent("Web3VerseLoadEvent", {
          detail: {
            url,
            done: uniqueId,
          },
        })
      );
    });
  },
};
