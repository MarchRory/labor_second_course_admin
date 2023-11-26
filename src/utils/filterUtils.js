/**
 * 用于配置角色权限，根据接口要求，需要过滤掉el-tree返回的父级节点
 * 可以直接利用它的props让父子不严格关联，但是我不太想要那种情况下的表现效果
 * @param gottenNodes el-tree返回的被选择的节点数组， 这个数组是一维的
 * @param checkedId el-tree 返回的被选择的初始的id数组，这里面可能存在父子id都在的情况
 * @param dataArr 一个一维数组, 被扁平化处理之后的完整树状数据
 * @return 从nodes中提取出的parentId对象数组，每个parent对象含有: 父权限id和其children的id数组
 */
export function filterParentId(gottenNodes, checkedId, dataArr){
  let pId =[]
  
  // 1、获取nodes中的所有的parentId和其children的id数组，加入集合
  let nodeKids = []
  for(let i = 0; i < gottenNodes.length; i++){
    if(gottenNodes[i].children && gottenNodes[i].children.length > 0){
      nodeKids = dataArr.find((p) => p.id == gottenNodes[i].id).children.map((child) => { return child.id })
      pId.push({
	  	id: gottenNodes[i].id,
	  	children: nodeKids
	  })
    }

    nodeKids = []
  }
  // 借助Set去重并深拷贝
  pId = [...new Set( pId.map(p => JSON.stringify(p)) )].map(ever => JSON.parse(ever))
  // 3、遍历pId和初始权限数组，开始过滤
  return checkAndFilter(pId, checkedId)
}

/**
 * 过滤权限id
 * @param pId 处理得到的父亲权限信息
 * @param checkedId el-tree返回的源数组
 * @return 过滤结果
 */
function checkAndFilter(pId, checkedId){
  let cnt = 0, temp = []
  //需要深拷贝
  let copy = JSON.parse(JSON.stringify(checkedId))
  
  for(let i = 0; i < pId.length; i++){
    if(!pId[i].children.length){
      continue
    }

    copy.forEach((item) => {
      if(pId[i].children.includes(item)){
        cnt++
        temp.push(item)
      }
    })
    if(!cnt){ 
      continue
    }else if(cnt < pId[i].children.length){
      checkedId.splice(checkedId.indexOf(pId[i].id), 1)
    }else{
      temp.forEach((t) => {
        checkedId.splice(checkedId.indexOf(t), 1)
      })
    }

    // 已经遍历过的数据移出数组
    cnt = 0
    if(temp != []){
      temp.forEach((t) => {
        copy.splice(copy.indexOf(t), 1)
      })
      temp = []
    }
  }
  return checkedId
}