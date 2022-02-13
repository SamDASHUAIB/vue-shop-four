import request from '../utils/request'
/**
 * 获取用户列表数据
 * @param {Object} params 请求体参数
 * @returns Promise
 */
export function getUserList(params) {
  return request({
    url: 'users',
    method: 'get',
    params,
  })
}
/**
 * 修改用户状态
 * @param {Object} userInfo 用户信息
 * @returns Promise
 */
export function setStateChange(userInfo) {
  return request({
    url: `users/${userInfo.id}/state/${userInfo.mg_state}`,
    method: 'put',
  })
}
/**
 * 添加用户。
 * @param {Object} data 用户信息
 * @returns Promise
 * children
 * authName
 */
export function addUser(data) {
  return request({
    url: `/users`,
    method: 'post',
    data,
  })
}
