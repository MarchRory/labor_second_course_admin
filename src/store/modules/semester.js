import { getSemesterNow } from "@/api/semesterAndObjectives/semester"

const state = {
    id: null,
    semesterName: null,
    start: null,
    end: null
}

const actions = {
    getSemesterInfo({ commit }){
        return new Promise((resolve, reject) => {
                getSemesterNow()
                .then(res => {
                    if(res.code == 200){
                        const { data } = res
                        commit('SET_SEMESTER', data)
                        resolve()
                    }else{
                        throw new Error('服务器异常, 获取学期信息失败')
                    }
            })
         })
    },


}

const mutations = {
    SET_SEMESTER(state, data){
        state.id = data.id
        state.semesterName = data.semesterName
        state.start = data.start
        state.end = data.end
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
  }
