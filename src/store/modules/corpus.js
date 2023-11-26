const state = {
    total: null,
}

const mutations = {
    SET_TOTAL(state, num){
        state.total = num
    }
}

export default {
    namespaced: true,
    state,
    mutations
}