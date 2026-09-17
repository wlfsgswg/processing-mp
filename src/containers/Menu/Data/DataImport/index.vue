<template>
  <div class="home">
    <div class="data-import-container">
      <div class="data-import-container-upload">
        <div class="p-b-20">
          <Title title="上传文件"></Title>
        </div>
        <div>
          <el-upload
            :class="isMobile ? 'upload' : 'upload upload360'"
            drag
            action=""
            accept=".xlsx,.xls,.et"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :file-list="fileList"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或
              <el-button type="text">点击上传</el-button>
            </div>
            <div class="el-upload__tip" slot="tip">
              只接受xlsx、xls、et文件，仅能上传1个文件
            </div>
          </el-upload>
        </div>
      </div>
      <div class="data-import-container-template" v-if="!isHadTable">
        <div class="p-b-20">
          <Title title="创建数据库表"></Title>
        </div>
        <div class="data-import-header">
          <span> 表头： </span>
          <span v-if="headers.length">
            <el-tag
              class="m-r-10 m-b-10"
              size="small"
              v-for="item in headers"
              :key="item"
              :type="item"
            >
              {{ item }}
            </el-tag>
          </span>
          <span v-else>暂无表头，请先上传文件</span>
        </div>
        <!-- 创建数据库表 -->
        <div class="t-a-r">
          <el-button type="primary" size="small" @click="handleCreate"
            >创建</el-button
          >
        </div>
      </div>
      <div class="data-import-container-template" v-if="isHadTable">
        <div class="p-b-20">
          <Title title="导入数据"></Title>
        </div>
        <div class="data-import-header">
          <span>
            {{
              isHadImport
                ? "数据已导入成功"
                : "数据库表已创建成功，点击右侧按钮，导入数据"
            }}
          </span>
        </div>
        <!-- 创建数据库表 -->
        <div class="t-a-r" v-if="isHadImport">
          <el-button type="primary" size="small" @click="handleSkip"
            >查看数据</el-button
          >
        </div>
        <div class="t-a-r" v-else>
          <el-button type="primary" size="small" @click="handleImport"
            >导入数据</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "./index.less";
import { isMobileDevice, filterEmptyObj } from "@/common/utils.js";
import { Title } from "@/components";

export default {
  name: "home",
  components: {
    Title,
  },
  data: () => ({
    list: [],
    headers: [],
    fileList: [],
    isMobile: false,
    workBook: "",
    tablename: "",
    isHadTable: false,
    isHadImport: false,
  }),
  mounted() {
    this.isMobile = isMobileDevice();
  },
  methods: {
    async handleToJson(fileUrl) {
      // 发起网络请求获取excel二进制数据
      const res = await fetch(fileUrl);
      if (!res.ok) {
        alert("文件不存在，请检查路径");
        return;
      }
      // 拿到二进制buffer后用xlsx库解析
      const buffer = await res.arrayBuffer();
      const XLSX = require("xlsx");
      // 开启cellDates：excel日期单元格读取为JS Date对象
      const workbook = XLSX.read(buffer, { cellDates: true });

      // 处理所有工作表
      let startRow = 1;
      Object.keys(workbook.Sheets).forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const cleanSheet = {};
        // 1. 复制配置项，清除工作表保护 !protect
        Object.entries(sheet).forEach(([key, val]) => {
          if (key.startsWith("!")) {
            if (key !== "!protect") cleanSheet[key] = val;
          }
        });
        // 清空合并单元格，去掉跨列大标题样式
        cleanSheet["!merges"] = [];
        // 2. 自动识别正文起始行（过滤顶部标题大头）
        const rowMap = {};
        const allRows = new Set();
        Object.entries(sheet).forEach(([cellKey]) => {
          if (cellKey.startsWith("!")) return;
          const rowNum = parseInt(cellKey.match(/\d+/)[0]);
          const col = cellKey.replace(/\d+/g, "");
          allRows.add(rowNum);
          if (!rowMap[rowNum]) rowMap[rowNum] = new Set();
          rowMap[rowNum].add(col);
        });
        const sortedRows = Array.from(allRows).sort((a, b) => a - b);
        // 判断规则：一行超过3列有内容 = 正式表格表头
        startRow = sortedRows[sortedRows.length - 1];
        for (const r of sortedRows) {
          if (rowMap[r].size >= 3) {
            startRow = r;
            break;
          }
        }
        // 3. 只保留正文行，丢弃上方所有标题
        Object.entries(sheet).forEach(([cellKey, cellVal]) => {
          if (cellKey.startsWith("!")) return;
          const r = parseInt(cellKey.match(/\d+/)[0]);
          if (r >= startRow) {
            cleanSheet[cellKey] = cellVal;
          }
        });
        // 替换为清理后的sheet
        workbook.Sheets[sheetName] = cleanSheet;
      });

      // 获取第1个工作表
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // 1. 读取二维数组并清洗所有文本，日期转 yyyy-MM-dd
      const aoaData = XLSX.utils
        .sheet_to_json(worksheet, { header: 1, blankrows: true })
        .map((row) => {
          return row.map((cell) => {
            // 日期处理：转成 2025-01-01
            if (cell instanceof Date) {
              const y = cell.getFullYear();
              const m = String(cell.getMonth() + 1).padStart(2, "0");
              const d = String(cell.getDate()).padStart(2, "0");
              return `${y}-${m}-${d}`;
            }
            if (typeof cell === "number") {
              return Number(cell.toFixed(2));
            }
            if (typeof cell !== "string") return cell;
            return cell.replace(/\s/g, "").trim();
          });
        });

      // 2. 重建工作表，重置行号从A1开始
      const newWorksheet = XLSX.utils.aoa_to_sheet(aoaData);
      workbook.Sheets[firstSheetName] = newWorksheet;

      // 3. 转换为标准对象数组（key为清洗后的表头）
      const list = XLSX.utils.sheet_to_json(newWorksheet, {
        defval: "", // 空白单元格填空字符串，避免被当缺失
        blankrows: true,
      });
      // 提取表头
      const headers = list.length ? Object.keys(list[0]) : [];
      this.list = filterEmptyObj(list);
      console.log("list", this.list);

      this.headers = headers;
    },
    handleFileChange(fileObj, fileList) {
      const file = fileObj.raw;
      // 极简生成本地blob静态地址（图片/视频/文档都支持）
      const localFileUrl = URL.createObjectURL(file);
      this.fileList = fileList;
      // 处理
      this.handleToJson(localFileUrl);
    },
    // 创建表格
    handleCreate() {
      if (!this.headers.length)
        return this.$message({
          message: "暂无表头，请先上传文件",
          type: "warning",
        });
      this.$prompt("请添加表名", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/,
        inputErrorMessage: "仅支持输入中英文、数字，不要与以往表名重复",
      })
        .then(({ value }) => {
          // 请求后端接口，塞入表名和this.header,生成一张表
          this.tablename = value;
          this.$API
            .createTable({
              tablename: value,
              headers: this.headers,
            })
            .then((res) => {
              this.$message({
                type: "success",
                message: res.message || "创建成功",
              });
              this.isHadTable = true;
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入",
          });
        });
    },
    // 导入数据
    handleImport() {
      this.$API
        .importData({
          tablename: this.tablename,
          list: this.list,
        })
        .then((res) => {
          this.$message({
            type: "success",
            message: res.message || "创建成功",
          });
          this.isHadImport = true;
        });
    },
    // 跳转到数据展示页面
    handleSkip() {
      this.$router.push({
        path: "/data/table",
        query: {
          name: this.tablename,
        },
      });
    },
  },
  watch: {},
};
</script>
