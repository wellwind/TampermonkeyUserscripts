// ==UserScript==
// @name         Auto fill to ChatGPT
// @description  Auto fill prompt to ChatGPT and get instantly result
// @version      2.0.0
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

  // 取得 # 後面的內容
  var hash = window.location.hash.slice(1);

  // 將 # 後面的內容轉換成查詢字串
  var query = hash.replace(/([^&=]+)=([^&]*)/g, (_, key, value) => {
    return key + "=" + encodeURIComponent(value);
  });

  // 解析查詢字串並取得所需的參數
  var params = new URLSearchParams(query);

  // 解析參數
  const prompt = params.get("prompt");
  const autoSubmit = params.get("autoSubmit");

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

      // 更新網址
      history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }, 1000);
  }
})();
