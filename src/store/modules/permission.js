import { asyncRouterMap, constantRouterMap } from '@/router';
import { getAllPermissions, getKeyName,  addPermission, deletePermission, updatePermission } from '@/api/permissionCtrl'
import { deepDeleteChild, deepInsertChild, deepSearchChild, deepUpdateChild } from '@/api/common'
import { Message } from 'element-ui';
import { faltten } from '@/api/common';
/**
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(v => route.meta.roles.indexOf(v) >= 0)
  } else {
    return true
  }
}

const state = {
  routes: [],
  addRoutes: [],
  permissionsTree: [],
  newRootPermission: [
    { id: 1, type: "info", name: "ALL", key: "*" },
    { id: 2, type: "primary", name: "增加", key: "add" }, 
    { id: 3, type: "danger", name: "删除", key: "del" }, 
    { id: 4, type: "success", name: "查找", key: "get" }, 
    { id: 5, type: "warning", name: "修改", key: "modify" }
  ],
  permissionsFalt: [],
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRouterMap.concat(routes)
  },
  INIT_PERMISSIONS(state, permissions){
    permissions.forEach((item, index) => {
      permissions[index].hasChildren = item.children.length != 0
    })
    state.permissionsTree = permissions
  },
  ADD_PERMISSIONS(state, p){
    p = getKeyName(p)
    if(p.parentId == 0){
      state.permissionsTree.push(p)
    }else{
      state.permissionsTree = deepInsertChild(state.permissionsTree, p, p.parentId)
    }
  },
  DELETE_PERMISSION(state, id){
    state.permissionsTree = deepDeleteChild(state.permissionsTree, id)
  },
  MODIFY_PERMISSION(state, modified){
    state.permissionsTree = deepUpdateChild(state.permissionsTree, modified)
  },
  FALTTN_PERMISSIONS(state){
    const pTree = JSON.parse(JSON.stringify(state.permissionsTree))
    state.permissionsFalt = faltten(pTree)
  }
}

const actions = {
  falttnPermissions({ commit }){
    commit('FALTTN_PERMISSIONS')
  },
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let userRoutes = []
      // 如果有root权限或者全部页面访问权限，那么把权限路由表全部给用户, 否则进行过滤
      if(roles.indexOf('router')>=0){  // 全部访问权
        userRoutes = asyncRouterMap
      }else{
        // 切割页面权限拿到路由name
        userRoutes = asyncRouterMap.filter(route => {
          if (hasPermission(roles, route)) {
            if (route.children && route.children.length > 0) {
              route.children = route.children.filter(childRoute => {
                if (hasPermission(roles, childRoute)) {
                  return childRoute
                }
                return false;
              });
              return route
            } else {
              return route
            }
          }
          return false;  
        }); 
      }
      const accessedRoutes = userRoutes
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },
  // 该函数后续再完善
  deleteP({ commit }, id){
    return new Promise((resolve, reject) => {
        deletePermission(id).then(res => {
          if(res.code == 200){
            commit('DELETE_PERMISSION', id)
            Message({
              message: '权限已成功移除',
              type: 'success',
              duration: 3000
            })
            resolve(true)
          }
        })
    })
  },
  addPermission({ commit }, p){
    console.log(p)
    return new Promise((resolve, reject) => {
      let flag = deepSearchChild(state.permissionsTree, p.parentId, p.permissionName, p.keyName)
      console.log(flag)
      if(flag == true){
        Message({
          message: '该权限已存在',
          type: 'error',
          duration: 3000
        })
        reject(flag)
      }else{
        addPermission(p).then((res) => {
          if(res.code == 200){
            commit('ADD_PERMISSIONS', p)
            Message({
              message: '添加成功',
              type: 'success',
              duration: 3000
            })
            resolve(true)
          }
        })
      }
    })
  },
  modifyPermission({commit}, modified){
    return new Promise((resolve, reject) => {
      updatePermission(modified).then(res => {
        if(res.code == 200){
          modified = getKeyName(modified)
          commit('MODIFY_PERMISSION', modified)
          resolve(true)
        }
      })
    })
  },

  initPermissionList({commit}){
    return new Promise((resolve, reject) => {
        getAllPermissions().then(res => {
          let { data } = res
          data = getKeyName(data)
          if(data.length){ 
            commit('INIT_PERMISSIONS', data)
            commit('FALTTN_PERMISSIONS')
            resolve(state.permissionsFalt) 
          }
          else { reject(false) }
        })
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

