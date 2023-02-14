// ==UserScript==
// @name         Auto summarize article by ChatGPT
// @description  Send article to ChatGPT and get summarization result
// @version      0.1.0
// @source       https://github.com/wellwind/TampermonkeyUserscripts/raw/main/src/AutoSummarizeByChatGPT.user.js
// @namespace    https://github.com/wellwind/TampermonkeyUserscripts/raw/main/src/AutoSummarizeByChatGPT.user.js
// @website      https://fullstackladder.dev/
// @author       Mike Huang
// @license      MIT
// @match        http://*/*
// @match        https://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.registerMenuCommand
// ==/UserScript==

const setAutoFill = async () => {
  // 隔一秒再處理，避免畫面還沒準備好
  setTimeout(async () => {
    const prompt = await GM.getValue("prompt", "");
    if (prompt) {
      // 填入 prompt
      const textarea = document.querySelector("textarea[data-id=root]");
      textarea.value = prompt;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      const button = textarea.parentElement.querySelector(
        "button.absolute.p-1.rounded-md.text-gray-500.bottom-1\\.5.right-1.md\\:bottom-2\\.5.md\\:right-2.hover\\:bg-gray-100.dark\\:hover\\:text-gray-400.dark\\:hover\\:bg-gray-900.disabled\\:hover\\:bg-transparent.dark\\:disabled\\:hover\\:bg-transparent"
      );
      button.click();

      // 清除暫存的 prompt
      await GM.setValue("prompt", "");
    }
  }, 1000);
};

const registerContextMenu = async () => {
  GM.registerMenuCommand(
    "Summarize this article",
    async () => {
      const promptBase =
        "請使用流暢的繁體中文分析以下文章，提供我簡短的文章總結，並盡可能用條列的方式表示";

      const article = document.querySelector("article");

      // 有 article 標籤才處理
      if (article) {
        // 複製一份 DOM
        const clonedArticle = article.cloneNode(true);

        // 節省空間，移除 `<pre>` 標籤，因為通常是程式碼
        const preTags = clonedArticle.querySelectorAll("pre");
        preTags.forEach((tag) => {
          tag.remove();
        });

        // 設定 prompt 並打開 ChatGPT
        const prompt = `${promptBase}\n\n${clonedArticle.innerText}`;
        await GM.setValue("prompt", prompt);
        window.open("https://chat.openai.com/chat", "_blank");
      }
    },
    "c"
  );
};

(async function () {
  "use strict";

  if (location.hostname === "chat.openai.com") {
    console.log("submit");
    await setAutoFill();
  } else {
    console.log("register");
    await registerContextMenu();
  }
})();
