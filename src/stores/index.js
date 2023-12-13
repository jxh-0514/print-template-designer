/*
 * @Descripttion:
 * @version:
 * @Author: 杭
 * @Date: 2023-12-13 14:01:42
 * @LastEditors: 杭
 * @LastEditTime: 2023-12-13 15:32:15
 */
/* eslint-disable */
import Vue from 'vue'
import Vuex from 'vuex'

import printTemplateModule from './modules/index.js'

Vue.use(Vuex)
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  strict: debug,
  modules: {
    printTemplateModule
  }
})
