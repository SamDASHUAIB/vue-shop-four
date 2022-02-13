import request from '../utils/request'
/**
 * 获取左侧菜单栏数据
 * @returns Promise
 */
export function getMenuList() {
  return request({
    url: 'menus',
    method: 'get',
  })
}
