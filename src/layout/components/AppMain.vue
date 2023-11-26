<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cacheRoute" :exclude="noCacheRoutes">
        <router-view :key="key" />
        <!-- <router-view  :include="cachedViews" /> -->
      </keep-alive>
    </transition>
  </section>
</template>

<script>
export default {
  name: "AppMain",
  data() {
    return {
      cacheRoute: [
        "departmentTable",
        "majorTable",
        "templateTable",
        "wordTable",
        "wordTypeTable",
        "roleTable",
        "userTable",
        "rankList",
        "stuTable",
        "semesterTable",
        "reportBatchTable",
      ],
      noCacheRoutes: ["introduation"],
    };
  },
  computed: {
    key() {
      return this.$route.path;
    },
  },
};
</script>

<style scoped>
.app-main {
  /*50 = navbar  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}
.fixed-header + .app-main {
  padding-top: 50px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
