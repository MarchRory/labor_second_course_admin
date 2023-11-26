import request from '@/utils/request'

const MODEL_BASE_URL = '/user/student'
const API = {
  PAGE: `${MODEL_BASE_URL}/page`,
  UPLOAD: `${MODEL_BASE_URL}/excel`,
  DOWNLOAD: `${MODEL_BASE_URL}/rank/download`
}
/**
 * 分页查询学生
 * @param {*} param0
 * @returns
 */
export function studentList({ key, pageNum, pageSize, departmentId }) {
  return request({
    url: API.PAGE,
    method: 'get',
    params: {
      key, pageNum, pageSize, departmentId
    }
  })
}

/**
 * 学生详情
 * @param studentName
 * @returns {*}
 */
export function getStudent(studentName) {
  return request({
    url: `${MODEL_BASE_URL}/${studentName}`,
    method: 'get'
  })
}

/**
 * 学生添加
 * @param student
 * @returns {*}
 */
export function addStudent(data) {
  return request({
    url: MODEL_BASE_URL,
    method: 'post',
    data
  })
}

/**
 * 学生修改
 * @param student
 * @returns {*}
 */
export function updateStudent(data) {
  return request({
    url: MODEL_BASE_URL,
    method: 'put',
    data
  })
}

/**
 * 学生删除
 * @param id
 * @returns {*}
 */
export function deleteStudent(id) {
  return request({
    url: `${MODEL_BASE_URL}/${id}`,
    method: 'delete'
  })
}

/**
 * 导入学生Excel表格
 * @param {File} file
 * @returns
 */
export async function uploadStu(file) {
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
export function downloadExcel(semesterId) {
  return request({
    url: API.DOWNLOAD,
    method: 'GET',
    params: {
      semesterId
    },
    headers: {
      'Content-Type': "application/x-www-form-urlencoded"
    },
    responseType: 'blob'
  })
}
