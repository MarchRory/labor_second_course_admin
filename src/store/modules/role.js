import { getRoles, addRole, updateRole, deleteRole } from "@/api/role";
import { Message } from "element-ui";

const state = {
  roleList: [],
};

const actions = {
  initRoleList({ commit }) {
    return new Promise((resolve, reject) => {
      getRoles().then((res) => {
        if (res.code == 200) {
          const { data } = res;
          commit("INIT_ROLES", data);
          resolve(true);
        } else {
          reject(false);
          Message({
            type: "error",
            message: "获取角色列表失败",
            duration: 3000,
          });
        }
      });
    });
  },
  addRole({ commit }, newRole) {
    return new Promise((resolve, reject) => {
      let flag = state.roleList.find((role) => {
        role.roleName == newRole.roleName && role.roleKey == newRole.roleKey;
      });
      if (flag === undefined) {
        addRole(newRole).then((res) => {
          if (res.code == 200) {
            commit("ADD_ROLE", newRole);
            /*                         Message({
                            type: "success",
                            message: "角色添加成功",
                            duration: 3000
                        }) */
            resolve(true);
          } else {
            /*                         Message({
                            type: "error",
                            message: "添加失败",
                            duration: 3000
                        }) */
            reject(false);
          }
        });
      } else {
        Message({
          type: "error",
          message: "角色名重复",
          duration: 3000,
        });
      }
    });
  },
  delRole({ commit }, id) {
    return new Promise((resolve, reject) => {
      deleteRole(id).then((res) => {
        if (res.code == 200) {
          commit("DEL_ROLE", id);
          Message({
            message: "用户已成功移除",
            type: "success",
            duration: 3000,
          });
          resolve(true);
        } else {
          reject(false);
        }
      });
    });
  },
  modifyRole({ commit }, data) {
    return new Promise((resolve, reject) => {
      updateRole(data).then((res) => {
        if (res.code == 200) {
          commit("MODIFY_ROLE", data);
          resolve(true);
        } else {
          reject(false);
        }
      });
    });
  },
};

const mutations = {
  INIT_ROLES(state, data) {
    state.roleList = data;
  },
  ADD_ROLE(state, data) {
    state.roleList.push(data);
  },
  DEL_ROLE(state, id) {
    let goal = state.roleList.findIndex((role) => {
      role.id == id;
    });
    state.roleList.splice(goal, 1);
  },
  MODIFY_ROLE(state, data) {
    let goal = state.roleList.findIndex((role) => {
      role.id = data.id;
    });
    state.roleList[goal] = data;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
