<template>
  <div class="xcx-components-leftmenu">
    <div class="img">
      <img :src="Logo" alt="" />
    </div>
    <el-menu
      background-color="#fff"
      mode="vertical"
      :unique-opened="false"
      :default-active="focus"
      :default-openeds="openKeys"
      :router="true"
      class="menu"
      @select="handleChangeItem"
    >
      <template v-for="item in listMenu">
        <template v-if="!item.children">
          <el-menu-item :index="item.key" :key="item.key">
            <template slot="title">
              <i :class="item.icon"></i>
              <span>{{ item.title }}</span>
            </template>
          </el-menu-item>
        </template>
        <template v-else>
          <el-submenu :index="item.key" :key="item.key">
            <template slot="title">
              <i :class="item.icon"></i> <span>{{ item.title }}</span></template
            >
            <el-menu-item
              v-for="it in item.children"
              :index="it.key"
              :key="it.key"
            >
              {{ it.title }}</el-menu-item
            >
          </el-submenu>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script>
import { listMenu } from "./tyle";
import Logo from "./../../assets/img/big_logo.png";

import "./index.less";
export default {
  name: "left-menu",
  data: () => ({
    Logo,
    listMenu: [...listMenu],
    // focus: "/home",
    focus: "/data/import",
    openKeys: [],
  }),
  mounted() {
    const path = this.$route.path;
    this.focus = path;
    listMenu.map((it) => {
      if (`${it.key}` === path) this.focus = it.key;
      this.openKeys.push(it.key);
    });
    this.$router.beforeEach((to, from, next) => {
      this.focus = to.path;
      next();
    });
  },
  methods: {
    handleChangeItem(e) {
      this.$router.push(e);
    },
  },
};
</script>
