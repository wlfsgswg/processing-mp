import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import VueRouter from 'vue-router'
import { router } from "./routes/routes";
import "./less/index.less";
// 有关elementUi组件
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import AnimateNumber from "vue-animate-number";
import VueClipboard from 'vue-clipboard2'
import API from './common/api'
Vue.use(ElementUI);
Vue.use(AnimateNumber);
Vue.use(VueClipboard);
Vue.config.productionTip = false;
Vue.prototype.$API = API // 全局请求方法
// 解决编程式路由往同一地址跳转时会报错的情况
const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace

// push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)

    return originalPush.call(this, location).catch(err => err)
}

// replace
VueRouter.prototype.replace = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject)

    return originalReplace.call(this, location).catch(err => err)
}

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");