const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  semesterId: state => state.semester.id,
  start: state => parseInt(state.semester.start.replaceAll('-','')), // 转换为了数字, 方便比较当前时间所在的阶段
  end: state => parseInt(state.semester.end.replaceAll('-','')),     // 转换为了数字, 方便比较当前时间所在的阶段
  roles: state => state.user.roles,
  userPermissions: state => state.user.userPermissions,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  permission_routes: state => state.permission.routes,// 筛选后的路由
  permissionsTree: state => state.permission.permissionsTree,
  permissionsFalt: state => state.permission.permissionsFalt,
  department: state => state.department.department,
  defaultAvatar: state => state.user.defaultAvatar
}

export default getters
