import request from '@/utils/request'


const MODEL_BASE_URL = '/user/teacher'
const API = {
  PAGE:`${MODEL_BASE_URL}/page`,
  USER:`${MODEL_BASE_URL}/user`
}
/**
 * 教师分页
 * @param data
 * @returns {*}
 */
export function teacherList(data) {
  return request({
    url: API.PAGE,
    params:data,
    method: 'get'
  })
}

/**
 * 教师详情
 * @param teacherName
 * @returns {*}
 */
export function getTeacher(teacherName) {
  return request({
    url: `${MODEL_BASE_URL}/${teacherName}`,
    method: 'get'
  })
}

/**
 * 教师添加
 * @param teacher
 * @returns {*}
 */
export function addTeacher(data) {
  return request({
    url: MODEL_BASE_URL,
    method: 'post',
    data
  })
}

/**
 * 教师修改
 * @returns {*}
 * @param data
 */
export function updateTeacher(data) {
  return request({
    url: MODEL_BASE_URL,
    method: 'put',
    data
  })
}

/**
 * 教师删除
 * @param id
 * @returns {*}
 */
export function deleteTeacher(id) {
  return request({
    url: `${MODEL_BASE_URL}/${id}`,
    method: 'delete'
  })
}

