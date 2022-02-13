import axios from 'axios'
import { Message } from 'element-ui'

const service = axios.create({
  baseURL: 'http://127.0.0.1:8888/api/private/v1/',
  timeout: 5000,
})

service.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
/*
  响应拦截器
  处理返回的数据异常
  解构，axios 多余的一层 data
*/
service.interceptors.response.use(response => {
  // 解构 data(我们需要的数据)
  // 注意 axios 默认添加的一层 data
  const {
    data: res,
    meta: { msg, status },
  } = response.data
  if (status !== 200 && status !== 201) {
    Message.error(msg) // 提示错误信息，提示错误信息
    return Promise.reject(new Error(msg))
  }
  // 成功, 返回请求的数据
  return res
})
export default service
