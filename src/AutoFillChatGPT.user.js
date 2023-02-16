// ==UserScript==
// @name         ChatGPT: 自動填入提示文字並自動送出
// @description  自動填入 ChatGPT 提示文字並可設定自動送出提問
// @version      2.1.1
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

  // 解析 hash 中的查詢字串並取得所需的參數
  var params = new URLSearchParams(location.hash.substring(1));

  // 解析參數
  let prompt = params.get("prompt");
  let autoSubmit = false;

  switch (params.get("autoSubmit")) {
    case 'true':
    case '1':
      autoSubmit = true
      break;
  }

  if (prompt) {
    // 隔一秒再處理，避免畫面還沒準備好
    setTimeout(() => {
      // 填入 prompt
      const textarea = document.querySelector("textarea[data-id=root]");
      textarea.value = decodeURIComponent(prompt).replace(/\\n/g, "\n");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      // 自動送出
      if (autoSubmit) {
        // 避免有複數按鈕
        const button = textarea.parentElement.querySelector("button:last-child");
        button.click();
      }

      // 更新網址
      history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }, 1000);
  }
})();
