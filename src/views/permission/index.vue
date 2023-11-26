<template>
    <div class="bg">
        <router-view v-if="isReload" />
    </div>
  </template>

<script>
export default{
  provide(){
    return {
      reload: this.reload
    }
  },
  data(){
    return{
      isReload: true,
    }
  },
  methods:{
    reload(){
      this.isReload = false
      this.$nextTick(()=>{
        this.isReload = true
      })
    }
  }
}
</script>

<style scoped>
  .bg{
    background-color:#d6d6d640;
    height: calc(100vh - 50px);
    overflow-y: auto;
  }
</style>