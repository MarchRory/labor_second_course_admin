/**
 * 防抖指令, 该指令是简单实现, 默认600毫秒按钮禁用防止频繁操作
 * @param {*} el 
 * @param {*} binding 
 */

function debounce(el, binding){
    el.addEventListener('click', (e) => {
        if(!el.disabled){
            el.disabled = true
            setTimeout(() => {
                el.disabled = false
             }, binding.value || 6 * 100)
        }
     })
}

export default{
    inserted(el, binding){
        debounce(el, binding)
    }
}