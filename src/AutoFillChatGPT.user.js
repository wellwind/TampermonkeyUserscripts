// ==UserScript==
// @name         ChatGPT: 自動填入提示文字並自動送出
// @description  自動填入 ChatGPT 提示文字並可設定自動送出提問
// @version      3.1.8
// @source       https://github.com/wellwind/TampermonkeyUserscripts/raw/main/src/AutoFillChatGPT.user.js
// @namespace    https://github.com/wellwind/TampermonkeyUserscripts/raw/main/src/AutoFillChatGPT.user.js
// @website      https://fullstackladder.dev/
// @author       Mike Huang
// @run-at       document-end
// @license      MIT
// @match        *://chat.openai.com/chat*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// ==/UserScript==

// ChatGPT 畫面產生後，還不會立刻取得 Acccess Token，這會導致送出失敗
// 目前的解決方式是檢查左邊 sidebar 是否已經讀取完，如果讀取完代表 Access Token 已經有了
const checkCanAccess = () => {
  const xpath = `//*[contains(text(), 'Not seeing what you expected here?')]`;
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  return result.snapshotLength == 0;
};

const autoFillFromSegment = () => {
  if (!location.hash) {
    return;
  }

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

  /**
   * 等待 focus 到訊息輸入框就開始初始化功能
   */
  const it = setInterval(() => {
    const textarea = document.activeElement;
    if (
      textarea.tagName === "TEXTAREA" &&
      textarea.nextSibling.tagName === "BUTTON" &&
      checkCanAccess()
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
        // workaround, 還沒拿到 token 前不送出, 目前無法判斷何時取得 token, 先等一秒
        //           setTimeout(() => {
        button.click();
        //           }, 1000);
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

  setTimeout(() => {
    // 預設的送出按鈕
    const button = textarea.parentElement.querySelector("button:last-child");
    button.click();
  }, 0);
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
  // list explain
  { text: "條列總結", value: "請以條列式的方式總結上述內容" },
  // rewrite
  { text: "重寫內容", value: "請重寫上述內容" },
  // short
  { text: "簡化內容", value: "請用簡短的方式說明上述內容" },
  // translate to TC
  { text: "翻譯成繁中", value: "請將上述內容翻譯成流暢的繁體中文" },
  // translate to EN
  { text: "翻譯成英文", value: "請將上述內容翻譯成流暢的英文" },
];

const addButtonsToSendDefaultMessage = () => {
  let globalButtons = [];
  let buttonsArea = null;

  const main = document.querySelector("body");
  const obs = new MutationObserver(() => {
    // 尋找聊天記錄的最後一筆，用來插入按鈕
    const talkBlocks = document.querySelectorAll(
      ".text-base.gap-4.md\\:gap-6.md\\:max-w-2xl.lg\\:max-w-xl.xl\\:max-w-3xl.p-4.md\\:py-6.flex.lg\\:px-0.m-auto"
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
    buttonsArea.style.paddingLeft = "calc(30px + 0.75rem)";
    talkBlockToInsertButtons.after(buttonsArea);

    // add buttons
    defaultManualSubmitText.forEach((item) => {
      let lastText = talkBlockToInsertButtons.innerText;

      const isPunctuation = (str) => {
        const punctuationRegex = /^(?![，,：:])[\p{P}\p{S}]$/u;
        return punctuationRegex.test(str);
      };

      // 最後一個字元如果是標點符號，就不要顯示「繼續」
      if (
        isPunctuation(lastText.charAt(lastText.length - 1)) &&
        item.text == "繼續"
      ) {
        return;
      }

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
  addButtonsToSendDefaultMessage();
})();
