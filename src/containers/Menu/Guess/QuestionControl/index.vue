<template>
  <div class="xcx-guess-guesscontrol">
    <Title title="三国猜问题列表"></Title>
    <!-- 条件搜索 -->
    <div class="search">
      <el-row>
        <el-col :span="8">
          <div class="search-item">
            <div class="label">问题内容：</div>
            <div class="component">
              <el-input
                v-model="search.content"
                size="small"
                placeholder="请输入内容"
                :style="{ width: '100%' }"
                clearable
              ></el-input>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="search-item">
            <div class="label">问题答案：</div>
            <div class="component">
              <el-input
                v-model="search.name"
                size="small"
                placeholder="请输入答案"
                :style="{ width: '100%' }"
                clearable
              ></el-input>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="search-item">
            <div class="label">人物朝代：</div>
            <div class="component">
              <el-select
                v-model="search.dynasty"
                placeholder="请选择朝代"
                size="small"
                :style="{ width: '100%' }"
                clearable
              >
                <el-option
                  v-for="it in sgDynasty"
                  :label="it.name"
                  :value="it.value"
                  :key="it.value"
                ></el-option>
              </el-select>
            </div>
          </div>
        </el-col>
      </el-row>
      <div class="p-t-20 p-b-20">
        <el-row>
          <el-col :span="8">
            <div class="search-item">
              <div class="label">问题状态：</div>
              <div class="component">
                <el-select
                  v-model="search.status"
                  placeholder="请选择状态"
                  size="small"
                  :style="{ width: '100%' }"
                  clearable
                >
                  <el-option label="启用" :value="1" :key="1"></el-option>
                  <el-option label="禁用" :value="2" :key="2"></el-option>
                </el-select>
              </div>
            </div>
          </el-col>
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
    <div class="p-b-10">
      <el-button type="primary" size="small" @click="handleAdd">
        新增问题</el-button
      >
    </div>
    <xcx-table
      :columns="guessControlColumns"
      :dataSource="list"
      name="xcxguesscontroltable"
      :loading="loading"
    >
      <template #desc="{ row }">
        <div class="container-table-item">
          <div v-for="it in row.desc" :key="it" class="table-item">
            {{ it }}
          </div>
          <div
            v-for="it in row.promitdesc"
            :key="it"
            class="c-primary table-item"
          >
            {{ it }}
          </div>
        </div>
      </template>
      <template #createname="{ row }">
        <div class="table-item2">
          <span>创建：</span>
          <span>{{ row.createname }}</span>
        </div>
        <div class="table-item2" v-if="row.updatename">
          <span>更新：</span>
          <span>{{ row.updatename }}</span>
        </div>
      </template>
      <template #name="{ row }">
        <div>{{ row.name }}</div>
        <div>
          <el-tag size="mini">{{ row.dynastyName }}</el-tag>
        </div>
      </template>
      <template #keywords="{ row }">
        <div>
          {{ row.keywords ? row.keywords.join(",") : "--" }}
        </div>
      </template>
      <template #status="{ row }">
        <div v-if="row.status === 1">
          <el-tag type="success" size="mini">启用</el-tag>
        </div>
        <div v-if="row.status === 2">
          <el-tag type="danger" size="mini">禁用</el-tag>
        </div>
      </template>
      <template #op="{ row }">
        <div>
          <!-- 由于随便禁用问题肯定会导致数据混乱，此处不在展示禁用按钮 -->
          <span class="m-r-5" v-if="userInfo.grade === 1 && row.status !== 1">
            <el-popconfirm
              icon="el-icon-info"
              title="点击确定即刻生效，确定要启用吗？"
              popper-class="guess-popconfirm"
              @confirm="handleSwitchStatus(row, row.status)"
            >
              <el-button slot="reference" type="text">
                启用
              </el-button>
            </el-popconfirm>
          </span>
          <span class="m-r-5">
            <el-button
              type="text"
              v-if="userInfo.grade !== 3"
              @click="handleEdit(row)"
              >修改</el-button
            >
          </span>
          <span class="m-r-5">
            <el-button type="text" @click="handleOpen(row)">查看</el-button>
          </span>
        </div>
      </template>
    </xcx-table>
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
    <Dialog
      :visible="visible"
      width="720px"
      :title="dialogTitle || '新增问题'"
      @onCancel="onCancel"
      @onOk="submitForm('dynamicValidateForm')"
      :okButtonLoading="okloading"
    >
      <template #content>
        <div class="dialog-content">
          <div class="dialog-content-form">
            <el-form
              :model="dynamicValidateForm"
              ref="dynamicValidateForm"
              label-width="66px"
              class="demo-dynamic"
            >
              <el-form-item
                v-for="(domain, index) in dynamicValidateForm.domains"
                :label="'描述' + (index + 1)"
                :key="domain.key"
                :prop="'domains.' + index + '.value'"
                :rules="{
                  required: true,
                  message: '描述内容不能为空！',
                  trigger: 'blur',
                }"
              >
                <div class="demo-dynamic-flex">
                  <div class="input">
                    <el-input
                      size="small"
                      v-model="domain.value"
                      placeholder="请输入描述内容，最多45字"
                      :maxlength="45"
                    ></el-input>
                  </div>
                  <div class="btn">
                    <div v-if="index">
                      <el-button
                        plain
                        size="small"
                        @click.prevent="removeDomain(domain, 'domain')"
                        >删除</el-button
                      >
                    </div>
                    <div v-else>
                      <el-button
                        type="primary"
                        size="small"
                        @click="addDomain('domain')"
                        >新增</el-button
                      >
                    </div>
                  </div>
                </div>
              </el-form-item>
              <el-form-item
                v-for="(orthersDomain,
                index) in dynamicValidateForm.orthersDomains"
                :label="'其他' + (index + 1)"
                :key="orthersDomain.key"
                :prop="'orthersDomains.' + index + '.value'"
                :rules="{
                  required: true,
                  message: '其他内容不能为空！',
                  trigger: 'blur',
                }"
              >
                <div class="demo-dynamic-flex">
                  <div class="input">
                    <el-input
                      size="small"
                      v-model="orthersDomain.value"
                      placeholder="请输入其他内容，最多45字"
                      :maxlength="45"
                    ></el-input>
                  </div>
                  <div class="btn">
                    <div v-if="index">
                      <el-button
                        plain
                        size="small"
                        @click.prevent="
                          removeDomain(orthersDomain, 'orthersDomain')
                        "
                        >删除</el-button
                      >
                    </div>
                    <div v-else>
                      <el-button
                        type="primary"
                        size="small"
                        @click="addDomain('orthersDomain')"
                        >新增</el-button
                      >
                    </div>
                  </div>
                </div>
              </el-form-item>
              <el-form-item
                prop="dynasty"
                label="朝代"
                :rules="[
                  {
                    required: true,
                    message: '朝代不能为空！',
                    trigger: 'blur',
                  },
                ]"
              >
                <el-select
                  placeholder="请选择朝代"
                  size="small"
                  :style="{ width: '100%' }"
                  v-model="dynamicValidateForm.dynasty"
                >
                  <el-option
                    v-for="it in sgDynasty"
                    :label="it.name"
                    :value="it.value"
                    :key="it.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                prop="name"
                label="答案"
                :rules="[
                  {
                    required: true,
                    message: '答案内容不能为空！',
                    trigger: 'blur',
                  },
                ]"
              >
                <el-input
                  size="small"
                  v-model="dynamicValidateForm.name"
                  placeholder="请输入答案"
                  :maxlength="10"
                ></el-input>
              </el-form-item>
              <el-form-item
                prop="keywords"
                label="关键人"
                :rules="[
                  {
                    required: true,
                    message: '关键人内容不能为空！',
                    trigger: 'blur',
                  },
                ]"
              >
                <el-select
                  size="small"
                  v-model="dynamicValidateForm.keywords"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  :style="{ width: '100%' }"
                  placeholder="请输入关键人"
                >
                  <el-option
                    v-for="item in keywordsNames"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </template>
    </Dialog>
    <Dialog
      :visible="openVisible"
      width="720px"
      title="问题详情"
      @onCancel="openVisible = false"
      :slotObject="{ content: true, footer: true }"
    >
      <template #content>
        <div class="dialog-content">
          <div class="dialog-content-form">
            <el-descriptions border>
              <template slot="title">
                <div>
                  <span>{{ opendataTitle.str1 }}</span>
                  <span class="c-primary">{{ opendataTitle.str2 }}</span>
                </div>
              </template>
              <el-descriptions-item
                v-for="it in opendata"
                :key="it.key"
                :label="it.key"
              >
                {{ it.value }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>
import "./index.less";
import { Title, XcxTable, Dialog } from "@/components";
import { guessControlColumns } from "@/common/columns";
import { fromValueGetName, pickerOptions } from "@/common/const";
import { mapState } from "vuex";
import moment from "moment";
const dynamicValidateForm = {
  name: "",
  dynasty: "1",
  keywords: [],
  domains: [
    {
      key: "domain1",
      value: "",
    },
    {
      key: "domain2",
      value: "",
    },
  ],
  orthersDomains: [
    {
      key: "orthersDomain1",
      value: "",
    },
  ],
};
export default {
  data: () => ({
    guessControlColumns,
    pickerOptions,
    dialogTitle: "新增问题",
    sgDynasty: [
      {
        name: "三国",
        value: "1",
      },
    ],
    loading: false,
    visible: false,
    openVisible: false,
    okloading: false,
    keywordsNames: [], //人物名称
    list: [],
    total: 0,
    // 表单
    dynamicValidateForm: JSON.parse(JSON.stringify(dynamicValidateForm)),
    // 搜索
    search: {
      content: "",
      dynasty: "",
      name: "",
      time: "",
      status: "",
    },
    // 分页
    page: {
      pageSize: 5,
      pageNum: 1,
    },
    // 查看数据data
    opendata: [],
    opendataTitle: {
      str1: "",
      str2: "",
    },
  }),
  components: {
    Title,
    XcxTable,
    Dialog,
  },
  mounted() {
    this.handleGetGuessData();
    // 请求总人名进行设计混淆人物
    this.handleGetKeywordsNames();
  },
  methods: {
    // 提交
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.handleSummit();
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    removeDomain(item, e) {
      if (e === "domain") {
        let index = this.dynamicValidateForm.domains.indexOf(item);
        if (index !== -1) {
          this.dynamicValidateForm.domains.splice(index, 1);
        }
      } else {
        let index = this.dynamicValidateForm.orthersDomains.indexOf(item);
        if (index !== -1) {
          this.dynamicValidateForm.orthersDomains.splice(index, 1);
        }
      }
    },
    addDomain(e) {
      if (e === "domain") {
        if (this.dynamicValidateForm.domains.length < 5) {
          this.dynamicValidateForm.domains.push({
            value: "",
            key: Date.now(),
          });
        } else {
          this.$message({
            message: "描述最多只能五条！",
            type: "warning",
          });
        }
      } else {
        if (this.dynamicValidateForm.orthersDomains.length < 2) {
          this.dynamicValidateForm.orthersDomains.push({
            value: "",
            key: Date.now(),
          });
        } else {
          this.$message({
            message: "其他最多只能两条！",
            type: "warning",
          });
        }
      }
    },
    handleGetGuessData() {
      this.loading = true;
      this.$API
        .getGuessData({
          ...this.search,
          ...this.page,
        })
        .then((res) => {
          this.list =
            res.data.map((it, index) => {
              return {
                ...it,
                index: index + 1,
                editLoading: false,
                dynastyName: fromValueGetName(it.dynasty, this.sgDynasty),
                orginTime: it.time - 0,
                orginupdatetime: it.updatetime ? it.updatetime - 0 : "",
                time: moment(it.time - 0).format("YYYY-MM-DD"),
                updatetime: it.updatetime
                  ? moment(it.updatetime - 0).format("YYYY-MM-DD")
                  : "",
                updatename: it.updatename ? it.updatename : "",
                desc: JSON.parse(it.desc),
                promitdesc: JSON.parse(it.promitdesc),
                keywords: it.keywords ? JSON.parse(it.keywords) : "",
              };
            }) || [];
          this.total = res.total || 0;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handleGetKeywordsNames() {
      this.$API
        .getGuessData({
          pageSize: 500,
          pageNum: 1,
          dynasty: this.dynamicValidateForm.dynasty,
        })
        .then((res) => {
          this.keywordsNames = [
            ...new Set((res.data || []).map((it) => it.name)),
          ].map((item) => ({
            value: item,
            label: item,
          }));
        });
    },
    onCancel() {
      this.visible = false;
      this.resetForm("dynamicValidateForm");
      this.dynamicValidateForm = JSON.parse(
        JSON.stringify(dynamicValidateForm)
      );
    },
    // summit
    handleSummit() {
      const id = this.dynamicValidateForm.id;
      // 整理参数
      const data = {
        name: this.dynamicValidateForm.name,
        dynasty: this.dynamicValidateForm.dynasty,
        keywords: JSON.stringify(this.dynamicValidateForm.keywords),
        desc: JSON.stringify(
          this.dynamicValidateForm.domains.map((it) => it.value)
        ),
        promitdesc: JSON.stringify(
          this.dynamicValidateForm.orthersDomains.map((it) => it.value)
        ),
        username: this.userInfo.name,
        useraccount: this.userInfo.phone,
      };
      if (id) {
        data.id = id;
      }
      this.okloading = true;
      this.$API
        .addGuessData(data)
        .then(() => {
          this.$message({
            message: id ? "修改成功" : "新增成功",
            type: "success",
          });
          this.okloading = false;
          this.onCancel();
          // 没id说明是新增，搜索重置
          if (!id) {
            this.search = {
              content: "",
              dynasty: "",
              name: "",
              time: "",
              status: "",
            };
            this.page = { pageSize: 5, pageNum: 1 };
          }
          this.handleGetGuessData();
        })
        .catch(() => {
          this.okloading = false;
        });
    },
    // 新增
    handleAdd() {
      this.dialogTitle = "新增问题";
      // 加上延时器，解决弹框一闪一闪的问题
      setTimeout(() => {
        this.visible = true;
      }, 200);
    },
    // 修改
    handleEdit(row) {
      this.dialogTitle = "修改问题";
      const dynamicValidateForm = {
        id: row.id,
        dynasty: row.dynasty,
        name: row.name,
        keywords: row.keywords,
        domains: row.desc.map((it, i) => ({
          key: "domain" + (i + 1),
          value: it,
        })),
        orthersDomains: row.promitdesc.map((it, i) => ({
          key: "orthersDomain" + (i + 1),
          value: it,
        })),
      };
      // 赋值
      this.dynamicValidateForm = dynamicValidateForm;
      // 加上延时器，解决弹框一闪一闪的问题
      setTimeout(() => {
        this.visible = true;
      }, 200);
    },
    // 禁用or启用
    handleSwitchStatus(row, status) {
      if (!row.editLoading) {
        row.editLoading = true;
        this.$API
          .editGuessDataStatus({
            id: row.id,
            status,
            username: this.userInfo.name,
            useraccount: this.userInfo.phone,
          })
          .then(() => {
            row.editLoading = false;
            this.$message({
              message: "状态修改成功",
              type: "success",
            });
            this.handleGetGuessData();
          })
          .catch(() => {
            row.editLoading = false;
          });
      }
    },
    // 查询
    handleSearch(e) {
      if (e === "clear") {
        this.search = {
          content: "",
          dynasty: "",
          name: "",
          time: "",
          status: "",
        };
      }
      this.page = { pageSize: 5, pageNum: 1 };
      this.handleGetGuessData();
    },
    // 分页相关请求
    handleSizeChange(val) {
      this.page = {
        pageSize: val,
        pageNum: 1,
      };
      this.handleGetGuessData();
    },
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.handleGetGuessData();
    },
    // 查看
    handleOpen(row) {
      this.opendataTitle = {
        str1: row.desc.join(""),
        str2: row.promitdesc.join(""),
      };
      this.opendata = [
        {
          key: "人物朝代",
          value: row.dynastyName || "--",
        },
        {
          key: "问题答案",
          value: row.name || "--",
        },
        {
          key: "问题状态",
          value: row.status === 1 ? "启用" : "禁用",
        },
        {
          key: "创建用户",
          value: row.createname || "--",
        },
        {
          key: "创建账号",
          value: row.createaccount || "--",
        },
        {
          key: "创建时间",
          value: moment(row.orginTime - 0).format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          key: "更新用户",
          value: row.updatename || "--",
        },
        {
          key: "更新账号",
          value: row.updateaccount || "--",
        },
        {
          key: "更新时间",
          value: row.orginupdatetime
            ? moment(row.orginupdatetime - 0).format("YYYY-MM-DD HH:mm:ss")
            : "--",
        },
        {
          key: "关键人",
          value: (row.keywords || []).join("、"),
        },
      ];
      this.openVisible = true;
    },
  },
  computed: {
    ...mapState("global", ["globalInfo", "userInfo"]),
  },
  watch: {},
};
</script>
