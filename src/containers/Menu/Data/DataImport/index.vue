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
      const buffer = await res.arrayBuffer();
      const XLSX = require("xlsx");
      const workbook = XLSX.read(buffer, { cellDates: true });

      const firstSheetName = workbook.SheetNames[0];
      const originWorksheet = workbook.Sheets[firstSheetName];

      // =========【第一步：在原始sheet上，找到startRow起始行，不要修改原始sheet！】=========
      let startRow = 1;
      const rowMap = {};
      const allRows = new Set();
      Object.entries(originWorksheet).forEach(([cellKey]) => {
        if (cellKey.startsWith("!")) return;
        const rowNum = parseInt(cellKey.match(/\d+/)[0]);
        const col = cellKey.replace(/\d+/g, "");
        allRows.add(rowNum);
        if (!rowMap[rowNum]) rowMap[rowNum] = new Set();
        rowMap[rowNum].add(col);
      });
      const sortedRows = Array.from(allRows).sort((a, b) => a - b);
      startRow = sortedRows[sortedRows.length - 1];
      for (const r of sortedRows) {
        if (rowMap[r].size >= 3) {
          startRow = r;
          break;
        }
      }

      // 日期工具函数
      const excelSerialToDate = (serial) =>
        new Date(Math.round((serial - 25569) * 86400 * 1000));
      const fmtDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${dd}`;
      };
      // 日期列匹配
      const isDateColName = (name) =>
        /日期|时间|date|time|年月日|day/gi.test(String(name).toLowerCase());

      // =========【关键：直接从原始sheet读取raw二维数组，保留原始单元格类型】=========
      const rawAoaAll = XLSX.utils.sheet_to_json(originWorksheet, {
        header: 1,
        blankrows: true,
        raw: true,
      });
      // 只保留 >= startRow 的行，丢弃顶部标题行
      const rawAoa = rawAoaAll.slice(startRow - 1);
      const headers0 = (rawAoa[0] || []).map((h) =>
        h == null ? "" : String(h).trim(),
      );

      // 清洗每一行
      const aoaData = rawAoa.map((row) => {
        return row.map((cell, ci) => {
          // 1.原生Date对象
          if (cell instanceof Date) return fmtDate(cell);

          // 2. 数字序列号（原始单元格是number）
          if (typeof cell === "number") {
            // 如果是日期列，并且序列号范围合法
            if (isDateColName(headers0[ci]) && cell >= 20000 && cell <= 60000) {
              return fmtDate(excelSerialToDate(cell));
            } else {
              //普通数字
              return Number(cell.toFixed(2));
            }
          }

          // 3. 重点：如果是字符串，尝试转数字再判断！解决'46048'字符串序列号
          if (typeof cell === "string") {
            const trimStr = cell.replace(/\s/g, "").trim();
            // 字符串能转为数字，并且当前列为日期列
            if (/^\d+$/.test(trimStr)) {
              const numVal = Number(trimStr);
              if (
                isDateColName(headers0[ci]) &&
                numVal >= 20000 &&
                numVal <= 60000
              ) {
                return fmtDate(excelSerialToDate(numVal));
              }
            }
            return trimStr;
          }
          // 其他
          if (cell === null || cell === undefined) return "";
          return cell;
        });
      });

      // 重建工作表
      const newWorksheet = XLSX.utils.aoa_to_sheet(aoaData);
      workbook.Sheets[firstSheetName] = newWorksheet;

      // 转对象数组
      const list = XLSX.utils.sheet_to_json(newWorksheet, {
        defval: "",
        blankrows: true,
      });
      const headers = list.length ? Object.keys(list[0]) : [];
      this.list = filterEmptyObj(list);
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
