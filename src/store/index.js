import Vue from 'vue'
import Vuex from 'vuex'
import global from './modules/global'
import { createLogger } from 'vuex'
Vue.use(Vuex)
export default new Vuex.Store({
    modules: {
        global
    },
    plugins: process && process.env && process.env.NODE_ENV === 'development' ? [createLogger()] : [],
})
