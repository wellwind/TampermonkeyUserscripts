// ==UserScript==
// @name         ChatGPT: 自動填入提示文字並自動送出
// @description  自動填入 ChatGPT 提示文字並可設定自動送出提問
// @version      3.1.1
// @source       https://github.com/wellwind/TampermonkeyUserscripts/raw/main/src/AutoFillChatGPT.user.js
// @namespace    https://github.com/wellwind/TampermonkeyUserscripts/raw/main/src/AutoFillChatGPT.user.js
// @website      https://fullstackladder.dev/
// @author       Mike Huang
// @license      MIT
// @match        *://chat.openai.com/chat*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        GM.registerMenuCommand
// ==/UserScript==

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
  if (!prompt) {
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

const defaultManualSubmitText = [
  // continue
  { text: "繼續", value: "繼續" },
  // exemplify
  { text: "舉例說明", value: "請舉例說明" },
  // expand
  { text: "提供細節", value: "請提供更多細節說明" },
  // explain
  { text: "解釋清楚", value: "請用更清楚的方式解釋" },
  // rewrite
  { text: "重寫內容", value: "請重寫上述內容" },
  // short
  { text: "簡化內容", value: "請用簡短的方式說明上述內容" },
  // translate to TC
  { text: "翻譯成繁中", value: "請將上述內容翻譯成流暢的繁體中文" },
  // translate to EN
  { text: "翻譯成英文", value: "請將上述內容翻譯成流暢的英文" },
];

const registerContextMenuToAutoFill = () => {
  defaultManualSubmitText.forEach((item) => {
    GM.registerMenuCommand(item.text, async () => {
      fillAndSubmitText(item.value);
    });
  });
};

const addButtonsToSendDefaultMessage = () => {
  let globalButtons = [];
  let buttonsArea = null;

  const main = document.querySelector("body");
  const obs = new MutationObserver(() => {
    // 尋找聊天記錄的最後一筆，用來插入按鈕
    const talkBlocks = document.querySelectorAll(
      ".text-base.gap-4.md\\:gap-6.m-auto.md\\:max-w-2xl.lg\\:max-w-2xl.xl\\:max-w-3xl.p-4.md\\:py-6.flex.lg\\:px-0:not(.custom-buttons-area)"
    );
    if (!talkBlocks || !talkBlocks.length) {
      return;
    }

    // 要被插入按鈕的區塊
    const talkBlockToInsertButtons = talkBlocks[talkBlocks.length - 1];

    // 先停止觀察，避免自訂畫面變更被觀察到
    stop();

    // 先將原來動態加入的內容移除

    // remove custom buttons
    globalButtons.forEach((button) => button.remove());
    globalButtons = [];

    // remove buttons area
    if (buttonsArea) {
      buttonsArea.remove();
    }

    // 重新將按鈕區和按鈕移除

    // create a new buttons area
    buttonsArea = document.createElement("div");
    buttonsArea.classList =
      "custom-buttons-area text-base m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl p-4 md:py-6 flex lg:px-0";
    buttonsArea.style.overflowY = "auto";
    buttonsArea.style.display = "flex";
    buttonsArea.style.flexWrap = "wrap";
    buttonsArea.style.paddingTop = 0;
    talkBlockToInsertButtons.after(buttonsArea);

    // add buttons
    defaultManualSubmitText.forEach((item) => {
      const button = document.createElement("button");
      button.style.border = "1px solid #d1d5db";
      button.style.borderRadius = "5px";
      button.style.padding = "0.5rem 1rem";
      button.style.margin = "0.5rem";

      button.innerText = item.text;
      button.addEventListener("click", () => {
        fillAndSubmitText(item.value);
      });

      buttonsArea.append(button);
      globalButtons.push(button);
    });

    // 重新開始觀察
    start();
  });

  const start = () => {
    obs.observe(main.parentElement, {
      childList: true,
      attributes: true,
      subtree: true,
    });
  };
  const stop = () => {
    obs.disconnect();
  };

  start();
};

(function () {
  "use strict";

  autoFillFromSegment();
  registerContextMenuToAutoFill();
  addButtonsToSendDefaultMessage();
})();
