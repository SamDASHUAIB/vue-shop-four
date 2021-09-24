<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>
<script>
export default {
  name: 'home',
  components: {},
  data() {
    return {}
  },
  props: {},
  created() {},
  methods: {
    logout() {
      // 基于 token 的退出功能实现, 只要销毁 token 就好了
      window.sessionStorage.clear()
      // 销毁 token 后, 跳转回 login 页
      this.$router.push('/login')
    },
  },
}
</script>
<style lang="less" scoped></style>
