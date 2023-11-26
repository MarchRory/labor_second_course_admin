
/**
 * 错误常量
 *
 */
export const ResultEnum = {
  SUCCESS: { message: '成功', code: 200 },
  AUTH: { message: '权限不足', code: 403 },
  FAIL: { message: '请求失败', code: 250 },
  EXPORT_FAILED: { message: '导出失败', code: 300 },
  SIGN_IN_TIMEOUT: { message: '签到超时', code: 150 },
  USER_NOT_FOUND: { message: '用户不存在', code: 280 },
  PASSWORD_ERROR: { message: '密码错误', code: 555 },
  AUTHENTICATION_FAILED: { message: '身份验证失败', code: 1020 },
  DATA_NOT_EXIST: { message: '当前查询的数据不存在,请稍后再试', code: 10010 },
  PARAMETER_WARNING: { message: '存在异常参数,后台已经过滤', code: 1010 },
  RUNTIME_EXCEPTION: { message: '系统异常', code: 250 },
  YIBAN_HAS_BIND: { message: '易班账号已经被绑定', code: 23 },
  YIBAN_ERROR: { message: '易班账号异常', code: 24 },
  DATA_DUPLICATION: { message: '数据在系统中重复', code: 25 },
  NOT_REMOVABLE: { message: '不可删除的数据', code: 24 }
}
