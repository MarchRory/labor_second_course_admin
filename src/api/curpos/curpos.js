import request from '@/utils/request'

/**
 * 模块根url
 * @type {string}
 */
const MODEL_BASE_URL = '/curriculum/template'
/**
 * API_url
 * @type {{UPLOAD: string, PAGE: string}}
 */
const API = {
  UPLOAD: `${MODEL_BASE_URL}/upload`,
  PAGE: `${MODEL_BASE_URL}/page`
}

/**
 * 分页查询
 * @param pageNum 页号数
 * @param pageSize 页数据量
 * @param level 评分
 * @returns {*}
 */
export function getTemplate(params) {
  return request({
    url: API.PAGE,
    method: 'GET',
    heaeders: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params
  })
}

/**
 * 移除模板
 * @param id
 * @returns {*}
 */
export function deleteTemplate(id) {
  return request({
    url: `${MODEL_BASE_URL}/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 更新模板
 * @param data
 * @returns {*}
 */
export function modifyTemplate(data) {
  return request({
    url: MODEL_BASE_URL,
    method: 'PUT',
    data
  })
}

/**
 * 添加模板
 * @param data
 * @returns {*}
 */
export function addTemplate(data) {
  return request({
    url: MODEL_BASE_URL,
    method: 'POST',
    data: data
  })
}

/**
 * 导入模板Excel表格
 * @param {File} file
 * @returns
 */
export async function uploadTemplate(file) {
  const fd = new FormData()
  fd.append('file', file)
  return await request({
    url: API.UPLOAD,
    method: 'POST',
    data: fd,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 根据id查询模板内容
 * @param {*} id 模板id
 * @returns
 */
export async function selectTemplateByIdAPI(id) {
  return await request({
    url: `${MODEL_BASE_URL}/${id}`,
    method: 'GET'
  })
}
