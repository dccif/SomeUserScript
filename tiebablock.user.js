// ==UserScript==
// @name         tieba User Blocker
// @namespace    http://dccif.top/
// @version      0.1
// @description  在贴吧中屏蔽黑名单用户
// @author       dccif
// @match        *://tieba.baidu.com/*
// @match        *://tieba.baidu.com/p/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(async function () {
    "use strict";
    var settingKey = "blockerUser";
    var blockedUsersArray = GM_getValue(settingKey, [])

    // add Button svg
    var addSVG = `<svg width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <title/> <g id="Complete"> <g data-name="add" id="add-2"> <g> <line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="12" x2="12" y1="19" y2="5"/> <line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="5" x2="19" y1="12" y2="12"/> </g> </g> </g> </svg>`;

    // 添加样式
    GM_addStyle(`
 #settingsButton {
     position: fixed;
     bottom: 20px;
     left: 20px;
     z-index: 9999;
 }
 #blockedUsers {
     position: fixed;
     bottom: 60px;
     left: 20px;
     z-index: 9999;
     display: none;
     background: #ffffff;
     border: 1px solid #000000;
     padding: 10px;
 }
`);
    // 创建设置按钮
    var btn = document.createElement("button");
    btn.id = "settingsButton";
    btn.innerHTML = "Settings";

    // 创建一个div来显示黑名单用户
    var blockedUsersDiv = document.createElement("div");
    blockedUsersDiv.id = "blockedUsers";

    // 添加点击事件
    btn.onclick = function () {
        // var blockedUsersDiv = document.getElementById("blockedUsers");
        blockedUsersDiv.style.display =
            blockedUsersDiv.style.display === "none" ? "block" : "none";
    };
    // 获取存储的黑名单用户
    var blockedUsers = GM_getValue(settingKey, blockedUsersArray);
    blockedUsers = Array.from(blockedUsers)

    for (let blockuser of blockedUsers) {
        let userDiv = document.createElement("div");
        userDiv.innerHTML += "<p>" + blockuser + "</p>";
        // 添加删除按钮
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        userDiv.appendChild(deleteButton);
        deleteButton.onclick = function () {
            // 删除用户并更新窗口
            removeUserFromBlacklist(blockuser);
            blockedUsersDiv.removeChild(userDiv);
        };
        blockedUsersDiv.appendChild(userDiv);
    }

    // 将div添加到页面
    document.body.appendChild(blockedUsersDiv);

    // 将按钮添加到页面
    document.body.appendChild(btn);

    // css Thread List
    var threadCSS = ".threadlist_author";

    // get author List
    console.log("获取帖子列表")
    let authorList = document.querySelectorAll(threadCSS);

    authorList.forEach((userdiv) => {
        // get user id
        let userspan = userdiv.querySelector("span[data-field]");
        if (userspan) {
            let currentUserId = getUserIdFromElem(userspan);
            checkInBlockAndRemove(userspan, (elem) => {
                elem.closest("li").remove()
            })
            //
            // // if in block list then remove
            // if (blockedUsers.includes(currentUserId)) {
            //     userspan.closest("li").remove();
            // }
            addBlockButtontoEle(userdiv, currentUserId)
        }
        // addToblock.addEventListener("click", () => {
        //     console.log("已经添加" + currentUserId);
        //     blockedUsers.push(currentUserId);
        //     GM_setValue(settingKey, [...new Set(blockedUsers)]);
        // });
    });

    // post author list
    var postAuthorCSS = ".d_name"
    console.log("获取post回复列表")
    let postAuthorList = document.querySelectorAll(postAuthorCSS)
    postAuthorList.forEach((postAuthor) => {
        let replyLi = postAuthor.querySelector("li[data-fiedl]")
        if (replyLi) {
            let currentUserId = getUserIdFromElem(replyLi)
        }
    })

    function getUserIdFromElem(elem) {
        return JSON.parse(
            elem.getAttribute("data-field")
        ).user_id;
    }

    function checkInBlockAndRemove(elem, removeFn) {
        let currentUserId = getUserIdFromElem(elem)

        if (blockedUsers.includes(currentUserId)) {
            removeFn(elem)
        }
    }

    function addBlockButtontoEle(ele, userId) {
        // add Button
        let addToblock = document.createElement("button")
        addToblock.innerHTML = addSVG
        ele.appendChild(addToblock)

        // button click event
        addToblock.addEventListener("click", () => {
            console.log("已经添加" + userId)
            blockedUsers.push(userId)
            GM_setValue(settingKey, [...new Set(blockedUsers)]);
        })
    }

    function removeUserFromBlacklist(user) {
        // 从黑名单中删除用户
        var blacklist = Array.from(GM_getValue(settingKey, []));
        var index = blacklist.indexOf(user);

        if (index !== -1) {
            blacklist.splice(index, 1);
            GM_setValue(settingKey, [...new Set(blacklist)]);
        }
    }
})();
