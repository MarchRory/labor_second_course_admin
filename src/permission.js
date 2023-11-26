import router from "./router";
import store from "./store";
import { Message } from "element-ui";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { getToken } from "@/utils/auth";
import getPageTitle from "@/utils/get-page-title";

NProgress.configure({ showSpinner: false });
const whiteList = ["/login", "/404"]; // 不重定向的白名单

router.beforeEach(async (to, from, next) => {
  NProgress.start();
  // 设置页面标题
  document.title = getPageTitle(to.meta.title);
  // 确定用户是否已登录
  const hasToken = getToken();
  // 判断是否存在token,没有就重新登陆
  if (hasToken) {
    if (to.path === "/login") {
      // 如果已登录，则重定向到主页
      next({
        path: "/",
      });
      NProgress.done();
    } else {
      // 确定用户是否通过getInfo获得了权限角色
      const hasRoles = store.getters.roles && store.getters.roles.length > 0; //这里指的是src/store/getters.js的roles
      // 无法获取roles
      // 判断是否已经有roles了
      if (hasRoles) {
        if (to.path != "/") {
          next();
        } else {
          next("/404");
        }
      } else {
        try {
          // 1. 获取roles
          const roles = await store.dispatch("user/getInfo"); //第一步
          // 2. 根据角色生成可访问路由图
          // 获取通过权限验证的路由
          const accessRoutes = await store.dispatch(
            "permission/generateRoutes",
           roles
          ); //第二步
          // 3. 更新加载路由
          router.options.routes = store.getters.permission_routes; //第三步
          // 动态添加可访问路由
          router.addRoutes(accessRoutes);

          // 由于roles存储在vuex中，导致没有roles还有个情况是页面F5刷新, 这会触发路由守卫进入这里的代码, 所以在这里再重新获取一次roles和学期信息这俩全局状态，保持数据持久化
          await store.dispatch("semester/getSemesterInfo");

          // 两个全局状态都获取后再进入主页
          next({ ...to, replace: true });
        } catch (error) {
          await store.dispatch("user/resetToken");
          Message({
            message: error.msg || "Error",
            type: "error",
            duration: 5 * 1000,
          });
          next(`/login?redirect=${to.path}`);
          NProgress.done();
        }
      }
    }
  } else {
    /* 没有token */
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next();
    } else {
      next(`/login?redirect=${to.path}`); // 否则全部重定向到登录页
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});
