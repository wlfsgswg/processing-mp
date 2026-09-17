<template>
  <div class="xcx-data-datatable">
    <Title title="数据列表"></Title>
    <!-- 条件搜索 -->
    <div class="search">
      <div class="p-b-20">
        <el-row>
          <el-col :span="8">
            <div class="search-item">
              <div class="label">被反映人姓名：</div>
              <div class="component">
                <el-input
                  v-model="search.主要被反映人姓名"
                  size="small"
                  placeholder="请输入被反映人姓名"
                  :style="{ width: '100%' }"
                  clearable
                ></el-input>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="search-item">
              <div class="label">被反映人职级：</div>
              <div class="component">
                <el-input
                  v-model="search.主要被反映人职级"
                  size="small"
                  placeholder="请输入被反映人职级"
                  :style="{ width: '100%' }"
                  clearable
                ></el-input>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="search-btn clearfix">
              <div class="r-right">
                <el-button type="primary" size="small" @click="handleSearch">
                  查询</el-button
                >
              </div>
              <div class="r-right p-r-8">
                <el-button plain size="small" @click="handleSearch('clear')">
                  重置</el-button
                >
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <!-- <div class="p-t-20 p-b-20">
        <el-row>
          <el-col :span="8">
            <div class="search-item">
              <div class="label">创建时间：</div>
              <div class="component">
                <el-date-picker
                  v-model="search.time"
                  size="small"
                  type="daterange"
                  unlink-panels
                  :style="{ width: '100%' }"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="yyyy-MM-dd"
                  :picker-options="pickerOptions"
                >
                </el-date-picker>
              </div>
            </div>
          </el-col>
        </el-row>
      </div> -->
    </div>
    <div :class="`xcx-components-table`" v-if="tableColumns.length">
      <el-table
        ref="dataTable"
        :loading="loading"
        border
        element-loading-spinner="el-icon-loading el-icon-nologin-loading"
        :data="list"
        :cell-style="{
          height: '56px !important',
          'font-size': '14px',
          'text-align': 'center',
        }"
        :header-cell-style="{
          background: '#F6F6F6',
          color: '#333',
          'font-size': '14px',
          'text-align': 'center',
        }"
        :style="'width: 100%'"
        :row-style="{ color: '#333' }"
      >
        <el-table-column
          :fixed="item.fixed"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          show-overflow-tooltip
          v-for="item in tableColumns"
          :width="item.windth"
        >
        </el-table-column>
      </el-table>
    </div>
    <div class="p-t-20 t-a-r">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.pageNum"
        :page-sizes="[5, 10, 20, 50, 100, 200, 500]"
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
import { pickerOptions } from "@/common/const";
import { mapState } from "vuex";

export default {
  data: () => ({
    tableColumns: [],
    tablename: "",
    pickerOptions,
    sgDynasty: [
      {
        name: "三国",
        value: "1",
      },
    ],
    loading: false,
    list: [],
    total: 0,
    // 搜索
    search: {
      主要被反映人职级: "",
      主要被反映人姓名: "",
    },
    // 分页
    page: {
      pageSize: 10,
      pageNum: 1,
    },
    keys:[]
  }),
  components: {
    Title,
  },
  mounted() {
    // 获取参数名字
    this.tablename = this.$route.query.name;
    this.handleQueryTableData();
  },
  methods: {
    handleClick(row) {
      console.log(row);
    },
    // 请求
    handleQueryTableData() {
      this.loading = true;
      this.$API
        .queryTableData({
          tablename: this.tablename,
          search: this.search,
          keys: this.keys,
          ...this.page,
        })
        .then((res) => {
          this.list = res.list || [];
          this.total = res.total || 0;
          this.loading = false;
          const keys = Object.keys(this.list[0] || {}).slice(1);
          this.keys = keys;

          const tableColumns = [];
          const length = keys.length;
          for (let index = 0; index < length; index++) {
            const key = keys[index];
            tableColumns.push({
              label: key,
              prop: key,
              minWidth: 10,
              width: 400,
            });
          }
          this.tableColumns = tableColumns;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 查询
    handleSearch(e) {
      if (e === "clear") {
        this.search = {
          主要被反映人职级: "",
          主要被反映人姓名: "",
        };
      }
      this.page = { pageSize: 10, pageNum: 1 };
      this.handleQueryTableData();
    },
    // 分页相关请求
    handleSizeChange(val) {
      this.page = {
        pageSize: val,
        pageNum: 1,
      };
      this.handleQueryTableData();
    },
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.handleQueryTableData();
    },
  },
  computed: {
    ...mapState("global", ["globalInfo", "userInfo"]),
  },
  watch: {},
};
</script>
