import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import axios from 'axios'

// 导入全局样式表
import './assets/css/global.css'

// 导入字体图标
import './assets/fonts/iconfont.css'

// 树形表格
import TreeTable from 'vue-table-with-tree-grid'

// 配置 axios
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置拦截器, 请求拦截器, 添加 token 保证拥有获取数据的权限
axios.interceptors.request.use(config => {
  // config 必须返回
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// axios
Vue.prototype.$http = axios

// 树形表格
Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
