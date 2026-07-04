const XLSX = require("xlsx");
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

function createNewXlsx(list) {
  //筛选特定公司
  const newList = list.filter((it) =>
    it.代理公司.includes("河南省天平招标代理有限公司"),
  );
  // 生成新表
  // 3. 筛选后数据生成新工作表
  const newSheet = XLSX.utils.json_to_sheet(newList);

  // 4. 创建新工作簿，写入工作表
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, "筛选结果");

  // 5. 输出新Excel文件
  const outputPath = "./筛选后数据.xlsx";
  XLSX.writeFile(newWorkbook, outputPath);
}

module.exports = {
  createNewXlsx,
  formatExcelDate,
  isMobileDevice,
};
