<template>
  <div class="xcx-system-accountcontrol">
    <Title title="账号管理"></Title>
    <!-- 条件搜索 -->
    <div class="search">
      <el-row>
        <el-col :span="8">
          <div class="search-item">
            <div class="label">账号名字：</div>
            <div class="component">
              <el-input v-model="search.name" size="small" placeholder="请输入账号名字" :style="{ width: '100%' }"
                clearable></el-input>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="search-item">
            <div class="label">账号手机：</div>
            <div class="component">
              <el-input v-model="search.phone" size="small" placeholder="请输入账号手机" :style="{ width: '100%' }"
                clearable></el-input>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="search-item">
            <div class="label">账号状态：</div>
            <div class="component">
              <el-select v-model="search.status" placeholder="请选择状态" size="small" :style="{ width: '100%' }" clearable>
                <el-option label="启用" :value="1" :key="1"></el-option>
                <el-option label="禁用" :value="2" :key="2"></el-option>
              </el-select>
            </div>
          </div>
        </el-col>
      </el-row>
      <div class="p-t-20 p-b-20">
        <el-row>
          <el-col :span="8">
            <div class="search-item">
              <div class="label">申请时间：</div>
              <div class="component">
                <el-date-picker v-model="search.time" value-format="yyyy-MM-dd"  size="small" type="daterange" unlink-panels
                  :style="{ width: '100%' }" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                  :picker-options="pickerOptions">
                </el-date-picker>
              </div>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="search-btn clearfix">
              <div class="r-right">
                <el-button type="primary" size="small" @click="handleSearch"> 查询</el-button>
              </div>
              <div class="r-right p-r-8">
                <el-button plain size="small" @click="handleSearch('clear')"> 重置</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <xcx-table :columns="accountControlColumns" :dataSource="list" name="xcxaccountcontroltable" :loading="loading">
      <template #grade="{ row }">
        <div>
          {{
            row.grade === 1 ? '超级管理员' : row.grade === 2 ? '管理员' : '普通用户'
          }}
        </div>
      </template>
      <template #status="{ row }">
        <div v-if="row.status === 1">
          <el-tag type="success" size="mini">启用</el-tag>
        </div>
        <div v-if="row.status === 2">
          <el-tag type="danger" size="mini">禁用</el-tag>
        </div>
        <div v-if="row.status === 0">
          <el-tag type="info" size="mini">申请中</el-tag>
        </div>
      </template>
      <template #op="{ row }">
        <div>
          <span class="m-r-5" v-if="row.status === 0 && userInfo.grade === 1">
            <el-popconfirm icon="el-icon-info" :title="'点击确定即刻生效，确定要开启该账号吗？'" popper-class="guess-popconfirm"
              @confirm="handleAggree(row, row.status)">
              <el-button slot="reference" type="text">
                同意
              </el-button>
            </el-popconfirm>
          </span>
          <span class="m-r-5" v-if="userInfo.grade === 1 && row.grade !== 1 && row.status !== 0">
            <el-popconfirm icon="el-icon-info" :title="row.status === 1 ? '点击确定即刻生效，确定要禁用吗？' : '点击确定即刻生效，确定要启用吗？'"
              popper-class="guess-popconfirm" @confirm="handleSwitchStatus(row, row.status)">
              <el-button slot="reference" type="text">
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
            </el-popconfirm>
          </span>
          <span class="m-r-5" v-if="userInfo.grade !== 3 && row.grade !== 1">
            <el-button type="text" @click="handleEdit(row)">修改</el-button>
          </span>
          <span>
            <el-button type="text" @click="handleOpen(row)">查看</el-button>
          </span>
        </div>
      </template>
    </xcx-table>
    <div class="p-t-20 t-a-r">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="page.pageNum" :page-sizes="[5, 10, 20]" :page-size="page.pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <Dialog :visible="visible" width="450px" :title="dialogTitle" @onCancel="onCancel"
      @onOk="submitForm('dynamicValidateForm')" :okButtonLoading="okloading">
      <template #content>
        <div class="dialog-content">
          <div class="dialog-content-form">
            <el-form :model="dynamicValidateForm" ref="dynamicValidateForm" label-width="80px" class="demo-dynamic">
              <el-form-item prop="name" label="账号名字" :rules="[
                { required: true, message: '账号名字不能为空！', trigger: 'blur' },
              ]">
                <el-input size="small" v-model="dynamicValidateForm.name" placeholder="请输入答案" :maxlength="10"></el-input>
              </el-form-item>
              <el-form-item prop="password" label="账号密码" :rules="[
                { required: true, message: '账号密码不能为空！', trigger: 'blur' },
              ]">
                <el-input size="small" v-model="dynamicValidateForm.password" placeholder="请输入密码"
                  :maxlength="20"></el-input>
              </el-form-item>
              <el-form-item prop="grade" label="账号等级" :rules="[
                { required: true, message: '账号等级不能为空！', trigger: 'blur' },
              ]">
                <el-select placeholder="请选择账号等级" size="small" :style="{ width: '100%' }"
                  v-model="dynamicValidateForm.grade">
                  <el-option v-for="it in grades" :label="it.name" :value="it.value" :key="it.value"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </template>
    </Dialog>
    <Dialog :visible="openVisible" width="720px" title="账号详情" @onCancel="openVisible = false"
      :slotObject="{ content: true, footer: true }">
      <template #content>
        <div class="dialog-content">
          <div class="dialog-content-form">
            <el-descriptions border>
              <template slot="title"> </template>
              <el-descriptions-item v-for="it in opendata" :key="it.key" :label="it.key">
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
import { accountControlColumns } from "@/common/columns";
import { pickerOptions, grades, fromValueGetName } from '@/common/const'
import { mapState } from "vuex";
import moment from "moment";
const dynamicValidateForm = {
  name: '',
  grade: '',
  password: '',
}
export default {
  data: () => ({
    accountControlColumns,
    pickerOptions,
    dialogTitle: '修改账号',
    loading: false,
    visible: false,
    openVisible: false,
    okloading: false,
    list: [],
    total: 0,
    grades,
    // 表单
    dynamicValidateForm: JSON.parse(JSON.stringify(dynamicValidateForm)),
    // 搜索
    search: {
      phone: '',
      name: '',
      time: '',
      status: '',
    },
    // 分页
    page: {
      pageSize: 10,
      pageNum: 1
    },
    // 查看数据data
    opendata: [],
  }),
  components: {
    Title,
    XcxTable,
    Dialog
  },
  mounted() {
    this.handleGetAccountData()
  },
  methods: {
    // 提交
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.handleSummit()
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    handleGetAccountData() {
      this.loading = true;
      this.$API
        .getAccountData({
          ...this.search, ...this.page
        })
        .then((res) => {
          this.list = res.data.map((it, index) => {
            return {
              ...it,
              index: index + 1,
              editLoading: false,
              agreeLoading: false,
              orginApplytime: it.applytime,
              orginAgreetime: it.agreetime,
              applytime: moment(it.applytime - 0).format("YYYY-MM-DD HH:mm:ss"),
              agreetime: it.agreetime ? moment(it.agreetime - 0).format("YYYY-MM-DD HH:mm:ss") : '--',
              agreename: it.agreename ? it.agreename : '--',
            }
          }) || []
          this.total = res.total || 0
          this.loading = false
        }).catch(() => {
          this.loading = false
        });
    },
    onCancel() {
      this.visible = false
      this.resetForm('dynamicValidateForm')
      this.dynamicValidateForm = JSON.parse(JSON.stringify(dynamicValidateForm))
    },
    // summit
    handleSummit() {
      this.okloading = true
      this.$API
        .addAccount({
          ...this.dynamicValidateForm,
          updatename: this.userInfo.name,
          updatephone: this.userInfo.phone,
        })
        .then(() => {
          this.$message({
            message: '修改成功',
            type: 'success'
          });
          this.okloading = false
          this.onCancel()
          this.handleGetAccountData()
        }).catch(() => {
          this.okloading = false
        })
    },
    // 修改
    handleEdit(row) {
      const dynamicValidateForm = {
        phone: row.phone,
        name: row.name,
        grade: row.grade,
        password: row.password,
      }
      // 赋值
      this.dynamicValidateForm = dynamicValidateForm
      // 加上延时器，解决弹框一闪一闪的问题
      setTimeout(() => {
        this.visible = true;
      }, 200);
    },
    // 禁用or启用
    handleSwitchStatus(row, status) {
      row.editLoading = true
      this.$API
        .editAccountStatus({
          phone: row.phone,
          status,
          updatename: this.userInfo.name,
          updatephone: this.userInfo.phone,
        })
        .then(() => {
          row.editLoading = false
          this.$message({
            message: status === 1 ? '账号已禁用' : '账号已启用',
            type: 'success'
          });
          this.handleGetAccountData()
        }).catch(() => {
          row.editLoading = false
        })
    },
    // 查询
    handleSearch(e) {
      if (e === 'clear') {
        this.search = { phone: '', name: '', time: '', status: '' }
      }
      this.page = { pageSize: 10, pageNum: 1 }
      this.handleGetAccountData()
    },
    // 分页相关请求
    handleSizeChange(val) {
      this.page = {
        pageSize: val,
        pageNum: 1
      }
      this.handleGetAccountData()
    },
    handleCurrentChange(val) {
      this.page.pageNum = val
      this.handleGetAccountData()
    },
    // 查看
    handleOpen(row) {
      this.opendata = [
        {
          key: '账号名字', value: row.name || '--'
        },
        {
          key: '账号手机', value: row.phone || '--'
        },
        {
          key: '账号状态', value: row.status === 1 ? '启用' : '禁用'
        },
        {
          key: '账号等级', value: fromValueGetName(row.grade, grades) === '--' ? '超级管理员' : fromValueGetName(row.grade, grades)
        },
        {
          key: '账号邮箱', value: row.mail || '--'
        },
        {
          key: '申请时间', value: moment(row.orginApplytime - 0).format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          key: '同意人', value: row.agreename || '--'
        },
        {
          key: '同意手机', value: row.agreephone || '--'
        },
        {
          key: '同意时间', value: row.orginAgreetime ? moment(row.orginAgreetime - 0).format("YYYY-MM-DD HH:mm:ss") : '--',
        },
        {
          key: '更新人', value: row.updatename || '--'
        },
        {
          key: '更新手机', value: row.updatephone || '--'
        },
        {
          key: '更新时间', value: row.updatetime ? moment(row.updatetime - 0).format("YYYY-MM-DD HH:mm:ss") : '--',
        },

      ]
      this.openVisible = true
    },
    // 同意账号申请
    handleAggree(row) {
      row.agreeLoading = true
      this.$API
        .agreeAccount({
          phone: row.phone,
          agreename: this.userInfo.name,
          agreephone: this.userInfo.phone,
        })
        .then(() => {
          row.agreeLoading = false
          this.$message({
            message: '账号已开启',
            type: 'success'
          });
          this.handleGetAccountData()
        }).catch(() => {
          row.agreeLoading = false
        })

    }
  },
  computed: {
    ...mapState("global", ["globalInfo", "userInfo"]),
  },
  watch: {},
};
</script>
