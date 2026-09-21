<template>
  <div class="xcx-data-datacharts">
    <div v-if="type === 1">
      <Title title="乡镇街道"></Title>
      <div class="p-t-20 p-b-20">
        <div
          class="container_content"
          v-loading="loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(255, 255, 255, 0.3)"
        >
          <div id="container_xz" style="width: 100%; height: 480px"></div>
        </div>
      </div>
      <Title title="派驻机关"></Title>
      <div class="p-t-20 p-b-20">
        <div
          class="container_content"
          v-loading="loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(255, 255, 255, 0.3)"
        >
          <div id="container_pz" style="width: 100%; height: 480"></div>
        </div>
      </div>
      <Title title="机关单位"></Title>
      <div class="p-t-20 p-b-20">
        <div
          class="container_content"
          v-loading="loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(255, 255, 255, 0.3)"
        >
          <div id="container_jg" style="width: 100%; height: 480"></div>
        </div>
      </div>
    </div>
    <div v-else>
      <Title title="线索来源"></Title>
      <div class="p-t-20 p-b-20">
        <div
          class="container_content"
          v-loading="loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(255, 255, 255, 0.3)"
        >
          <div id="container_xsly" style="width: 100%; height: 480px"></div>
        </div>
      </div>
    </div>
    <div
      class="clearfix"
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.3)"
    >
      <div class="l-left">
        <el-button type="primary" size="small" @click="handleImport">
          {{
            `${this.type === 1 ? "承办单位" : "线索来源"}执纪执法数据`
          }}</el-button
        >
      </div>
      <div class="r-right">
        <el-button type="primary" size="small" @click="printChart">
          {{
            `打印${this.type === 1 ? "承办单位" : "线索来源"}执纪执法图表`
          }}</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import "./index.less";
import { Title } from "@/components";
import { mapState } from "vuex";
import { Chart } from "@antv/g2";
import {
  hasAnyWord,
  sortByChengbanDanwei,
  createNewXlsx,
} from "@/common/utils.js";
export default {
  data: () => ({
    tablename: "",
    type: 1,
    loading: true,
    obj: {},
    total: 0,
    sourceList: [],
    departmentList: [],
    chart_xz: null,
    chart_pz: null,
    chart_jg: null,
    // 线索来源
    chart_xsly: null,
    importData: [],
  }),
  components: {
    Title,
  },
  mounted() {
    // 获取参数名字
    this.tablename = this.$route.query.name;
    this.type = this.$route.query.type - 0;
    if (this.type === 1) {
      this.handleQueryDistinctField("承办单位");
    } else {
      this.handleQueryDistinctField("线索来源");
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  },
  methods: {
    // 导出数据
    handleImport() {
      // 处理数据，显示
      createNewXlsx(
        this.importData,
        `${this.type === 1 ? "承办单位" : "线索来源"}执纪执法数据`,
      );
    },
    async printChart() {
      try {
        // 三个图表容器ID，按你的实际dom修改
        const ids =
          this.type === 1
            ? ["container_xz", "container_pz", "container_jg"]
            : ["container_xsly"];
        const imgList = [];

        // 循环取出每个canvas，转图片
        for (const id of ids) {
          const wrap = document.getElementById(id);
          if (!wrap) continue;
          const canvas = wrap.querySelector("canvas");
          if (!canvas) continue;
          // 质量0.6，平衡清晰度和速度
          const imgSrc = canvas.toDataURL("image/png", 0.6);
          imgList.push(imgSrc);
        }

        if (imgList.length === 0) {
          this.$message.warning("没有可打印的图表！");
          return;
        }

        // 拼接图片html，多张图上下排列
        let imgHtml = "";
        imgList.forEach((src) => {
          imgHtml += `<img src="${src}" style="width:100%;display:block;margin-bottom:24px;">`;
        });

        // 新开打印窗口
        const printWin = window.open("", "_blank", "width=1200,height=900");
        printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>打印图表</title>
        <style>
          body { margin: 0; padding: 16px; }
          @page {
            size: A4 landscape;
            margin:10mm;
          }
        </style>
      </head>
      <body>
        ${imgHtml}
      </body>
      </html>
    `);
        printWin.document.close();
        // 等待最后一张图片加载完成
        const lastImg = new Image();
        lastImg.src = imgList[imgList.length - 1];
        lastImg.onload = () => {
          setTimeout(() => {
            printWin.print();
            printWin.close();
          }, 200);
        };
      } catch (err) {
        console.error("打印异常：", err);
        this.$message.error("打印失败");
      }
    },
    // 生成Chart图
    renderChart(chartJson, para) {
      if (this[`chart_${para}`]) {
        this[`chart_${para}`].destroy();
        this[`chart_${para}`] = null;
      }
      const chart = new Chart({
        container: `container_${para}`,
        autoFit: true,
      });
      chart.options({
        type: "interval",
        data: chartJson,
        encode: {
          x: this.type === 1 ? "承办单位" : "线索来源",
          y: "value",
          color: "type",
        },
        // ✅核心：dodgeX 实现并排分组柱状图
        transform: [{ type: "dodgeX" }],
        // ==========G25.x 自定义颜色写在这里！==========
        scale: {
          color: {
            type: "ordinal",
            range: [
              "#165DFF",
              "#00A86B",
              "#FF7D45",
              "#B19CD9",
              "#CD5C5C",
              "#C3B091",
              "#71A0C9",
            ],
          },
        },
        interaction: {
          tooltip: {
            shared: true,
          },
        },
        tooltip: {
          title: this.type === 1 ? "承办单位" : "线索来源",
          items: [
            (datum) => {
              return {
                name: datum.type,
                value: datum.value,
              };
            },
          ],
        },
        labels: [
          {
            text: (datum) => (datum.value ? `${datum.value}` : ""),
            position: "top",
            dy: -14,
            style: {
              fill: "red",
              fontSize: 12,
              textAlign: "center",
            },
          },
        ],
        legend: {
          position: "top-left",
        },
        axis: {
          x: {
            labelTransform: "rotate(-70)",
            labelTextAlign: "right",
            labelSpacing: 12,
            labelFontSize: 11,
          },
          y: {
            title: { text: "数量" },
          },
        },
      });
      chart.render();
      // 改用 tooltip:change 事件！官方用来修改tooltip items的事件
      chart.on("tooltip:change", (ev) => {
        // 获取当前悬浮的承办单位/线索来源名称
        let orgName;
        let allRows;
        if (this.type === 1) {
          orgName = ev.items[0].data.承办单位;
          allRows = chartJson.filter((d) => d.承办单位 === orgName);
        } else {
          orgName = ev.items[0].data.线索来源;
          allRows = chartJson.filter((d) => d.线索来源 === orgName);
        }
        // 清空原有items数组
        ev.items.splice(0, ev.items.length);
        // 重新追加全部7条
        allRows.forEach((row) => {
          ev.items.push({
            name: row.type,
            value: row.value,
            data: row,
          });
        });
      });
      // 监听柱子点击
      chart.on("interval:dblclick", (ev) => {
        // 拿到当前点击柱子的原始数据
        const data = ev.data.data;
        // 双击监听，打开table页面，赋予特定选项
        const routeObj = this.$router.resolve({
          path: "/data/table",
          query:
            this.type === 1
              ? {
                  name: this.tablename,
                  department: data.承办单位 ?? "",
                }
              : {
                  name: this.tablename,
                  source: data.线索来源 ?? "",
                },
        });
        window.open(routeObj.href, "_blank");
      });
      this[`chart_${para}`] = chart;
    },
    // 请求
    handleQueryTableData() {
      this.loading = true;
      this.$API
        .queryTableData({
          tablename: this.tablename,
          pageNum: 1,
          pageSize: "all",
        })
        .then((res) => {
          // 对res.list进行合并处理
          const obj = {};
          if (this.type === 1) {
            this.departmentList.forEach((dept) => {
              obj[dept] = [];
            });
          } else {
            this.sourceList.forEach((dept) => {
              obj[dept] = [];
            });
          }
          (res.list || []).forEach((item) => {
            const key = this.type === 1 ? item.承办单位 : item.线索来源;
            if (obj[key]) {
              obj[key].push(item);
            }
          });
          let chartJsonJG = [];
          let chartJsonPZ = [];
          let chartJsonXZ = [];
          let chartJsonXSLY = [];
          let importData = [];
          // 整理最终数据
          for (const key in obj) {
            if (!Object.hasOwn(obj, key)) continue;
            const element = obj[key];
            // 办结
            let complete = 0;
            // 立案
            let caseFiling = 0;
            let caseFilingPeople = 0;
            // 处理处分
            let discipline = 0;
            // 留置件数
            let detain = 0;
            // 留置人数
            let detainPeople = 0;

            for (let index = 0; index < element.length; index++) {
              const el = element[index];
              if (el.是否查结 === "是") complete++;
              // 立案件数
              if (el.是否立案 === "是") caseFiling++;
              // 立案人数
              caseFilingPeople = caseFilingPeople + (el.立案人数 - 0);
              // 留置件数
              if (el.是否采取留置措施 === "是") detain++;
              // 留置人数
              detainPeople = detainPeople + (el.留置人数 - 0);
              // 处理处分人数
              discipline =
                discipline +
                (el.第一种形态 -
                  0 +
                  (el.第二种形态 - 0) +
                  (el.第三种形态 - 0) +
                  (el.第四种形态 - 0));
            }
            let depKey = key;
            // 1. 定义基础数据配置，新增/删除类型直接在这里改
            const baseList = [
              { value: complete, type: "办结" },
              { value: element.length - complete, type: "未办结" },
              { value: caseFiling, type: "立案件数" },
              { value: caseFilingPeople, type: "立案人数" },
              { value: detain, type: "留置件数" },
              { value: detainPeople, type: "留置人数" },
              { value: discipline, type: "处理处分人数" },
            ];

            // 2. 判断字段名，type===1 用承办单位，否则线索来源
            const fieldKey = this.type === 1 ? "承办单位" : "线索来源";
            const baseChartJson = baseList.map((item) => {
              return {
                ...item,
                [fieldKey]: depKey,
              };
            });
            if (this.type === 1) {
              // 区分机关、派驻、乡镇
              if (hasAnyWord(depKey, ["镇", "乡", "街道"])) {
                chartJsonXZ = [...chartJsonXZ, ...baseChartJson];
              } else if (hasAnyWord(depKey, ["派驻"])) {
                chartJsonPZ = [...chartJsonPZ, ...baseChartJson];
              } else {
                chartJsonJG = [...chartJsonJG, ...baseChartJson];
              }
            } else {
              chartJsonXSLY = [...chartJsonXSLY, ...baseChartJson];
            }
            let importDataObj = {
              办结: complete,
              未办结: element.length - complete,
              立案件数: caseFiling,
              立案人数: caseFilingPeople,
              留置件数: detain,
              留置人数: detainPeople,
              处理处分人数: discipline,
            };
            if (this.type === 1) {
              importDataObj.承办单位 = depKey;
            } else {
              importDataObj.线索来源 = depKey;
            }
            importData.push(importDataObj);
          }
          this.importData = importData;
          this.obj = obj;
          this.total = res.total || 0;
          chartJsonJG = sortByChengbanDanwei(chartJsonJG);
          // 绘制图形
          if (this.type === 1) {
            this.renderChart(chartJsonXZ, "xz");
            this.renderChart(chartJsonPZ, "pz");
            this.renderChart(chartJsonJG, "jg");
          } else {
            this.renderChart(chartJsonXSLY, "xsly");
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 获取下拉框
    handleQueryDistinctField(field) {
      this.$API
        .queryDistinctField({
          tablename: this.tablename,
          field,
        })
        .then((res) => {
          if (field === "线索来源") {
            this.sourceList = res.options || [];
          }
          if (field === "承办单位") {
            this.departmentList = res.options || [];
          }
          this.handleQueryTableData();
        });
    },
  },
  computed: {
    ...mapState("global", ["globalInfo", "userInfo"]),
  },
  watch: {},
};
</script>
