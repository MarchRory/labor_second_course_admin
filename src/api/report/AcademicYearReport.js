import request from '@/utils/request'

const MODEL_BASE_URL = '/curriculum/academic_year_report'
const API = {
  BATCH_PAGE: `${MODEL_BASE_URL}/batch`,
  DETAIL: `${MODEL_BASE_URL}/detail`
}

/**
 * 详情
 * @param {string} id
 * @returns
 */
export function getReportBatchDetail(id) {
  return request.get(`${API.DETAIL}/${id}`)
}
/**
 * 新增报告批次
 * @param {object} reportBatch ReportBatch
 * @param {string} reportBatch.reportBatchName
 * @param {string} reportBatch.start
 * @param {string} reportBatch.end
 * @returns
 */
export function createReportBatch(reportBatch) {
  return request.post(`${MODEL_BASE_URL}`, reportBatch)
}
/**
 * 更新报告批次
 * 时间区间不可更新
 * @param {object} reportBatch ReportBatch
 * @param {string | number} reportBatch.id
 * @param {string} reportBatch.reportBatchName
 * @returns
 */
export function updateReportBatch(reportBatch) {
  return request.put(`${MODEL_BASE_URL}`, reportBatch)
}
/**
 * id查询报告批次
 * @param {string | number} id 主键
 * @returns
 */
export function getReportBatch(id) {
  return request.get(`${MODEL_BASE_URL}/${id}`)
}

/**
 * 删除报告批次
 * @param {string} id 主键
 * @returns
 */
export function deleteReportBatch(id) {
  return request.delete(`${MODEL_BASE_URL}/${id}`)
}
/**
 * 报告批次分页查询
 * @param {object} params
 * @param {string} params.page
 * @param {string} params.pageSize
 * @param {number} params.state
 * @param {number} params.visibility
 * @param {string} params.key
 * @returns
 */
export function batchPage(params) {
  return request({
    url: API.BATCH_PAGE,
    method: 'get',
    params
  })
}
