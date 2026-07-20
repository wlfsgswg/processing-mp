<template>
  <div class="home">
    <div class="home-sm">

    </div>
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
            accept=".xlsx,.xls"
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
              只接受xlsx、xls文件，仅能上传1个文件
            </div>
          </el-upload>
        </div>
      </div>
      <div class="home-container-template">
        <div class="p-b-20">
          <Title title="自定义模板"></Title>
        </div>
        <div class="home-header" v-if="headers.length">
          <span> 表头： </span>
          <span>
            <el-tag
              class="m-r-10"
              size="small"
              v-for="item in headers"
              :key="item"
              :type="item"
            >
              {{ item }}
            </el-tag>
          </span>
        </div>
        <!-- 输入、输出 -->
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="grid-content bg-purple">
              <div class="bg-purple-sr">
                <div class="text">输入：</div>
                <div
                  class="my-bth"
                  @click="handleInsert"
                  v-if="headers.length && insertBtn"
                >
                  插入所有表头
                </div>
              </div>
              <div>
                <el-input
                  type="textarea"
                  :rows="3"
                  placeholder="自定义内容，请把需要插入的表头放入{{}}内"
                  v-model="textarea"
                >
                </el-input>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="grid-content bg-purple">
              <div class="text">输出：</div>
              <div>
                <el-input
                  type="textarea"
                  :rows="3"
                  placeholder="输出内容"
                  :value="textarea2"
                  disabled
                >
                </el-input>
              </div>
            </div>
          </el-col>
        </el-row>
        <div class="p-t-20 t-a-r">
          <el-button type="primary" size="small" @click="handleReturn"
            >按照模板输出</el-button
          >
        </div>
      </div>
      <div class="home-container-content" v-if="outList.length">
        <div class="p-b-20">
          <Title
            title="输出内容"
            :updateTitle="isMerge ? '单条展示' : '合并展示'"
            @onUpdate="handleUpdata"
          ></Title>
        </div>
        <div v-if="isMerge" class="out-list-item">
          <div class="text">{{ outList.join(",") }}</div>
          <div class="btn">
            <el-button type="text" @click="handleCopy('merge')"
              >复制</el-button
            >
          </div>
        </div>
        <div v-else>
          <div
            v-for="(item, index) in outList"
            :key="index"
            class="out-list-item"
          >
            <div class="text">{{ item }}</div>
            <div class="btn">
              <el-button type="text" @click="handleCopy(item)"
                >复制</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "./index.less";
import {
  formatExcelDate,
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
    textarea: "",
    outList: [],
    isMobile: false,
    isMerge: false,
    workBook: "",
    insertBtn: true,
  }),
  mounted() {
    this.isMobile = isMobileDevice();
  },
  methods: {
    handleUpdata() {
      this.isMerge = !this.isMerge;
    },
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
        .sheet_to_json(worksheet, { header: 1 })
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
      const list = XLSX.utils.sheet_to_json(newWorksheet);
      // 提取表头
      const headers = list.length ? Object.keys(list[0]) : [];

      this.list = list;
      this.headers = headers;
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
    handleReturn() {
      if (!this.list.length)
        return this.$message({
          message: "请先上传文件",
          type: "error",
        });

      if (!this.textarea)
        return this.$message({
          message: "请先设置模板",
          type: "error",
        });
      // 模板
      const temp = this.textarea;
      const outList = [];

      for (let index = 0; index < this.list.length; index++) {
        const e = this.list[index];
        outList.push(
          temp.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            return key === "办结时间"
              ? formatExcelDate(e[key])
              : e[key] ?? "--"; // 找不到就保留原占位符
          }),
        );
      }

      this.outList = outList;
    },
    // 复制
    handleCopy(text) {
      if (text === "merge") {
        text = this.outList.join(",");
      }
      this.$copyText(text).then(() => {
        this.$message({
          message: "复制成功",
          type: "success",
        });
      });
    },
    // 插入表头
    handleInsert() {
      let str = "";
      for (let index = 0; index < this.headers.length; index++) {
        str =
          str +
          `{{${this.headers[index]}}}${
            index !== this.headers.length - 1 ? "，" : ""
          }`;
      }
      this.textarea = this.textarea + str;
      this.insertBtn = false;
    },
  },
  watch: {},
  computed: {
    textarea2() {
      const textarea = this.textarea.trim();
      return textarea.replace(/\{\{([^}]+)\}\}/g, "/$1列内容/");
    },
  },
};
</script>
