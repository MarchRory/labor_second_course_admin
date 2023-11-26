// 深度克隆DOM树
export function deepCloneElement(originDOM){
    const copyNode = originDOM.cloneNode(true)
/*     console.log(copyNode)
    let container = document.createElement('div')
    for (let i = 0; i < copyNode.length; i++) {
        container.appendChild(copyNode[i]);
    } */
    return copyNode.innerHTML
}