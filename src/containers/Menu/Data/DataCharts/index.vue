<template>
  <div class="xcx-data-datacharts">
    <Title title="乡镇数据"></Title>
    <div class="p-t-20 p-b-20">
      <div
        class="container_content"
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.3)"
      >
        <div id="container_xz" style="width: 100%; height: 550"></div>
      </div>
    </div>
    <Title title="派驻数据"></Title>
    <div class="p-t-20 p-b-20">
      <div
        class="container_content"
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.3)"
      >
        <div id="container_pz" style="width: 100%; height: 550"></div>
      </div>
    </div>
    <Title title="机关数据"></Title>
    <div class="p-t-20 p-b-20">
      <div
        class="container_content"
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.3)"
      >
        <div id="container_jg" style="width: 100%; height: 550"></div>
      </div>
    </div>
  </div>
</template>

<script>
import "./index.less";
import { Title } from "@/components";
import { mapState } from "vuex";
import { Chart } from "@antv/g2";
import { hasAnyWord, sortByChengbanDanwei } from "@/common/utils.js";
export default {
  data: () => ({
    tablename: "",
    loading: true,
    obj: {},
    total: 0,
    sourceList: [],
    departmentList: [],
    chart_xz: null,
    chart_pz: null,
    chart_jg: null,
  }),
  components: {
    Title,
  },
  mounted() {
    // 获取参数名字
    this.tablename = this.$route.query.name;
    this.handleQueryDistinctField("线索来源");
    this.handleQueryDistinctField("承办单位");
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  },
  methods: {
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
        encode: { x: "承办单位", y: "value", color: "type" },
        // ✅核心：dodgeX 实现并排分组柱状图
        transform: [{ type: "dodgeX" }],
        color: [
          "#1677ff",
          "#13c2c2",
          "#fa8c16",
          "#722ed1",
          "#597ef7",
          "#52c41a",
          "#ad6800",
        ],
        // 重点！interaction.tooltip.shared = true
        interaction: {
          tooltip: {
            shared: true,
          },
        },
        tooltip: {
          title: "承办单位",
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
            dy: -16,
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
        // 获取当前悬浮的承办单位名称
        const orgName = ev.items[0].data.承办单位;
        const allRows = chartJson.filter((d) => d.承办单位 === orgName);
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
          query: {
            name: this.tablename,
            department: data.承办单位 ?? "",
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
          this.departmentList.forEach((dept) => {
            obj[dept] = [];
          });
          (res.list || []).forEach((item) => {
            const key = item.承办单位;
            if (obj[key]) {
              obj[key].push(item);
            }
          });
          let chartJsonJG = [];
          let chartJsonPZ = [];
          let chartJsonXZ = [];
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
            let item1 = {
              承办单位: depKey,
              value: complete,
              type: "办结",
            };
            let item2 = {
              承办单位: depKey,
              value: element.length - complete,
              type: "未办结",
            };
            let item3 = {
              承办单位: depKey,
              value: caseFiling,
              type: "立案件数",
            };
            let item4 = {
              承办单位: depKey,
              value: caseFilingPeople,
              type: "立案人数",
            };

            let item5 = {
              承办单位: depKey,
              value: detain,
              type: "留置件数",
            };
            let item6 = {
              承办单位: depKey,
              value: detainPeople,
              type: "留置人数",
            };
            let item7 = {
              承办单位: depKey,
              value: discipline,
              type: "处理处分人数",
            };
            // 区分机关、派驻、乡镇
            if (hasAnyWord(depKey, ["镇", "乡", "街道"])) {
              chartJsonXZ.push(item1);
              chartJsonXZ.push(item2);
              chartJsonXZ.push(item3);
              chartJsonXZ.push(item4);
              chartJsonXZ.push(item5);
              chartJsonXZ.push(item6);
              chartJsonXZ.push(item7);
            } else if (hasAnyWord(depKey, ["派驻"])) {
              chartJsonPZ.push(item1);
              chartJsonPZ.push(item2);
              chartJsonPZ.push(item3);
              chartJsonPZ.push(item4);
              chartJsonPZ.push(item5);
              chartJsonPZ.push(item6);
              chartJsonPZ.push(item7);
            } else {
              chartJsonJG.push(item1);
              chartJsonJG.push(item2);
              chartJsonJG.push(item3);
              chartJsonJG.push(item4);
              chartJsonJG.push(item5);
              chartJsonJG.push(item6);
              chartJsonJG.push(item7);
            }
          }
          this.obj = obj;
          this.total = res.total || 0;
          chartJsonJG = sortByChengbanDanwei(chartJsonJG);
          // 绘制图形
          this.renderChart(chartJsonXZ, "xz");
          this.renderChart(chartJsonPZ, "pz");
          this.renderChart(chartJsonJG, "jg");
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
            this.handleQueryTableData();
          }
        });
    },
  },
  computed: {
    ...mapState("global", ["globalInfo", "userInfo"]),
  },
  watch: {},
};
</script>
