// ==UserScript==
// @name         ChatGPT: 自動填入提示文字並自動送出
// @description  自動填入 ChatGPT 提示文字並可設定自動送出提問
// @version      2.3.1
// @source       https://github.com/wellwind/TampermonkeyUserscripts/raw/main/src/AutoFillChatGPT.user.js
// @namespace    https://github.com/wellwind/TampermonkeyUserscripts/raw/main/src/AutoFillChatGPT.user.js
// @website      https://fullstackladder.dev/
// @author       Mike Huang
// @license      MIT
// @match        *://chat.openai.com/chat*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        GM.registerMenuCommand
// ==/UserScript==

const fillAndSubmitText = (test) => {
  // 填入 text
  const textarea = document.querySelector("textarea");
  textarea.value = test;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  const button = textarea.parentElement.querySelector(
    "button.absolute.p-1.rounded-md.text-gray-500.bottom-1\\.5.right-1.md\\:bottom-2\\.5.md\\:right-2.hover\\:bg-gray-100.dark\\:hover\\:text-gray-400.dark\\:hover\\:bg-gray-900.disabled\\:hover\\:bg-transparent.dark\\:disabled\\:hover\\:bg-transparent"
  );
  button.click();
};

const registerContextMenuToAutoFill = () => {
  // exemplify
  GM.registerMenuCommand("舉例說明", async () => {
    fillAndSubmitText("請舉例說明");
  });
  // expand
  GM.registerMenuCommand("請提供更多細節說明", async () => {
    fillAndSubmitText("請提供更多細節說明");
  });
  // explain
  GM.registerMenuCommand("解釋得更清楚", async () => {
    fillAndSubmitText("請用更清楚的方式解釋");
  });
  // rewrite
  GM.registerMenuCommand("重寫上述內容", async () => {
    fillAndSubmitText("請重寫上述內容");
  });
  // short
  GM.registerMenuCommand("簡化上述內容", async () => {
    fillAndSubmitText("請用簡短的方式說明上述內容");
  });
  // translate to TC
  GM.registerMenuCommand("翻譯成繁中", async () => {
    fillAndSubmitText("請將上述內容翻譯成流暢的繁體中文");
  });
  // translate to EN
  GM.registerMenuCommand("翻譯成英文", async () => {
    fillAndSubmitText("請將上述內容翻譯成流暢的英文");
  });
};

const autoFillFromSegment = () => {
  /**
   * 等待 focus 到訊息輸入框就開始初始化功能
   */

  // 解析 hash 中的查詢字串並取得所需的參數
  const params = new URLSearchParams(location.hash.substring(1));

  // 解析參數
  const prompt = params
    .get("prompt")
    ?.replace(/\r/g, "")
    .replace(/\s+$/g, "")
    .replace(/\n{3,}/gs, "\n\n")
    .replace(/^\s+|\s+$/gs, "");
  const autoSubmit = params.get("autoSubmit");

  // 沒有 prompt 就不用作任何事情
  if (!params) {
    return;
  }
  const it = setInterval(() => {
    const textarea = document.activeElement;
    if (
      textarea.tagName === "TEXTAREA" &&
      textarea.nextSibling.tagName === "BUTTON"
    ) {
      // 預設的送出按鈕
      const button = textarea.parentElement.querySelector("button:last-child");

      // 填入 prompt
      textarea.value = prompt;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length); //將選擇範圍設定為文本的末尾
      textarea.scrollTop = textarea.scrollHeight; // 自動捲動到最下方

      // auto submit
      if (autoSubmit == "1" || autoSubmit == "true") {
        button.click();
      }

      // 移掉 segment 的參數
      history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );

      clearInterval(it);
    }
  }, 60);
};

(function () {
  "use strict";

  autoFillFromSegment();
  registerContextMenuToAutoFill();
})();
