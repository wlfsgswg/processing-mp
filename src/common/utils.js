const XLSX = require("xlsx");
const { accountList } = require("./const");
// 格式化输出
function formatExcelDate(num) {
  const d = XLSX.SSF.parse_date_code(num);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.y}-${pad(d.m)}-${pad(d.d)}`;
}

// 判读是不是在手机上浏览
function isMobileDevice() {
  var isMobile =
    /iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk|Mobi|Mini|Opera Mini/i.test(
      navigator.userAgent,
    );
  return isMobile;
}

function createNewXlsx(list, name = "") {
  // 生成新表
  // 筛选后数据生成新工作表
  const newSheet = XLSX.utils.json_to_sheet(list);

  // 创建新工作簿，写入工作表
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, "数据");

  // 输出新Excel文件
  const outputPath = `${name || "导出数据"}.xlsx`;
  XLSX.writeFile(newWorkbook, outputPath);
}

const fromAccountGetPassword = (account) => {
  let password = "--";
  accountList.map((it) => {
    if (it.account === account) password = it.password;
  });
  return password;
};

// 随机生成guid
const guid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * vw 转 px
 * @param {number} vwVal vw数值，比如100代表100vw
 * @returns {number} px
 */
function vwToPx(vwVal) {
  const viewportWidth = window.innerWidth;
  return (vwVal / 100) * viewportWidth;
}

function filterEmptyObj(arr) {
  return arr.filter((item) => {
    // 跳过非对象
    if (typeof item !== "object" || item === null) return true;
    // 取出对象所有value
    const values = Object.values(item);
    // 判断：是否至少有一项不为空（''、null、undefined 视为空）
    const hasValue = values.some((val) => {
      return val !== "" && val !== null && val !== undefined;
    });
    return hasValue;
  });
}
/**
 * 【6个月到期逻辑】
 * @param {string} dateStr yyyy-MM-dd
 * @returns {Object} {tip, isOver, remainDays}
 * isOver：0=不足5个月；1=满5不足6个月；2=超过6个月
 */
function checkSixMonth(dateStr) {
  const startDate = new Date(dateStr);
  const now = new Date();
  const sYear = startDate.getFullYear();
  const sMonth = startDate.getMonth();
  const sDay = startDate.getDate();
  const nYear = now.getFullYear();
  const nMonth = now.getMonth();
  const nDay = now.getDate();

  let diffMonth = (nYear - sYear) * 12 + (nMonth - sMonth);
  if (nDay < sDay) diffMonth--;

  let tip = "";
  let remainDays = null;
  let isOver = 0;
  const targetDate = new Date(sYear, sMonth + 6, sDay);

  if (diffMonth >= 6) {
    isOver = 2;
    const diffTime = now.getTime() - targetDate.getTime();
    const overDays = Math.floor(diffTime / 86400000);
    tip = `已超${overDays}天`;
  } else if (diffMonth >= 5) {
    isOver = 1;
    const diffTime = targetDate.getTime() - now.getTime();
    remainDays = Math.ceil(diffTime / 86400000);
    tip = `${remainDays}天后到期`;
  }
  return { tip, isOver, remainDays };
}

/**
 * 【12个月到期逻辑】
 * @param {string} dateStr yyyy-MM-dd
 * @returns {Object} {tip, isOver, remainDays}
 * isOver：0=不足11个月；1=满11不足12个月；2=超过12个月
 */
function checkTwelveMonth(dateStr) {
  const startDate = new Date(dateStr);
  const now = new Date();
  const sYear = startDate.getFullYear();
  const sMonth = startDate.getMonth();
  const sDay = startDate.getDate();
  const nYear = now.getFullYear();
  const nMonth = now.getMonth();
  const nDay = now.getDate();

  let diffMonth = (nYear - sYear) * 12 + (nMonth - sMonth);
  if (nDay < sDay) diffMonth--;

  let tip = "";
  let remainDays = null;
  let isOver = 0;
  const targetDate = new Date(sYear, sMonth + 12, sDay);

  if (diffMonth >= 12) {
    isOver = 2;
    const diffTime = now.getTime() - targetDate.getTime();
    const overDays = Math.floor(diffTime / 86400000);
    tip = `已超${overDays}天`;
  } else if (diffMonth >= 11) {
    isOver = 1;
    const diffTime = targetDate.getTime() - now.getTime();
    remainDays = Math.ceil(diffTime / 86400000);
    tip = `${remainDays}天后到期`;
  }
  return { tip, isOver, remainDays };
}
/**
 * 判断字符串是否包含数组内任意一项
 * @param {string} str 待检测字符串
 * @param {string[]} arr 关键词数组 ['镇','乡','街道']
 * @returns {boolean}
 */
function hasAnyWord(str, arr) {
  if (!str) return false;
  return arr.some((word) => str.includes(word));
}

/**
 * 对 chartJsonJG 数组排序
 * @param {Array} chartJsonJG 原始数据数组，每个对象包含【承办单位】字段
 * @returns {Array} 排序后的新数组
 */
function sortByChengbanDanwei(chartJsonJG) {
  // 重点：顺序！长中文数字放前面，优先匹配
  const numMap = [
    { text: "十六", val: 16 },
    { text: "十五", val: 15 },
    { text: "十四", val: 14 },
    { text: "十三", val: 13 },
    { text: "十二", val: 12 },
    { text: "十一", val: 11 },
    { text: "十", val: 10 },
    { text: "九", val: 9 },
    { text: "八", val: 8 },
    { text: "七", val: 7 },
    { text: "六", val: 6 },
    { text: "五", val: 5 },
    { text: "四", val: 4 },
    { text: "三", val: 3 },
    { text: "二", val: 2 },
    { text: "一", val: 1 },
  ];

  // 提取承办单位中的中文数字，找不到返回 null
  function getNum(text) {
    for (const item of numMap) {
      if (text.includes(item.text)) {
        return item.val;
      }
    }
    return null;
  }

  // 拷贝数组，不污染原数据
  const list = [...chartJsonJG];

  list.sort((a, b) => {
    const numA = getNum(a.承办单位);
    const numB = getNum(b.承办单位);

    // 规则：无数字的排在最前面
    if (numA === null && numB !== null) return -1;
    if (numA !== null && numB === null) return 1;

    // 两者都没有数字：保持相对顺序
    if (numA === null && numB === null) return 0;

    // 两者都有数字：按数值升序：一(1) < 二(2) < ... <十一(11) <十二(12)...<十六(16)
    return numA - numB;
  });

  return list;
}

module.exports = {
  vwToPx,
  guid,
  hasAnyWord,
  createNewXlsx,
  filterEmptyObj,
  formatExcelDate,
  isMobileDevice,
  checkSixMonth,
  checkTwelveMonth,
  fromAccountGetPassword,
  sortByChengbanDanwei,
};
