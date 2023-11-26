import request from '@/utils/request'

/**
 * 废弃->请使用user.js下的此方法
 * @param semesterId
 * @returns {AxiosPromise}
 */
export function downloadExcel(semesterId) {
  return request({
    url: '/user/student/rank/download',
    method: 'GET',
    params: {
      semesterId
    },
    responseType: 'blob'
  })
}

