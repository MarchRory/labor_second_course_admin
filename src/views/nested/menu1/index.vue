<template>
  <div class="bg">
    <keep-alive include="courseTable">
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: "courseView",
  provide() {
    return {
      reload: this.reload,
    };
  },
  data() {
    return {
      isReload: true,
    };
  },
  methods: {
    reload() {
      this.isReload = false;
      this.$nextTick(() => {
        this.isReload = true;
      });
    },
  },
};
</script>

<style>
.bg {
  background-color: #d6d6d640;
  height: calc(100vh - 50px);
  overflow-y: auto;
}
</style>
