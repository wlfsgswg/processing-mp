<template>
  <div class="home">
    <div class="home-sm"></div>
    <div class="home-container">
      <div class="home-container-upload">
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
      <div class="home-container-template">
        <div class="p-b-20">
          <Title title="创建数据库表"></Title>
        </div>
        <div class="home-header">
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
    </div>
  </div>
</template>

<script>
import "./index.less";
import {
  isMobileDevice,
  // createNewXlsx,
} from "@/common/utils.js";
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
      // 通过xlsx库处理数据
      const XLSX = require("xlsx");
      const workbook = XLSX.readFile(buffer);
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

      // 1. 读取二维数组并清洗所有文本
      const aoaData = XLSX.utils
        .sheet_to_json(worksheet, { header: 1, blankrows: true })
        .map((row) => {
          return row.map((cell) => {
            if (typeof cell === "number") {
              return Number(cell.toFixed(2));
            }
            if (typeof cell !== "string") return cell;
            if (typeof cell === "string") return cell.replace(/\s/g, "").trim();

            return cell;
          });
        });

      // 2. 重建工作表，重置行号从A1开始
      const newWorksheet = XLSX.utils.aoa_to_sheet(aoaData);
      workbook.Sheets[firstSheetName] = newWorksheet;

      // 3. 转换为标准对象数组（key为清洗后的表头）
      const list = XLSX.utils.sheet_to_json(newWorksheet, {
        defval: "", // 空白单元格填空字符串，避免被当缺失
        blankrows: true, // 保留空行
      });
      // 提取表头
      const headers = list.length ? Object.keys(list[0]) : [];

      this.list = list.slice(1);
      this.headers = headers;
      console.log("list", this.list);
      // 下载新表
      // createNewXlsx(this.list);
    },
    handleFileChange(fileObj, fileList) {
      const file = fileObj.raw;
      // 极简生成本地blob静态地址（图片/视频/文档都支持）
      const localFileUrl = URL.createObjectURL(file);
      this.fileList = fileList;
      // 处理
      this.handleToJson(localFileUrl);
    },
    handleCreate() {
      if (!this.headers.length)
        return this.$message({
          message: "暂无表头，请先上传文件",
          type: "warning",
        });
      this.$prompt("请添加表名", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^[a-z]+$/,
        inputErrorMessage: "仅支持输入小写字母，不要与以往表名重复",
      })
        .then(({ value }) => {
          // 请求后端接口，塞入表名和this.header,生成一张表
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
              console.log("res", res);
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入",
          });
        });
    },
  },
  watch: {},
};
</script>
