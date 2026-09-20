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
            <template slot-scope="scope">
              <div v-if="item.scope">
                <el-button
                  @click="handleSkip(scope.row)"
                  type="text"
                  size="small"
                  >查看</el-button
                >
                <el-button
                  type="text"
                  size="small"
                  @click="handleDelete(scope.row)"
                  >删除</el-button
                >
              </div>
              <div v-else>{{ scope.row[item.prop] }}</div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="p-t-20 t-a-r">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.pageNum"
        :page-sizes="[5, 10, 20]"
        :page-size="page.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import "./index.less";
import { Title } from "@/components";
export default {
  data: () => ({
    list: [],
    total: 0,
    columns: [
      {
        label: "ID",
        prop: "id",
      },
      {
        label: "表名",
        prop: "name",
      },
      {
        label: "数据量",
        prop: "total",
      },
      {
        label: "创建时间",
        prop: "createtime",
      },
      {
        label: "操作",
        prop: "op",
        scope: true,
      },
    ],
    page: {
      pageSize: 5,
      pageNum: 1,
    },
  }),
  components: {
    Title,
  },
  mounted() {
    this.handleQueryStatList();
  },
  methods: {
    // 查看
    handleSkip(e) {
      const routeObj = this.$router.resolve({
        path: "/data/table",
        query: {
          name: e.name,
        },
      });
      window.open(routeObj.href, "_blank");
    },
    // 删除
    handleDelete(e) {
      //请求ajax删除
      this.$API.statDel({ id: e.id }).then(() => {
        this.$message({ message: `已删除`, type: "success" });
        // 重新请求页面，如果刚好删除某页的最后一条，往前翻一页，如果第一页则不操作
        const { pageSize, pageNum } = this.page;
        const total = this.total;
        if (pageNum !== 1 && total % pageSize === 1) {
          this.page.pageNum = this.page.pageNum - 1;
        }
        this.handleQueryStatList();
        // 还需要删除特定表
        this.$API.dbDropTable({
          tableName: e.name,
        });
      });
    },
    handleQueryStatList() {
      this.$API
        .statList({
          ...this.page,
        })
        .then((res) => {
          this.total = res.total;
          console.log(res);
          this.list = res.data || [];
        });
    },
    // 分页相关请求
    handleSizeChange(val) {
      this.page = {
        pageSize: val,
        pageNum: 1,
      };
      this.handleQueryStatList();
    },
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.handleQueryStatList();
    },
  },
};
</script>
