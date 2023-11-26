import request from '@/utils/request'

const MODEL_BASE_URL = '/curriculum/signUp'
const API = {
  PASS:`${MODEL_BASE_URL}/pass`,
  NOT_REVIEWED:`${MODEL_BASE_URL}/notReviewed`,
  CODE:`${MODEL_BASE_URL}/attendance/code`,
  EVALUATE:`${MODEL_BASE_URL}/evaluate`,
}
/**
 * 批量审核
 * @param {*} courseId 
 * @param {*} data 
 * @param {*} choice 
 * @returns 
 */
export async function examinePass(courseId, data, choice){
    return await request({
        url: API.PASS + '/'+courseId + '/' + choice,    // 这里有个问题，如果使用模板字符串拼接，会无法通过预检，baseURL拼不上
        method: 'POST',
        data,
    })
}

/**
 * 获取待审核课程的列表
 * @returns 
 */
export async function getExamineList(){
    return await request({
        url: API.NOT_REVIEWED,
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * 考评
 * @param {*} data 
 * @returns 
 */
export async function evaluate(data) {
  return await request({
    url: API.EVALUATE,
    method: 'POST',
    data,
  })
}

/**
 * 签到码
 * @param {*} couseId
 * @param {*} code
 * @param {*} time
 * @param {*} force 0不强制覆盖, 获取上次码的信息; 1强制覆盖上次的码
 * @returns res force=1才会重新生成,force=0,会拿到当前的签到码和过期时间,如果不存在,会返回time=-2
 */
export function sendSignCode(couseId, code, time=60*30, force = 0){
  return request({
    url: `${API.CODE}/${couseId}/${code}/${time}/${force}`,
    method: 'POST'
  })
}
