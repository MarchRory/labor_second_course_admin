import Vue from 'vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import echarts from 'echarts'
Vue.prototype.$echarts = echarts
import 'echarts-wordcloud'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import '@/assets/iconfont/dashboardUse/iconfont.css'
import '@/styles/index.scss' // global css
import App from './App'
import '@/myOrder/index'
import store from './store'
import router from './router'
import '@/icons' // icon
import '@/permission' // permission control
import myDerectives from '@/myOrder/index'
import Contextmenu from 'vue-contextmenujs'
// import axios from 'axios'

// Vue.prototype.$http = axios;

// axios.defaults.baseURL = 'http://162.14.102.246:8100/';
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */

// set ElementUI lang to EN
//Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(Contextmenu)
Vue.use(ElementUI)
   .use(myDerectives)
Vue.config.productionTip = false


new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
