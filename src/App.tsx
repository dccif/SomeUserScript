import { GM_getValue, GM_listValues, GM_setValue } from '$';
import { useEffect, useRef, useState } from 'react';

import './App.css';

import BlockerUserList from './BlockerUserList';

export const GM_STORE_USERIDKEY = 'tiebaBlocker';
export const GM_STORE_NICKNAMEMAPKEY = 'tiebaBlockerIdNickNameMap';

var tiebaBlocker = {
  curPage: 1,
};

var tiebaIdNickNameMap: Map<number, string> = new Map();

function getCurrentPagePnValue() {
  // 获取当前页面的URL
  const currentUrl = window.location.href;

  // 创建URL对象（假设环境支持现代浏览器API）
  const url = new URL(currentUrl);

  // 使用URLSearchParams获取查询参数
  const searchParams = new URLSearchParams(url.search);

  // 获取'pn'参数的值
  const pnValue = searchParams.get('pn');

  // 如果'pn'参数存在，则打印其值，否则打印'pn参数不存在'
  if (pnValue !== null) {
    return parseInt(pnValue); // 可以根据需要返回值
  } else {
    return 0; // 或者根据需要返回其他指示值
  }
}

function decidePage(muValue: number, urlValue: number) {
  let outPage = 0;
  if (urlValue % 50 === 0) {
    outPage = urlValue / 50 + 1;
    if (outPage > muValue) {
      return outPage;
    } else {
      return muValue;
    }
  } else {
    return Math.floor(urlValue / 50) + 1;
  }
}

const squareAddSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
  </svg>`;

function getUserIdFromElem(elem: Element): number {
  return JSON.parse(elem.getAttribute('data-field')!).user_id;
}

function App() {
  const [visible, setVisible] = useState<boolean>(false);
  const [curPage, setCurPage] = useState<number>(tiebaBlocker.curPage);
  const curPageUser = useRef<Set<number>>(new Set());
  const inBlockerUser = useRef<number[]>([]);
  const [curBlockerUser, setCurBlockerUser] = useState<Set<number>>(new Set());

  const initObserver = () => {
    let pageElem = document.getElementById('pagelet_frs-base/pagelet/content');
    if (!pageElem) {
      console.log('Page element not found.');
      return;
    }

    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type !== 'childList') continue;

        Array.from(mutation.addedNodes).forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          const element = node as HTMLElement;
          if (!element.classList.contains('thread_list_bottom')) return;

          const target = element.querySelector<HTMLSpanElement>(
            '#frs_list_pager span',
          );
          if (!target) return;

          const spanContent = target.textContent || target.innerText;
          console.log(
            'decPage',
            decidePage(parseInt(spanContent), getCurrentPagePnValue()),
          );

          tiebaBlocker.curPage = decidePage(
            parseInt(spanContent),
            getCurrentPagePnValue(),
          );
          setCurPage(tiebaBlocker.curPage);
        });
      }
    });

    observer.observe(pageElem, {
      attributes: false,
      childList: true,
      subtree: true,
    });
  };

  const checkBlocker = () => {
    inBlockerUser.current = GM_getValue(GM_STORE_USERIDKEY);
    const parsedData = JSON.parse(GM_getValue(GM_STORE_USERIDKEY, '[]'));
    if (Array.isArray(parsedData)) {
      setCurBlockerUser(new Set(parsedData));
    } else {
      setCurBlockerUser(new Set());
    }
  };

  function addBlockBtnClick(event: Event, userId: number, elem: Element) {
    event.preventDefault();
    event.stopPropagation();
    console.log('this is elem', elem);

    // 获取用户名
    const curNickName = elem.querySelector<HTMLAnchorElement>(
      '.frs-author-name-wrap>a',
    )?.innerText;

    if (curNickName) {
      tiebaIdNickNameMap.set(userId, curNickName);
    }

    const curLiElem = (event.target as SVGElement).closest<HTMLLIElement>(
      '.j_thread_list.clearfix.thread_item_box',
    );
    if (curLiElem) {
      curLiElem.style.display = 'none';
    }

    console.log('curBlockerUser:', tiebaIdNickNameMap);

    setCurBlockerUser((curBlockerUser) => {
      const updatedBlockerUser = new Set(curBlockerUser);
      if (!updatedBlockerUser.has(userId)) {
        updatedBlockerUser.add(userId);
        GM_setValue(
          GM_STORE_USERIDKEY,
          JSON.stringify(Array.from(updatedBlockerUser)),
        );
        GM_setValue(
          GM_STORE_NICKNAMEMAPKEY,
          JSON.stringify(tiebaIdNickNameMap),
        );
      }
      return updatedBlockerUser;
    });
  }

  const removeFromBlocker = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    item: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('removeI', item);

    setCurBlockerUser((curBlockerUser) => {
      // 克隆当前的屏蔽用户集合
      const updatedBlockerUser = new Set(curBlockerUser);

      // 检查集合中是否存在该用户，如果存在则删除
      if (updatedBlockerUser.has(item)) {
        updatedBlockerUser.delete(item);

        // 更新存储，以保持屏蔽列表的最新状态
        GM_setValue(
          GM_STORE_USERIDKEY,
          JSON.stringify(Array.from(updatedBlockerUser)),
        );
      }

      // 返回更新后的屏蔽用户集合
      return updatedBlockerUser;
    });
  };

  const addTieList = () => {
    const authorList = document.querySelectorAll('.threadlist_author');
    console.log('inU', inBlockerUser.current);

    authorList.forEach((authorDiv) => {
      const userSpan = authorDiv.querySelector('span[data-field]');
      if (userSpan) {
        const curUserId = getUserIdFromElem(userSpan);

        if (
          inBlockerUser.current &&
          inBlockerUser.current.includes(curUserId)
        ) {
          const curLiElem = authorDiv.closest<HTMLLIElement>(
            '.j_thread_list.clearfix.thread_item_box',
          );
          if (curLiElem) {
            curLiElem.style.display = 'none';
          }
        }

        curPageUser.current.add(curUserId);
        addBlockButtonToEle(authorDiv, curUserId);
      }
    });

    console.log('This is all', curPageUser.current);
  };

  function addBlockButtonToEle(elem: Element, userId: number) {
    // 获取elem的父节点
    const parent = elem.parentNode;
    if (parent) {
      const nowButton = parent.querySelectorAll('.blockerButton');
      if (nowButton.length > 0) return;

      let addBtn = document.createElement('button');
      addBtn.innerHTML = squareAddSVG;
      addBtn.className = 'blockerButton';
      addBtn.addEventListener('click', (event) =>
        addBlockBtnClick(event, userId, elem),
      );
      parent.insertBefore(addBtn, elem);
    }
  }

  const closeBlockerList = () => {
    setVisible(false);
  };

  useEffect(() => {
    const urlPattern = /tieba\.baidu\.com\/f.*/;
    if (urlPattern.test(window.location.href)) {
      addTieList();
    }
  }, [curPage]);

  useEffect(() => {
    initObserver();
    checkBlocker();
  }, []);

  return (
    <>
      <div id="tiebaBlocker">
        <div>
          {visible ? (
            <div id="blockerListContainer">
              <BlockerUserList
                blcokerUserSet={curBlockerUser}
                removeFromBlocker={removeFromBlocker}
                onClose={closeBlockerList}
              />
            </div>
          ) : (
            <button onClick={() => setVisible(true)}>显示黑名单</button>
          )}
        </div>
        <div className="testButton">
          <button
            onClick={() => {
              console.log('cur user', curBlockerUser);
              console.log(
                'gmGet',
                GM_listValues(),
                GM_getValue(GM_STORE_NICKNAMEMAPKEY),
              );
            }}
          >
            获取当前存储与状态
          </button>
        </div>
      </div>
      <div id="blockerList"></div>
    </>
  );
}

export default App;
