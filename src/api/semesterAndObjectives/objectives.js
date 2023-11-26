import request from '@/utils/request'

const MODEL_BASE_URL = '/curriculum/objectives'
const API = {
  PAGE: `${MODEL_BASE_URL}/page`,
  ITEM_PAGE: `${MODEL_BASE_URL}/item/page`,
  BIND: `${MODEL_BASE_URL}/bind`,
  BATCH_BIND: `${MODEL_BASE_URL}/batch/bind`,
  BIND_USER: `${MODEL_BASE_URL}/bindUser`,
  BATCH_BIND_TO_STUDENT: `${MODEL_BASE_URL}/bindStudent/batch`,
  BATCH_BIND_TO_USER: `${MODEL_BASE_URL}/bindUser/batch`,
  USER_LIST: `${MODEL_BASE_URL}/userList`,
  UPDATE_TYPE: `${MODEL_BASE_URL}/course`
}
/**
 * 将课程绑定到设定的课程目标上
 * @param {number} courseObjectivesId 课程规划ID
 * @param {number} courseId 课程id
 * @returns
 */
export function bindCourse(courseObjectivesId, courseId) {
  return request({
    url: API.BIND,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: {
      courseObjectivesId, courseId
    }
  })
}

/**
 * 解绑学生和目标
 * @param {Numebr} objectId 课程目标id
 * @param {Number} userId  学生id
 * @param {Number} choice 1 绑定， 0 解绑， 这个接口只用于解绑所以默认为0
 * @returns
 */
export function unBind(objectivesId, userId, choice = 0) {
  return request({
    url: API.BIND_USER,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: {
      objectivesId, userId, choice
    }
  })
}

/**
 * 将课程目标与学生绑定, 该接口用于读取excel表格数据后上传使用，适用于大批量绑定
 * @param {number} objectivesId 课程id
 * @param {Array} batchedArray 被绑定到该课程目标上的学生的数组
 * @param {Number} choice 默认传1批量绑定, 后面再看有没有需求批量解绑, 感觉应该不太会批量解
 * @returns
 */
export function objectivesBindUser(objectivesId, batchedArray, choice = 1) {
  return request({
    // url: `/curriculum/bindUser/batch/${objectivesId}/${choice}`,
    url: `${API.BATCH_BIND_TO_USER}/${objectivesId}/${choice}`,
    method: 'POST',
    data: batchedArray
  })
}
/**
 * 获取"选择"或“未选择"某课程目标的学生的名单
 * @param {number} objectivesId  课程目标id
 * @param {number} pageNum
 * @param {number} pageSize
 * @param {number} type  1表示选择, 2表示未选择
 * @returns
 */
export function getObjStuList(objectivesId, pageNum, pageSize, type) {
  return request({
    url: `${API.USER_LIST}/${objectivesId}`,
    method: 'GET',
    params: { pageNum, pageSize, type },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 给课程目标批量绑定课程id，会覆盖之前已有的绑定
 *
 * @param {number} objectivesId
 * @param {Array} idArray 要绑定到课程目标上的课程id数组
 * @returns
 */
export function batchBind(objectivesId, idArray) {
  return request({
    url: `${API.BATCH_BIND}/${objectivesId}`,
    method: 'POST',
    data: {
      body: idArray
    }
  })
}

/**
 * 添加课程目标
 * @param data
 * @returns {AxiosPromise}
 */
export function addObjectives(data) {
  return request({
    url: MODEL_BASE_URL,
    method: 'POST',
    data
  })
}

/**
 * 更新课程目标
 * @param data
 * @returns {AxiosPromise}
 */
export function modifyObjectives(data) {
  return request({
    url: MODEL_BASE_URL,
    method: 'PATCH',
    data
  })
}

/**
 * 分页查询
 * @param pageNum
 * @param pageSize
 * @param key
 * @param semesterId
 * @returns {AxiosPromise}
 */
export function searchObjectives(pageNum, pageSize, key, semesterId) {
  return request({
    url: API.PAGE,
    method: 'GET',
    params: {
      pageNum, pageSize, key, semesterId
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 *
 * @param {number} objectId  课程目标的id
 * @returns data里包含了目标id、学分要求、学期信息和绑定的课程List
 */
export function searchObjectivesDetail(objectId) {
  return request({
    url: `${MODEL_BASE_URL}/${objectId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 根据课程目标分页查询课程
 * @param objectId
 * @param params
 * @returns {AxiosPromise}
 */
export function getCourseByObject(objectId, params) {
  return request({
    url: `${API.ITEM_PAGE}/${objectId}`,
    method: 'GET',
    params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 删除
 * @param id
 * @returns {AxiosPromise}
 */
export function deleteObjectives(id) {
  return request({
    url: `${MODEL_BASE_URL}/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 更新课程目标选修(必修)状态
 * @param objectivesId
 * @param courseId
 * @param objectivesType 1必修0选修
 * @returns {AxiosPromise<any>}
 */
export function updateType(objectivesId, courseId, objectivesType) {
  return request.post(`${API.UPDATE_TYPE}/${objectivesId}/${courseId}/${objectivesType}`)
}
