// ==UserScript==
// @name         Auto summarize article by ChatGPT
// @description  Send article to ChatGPT and get summarization result
// @version      0.0.1
// @source       https://github.com/wellwind/TampermonkeyUserscripts/raw/main/src/AutoSummarizeByChatGPT.user.js
// @namespace    https://github.com/wellwind/TampermonkeyUserscripts/raw/main/src/AutoSummarizeByChatGPT.user.js
// @website      https://fullstackladder.dev/
// @author       Mike Huang
// @license      MIT
// @match        http://*/*
// @match        https://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @run-at       context-menu
// ==/UserScript==

(function () {
  "use strict";
  const promptBase = '請使用流暢的繁體中文分析以下文章，提供我簡短的文章總結，並盡可能用條列的方式表示';
  const article = document.querySelector("article");
  if (article) {
    const prompt = encodeURIComponent(`${promptBase}\n\n${article.innerText}`);
    window.open(
      `https://chat.openai.com/chat?prompt=${prompt}&autoSubmit=true`
    );
  }
})();
