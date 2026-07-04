<template>
  <div :class="`xcx-components-table`">
    <el-table border :name="name" v-loading="loading" element-loading-spinner="el-icon-loading el-icon-nologin-loading"
      :data="dataSource" :cell-style="{ height: '56px', 'font-size': '14px', 'text-align': 'center' }" :header-cell-style="{
        background: '#F6F6F6',
        color: '#333',
        height: '44px',
        'font-size': '14px',
        'text-align': 'center'
      }" :row-style="{ color: '#333' }" @selection-change="handleSelectionChange" :height="height">
      <el-table-column v-for="item in notOperateColumns" :key="item.prop" :prop="item.prop" :label="item.label"
        :width="item.width" :show-overflow-tooltip="item.noTooltip ? false : true">
        <template v-if="item.slot" #default="scope">
          <slot :name="item.prop" :row="scope.row"></slot>
        </template>
      </el-table-column>
      <el-table-column :fixed="operate.fixed" :key="operate.prop" :prop="operate.prop" :label="operate.label"
        :width="operate.width" :show-overflow-tooltip="operate.noTooltip ? false : true">
        <template :slot-scope="scope" #default="scope">
          <slot :name="operate.prop" :row="scope.row"></slot>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "xcxtable",
  mounted() {
    // 为数组加默认index
    this.dataSource.map((it, index) => (it.index = index + 1 + ""));
  },
  data() {
    return {
      notOperateColumns: [],
      operate: {},
    };
  },
  methods: {
    handleSelectionChange(e) {
      this.$emit("selection-change", e);
    },
  },
  props: {
    loading: {
      type: [String, Boolean],
      default: () => false,
    },
    dataSource: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      required: true,
    },
    height: {
      type: [String, Number],
    },
    name: String,
    isFold: Boolean,
    type: String,
  },
  watch: {
    columns: {
      handler(e) {
        const columnsList = JSON.parse(JSON.stringify(e));
        this.operate = columnsList.pop();
        this.notOperateColumns = columnsList;
      },
      immediate: true,
    },
  },
};
</script>
<style lang="less" scoped>
@import "./index.less";
</style>
