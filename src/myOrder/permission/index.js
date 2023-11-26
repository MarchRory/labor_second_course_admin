import store from '@/store/index'
/**
 * 权限指令, 用户拥有传入的权限词时才可以渲染出DOM, 否则不可以渲染
 * @param {*} el  el是该权限绑定的标签
 * @param {*} binding  binding是传入给该权限的值
 */
function checkPermissions(el, binding){
    const { value } = binding

    // 绑定值应当以数组形式传入
    if(value && Array.isArray(value)){
        let isAuth = false
        for(let i=0; i < value.length; i++){
            isAuth = store.getters.userPermissions.some((hasP) => hasP === value[i]) 
                     || store.getters.roles.some((hasP) => hasP === value[i])
            if(isAuth){
                break;
            }
        }
        if(!isAuth){
            el.parentNode && el.parentNode.removeChild(el);
        }
    }else {
        throw new Error('该指令需要接收一个字符串数组')
    }
}

export default{
    inserted(el, binding) {
        checkPermissions(el, binding)
    },

    update(el, binding){
        checkPermissions(el, binding)
    }
}