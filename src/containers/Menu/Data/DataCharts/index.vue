<template>
  <div class="xcx-data-datacharts">
    <Title title="乡镇数据"></Title>
    <div class="p-t-20 p-b-20">
      <div
        id="container_xz"
        style="width: 100%; height: 550; border: 1px solid #eee"
      ></div>
    </div>
    <Title title="派驻数据"></Title>
    <div class="p-t-20 p-b-20">
      <div
        id="container_pz"
        style="width: 100%; height: 550; border: 1px solid #eee"
      ></div>
    </div>
    <Title title="机关数据"></Title>
    <div class="p-t-20 p-b-20">
      <div
        id="container_jg"
        style="width: 100%; height: 550; border: 1px solid #eee"
      ></div>
    </div>
  </div>
</template>

<script>
import "./index.less";
import { Title } from "@/components";
import { mapState } from "vuex";
import { Chart } from "@antv/g2";
import { hasAnyWord } from "@/common/utils.js";
export default {
  data: () => ({
    tablename: "",
    loading: false,
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
      // autoFit移到new Chart这里
      const chart = new Chart({
        container: `container_${para}`,
        autoFit: true,
      });
      chart.options({
        type: "interval",
        data: chartJson,
        encode: { x: "承办单位", y: "未办结" },
        labels: [
          {
            text: (datum) => (datum.未办结 ? `未办结${datum.未办结}` : ""),
            position: "top", // top = 柱子**外侧上方**
            dy: -16, // ✅ G2v5 垂直偏移用 dy！正数向上
            // 不要加 contrastReverse！一加就自动塞柱子里面
            style: {
              fill: "red",
              fontSize: 12,
              textAlign: "center",
            },
          },
        ],
        axis: {
          x: {
            labelTransform: "rotate(-70)",
            labelTextAlign: "right",
            labelSpacing: 12,
            labelFontSize: 11,
          },
          y: {
            title: { text: "未办结" },
          },
        },
      });
      chart.render();
      // 监听柱子点击
      chart.on("interval:dblclick", (ev) => {
        // 拿到当前点击柱子的原始数据
        const data = ev.data.data;
        // 双击监听，打开table页面，赋予特定选项
        const routeObj = this.$router.resolve({
          path: "/data/table",
          query: {
            name: this.tablename,
            // 强制兜底，undefined转为空字符串，保证参数一定会带上url
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
          // console.log(obj);
          const chartJsonJG = [];
          const chartJsonPZ = [];
          const chartJsonXZ = [];
          // 整理最终数据
          for (const key in obj) {
            if (!Object.hasOwn(obj, key)) continue;
            const element = obj[key];
            // 办结
            let complete = 0;
            // 立案
            let caseFiling = 0;
            // 处理处分
            let discipline = 0;
            // 留置
            let detain = 0;

            for (let index = 0; index < element.length; index++) {
              const el = element[index];
              if (el.是否查结 === "是") complete++;
            }

            let depKey = key
              // .replace(/平舆县纪委监委/g, "")
              // .replace(/平舆县/g, "")
              // .replace(/纪委监委/g, "");

            let item = {
              承办单位: depKey,
              办结: complete,
              未办结: element.length - complete,
              所有件: element || [],
              立案: caseFiling,
              处理处分: discipline,
              留置: detain,
            };
            // 区分机关、派驻、乡镇
            if (hasAnyWord(depKey, ["镇", "乡", "街道"])) {
              chartJsonXZ.push(item);
            } else if (hasAnyWord(depKey, ["派驻"])) {
              chartJsonPZ.push(item);
            } else {
              chartJsonJG.push(item);
            }
          }
          this.obj = obj;
          this.total = res.total || 0;
          this.loading = false;
          // 绘制图形
          this.renderChart(chartJsonXZ, "xz");
          this.renderChart(chartJsonPZ, "pz");
          this.renderChart(chartJsonJG, "jg");
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
