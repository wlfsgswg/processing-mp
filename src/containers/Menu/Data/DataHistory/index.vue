<template>
  <div class="xcx-data-datahistory">
    <Title title="历史数据"></Title>
    <div class="p-t-20">
      <div :class="`xcx-components-table`">
        <el-table
          border
          element-loading-spinner="el-icon-loading el-icon-nologin-loading"
          :data="list"
          :cell-style="{
            height: '56px',
            'font-size': '14px',
            'text-align': 'center',
          }"
          :header-cell-style="{
            background: '#F6F6F6',
            color: '#333',
            height: '44px',
            'font-size': '14px',
            'text-align': 'center',
          }"
          :style="'width: 100%'"
          :row-style="{ color: '#333' }"
        >
          <el-table-column
            v-for="item in columns"
            :key="item.prop"
            :prop="item.prop"
            :label="item.label"
            :width="item.width"
          >
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import "./index.less";
import { Title } from "@/components";
import { accountList } from "@/common/const";
export default {
  data: () => ({
    list: accountList || [],
    total: 0,
    columns: [
      {
        label: "账号",
        prop: "account",
      },
      {
        label: "密码",
        prop: "password",
      },
      {
        label: "用户",
        prop: "user",
      },
      {
        label: "创建时间",
        prop: "time",
      },
    ],
  }),
  components: {
    Title,
  },
  mounted() {},
  methods: {},
};
</script>
