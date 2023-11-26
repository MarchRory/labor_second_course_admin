/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */

//有一定安全风险，是否要采用这个用户名存在性检验，后面商讨决定
export function validUsername(str) {
/*   const valid_map = []
  
  return valid_map.indexOf(str.trim()) >= 0 */

  //暂时采用账号不出现特殊字符
  return /[^a-zA-Z0-9]/.test(str)
}
