import request from '@/utils/request'

const MODEL_BASE_URL = '/curriculum/semester'
const API = {
  NOW:`${MODEL_BASE_URL}/now`,
  PAGE:`${MODEL_BASE_URL}/page`,
  ALL:`${MODEL_BASE_URL}/all`
}
export function addSemester(data){
    return request({
        url: MODEL_BASE_URL,
        method: "POST",
        data
    })
}

export function modifySemester(data) {
    return request({
        url: MODEL_BASE_URL,
        method: 'PUT',
        data
    })
}

/**
 * 此接口极不安全,完全不建议使用
 * @returns {AxiosPromise}
 */
export function getAllSemesters(){
    return request({
        url: API.ALL,
        method: 'GET',
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * @param pageNum
 * @param pageSize
 * @returns 条件分页查询的学期的结果
 */
export function searchSemestersPage(pageNum, pageSize){
    return request({
        url: API.PAGE,
        method: 'GET',
      params:{pageNum,pageSize},
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}
/**
 * 获取学期信息
 * @returns 学期信息
 */
export async function getSemesterNow(){
  return await request({
    url: API.NOW,
    method: 'GET',
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

export function searchSingleSemester(id){
    return request({
        url: `${MODEL_BASE_URL}/${id}`,
        method: 'GET',
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

export function deleteSemester(id){
    return request({
        url: `${MODEL_BASE_URL}/${id}`,
        method: 'DELETE',
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}
