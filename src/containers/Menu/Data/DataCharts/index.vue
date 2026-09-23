<template>
  <div class="xcx-data-datacharts">
    <div v-if="fieldConfig.type === 1">
      <Title title="乡镇街道" skipTitle="返回" @onskip="handleBack"></Title>
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
      <Title
        :title="fieldConfig.field"
        skipTitle="返回"
        @onskip="handleBack"
      ></Title>
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
          {{ `${fieldConfig.field}执纪执法数据` }}
        </el-button>
      </div>
      <div class="r-right">
        <el-button type="primary" size="small" @click="printChart">
          {{ `打印${fieldConfig.field}执纪执法图表` }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import "./index.less";
import { Title } from "@/components";
import { mapState } from "vuex";
import { Chart } from "@antv/g2";
import { getFieldConfig } from "@/common/const.js";
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
    fieldConfig: {},
    total: 0,
    sourceList: [],
    departmentList: [],
    charts: {},
    importData: [],
  }),
  components: {
    Title,
  },
  computed: {
    ...mapState("global", ["globalInfo", "userInfo"]),
  },
  mounted() {
    this.tablename = this.$route.query.name;
    this.type = Number(this.$route.query.type) || 1;
    this.fieldConfig = getFieldConfig(this.type);
    const { field } = this.fieldConfig;
    this.handleQueryDistinctField(field);
  },
  beforeDestroy() {
    Object.values(this.charts).forEach((chartIns) => {
      if (chartIns && chartIns.destroy) {
        chartIns.destroy();
      }
    });
    this.charts = {};
  },
  methods: {
    // 返回
    handleBack() {
      this.$router.back();
    },
    handleImport() {
      createNewXlsx(this.importData, `${this.fieldConfig.field}执纪执法数据`);
    },
    async printChart() {
      try {
        const ids =
          this.fieldConfig.type === 1
            ? ["container_xz", "container_pz", "container_jg"]
            : ["container_xsly"];
        const imgList = [];

        for (const id of ids) {
          const wrap = document.getElementById(id);
          if (!wrap) continue;
          const canvas = wrap.querySelector("canvas");
          if (!canvas) continue;
          const imgSrc = canvas.toDataURL("image/png", 0.6);
          imgList.push(imgSrc);
        }

        if (imgList.length === 0) {
          this.$message.warning("没有可打印的图表！");
          return;
        }

        let imgHtml = "";
        imgList.forEach((src) => {
          imgHtml += `<img src="${src}" style="width:100%;display:block;margin-bottom:24px;">`;
        });

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
    renderChart(chartJson, para) {
      if (this.charts[para]) {
        this.charts[para].destroy();
        this.charts[para] = null;
      }
      const { field, label, type } = this.fieldConfig;
      const chart = new Chart({
        container: `container_${para}`,
        autoFit: true,
      });
      chart.options({
        type: "interval",
        data: chartJson,
        encode: {
          x: field,
          y: "value",
          color: "type",
        },
        transform: [{ type: "dodgeX" }],
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
            bounding: "viewport", // 使用整个浏览器视窗作为tooltip边界，不再被图表框限制
          },
        },
        tooltip: {
          title: label,
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
            labelFontSize: 11,
            labelSpacing: 14,
            // 自动角度策略：优先0°水平；放不下自动切-70°倾斜
            labelAutoRotate: {
              optionalAngles: [0, -70],
              recoverWhenFailed: true,
            },
            // 自动换行，最多2行
            labelAutoWrap: {
              maxLines: 2,
              wordWrapWidth: 110,
            },
            // 超过30字截断加省略号（兜底）
            labelFormatter: (text) => {
              if (!text) return text;
              const maxTotal = 30;
              if (text.length > maxTotal) {
                return text.slice(0, maxTotal) + "...";
              }
              return text;
            },
          },
          y: {
            title: { text: "数量" },
          },
        },
      });
      chart.render();
      chart.on("tooltip:change", (ev) => {
        const orgName = ev.items[0].data[field];
        const allRows = chartJson.filter((d) => d[field] === orgName);
        ev.items.splice(0, ev.items.length);
        allRows.forEach((row) => {
          ev.items.push({
            name: row.type,
            value: row.value,
            data: row,
          });
        });
      });

      chart.on("interval:dblclick", (ev) => {
        // 拿到当前点击柱子的原始数据
        const data = ev.data.data;
        const dynamicKey = Object.keys(data).find(
          (k) => !["value", "type"].includes(k),
        );
        const dimValue = data[dynamicKey];
        const routeQuery = {
          name: this.tablename,
          type,
          value: dimValue,
        };
        this.$router.push({
          path: "/data/table",
          query: routeQuery,
        });
      });
      this.charts[para] = chart;
    },
    handleQueryTableData() {
      this.loading = true;
      const { field } = this.fieldConfig;
      this.$API
        .queryTableData({
          tablename: this.tablename,
          pageNum: 1,
          pageSize: "all",
        })
        .then((res) => {
          const obj = {};
          const listPool =
            this.fieldConfig.type === 1 ? this.departmentList : this.sourceList;
          listPool.forEach((dept) => {
            obj[dept] = [];
          });

          (res.list || []).forEach((item) => {
            const key = item[field];
            if (obj[key]) {
              obj[key].push(item);
            }
          });
          let chartJsonJG = [];
          let chartJsonPZ = [];
          let chartJsonXZ = [];
          let chartJsonXSLY = [];
          let importData = [];

          for (const key in obj) {
            if (!Object.hasOwn(obj, key)) continue;
            const element = obj[key];
            let complete = 0;
            let caseFiling = 0;
            let caseFilingPeople = 0;
            let discipline = 0;
            let detain = 0;
            let detainPeople = 0;

            for (let index = 0; index < element.length; index++) {
              const el = element[index];
              if (el.是否查结 === "是") complete++;
              if (el.是否立案 === "是") caseFiling++;
              caseFilingPeople = caseFilingPeople + (el.立案人数 - 0);
              if (el.是否采取留置措施 === "是") detain++;
              detainPeople = detainPeople + (el.留置人数 - 0);
              discipline +=
                el.第一种形态 -
                0 +
                (el.第二种形态 - 0) +
                (el.第三种形态 - 0) +
                (el.第四种形态 - 0);
            }

            const baseList = [
              { value: complete, type: "办结" },
              { value: element.length - complete, type: "未办结" },
              { value: caseFiling, type: "立案件数" },
              { value: caseFilingPeople, type: "立案人数" },
              { value: detain, type: "留置件数" },
              { value: detainPeople, type: "留置人数" },
              { value: discipline, type: "处理处分人数" },
            ];

            const baseChartJson = baseList.map((item) => {
              return {
                ...item,
                [field]: key,
              };
            });
            if (this.fieldConfig.type === 1) {
              // 区分机关、派驻、乡镇
              if (hasAnyWord(key, ["镇", "乡", "街道"])) {
                chartJsonXZ = [...chartJsonXZ, ...baseChartJson];
              } else if (hasAnyWord(key, ["派驻"])) {
                chartJsonPZ = [...chartJsonPZ, ...baseChartJson];
              } else {
                chartJsonJG = [...chartJsonJG, ...baseChartJson];
              }
            } else {
              chartJsonXSLY = [...chartJsonXSLY, ...baseChartJson];
            }
            const importDataObj = {
              [field]: key,
              办结: complete,
              未办结: element.length - complete,
              立案件数: caseFiling,
              立案人数: caseFilingPeople,
              留置件数: detain,
              留置人数: detainPeople,
              处理处分人数: discipline,
            };
            importData.push(importDataObj);
          }
          this.importData = importData;
          this.obj = obj;
          this.total = res.total || 0;
          chartJsonJG = sortByChengbanDanwei(chartJsonJG);

          if (this.fieldConfig.type === 1) {
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
    handleQueryDistinctField(field) {
      this.$API
        .queryDistinctField({
          tablename: this.tablename,
          field,
        })
        .then((res) => {
          const opts = res.options || [];
          if (this.fieldConfig.type === 1) {
            this.departmentList = opts;
          } else {
            this.sourceList = opts;
          }
          this.handleQueryTableData();
        });
    },
  },
};
</script>
