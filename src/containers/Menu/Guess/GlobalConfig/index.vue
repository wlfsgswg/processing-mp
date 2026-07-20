<template>
  <div class="xcx-guess-guessconfig">
    <Title title="三国猜全局配置"></Title>
    <div class="tabs p-t-20">
      <el-tabs v-model="activeName" @tab-click="handleClick" type="border-card">
        <el-tab-pane label="微信小程序" name='1'>
          <el-form ref="wxform" :model="wxform" label-width="110px">
            <el-form-item prop="qq" label="QQ">
              <el-input size="small" v-model="wxform.qq" placeholder="此处输入QQ，为空则不展示"></el-input>
            </el-form-item>
            <el-form-item prop="group" label="QQ群">
              <el-input size="small" v-model="wxform.group" placeholder="此处输入QQ群，为空则不展示"></el-input>
            </el-form-item>
            <el-form-item prop="version" label="版本号" :rules="[
              { required: true, message: '版本号不能为空！', trigger: 'blur' },
            ]">
              <el-input size="small" v-model="wxform.version" placeholder="请输入版本号"></el-input>
            </el-form-item>
            <el-form-item prop="updateTime" label="更新时间" :rules="[
              { required: true, message: '更新时间不能为空！', trigger: 'blur' },
            ]">
              <div class="demo-dynamic-flex">
                <div class="input">
                  <el-input size="small" v-model="wxform.updateTime" placeholder="请输入更新时间，或者点击右侧按钮获取当前时间填入"></el-input>
                </div>
                <div class="btn">
                  <el-button type="primary" size="small" @click="getMomentTime">当前时间</el-button>
                </div>
              </div>
            </el-form-item>
            <el-form-item prop="aboutUrl" label="关于页Url" :rules="[
              { required: true, message: '关于页Url不能为空！', trigger: 'blur' },
            ]">
              <el-input size="small" v-model="wxform.aboutUrl" placeholder="请输入关于页Url"></el-input>
            </el-form-item>
            <el-form-item prop="aboutTitle" label="关于页标题" :rules="[
              { required: true, message: '关于页标题不能为空！', trigger: 'blur' },
            ]">
              <el-input size="small" v-model="wxform.aboutTitle" placeholder="请输入关于页标题，最多10字" :maxlength="10"></el-input>
            </el-form-item>
            <el-form-item v-for="(mini, index) in wxform.miniGroup" :label="'引流小程序' + (index + 1)" :key="mini.key"
              :prop="'miniGroup.' + index + '.appid'" :rules="[{ required: true, message: ' ' }]">
              <div class="demo-dynamic-flex">
                <div class="input">
                  <el-col :span="5">
                    <el-form-item :prop="`miniGroup[${index}].appName`" :rules="[
                      { required: true, message: '小程序名称不能为空！', trigger: 'blur' },
                    ]">
                      <el-input size="small" v-model="mini.appName" placeholder="请输入小程序名称" :maxlength="10"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col class="line" :span="1">-</el-col>
                  <el-col :span="5">
                    <el-form-item :prop="`miniGroup[${index}].appid`" :rules="[
                      { required: true, message: '小程序appid不能为空！', trigger: 'blur' },
                    ]">
                      <el-input size="small" v-model="mini.appid" placeholder="请输入小程序appid" :maxlength="20"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col class="line" :span="1">-</el-col>
                  <el-col :span="12">
                    <el-form-item :prop="`miniGroup[${index}].appDesc`" :rules="[
                      { required: true, message: '小程序描述不能为空！', trigger: 'blur' },
                    ]">
                      <el-input size="small" v-model="mini.appDesc" placeholder="请输入小程序描述，最多100字"
                        :maxlength="100"></el-input>
                    </el-form-item>
                  </el-col>
                </div>
                <div class="btn2">
                  <div v-if="index">
                    <el-button plain size="small" @click.prevent="removeMini(mini)">删除</el-button>
                  </div>
                  <div v-else>
                    <el-button type="primary" size="small" @click="addMini()">新增</el-button>
                  </div>
                </div>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="submitForm('wxform')" :loading="loading">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="QQ小程序" name='2'>
          <el-form ref="qqform" :model="qqform" label-width="110px">
            <el-form-item prop="qq" label="QQ">
              <el-input size="small" v-model="qqform.qq" placeholder="此处输入QQ，为空则不展示"></el-input>
            </el-form-item>
            <el-form-item prop="group" label="QQ群">
              <el-input size="small" v-model="qqform.group" placeholder="此处输入QQ群，为空则不展示"></el-input>
            </el-form-item>
            <el-form-item prop="isSubmitting" label="正在提交" :rules="[
              { required: true, message: '正在提交状态不能为空！', trigger: 'blur' },
            ]">
              <el-select v-model="qqform.isSubmitting" placeholder="请选择正在提交状态" size="small" :style="{ width: '100%' }">
                <el-option label="是" :value="true" :key="1"></el-option>
                <el-option label="否" :value="false" :key="0"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="version" label="版本号" :rules="[
              { required: true, message: '版本号不能为空！', trigger: 'blur' },
            ]">
              <el-input size="small" v-model="qqform.version" placeholder="请输入版本号"></el-input>
            </el-form-item>
            <el-form-item prop="updateTime" label="更新时间" :rules="[
              { required: true, message: '更新时间不能为空！', trigger: 'blur' },
            ]">
              <div class="demo-dynamic-flex">
                <div class="input">
                  <el-input size="small" v-model="qqform.updateTime" placeholder="请输入更新时间，或者点击右侧按钮获取当前时间填入"></el-input>
                </div>
                <div class="btn">
                  <el-button type="primary" size="small" @click="getMomentTime">当前时间</el-button>
                </div>
              </div>
            </el-form-item>
            <el-form-item prop="aboutUrl" label="关于页Url" :rules="[
              { required: true, message: '关于页Url不能为空！', trigger: 'blur' },
            ]">
              <el-input size="small" v-model="qqform.aboutUrl" placeholder="请输入关于页Url"></el-input>
            </el-form-item>
            <el-form-item prop="aboutTitle" label="关于页标题" :rules="[
              { required: true, message: '关于页标题不能为空！', trigger: 'blur' },
            ]">
              <el-input size="small" v-model="qqform.aboutTitle" placeholder="请输入关于页标题，最多10字" :maxlength="10"></el-input>
            </el-form-item>
            <el-form-item v-for="(mini, index) in qqform.miniGroup" :label="'引流小程序' + (index + 1)" :key="mini.key"
              :prop="'miniGroup.' + index + '.appid'" :rules="[{ required: true, message: ' ' }]">
              <div class="demo-dynamic-flex">
                <div class="input">
                  <el-col :span="5">
                    <el-form-item :prop="`miniGroup[${index}].appName`" :rules="[
                      { required: true, message: '小程序名称不能为空！', trigger: 'blur' },
                    ]">
                      <el-input size="small" v-model="mini.appName" placeholder="请输入小程序名称" :maxlength="10"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col class="line" :span="1">-</el-col>
                  <el-col :span="5">
                    <el-form-item :prop="`miniGroup[${index}].appid`" :rules="[
                      { required: true, message: '小程序appid不能为空！', trigger: 'blur' },
                    ]">
                      <el-input size="small" v-model="mini.appid" placeholder="请输入小程序appid" :maxlength="20"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col class="line" :span="1">-</el-col>
                  <el-col :span="12">
                    <el-form-item :prop="`miniGroup[${index}].appDesc`" :rules="[
                      { required: true, message: '小程序描述不能为空！', trigger: 'blur' },
                    ]">
                      <el-input size="small" v-model="mini.appDesc" placeholder="请输入小程序描述，最多100字"
                        :maxlength="100"></el-input>
                    </el-form-item>
                  </el-col>
                </div>
                <div class="btn2">
                  <div v-if="index">
                    <el-button plain size="small" @click.prevent="removeMini(mini)">删除</el-button>
                  </div>
                  <div v-else>
                    <el-button type="primary" size="small" @click="addMini()">新增</el-button>
                  </div>
                </div>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="submitForm('qqform')" :loading="loading">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { Title } from "@/components";
import "./index.less";
import moment from 'moment'
export default {
  components: {
    Title,
  },
  data: () => ({
    activeName: '1',
    loading: false,
    wxform: {
      qq: '',
      group: '',
      version: '',
      updateTime: '',
      aboutUrl: '',
      aboutTitle: '',
      miniGroup: []
    },
    qqform: {
      qq: '',
      group: '',
      version: '',
      updateTime: '',
      aboutUrl: '',
      aboutTitle: '',
      miniGroup: [],
      isSubmitting: false,//是否正在提交
    }
  }),
  mounted() {
    this.handleGetGlobalConfig()
  },
  methods: {
    handleGetGlobalConfig() {
      let appid = 'wx834f8964f50598b2'
      if (this.activeName === '2') appid = '1111021694'
      this.$API
        .getAppConfig({
          appid
        })
        .then((res) => {
          if (res.status === 200) {
            res.data.config = res.data.config.replace(/[\r|\n|\t]/g, "");
            let config = JSON.parse(res.data.config)
            let orginConfig = this.activeName === '1' ? this.wxform : this.qqform
            config = { ...orginConfig, ...config }
            if (!config.miniGroup || (config.miniGroup && config.miniGroup.length === 0)) {
              config.miniGroup = []
              config.miniGroup.push({ key: '1', appid: '', appDesc: '', appName: '' })
            }
            if (this.activeName === '1') this.wxform = config
            if (this.activeName === '2') this.qqform = config
          }
        })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$confirm('点击保存全局配置即刻生效, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            showCancelButton: false,
            type: 'warning'
          }).then(() => {
            this.handleSummit()
          }).catch(() => { });
        } else {
          return false;
        }
      });
    },
    handleClick(tab) {
      this.activeName === tab.name
      this.handleGetGlobalConfig()
    },
    getMomentTime() {
      this[this.activeName === '1' ? 'wxform' : 'qqform'].updateTime = moment().format('YYYY年MM月DD日 HH:mm:ss')
    },
    // 保存小程序配置
    handleSummit() {
      let appid = 'wx834f8964f50598b2'
      let config = JSON.stringify(this.wxform)
      if (this.activeName === '2') {
        appid = '1111021694'
        config = JSON.stringify(this.qqform)
      }
      this.loading = true
      this.$API
        .updateAppConfig({
          appid,
          config
        })
        .then((res) => {
          if (res.status === 200) {
            this.$message.success('更新成功！');
            this.loading = false
            this.handleGetGlobalConfig()
          }
        }).catch(() => {
          this.loading = false
        })
    },
    removeMini(item) {
      let index = this[this.activeName === '1' ? 'wxform' : 'qqform'].miniGroup.indexOf(item)
      if (index !== -1) {
        this[this.activeName === '1' ? 'wxform' : 'qqform'].miniGroup.splice(index, 1)
      }
    },
    addMini() {
      if (this[this.activeName === '1' ? 'wxform' : 'qqform'].miniGroup.length < 3) {
        this[this.activeName === '1' ? 'wxform' : 'qqform'].miniGroup.push({
          key: Date.now(), appid: '', appDesc: '', appName: ''
        });
      } else {
        this.$message({
          message: '跳转小程序最多只能三个！',
          type: 'warning'
        });
      }
    },
  },
  watch: {},
};
</script>
