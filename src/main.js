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
// 导入富文本编辑器以及样式
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor /* { default global options } */)

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

// 全局的时间过滤器
Vue.filter('dataFormat', function(originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
