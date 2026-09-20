<template>
  <div class="xcx-data-datatable">
    <div class="p-b-20">
      <Title title="数据列表"></Title>
    </div>
    <div class="p-b-20 data-department" v-if="!isShowSearch">
      <div>承办单位：{{ query.department }}</div>
      <div>
        总计：<span class="red p-r-5"> {{ total }} </span>件，已办结：<span
          class="red p-r-5"
        >
          {{ query.complete || 0 }} </span
        >件，未办结：<span class="red p-r-5">
          {{ total - query.complete || 0 }} </span
        >件，立案件数：<span class="red p-r-5">
          {{ query.caseFiling || 0 }} </span
        >件，立案人数：<span class="red p-r-5">
          {{ query.caseFilingPeople || 0 }} </span
        >人，留置件数：<span class="red p-r-5"> {{ query.detain || 0 }} </span
        >件，留置人数：<span class="red p-r-5">
          {{ query.detainPeople || 0 }} </span
        >人，处理处分人数：<span class="red p-r-5">
          {{ query.discipline || 0 }} </span
        >人
      </div>
    </div>
    <!-- 条件搜索 -->
    <div class="search" v-if="isShowSearch">
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
            <div class="search-item">
              <div class="label">排序方式：</div>
              <div class="component">
                <el-select
                  filterable
                  v-model="search.sort"
                  placeholder="请选择排序方式"
                  size="small"
                  :style="{ width: '100%' }"
                  clearable
                >
                  <el-option
                    label="受理日期"
                    value="受理日期"
                    key="1"
                  ></el-option>
                  <el-option
                    label="初次处置日期"
                    value="初次处置日期"
                    key="2"
                  ></el-option>
                  <el-option
                    label="立案日期"
                    value="立案日期"
                    key="3"
                  ></el-option>
                  <el-option
                    label="办结日期"
                    value="办结日期"
                    key="4"
                  ></el-option>
                </el-select>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="p-b-20 clearfix">
        <el-row>
          <el-col :span="24">
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
      <div class="r-right" v-if="isShowSearch">
        <el-button type="primary" size="small" @click="handleSkip">
          数据展示</el-button
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
          <!-- 作用域插槽：所有列都保留单元格结构，v-if只控制插槽内部自定义内容 -->
          <template slot-scope="scope">
            <!-- 判断：只有item.scope为true的时候，才渲染自定义内容；否则直接显示原始单元格值 -->
            <div v-if="item.scope">
              <!-- "受理日期", "初次处置日期", "立案日期", "办结日期" -->
              <div>{{ scope.row[item.prop] }}</div>
              <div class="p-t-5">
                <div
                  v-if="
                    item.prop === '受理日期' && scope.row.受理日期obj.isOver
                  "
                >
                  <el-tag
                    size="small"
                    :type="
                      scope.row.受理日期obj.isOver === 1 ? 'warning' : 'danger'
                    "
                    >{{ scope.row.受理日期obj.tip }}</el-tag
                  >
                </div>
              </div>
              <div
                v-if="
                  item.prop === '初次处置日期' &&
                  scope.row.初次处置日期obj.isOver
                "
              >
                <el-tag
                  size="small"
                  :type="
                    scope.row.初次处置日期obj.isOver === 1
                      ? 'warning'
                      : 'danger'
                  "
                  >{{ scope.row.初次处置日期obj.tip }}</el-tag
                >
              </div>
              <div
                v-if="item.prop === '立案日期' && scope.row.立案日期obj.isOver"
              >
                <el-tag
                  size="small"
                  :type="
                    scope.row.立案日期obj.isOver === 1 ? 'warning' : 'danger'
                  "
                  >{{ scope.row.立案日期obj.tip }}</el-tag
                >
              </div>

              <!--  -->
            </div>
            <div v-else>{{ scope.row[item.prop] }}</div>
          </template>
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
import { headerBasicCell, headerBasicCellScope } from "@/common/const";
import { checkSixMonth, checkTwelveMonth, createNewXlsx } from "@/common/utils";
import { mapState } from "vuex";

export default {
  data: () => ({
    tableColumns: [],
    tablename: "",
    loading: false,
    list: [],
    total: 0,
    // 搜索
    search: {
      线索来源: "",
      承办单位: "",
      sort: "",
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
    // 判断跳转过来
    isShowSearch: true,
    query: {
      department: "",
      type: "",
      value: "",
      // 办结
      complete: "",
      // 立案
      caseFiling: "",
      caseFilingPeople: "",
      // 处理处分
      discipline: "",
      // 留置件数
      detain: "",
      // 留置人数
      detainPeople: "",
    },
  }),
  components: {
    Title,
    Dialog,
  },
  mounted() {
    // 获取参数名字
    let { name, department } = this.$route.query;
    this.tablename = name;
    if (department) {
      this.query.department = department;
      this.search.承办单位 = department;
      this.page.pageSize = 50;
      this.isShowSearch = false;
      this.keys = ["承办单位"];
    } else {
      this.handleQueryDistinctField("线索来源");
      this.handleQueryDistinctField("承办单位");
    }
    this.handleQueryTableData();
  },
  _methods: {
    // 跳转到数据展示页面
    handleSkip() {
      this.$router.push({
        path: "/data/charts",
        query: {
          name: this.tablename,
        },
      });
    },
    handleCheckedCitiesChange() {
      const tableColumns = [];
      const length = this.checkedCell.length;
      for (let index = 0; index < length; index++) {
        const key = this.checkedCell[index];
        tableColumns.push({
          scope: headerBasicCellScope.includes(key) ? true : false,
          label: key,
          prop: key,
        });
      }
      this.tableColumns = tableColumns;
    },
    // 导出数据
    handleImport() {
      createNewXlsx(this.list);
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
          // 对list进行处理
          for (let a = 0; a < res.list.length; a++) {
            const e = res.list[a];
            e.受理日期obj =
              e.是否查结 === "是" ? { isOver: 0 } : checkSixMonth(e.受理日期);

            e.初次处置日期obj =
              e.是否立案 === "是" || e.是否查结 === "是"
                ? { isOver: 0 }
                : checkSixMonth(e.初次处置日期);

            e.立案日期obj =
              e.是否查结 === "是"
                ? { isOver: 0 }
                : checkTwelveMonth(e.立案日期);
          }

          this.list = res.list || [];
          this.total = res.total || 0;

          const keys = Object.keys(this.list[0] || {}).slice(1);
          this.keys = keys;
          if (!this.tableColumns.length) {
            const tableColumns = [];
            const length = headerBasicCell.length;
            for (let index = 0; index < length; index++) {
              const key = headerBasicCell[index];
              tableColumns.push({
                scope: headerBasicCellScope.includes(key) ? true : false,
                label: key,
                prop: key,
              });
            }
            this.tableColumns = tableColumns;
            // 判断当参数带“承办单位”时，需要获取7大参数并赋值
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
            if (!this.isShowSearch) {
              for (let index = 0; index < this.list.length; index++) {
                const el = this.list[index];
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
              this.query = {
                ...this.query,
                complete,
                caseFiling,
                caseFilingPeople,
                detain,
                detainPeople,
                discipline,
              };
            }

            this.loading = false;
          }
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
          线索来源: "",
          承办单位: "",
          sort: "",
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
  get methods() {
    return this._methods;
  },
  set methods(value) {
    this._methods = value;
  },
  computed: {
    ...mapState("global", ["globalInfo", "userInfo"]),
  },
  watch: {},
};
</script>
