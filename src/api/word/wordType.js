import request from '@/utils/request'

const MODEL_BASE_URL = '/curriculum/wordType'
const API = {
  PAGE: `${MODEL_BASE_URL}/page`
}
/**
 * 分页查询
 * @param {string} params.page
 * @param {string} params.pageSize
 * @param {string?} params.key
 * @param {Boolean?} params.withDate
 * @returns
 */
export function wordTypePage(params) {
  return request({
    url: API.PAGE,
    params
  })
}
/**
 * 新增
 * @param {object} wordType WordType
 * @param {string} wordType.type
 * @returns
 */
export function saveWordType(wordType) {
  return request.post(MODEL_BASE_URL, wordType)
}
/**
 * 更新
 * @param {object} wordType WordType
 * @param {string} wordType.type
 * @returns
 */
export function updateWordType(wordType) {
  return request.put(`${MODEL_BASE_URL}`, wordType)
}
/**
 * id查询
 * @param {string} id 主键
 * @returns
 */
export function getWordType(id) {
  return request.get(`${MODEL_BASE_URL}/${id}`)
}
/**
 * 删除
 * @param {string | number} id 主键
 * @returns
 */
export function deleteWordType(id) {
  return request.delete(`${MODEL_BASE_URL}/${id}`)
}
