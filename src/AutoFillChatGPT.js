// ==UserScript==
// @name         Auto fill to ChatGPT
// @namespace    https://fullstackladder.dev
// @version      0.1
// @description  Auto fill prompt to ChatGPT and get instantly result
// @author       Mike Huang
// @match        https://chat.openai.com/chat*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // 取得網址搜尋字串
  const searchParams = new URLSearchParams(window.location.search);

  // 解析參數
  const prompt = decodeURIComponent(searchParams.get("prompt"));

  // 更新網址
  const newUrl = `${window.location.origin}${
    window.location.pathname
  }?${searchParams.toString()}`;
  window.history.replaceState({}, "", newUrl);

  setTimeout(() => {
    const textarea = document.querySelector("textarea[data-id=root]");
    const button = textarea.parentElement.querySelector(
      "button.absolute.p-1.rounded-md.text-gray-500.bottom-1\\.5.right-1.md\\:bottom-2\\.5.md\\:right-2.hover\\:bg-gray-100.dark\\:hover\\:text-gray-400.dark\\:hover\\:bg-gray-900.disabled\\:hover\\:bg-transparent.dark\\:disabled\\:hover\\:bg-transparent"
    );
    textarea.value = prompt.replace(/\\n/g, "\n");
    button.click();

    // 移除 prompt 參數
    searchParams.delete("prompt");
  }, 1000);
})();
