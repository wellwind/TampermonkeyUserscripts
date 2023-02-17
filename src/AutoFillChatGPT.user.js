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

(async function () {
    "use strict";

    const {
        filter,
        interval,
        map,
        take
    } = await import('https://cdn.jsdelivr.net/npm/@esm-bundle/rxjs/esm/es2015/rxjs.min.js');

    /**
     * 等待 focus 到訊息輸入框就開始初始化功能
     */
    interval(100).pipe(
        map(() => document.activeElement),
        filter((element) => element.tagName === 'TEXTAREA' && element.nextSibling.tagName === 'BUTTON'),
        take(1)
    )
        .subscribe((textarea) => {
            // 預設的送出按鈕
            const button = textarea.parentElement.querySelector("button:last-child");

            // 解析 hash 中的查詢字串並取得所需的參數
            var params = new URLSearchParams(location.hash.substring(1));

            // 解析參數
            let prompt = params.get('prompt')
                .replace(/\\r/g, '')
                .replace(/\\n/g, '\n')
                .replace(/\s+$/mg, '')
                .replace(/\n{3,}/g, '\n\n')
                .replace(/^\s+|\s+$/g, '')
            let submit = params.get("autoSubmit");

            let autoSubmit = false;
            if (submit == '1' || submit == 'true') {
                autoSubmit = true
            }

            if (prompt) {
                textarea.value = prompt;
                textarea.dispatchEvent(new Event("input", { bubbles: true }));

                if (autoSubmit) {
                    button.click();
                }

                history.replaceState({}, document.title, window.location.pathname + window.location.search);
            }

        });
})();
