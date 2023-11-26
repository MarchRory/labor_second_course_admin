import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import router from '@/router'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['swpu_token'] = getToken()
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code && res.code !== 200) {
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        MessageBox.confirm('您已注销, 您可以选择继续留在此页面, 或者重新登录', '退出登录', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      } else if (res.code == 100) {
        this.$message.error('此次登录已过期, 请重新登录')
        router.push({ path: '/login?redirect=/login' })
      } else if (res.code == 403) {
        Message({
          type: 'warning',
          message: '没有操作权限',
          duration: 2 * 1000
        })
      } else if (res.code == 250 && response.request.responseURL == (process.env.VUE_APP_BASE_API + '/user/student/excel')) {
        return res
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    Message({
      message: error.message,
      type: 'Error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
