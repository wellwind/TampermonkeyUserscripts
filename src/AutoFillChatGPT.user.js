// ==UserScript==
// @name         Auto fill to ChatGPT
// @description  Auto fill prompt to ChatGPT and get instantly result
// @version      1.1.2
// @source       https://github.com/wellwind/TampermonkeyUserscripts/raw/main/src/AutoFillChatGPT.user.js
// @namespace    https://github.com/wellwind/TampermonkeyUserscripts/raw/main/src/AutoFillChatGPT.user.js
// @website      https://fullstackladder.dev/
// @author       Mike Huang
// @license      MIT
// @match        *://chat.openai.com/chat*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // 取得網址搜尋字串
  const searchParams = new URLSearchParams(window.location.search);

  // 解析參數
  const prompt = searchParams.get("prompt");
  const autoSubmit = searchParams.get("autoSubmit");

  if (prompt) {
    // 隔一秒再處理，避免畫面還沒準備好
    setTimeout(() => {
      // 填入 prompt
      const textarea = document.querySelector("textarea[data-id=root]");
      textarea.value = decodeURIComponent(prompt).replace(/\\n/g, "\n");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      // 自動送出
      if (autoSubmit) {
        const button = textarea.parentElement.querySelector(
          "button.absolute.p-1.rounded-md.text-gray-500.bottom-1\\.5.right-1.md\\:bottom-2\\.5.md\\:right-2.hover\\:bg-gray-100.dark\\:hover\\:text-gray-400.dark\\:hover\\:bg-gray-900.disabled\\:hover\\:bg-transparent.dark\\:disabled\\:hover\\:bg-transparent"
        );
        button.click();
      }

      // 移除參數
      searchParams.delete("prompt");
      searchParams.delete("autoSubmit");

      // 更新網址
      const newUrl = `${window.location.origin}${
        window.location.pathname
      }?${searchParams.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }, 1000);
  }
})();
