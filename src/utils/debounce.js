// 防抖函数
export function debunce(fn, delay=500){
    let timer
    if(timer){
        clearTimeout(timer)
    }
    timer = setTimeout(fn, delay)
}

// 节流函数
export function throttle(fn, delay=500) {
    let timerId
    if(timerId){
        return;
    }
    timerId = setTimeout(() => {
        fn()
        timerId = null
    }, delay)
}