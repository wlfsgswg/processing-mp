<template>
  <div class="xcx-data-datacharts">
    <Title title="图表展示"></Title>
    <!-- 条件搜索 -->
  </div>
</template>

<script>
import "./index.less";
import { Title } from "@/components";
import { mapState } from "vuex";

export default {
  data: () => ({
    tablename: "",
    loading: false,
    list: [],
    total: 0,
    sourceList: [],
    departmentList: [],
  }),
  components: {
    Title,
  },
  mounted() {
    // 获取参数名字
    this.tablename = this.$route.query.name;
    this.handleQueryTableData();
    this.handleQueryDistinctField("线索来源");
    this.handleQueryDistinctField("承办单位");
  },
  methods: {
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
          console.log(res);
          this.list = res.list || [];
          this.total = res.total || 0;
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
        });
    },
  },
  computed: {
    ...mapState("global", ["globalInfo", "userInfo"]),
  },
  watch: {},
};
</script>
