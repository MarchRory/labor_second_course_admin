import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * 没有权限要求的基本页面
 * 所有角色都可以访问
 */
// 所有权限通用路由表
// 如首页和登录页和一些不用权限的公用页面
export const constantRouterMap = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  }
]
// 异步挂载的路由
// 动态需要根据权限加载的路由表
// 路由权限词配置在roles中
export const asyncRouterMap = [
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/role',
    alwaysShow: true,
    name: 'Permission',
    meta: {
      title: '权限控制',
      icon: 'lock',
      breadNum: 1,
      roles: ['userRoleCtrl', 'permissionsTree', 'permissionRoleCtrl']
    },
    children: [
      {
        path: '/user',
        component: () => import('@/views/permission/userRole/index.vue'),
        name: 'RolePermission',
        meta: {
          title: '用户权限',
          roles: ['userRoleCtrl'],
          breadNum: 2,
          icon: 'user'
        }
      },
      {
        path: '/permissionTree',
        name: 'permissionTree',
        component: () => import('@/views/permission/tree/permissionTree'),
        meta: {
          title: '系统权限树',
          breadNum: 2,
          roles: ['permissionsTree'],
          icon: 'password'
        }
      },
      {
        path: '/role',
        name: '/role',
        component: () => import('@/views/permission/role/role'),
        meta: {
          title: '权限角色',
          breadNum: 2,
          roles: ['permissionRoleCtrl'],
          icon: 'peoples'
        }
      }
    ]
  },
  {
    path: '/userControl',
    name: 'userControl',
    component: Layout,
    meta: {
      title: '用户管理',
      roles: ['userManage']
    },
    children: [
      {
        path: 'index',
        name: 'index',
        component: () => import('@/views/permission/user/index'),
        meta: {
          title: '用户管理',
          roles: ['userManage'],
          icon: 'peoples',
        }
      }
    ]
  },
  {
    path: '/department',
    name: 'departmentPage',
    component: Layout,
    meta: {
      title: '院系管理',
      roles: ['department'],
      icon: 'el-icon-office-building'
    },
    children: [
      {
        path: 'index',
        name: 'department',
        component: () => import('@/views/department/index.vue'),
        meta: {
          title: '学院管理',
          roles: ['department'],
          icon: 'el-icon-office-building',
        },
      },
      {
        path: 'major',
        name: 'Major',
        component: () => import('@/views/department/major/index.vue'),
        meta: {
          title: '专业管理',
          roles: ['majorManage'],
          icon: 'el-icon-reading',
        }
      }
    ]
  },
  {
    path: '/example',
    component: Layout,
    meta: {
      roles: ['stuManage'],
      title: '学生管理'
    },
    children: [
      /*       {
      path: 'table',
      name: 'Table',
      component: () => import('@/views/teaAndStu/teacherManage/index'),
      meta: {
        title: '教师管理',
        breadNum: 2,
        icon: 'table',
        roles: ['editor']
      }
    }, */
      {
        path: 'stuManage',
        name: 'stuManage',
        component: () => import('@/views/teaAndStu/studentsManage/index'),
        meta: {
          title: '学生管理',
          roles: ['stuManage'],
          breadNum: 2,
          icon: 'tree',
        }
      }
    ]
  },
  {
    path: '/semester',
    component: Layout,
    redirect: '/semester/semesterObjectives',
    meta: {
      title: '学期与目标',
      breadNum: 2,
      roles: ['semestersAndObjectives'],
      icon: 'el-icon-school',
    },
    children: [
      {
        path: 'semesterObjectives',
        component: () =>
          import('@/views/semesters/index.vue'),
        name: 'semesters',
        meta: {
          title: '学期信息',
          activeMenu: '/semester',
          roles: ['semestersAndObjectives'],
          breadNum: 1,
        },
        hidden: true
      }
    ]
  },
  {
    path: '/nested',
    component: Layout,
    redirect: '/nested/lessonsManage',
    alwaysShow: true,
    name: 'lessonsService',
    meta: {
      title: '课程服务',
      breadNum: 1,
      icon: 'nested',
      roles: ['coursesManage', 'examine']
    },
    children: [
      {
        path: 'lessonsManage',
        component: () => import('@/views/course/index.vue'), // Parent router-view
        name: 'lessonsManage',
        meta: {
          title: '课程管理',
          breadNum: 2,
          keepAlive: true,
          showFather: true,
          icon: 'el-icon-school',
          activeMenu: '/nested/lessonsManage',
          roles: ['coursesManage', 'evaluatePage'],
        },
        //
        children: [
          {
            path: 'lessonDetail',
            component: () =>
              import(
                '@/views/course/components/lessonDetail.vue'
              ),
            name: 'lessonDetail',
            meta: {
              title: '二课详情',
              showFather: false,
              showEvaluate: false,
              keepAlive: false,
              activeMenu: '/nested/lessonsManage',
              roles: ['coursesManage', 'examine', 'evaluatePage'],
              breadNum: 2
            },
            hidden: true,
            children: [
              {
                path: 'introduction',
                component: () =>
                  import(
                    '@/views/course/evaluate/index.vue'
                  ),
                name: 'introduction',
                meta: {
                  title: '课程考评',
                  showFather: false,
                  showEvaluate: true,
                  activeMenu: '/nested/lessonsManage',
                  roles: ['evaluatePage'],
                  breadNum: 3
                }
              }
            ]
          }
        ]
      },
      {
        path: 'examine',
        component: () => import('@/views/nested/menu1/index'),
        redirect: '/nested/examine/examinePage',
        name: 'examineIndex',
        meta: {
          title: '报名审核',
          breadNum: 1,
          icon: 'el-icon-s-check',
          roles: ['examine']
        },
        children: [
          {
            path: 'examinePage',
            component: () => import('@/views/course/examine'),
            name: 'examine',
            meta: {
              title: '报名审核',
              roles: ['examine'],
              breadNum: 2,
              activeMenu: '/nested/examine',
            },
            hidden: true
          }
        ]
      }
    ]
  },
  {
    path: '/word',
    name: 'Word',
    redirect: 'index',
    component: Layout,
    meta: {
      title: '词汇与模板',
      roles: ['templateAndWordManage', 'templateAndWordManage.wordManage', 'templateAndWordManage.wordTypeManage', 'templateAndWordManage.templateManage'],
      icon: 'el-icon-collection'
    },
    children: [
      {
        path: 'index',
        name: 'WordIndex',
        component: () => import('@/views/word/index.vue'),
        meta: {
          title: '词汇管理',
          roles: ['templateAndWordManage.wordManage'],
          icon: 'el-icon-collection',
        }
      },
      {
        path: 'type',
        name: 'WordType',
        component: () => import('@/views/word/wordType/index.vue'),
        meta: {
          title: '词汇类型',
          roles: ['templateAndWordManage.wordTypeManage'],
          icon: 'el-icon-files',
        }
      },
      {
        path: 'template',
        component: () => import('@/views/word/template/index.vue'),
        name: 'template',
        meta: {
          title: '考评模板',
          roles: ['templateAndWordManage.templateManage'],
          breadNum: 2,
          icon: 'el-icon-receiving',
        }
      }
    ]
  },
  {
    path: '/report',
    name: 'Report',
    redirect: 'batch',
    component: Layout,
    meta: {
      title: '年度报告',
      roles: ['annulReportManage'],
      icon: 'el-icon-cloudy',
    },
    children: [
      {
        path: 'batch',
        name: 'ReportBatch',
        component: () => import('@/views/report/batch/index.vue'),
        meta: {
          title: '报告列表',
          roles: ['annulReportManage'],
          icon: 'el-icon-cloudy'
        }
      },
      {
        path: 'batchReportDetails',
        name: 'BatchReportDetails',
        hidden: true,
        component: () => import('@/views/report/batch/batchReportDetails.vue'),
        meta: {
          title: '年度报告详情',
          roles: ['annulReportManage'],
          icon: 'el-icon-cloudy'
        }
      }
    ]
  },
  {
    path: '/rankList',
    name: 'rankList',
    component: Layout,
    meta: {
      title: '积分排行榜',
      roles: ['rankList']
    },
    children: [
      {
        path: 'index',
        name: 'rankListIndex',
        component: () => import('@/views/scoreRankingList/index.vue'),
        meta: {
          title: '积分排行榜',
          icon: 'el-icon-s-data',
          roles: ['rankList'],
        }
      }
    ]
  },
  // 如果需要配置重定向404页面的话，需要配置在asyncRoutes的最后
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]
// 实例化vue的时候只挂载constantRouter
const createRouter = () =>
  new Router({
    mode: 'history', // require service support
    scrollBehavior: () => ({
      y: 0
    }),
    routes: constantRouterMap
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
