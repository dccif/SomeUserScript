import { GM_getValue, GM_listValues, GM_setValue } from '$';
import { useEffect, useRef, useState } from 'preact/hooks';
import './App.css';
import { squareAddSVG } from './assets';
import BlockerUserList from './components/BlockerUserList';
import { GM_STORE_NICKNAMEMAPKEY, GM_STORE_USERIDKEY } from './config';
import { decidePage, getCurrentPagePnValue, getUserIdFromElem } from './utils';

var tiebaBlocker = {
  curPage: 1,
};

const tiebaIdNickNameMap: Map<number, string> = new Map();

export default function App() {
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
            '#frs_list_pager span'
          );
          if (!target) return;

          const spanContent = target.textContent || target.innerText;
          console.log(
            'decPage',
            decidePage(parseInt(spanContent), getCurrentPagePnValue())
          );

          tiebaBlocker.curPage = decidePage(
            parseInt(spanContent),
            getCurrentPagePnValue()
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
      '.frs-author-name-wrap>a'
    )?.innerText;

    if (curNickName) {
      tiebaIdNickNameMap.set(userId, curNickName);
    }

    const curLiElem = (event.target as SVGElement).closest<HTMLLIElement>(
      '.j_thread_list.clearfix.thread_item_box'
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
          JSON.stringify(Array.from(updatedBlockerUser))
        );
        GM_setValue(
          GM_STORE_NICKNAMEMAPKEY,
          JSON.stringify(tiebaIdNickNameMap)
        );
      }
      return updatedBlockerUser;
    });
  }

  const removeFromBlocker = (e: MouseEvent, item: number) => {
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
          JSON.stringify(Array.from(updatedBlockerUser))
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
            '.j_thread_list.clearfix.thread_item_box'
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
        addBlockBtnClick(event, userId, elem)
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
      <div id='tiebaBlocker'>
        <div>
          {visible ? (
            <div id='blockerListContainer'>
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
        <div className='testButton'>
          <button
            onClick={() => {
              console.log('cur user', curBlockerUser);
              console.log(
                'gmGet',
                GM_listValues(),
                GM_getValue(GM_STORE_NICKNAMEMAPKEY)
              );
            }}
          >
            获取当前存储与状态
          </button>
        </div>
      </div>
      <div id='blockerList'></div>
    </>
  );
}
