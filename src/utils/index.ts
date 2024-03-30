/**
 * 获取当前页面URL中的'pn'参数值。
 * 该函数不接受任何参数。
 *
 * @returns {number} 如果URL中存在'pn'参数，则返回其数值解析结果；若不存在，则返回0。
 */
export function getCurrentPagePnValue() {
  // 获取当前页面的URL
  const currentUrl = window.location.href;

  // 创建URL对象以方便解析
  const url = new URL(currentUrl);

  // 使用URLSearchParams来处理查询参数
  const searchParams = new URLSearchParams(url.search);

  // 尝试获取名为'pn'的参数值
  const pnValue = searchParams.get('pn');

  // 检查'pn'参数是否存在并处理
  if (pnValue !== null) {
    return parseInt(pnValue); // 参数存在，返回解析后的数值
  } else {
    return 0; // 参数不存在，返回默认值
  }
}

/**
 * 根据给定的muValue和urlValue计算出页数。
 * @param muValue - 可用的最大页数。
 * @param urlValue - 当前url中表示的数值，通常用于计算页数。
 * @returns 返回实际应该显示的页数，该页数不会超过muValue指定的最大值。
 */
export function decidePage(muValue: number, urlValue: number) {
  let outPage = 0;
  // 如果urlValue能被50整除，计算出的页数会偏大，需要调整确保不超过muValue
  if (urlValue % 50 === 0) {
    outPage = urlValue / 50 + 1;
    // 如果计算出的页数超过muValue，实际返回muValue，否则返回计算出的页数
    if (outPage > muValue) {
      return outPage;
    } else {
      return muValue;
    }
  } else {
    // 对urlValue除以50并取整，再加上1，得到当前页数，无需调整
    return Math.floor(urlValue / 50) + 1;
  }
}

/**
 * 从指定元素中获取用户ID。
 * @param elem - 一个DOM元素，需要包含一个名为"data-field"的属性，其中存储了用户的ID信息。
 * @returns 返回从元素的"data-field"属性中解析出的用户ID，类型为number。
 */
export function getUserIdFromElem(elem: Element): number {
  // 从元素的"data-field"属性中解析用户ID
  return JSON.parse(elem.getAttribute('data-field')!).user_id;
}
