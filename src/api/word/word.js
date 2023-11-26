import request from '@/utils/request'
const MODEL_BASE_URL = '/curriculum/word'
const API = {
  UPLOAD: `${MODEL_BASE_URL}/upload`,
  PAGE: `${MODEL_BASE_URL}/page`,
  DOWNLOAD: `${MODEL_BASE_URL}/download`,
  WORD_CLOUD: `${MODEL_BASE_URL}/cloud`
}
/**
 * 新增
 * @param {object} word Word
 * @param {string} word.word
 * @param {number} word.level
 * @param {number} word.typeId
 * @param {number} word.partOfSpeech 可用值:未知,名词,动词,形容词,副词
 * @returns
 */
export function saveWord(word) {
  return request.post(MODEL_BASE_URL, word)
}
/**
 * 更新
 * @param {object} word Word
 * @param {string} word.word
 * @param {number} word.level
 * @param {number} word.typeId
 * @param {number} word.partOfSpeech 可用值:未知,名词,动词,形容词,副词
 * @returns
 */
export function updateWord(word) {
  return request.put(MODEL_BASE_URL, word)
}
/**
 * 词汇导入
 * @param {Blob} file
 * @returns
 */
export function uploadWord(file) {
  const fd = new FormData()
  fd.append('file', file)
  return request({
    url: API.UPLOAD,
    method: 'POST',
    data: fd,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
/**
 * id查询
 * @param {string} id 主键
 * @returns
 */
export function getWord(id) {
  return request.get(`${MODEL_BASE_URL}/${id}`)
}
/**
 * 词汇分页查询
 * @param {string}  params.page
 * @param {string}  params.pageSize
 * @param {string?}  params.level
 * @param {string?}  params.typeId
 * @param {string?}  params.partOfSpeech 表示词性(名词动词介词)参考:1名词,2动词,3形容词,4副词
 * @param {string?}  params.withDate 是否带上一些公共字段
 * @param {string?}  params.key
 * @returns
 */
export async function wordPage(params) {
  return await request({
    url: API.PAGE,
    method: 'GET',
    params
  })
}
/**
 * 删除
 * @param {string} id 主键
 * @returns
 */
export function deleteWord(id) {
  return request.delete(`${MODEL_BASE_URL}/${id}`)
}
/**
 * 导入模板获取
 * @returns
 */
export function downloadUploadTemplate() {
  return request({
    url: API.DOWNLOAD,
    method: 'GET',
    responseType: 'blob'
  })
}
/**
 * 词云
 * @param {number} limit 条数
 */
export function wordCloud(limit) {
  return request.get(`${API.WORD_CLOUD}`, { params: { limit }})
}
