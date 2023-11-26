import request from '@/utils/request'


const API = {
  BASE:'/curriculum/selfEvaluation'
}

export function getEvaluation(courseId,userId){
  return request({
    url: `${API.BASE}/${userId}/${courseId}`,
    method:'get'
  })
}
export function pageCourseEvaluate(data){
  return request({
    url: `${API.BASE}/`,
    method:'get',
    params:data,
  });
}
