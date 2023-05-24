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

  var blockedUsers = ["2157031743", "user2", "user3"];

  // css Thread List
  var threadCSS = ".threadlist_author";

  // get auther List
  let autherList = document.querySelectorAll(threadCSS);

  autherList.forEach((userdiv) => {
    // get user id
    let userspan = userdiv.querySelector("span[data-field]");
    if (userspan) {
      let currentUserId = JSON.parse(
        userspan.getAttribute("data-field")
      ).user_id;
      console.log("userid:" + currentUserId);

      // if in block list then remove
      if (blockedUsers.includes(currentUserId.toString())) {
        console.log(userspan);
        userspan.closest("li").remove();
      }
    }
  });
})();
