import { login,logout,getInfo } from '@/api/user'
import { getToken,setToken,removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'


const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    userPermissions: [],
    defaultAvatar: 'https://guli-fate.oss-cn-chengdu.aliyuncs.com/2023/08/15/3f176dd8-1d87-4707-9033-e557ef824430.png'
  }
}

const state = getDefaultState()

const mutations = {
  //重置state
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  //存储token
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  //存储用户信息
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_USERPERMISSIONS: (state, userPermissions) => {
    state.userPermissions = userPermissions
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const {
      username,
      password
    } = userInfo
    return new Promise((resolve, reject) => {
      login({
        username: username.trim(),
        password: password
      }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data)
        setToken(data)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({
    commit,
    state
  }) {
    return new Promise((resolve, reject) => {
      // state.token之前没有传 出现了重复登陆问题
      getInfo(state.token).then(response => {
        const { data } = response
        if (!data) {
          return reject('验证失败,请重新登录')
        }
        const { permissions, userInfo } = data
        if (!permissions || permissions.length <= 0) {
          reject('getInfo:roles must be a non-null array!')
        }
        commit('SET_NAME', userInfo.nickname)
        // 获取按钮级操作权限
        let auths = JSON.parse(JSON.stringify(permissions))
        auths = auths.filter(item => !item.includes('router'))

        // 获取角色, 生成路由访问权限
        const roles = permissions.filter((item) => item.includes('router'))
        roles.forEach((p, index, self) => {
          if(p != 'router'){
            self[index] = p.split('router.')[1]
          }
        })

        const USER_PERMISSIONS = auths
        commit('SET_USERPERMISSIONS', USER_PERMISSIONS)
        commit('SET_ROLES', JSON.parse(JSON.stringify(roles)))
        commit('SET_AVATAR', userInfo.avatar)
        // 抛出路由访问权限, 用于路由表过滤
        resolve(roles)
      }).catch(error => {
        console.log(error)
        reject(error)
      })
    })
  },

  // user logout
  logout({
    commit,
    state
  }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken()
        resetRouter()
        commit('RESET_STATE')
        commit('SET_ROLES', [])
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({
    commit
  }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      commit('SET_ROLES',[])
      resolve()
    })
  }
}

export default {
  // 加上这个会有报错,不加的话user/login这种方式用不了
  namespaced: true,
  state,
  mutations,
  actions
}
