import rq from '@/api/department/department'
const state = {
    department: []
}

const mutations = {
    SET_DEPARTMENT(state, department){
        state.department = department
    }
}

const actions = {
    init({commit}){
        return new Promise((resolve) => {
            rq.getDepartmentList(null, 1, 100)
            .then((res) => {
                if(res.code == 200){
                    const { list } = res.data
                    let index = list.findIndex(item => item.id == 1)
                    list.splice(index, 1)
                    commit('SET_DEPARTMENT', list)
                    resolve(list)
                }    
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