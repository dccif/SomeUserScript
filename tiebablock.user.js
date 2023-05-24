// ==UserScript==
// @name         tieba User Blocker
// @namespace    http://dccif.top/
// @version      0.1
// @description  在贴吧中屏蔽黑名单用户
// @author       dccif
// @match        *://tieba.baidu.com/*
// @match        *://tieba.baidu.com/p/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(async function () {
  "use strict";

  var blockedUsers = [];

  // css Thread List
  var threadCSS = ".threadlist_author";

  // get auther List
  let autherList = document.querySelectorAll(threadCSS);

  autherList.forEach((userdiv) => {
    // add button
    let addToblock = document.createElement("button");
    addToblock.innerHTML = "Add to block";
    userdiv.appendChild(addToblock);

    // get user id
    let userspan = userdiv.querySelector("span[data-field]");
    if (userspan) {
      let currentUserId = JSON.parse(
        userspan.getAttribute("data-field")
      ).user_id;

      // if in block list then remove
      if (blockedUsers.includes(currentUserId.toString())) {
        userspan.closest("li").remove();
      }
    }

    // button click event
    addToblock.addEventListener("click", () => {
      console.log("已经添加" + currentUserId);
    });
  });
})();
