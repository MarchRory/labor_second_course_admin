import request from '@/utils/request'
const CURRICULUM_STATISTICS = '/curriculum/statistics'
const API={
  DAILY_COURSE:`${CURRICULUM_STATISTICS}/dailyCourse`,
  CLASSIFICATION:`${CURRICULUM_STATISTICS}/course/classification`,
  TOTAL:`${CURRICULUM_STATISTICS}/total`,
  DAILY_COURSE_USER_COUNT:`${CURRICULUM_STATISTICS}/dailyCourseUserCount`,
  STUDENT_RANK:`/user/student/rank`,
  COURSE_SCORE:`${CURRICULUM_STATISTICS}/course/score`,
  GRADE_CREDIT:`${CURRICULUM_STATISTICS}/grade/credit/statistics`
}

/**
 * 统计课程数量
 * @param {string} start 统计起始时间， 格式必须为: yyyy、mm、dd，如果为多个连接，则必须用-连接
 * @param {string} end 同start
 * @param {number} semesterId 学期id, 从vuex的charts模块去拿, 学期id和start、end二选一且必传
 * @param {string} dateFormat 返回的日期格式，格式必须为: yyyy、mm、dd，如果为多个连接，则必须用-连接
 * @returns echarts柱状图或折线图需要的dataX和dataY
 */
export function getChartDailyCourse(start, end, semesterId, dateFormat){
    return request({
        url: API.DAILY_COURSE,
        method: 'GET',
      params:{start,end,semesterId,dateFormat},
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}


/**
 *
 * @returns 课程分类饼状图数据
 */
export function getChartCourseCategory(){
    return request({
        url: API.CLASSIFICATION,
        method: 'GET',
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}


/**
 * 系统展示数据汇总接口
 * @returns courseUserCount:当前学期学生参加活动人次;courseCount:当前学期课程总数; adminCount:管理员数量; studentCount:学生数量;
 */
export function getTotalData(){
    return request({
        url: API.TOTAL,
        method: 'GET',
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

export function getUserCountChart(start, end, semesterId, dateFormat){
    return request({
        url: API.DAILY_COURSE_USER_COUNT,
        method: 'GET',
        params:{start,end,semesterId,dateFormat},
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * 按照时间或者学期id获取学生积分排行榜
 * @param {*} start
 * @param {*} end
 * @param {*} semesterId
 * @returns
 */
export function getRankChart(start=null, end=null,semesterId){
    return request({
        url: API.STUDENT_RANK,
        method: 'GET',
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        params:{
            start, end, semesterId
        }

    })
}
/**
 * 单个课程数据汇总
 * @path {string|number} courseId
 * @path {number} type
 * @param {number} params interval 分段区间长度 
 * @returns
 */
export function statisticalScore(courseId, type, params) {
  return request.get(`${API.COURSE_SCORE}/${courseId}/${type}`, { params });
}

/**
 * 年级学分统计
 * @returns
 */
export function gradeCreditStatistics() {
    return request.get(API.GRADE_CREDIT);
  }
