<template>
  <div class="xcx-menu">
    <div class="left">
      <LeftMenu />
    </div>
    <div class="right">
      <div class="content">
        <div class="header">
          <div>
            <el-dropdown trigger="hover">
              <span class="el-dropdown-link">
                {{ account
                }}<i class="el-icon-caret-bottom el-icon--right c999"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <div class="header-dropdown-item">关于</div>
                <div class="header-dropdown-item" @click="loginOut">退出</div>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div class="img">
            <img
              src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
              alt=""
            />
          </div>
          <div class="warning">
            免责声明：本网站不存储用户信息，但不建议处理敏感数据！
          </div>
        </div>
        <div class="container">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { LeftMenu } from "@/components";
import Cookies from "js-cookie";
import "./index.less";
export default {
  name: "myMenu",
  components: {
    LeftMenu,
  },
  data: () => ({
    account: "",
  }),
  mounted() {
    const code = Cookies.get()?.code;
    const account = (code && code.split("_")[2]) || "";
    if (account) this.account = account;
  },
  methods: {
    loginOut() {
      Cookies.remove("code");
      this.$router.push("/login");
    },
  },
  watch: {},
  computed: {},
};
</script>
