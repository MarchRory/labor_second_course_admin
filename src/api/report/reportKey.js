import request from '@/utils/request'

/**
 * 分页查询
 * @param {object} params
 * @param {string} params.page
 * @param {string} params.pageSize
 * @param {string|number} params.batchId
 * @returns
 */
export function reportKeyPage(params) {
  return request.get(`/curriculum/report_key`, { params })
}
/**
 * 更新
 * @param {object} reportKeyword ReportKeyword

 * @param {number} reportKeyword.id
 * @param {string} reportKeyword.unscramble
 * @param {number} reportKeyword.state
 * @returns
 */
export function updateReportKey(reportKeyword) {
  return request.put(`/curriculum/report_key`, reportKeyword)
}
