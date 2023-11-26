import request from '@/utils/request'

const MODEL_BASE_URL = 'user'
const API = {
  LOGIN: `${MODEL_BASE_URL}/login`,
  INFO: `${MODEL_BASE_URL}/info`,
  LOGOUT: `${MODEL_BASE_URL}/logout`,
  PAGE: `${MODEL_BASE_URL}/page`,
  BIND: `${MODEL_BASE_URL}/bind`,
  UNBIND: `${MODEL_BASE_URL}/unbind`
}
export function login(data) {
  return request({
    url: API.LOGIN,
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: API.INFO,
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: API.LOGOUT,
    method: 'get'
  })
}

export function userPageApi({ pageNum, pageSize, key, type, withRole }) {
  if (!key) {
    key = null
  }
  return request({
    url: API.PAGE,
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: {
      pageNum, pageSize, key, type, withRole
    }
  })
}

export function addUser(data) {
  return request({
    url: MODEL_BASE_URL,
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: MODEL_BASE_URL,
    method: 'put',
    data
  })
}

export function deleteUser(userId) {
  return request({
    url: `/${MODEL_BASE_URL}/${userId}`,
    method: 'delete'
  })
}
export function userList({ pageNum, pageSize, key, type }) {
  return request({
    url: API.PAGE,
    method: 'get',
    params: {
      pageNum, pageSize, key, type
    }
  })
}
export const bindRoleApi = (userId, roleId) => request.post(`${API.BIND}/${userId}/${roleId}`)

export const unbindRoleApi = (userId, roleId) => request.delete(`${API.UNBIND}/${userId}/${roleId}`)

/**
 * 重置密码(后台)
 * @param {string} uid
 * @param {string} password
 * @returns
 */
export function resetPassword(uid, password) {
  return request.post(`/user/resetPassword`, null, { params: { uid, password }})
}
