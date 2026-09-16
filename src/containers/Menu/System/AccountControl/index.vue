<template>
  <div class="xcx-system-accountcontrol">
    <Title title="账号管理"></Title>
    <div class="p-t-20">
      <xcx-table
        :columns="columns"
        :dataSource="list"
        name="account_control_table"
      >
      </xcx-table>
    </div>
  </div>
</template>

<script>
import "./index.less";
import { Title, XcxTable } from "@/components";
import { accountList } from "@/common/const";
export default {
  data: () => ({
    list: accountList || [],
    total: 0,
    columns: [
      {
        label: "序号",
        prop: "index",
        width: 60,
      },
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
    XcxTable,
  },
  mounted() {},
  methods: {},
};
</script>
