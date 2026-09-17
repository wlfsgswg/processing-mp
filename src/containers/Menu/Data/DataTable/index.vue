<template>
  <div class="xcx-data-datatable">
    <Title title="数据列表"></Title>
    <!-- 条件搜索 -->
    <div class="search">
      <div class="p-b-20">
        <el-row>
          <el-col :span="8">
            <div class="search-item">
              <div class="label">线索来源：</div>
              <div class="component">
                <el-select
                  filterable
                  v-model="search.线索来源"
                  placeholder="请选择线索来源"
                  size="small"
                  :style="{ width: '100%' }"
                  clearable
                >
                  <el-option
                    v-for="it in sourceList"
                    :label="it"
                    :value="it"
                    :key="it"
                  ></el-option>
                </el-select>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="search-item">
              <div class="label">承办单位：</div>
              <div class="component">
                <el-select
                  filterable
                  v-model="search.承办单位"
                  placeholder="请选择承办单位"
                  size="small"
                  :style="{ width: '100%' }"
                  clearable
                >
                  <el-option
                    v-for="it in departmentList"
                    :label="it"
                    :value="it"
                    :key="it"
                  ></el-option>
                </el-select>
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
    </div>
    <div class="p-b-20 clearfix">
      <div class="l-left p-r-20">
        <el-button type="primary" size="small" @click="dialogVisible = true">
          设置表头
        </el-button>
      </div>
      <div class="l-left">
        <el-button type="primary" size="small" @click="handleImport">
          导出数据</el-button
        >
      </div>
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
    <Dialog
      :visible="dialogVisible"
      width="720px"
      title="设置表头"
      @onCancel="dialogVisible = false"
      :slotObject="{ footer: true, content: true }"
    >
      <template #content>
        <div class="dialog-content">
          <div class="dialog-content-form">
            <el-checkbox-group
              v-model="checkedCell"
              @change="handleCheckedCitiesChange"
            >
              <el-checkbox v-for="it in keys" :label="it" :key="it">{{
                it
              }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>
import "./index.less";
import { Title, Dialog } from "@/components";
import { pickerOptions, headerBasicCell } from "@/common/const";
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
      线索来源: "",
      承办单位: "",
    },
    // 分页
    page: {
      pageSize: 10,
      pageNum: 1,
    },
    dialogVisible: false,
    sourceList: [],
    departmentList: [],
    // 选项框
    keys: [],
    checkedCell: headerBasicCell,
  }),
  components: {
    Title,
    Dialog,
  },
  mounted() {
    // 获取参数名字
    this.tablename = this.$route.query.name;
    this.handleQueryTableData();
    this.handleQueryDistinctField("线索来源");
    this.handleQueryDistinctField("承办单位");
  },
  methods: {
    handleCheckedCitiesChange() {
      const tableColumns = [];
      const length = this.checkedCell.length;
      for (let index = 0; index < length; index++) {
        const key = this.checkedCell[index];
        tableColumns.push({
          label: key,
          prop: key,
        });
      }
      this.tableColumns = tableColumns;
    },
    // 导出数据
    handleImport() {},
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
          const length = headerBasicCell.length;
          for (let index = 0; index < length; index++) {
            const key = headerBasicCell[index];
            tableColumns.push({
              label: key,
              prop: key,
            });
          }
          this.tableColumns = tableColumns;
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
