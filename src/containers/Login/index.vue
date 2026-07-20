<template>
  <div class="xcx-login">
    <div class="xcx-login-top">
      <div class="content">
        <div class="content-title">
          <div class="title-img">
            <img :src="Logo" alt="" />
          </div>
          <div class="title-text">数据处理MP</div>
        </div>
        <div class="content-login">
          <div class="desc">
            <div class="desc-first"></div>
            <div class="desc-second">处理解构Excel表格，提高工作效率</div>
            <div class="desc-line"></div>
            <div class="desc-third">解放双手</div>
          </div>
          <div class="container">
            <div class="tabs">
              <div
                v-for="item in focusList"
                :key="item.label"
                :class="focus === item.focus ? 'active' : ''"
                @click="
                  (focus = item.focus),
                    (account = ''),
                    (password = ''),
                    (errorFirst = ''),
                    (errorSecond = '')
                "
              >
                <div class="label">{{ item.label }}</div>
                <div class="line"></div>
              </div>
            </div>
            <div>
              <el-input
                size="large"
                class="el-input"
                placeholder="请输入账号"
                v-model="account"
                :disabled="focus !== 1"
                @focus="errorFirst = ''"
              />
              <div :class="errorFirst ? 'error-show error' : 'error'">
                {{ errorFirst }}
              </div>
            </div>
            <div>
              <el-input
                size="large"
                class="el-input"
                placeholder="请输入账号密码"
                v-model="password"
                type="password"
                :disabled="focus !== 1"
                @focus="errorSecond = ''"
              />
              <div :class="errorSecond ? 'error-show error' : 'error'">
                {{ errorSecond }}
              </div>
            </div>
            <div class="m-t-25">
              <el-button
                type="primary"
                class="el-btn"
                size="large"
                :disabled="!account || !password"
                @click="handleSummit"
                :loading="loading"
              >
                {{ focus === 1 ? "登 录" : "申 请" }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="xcx-login-bottom">
      <div class="data-num">
        <div v-for="item in list" :key="item.label">
          <div class="bottom-num">
            {{ item.label }}
          </div>
        </div>
      </div>
      <div class="bottom-line"></div>
      <div class="bottom-by">©2020-2030 processing-mp by江枫</div>
    </div>
  </div>
</template>

<script>
import "./index.less";
import Logo from "@/assets/img/logo.png";
import { Message } from "element-ui";
import Cookies from "js-cookie";
import { guid, fromAccountGetPassword } from "@/common/utils";
// 正则验证账号，需要包含大小写
const accountRegular = /^(?=.*[A-Z])(?=.*[a-z])[A-Za-z]+$/;
// 正则密码须同时包含英文字母、数字、特殊符号，至少8个字符
const passwordRegular = /^(?![^a-zA-Z]+$)(?!\D+$)(?![a-zA-Z0-9]+$).{8,30}$/;
export default {
  name: "login",
  data: () => ({
    Logo,
    focus: 1,
    account: "",
    password: "",
    errorFirst: "",
    errorSecond: "",
    loading: false,
    list: [
      {
        label: "解析表格",
      },
      {
        label: "转化表格",
      },
      {
        label: "合并表格",
      },
    ],
    focusList: [
      {
        label: "账号登录",
        focus: 1,
      },
      {
        label: "申请账号",
        focus: 2,
      },
    ],
  }),
  mounted() {},
  methods: {
    //  登录或申请账号
    handleSummit() {
      if (
        accountRegular.test(this.account) &&
        passwordRegular.test(this.password)
      ) {
        // 登录
        this.loading = true;
        setTimeout(() => {
          if (this.focus !== 1) {
            Message.success("账号申请成功，请耐心等待管理者同意");
            this.account = "";
            this.password = "";
          } else {
            // 判断是不是属于设置的账号，如果是则放行，不是则报错！
            if (fromAccountGetPassword(this.account) === this.password) {
              // 登录成功，存储cookie，跳转页面
              Cookies.set(
                "code",
                `${guid() || "excel"}_${Date.parse(new Date())}_${
                  this.account
                }`,
                {
                  expires: 30,
                },
              );
              this.$router.push("/");
            } else {
              Message.error("账号或密码不正确");
            }
          }
          this.loading = false;
        }, 1000);
      } else {
        if (!accountRegular.test(this.account))
          this.errorFirst = "账号格式不正确！";
        if (!passwordRegular.test(this.password))
          this.errorSecond =
            "密码须包含英文字母、数字、特殊符号，至少8个字符！";
      }
    },
  },
  watch: {},
  computed: {},
};
</script>
