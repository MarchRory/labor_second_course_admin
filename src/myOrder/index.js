import permission from "./permission/index";  // 权限验证
import debounce from "./debounce";            // 防抖


const myDirectives = {
    permission,
    debounce
}

export default {
    install(Vue){
        Object.keys(myDirectives).forEach(key => {
            Vue.directive(key, myDirectives[key])
        })
    }
}
