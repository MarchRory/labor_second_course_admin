import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import permission from './modules/permission'
import role from './modules/role'
import lessons from './modules/lessons'
import curpos from './modules/corpus'
import semester from './modules/semester'
import department from './modules/department'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    permission,
    role,
    lessons,
    curpos,
    semester,
    department
  },
  getters
})

export default store
