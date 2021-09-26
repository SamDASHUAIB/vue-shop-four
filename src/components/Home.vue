<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 折叠与展开 -->
        <div @click="toggleCollapse" class="toggle-button">|||</div>
        <!-- 侧边栏菜单区 -->
        <!--
          unique-opened	只保持一个子项菜单展开
          collapse 折叠与展开
          collapse-transition 折叠与展开动画效果
          router vue 路由模式开启OR关闭 路径为 el-submenu 或者 el-menu 的 index 值
        -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#3E96F9"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <!-- 存在多级菜单使用 el-submenu -->
          <!-- 已经是最后一级菜单了使用 el-menu-item -->
          <!-- 指定唯一的 index 可以只展开自己不影响其他, index 只接受 string 类型 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 一级菜单的模板区 -->
            <template slot="title">
              <!-- 图标 -->
              <!-- 不同的 id 取出不同 icon, 动态添加 class -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + itemy.path"
              v-for="itemy in item.children"
              :key="itemy.id"
              @click="saveNavState('/' + itemy.path)"
            >
              <!-- 二级菜单的模板 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ itemy.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 子路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  name: 'home',
  components: {},
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      iconsObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        102: 'iconfont icon-danju',
        101: 'iconfont icon-shangpin',
        145: 'iconfont icon-baobiao',
      },
      // 折叠与展开布尔变量
      isCollapse: false,
      // 被激活的链接地址
      activePath: '',
    }
  },
  props: {},
  created() {
    // 请求左侧菜单数据
    this.getMenuList()
    // 组件一旦被创建, 立刻赋值
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      // 基于 token 的退出功能实现, 只要销毁 token 就好了
      window.sessionStorage.clear()
      // 销毁 token 后, 跳转回 login 页
      this.$router.push('/login')
    },
    // 获取所有的菜单数据
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 点击按钮, 切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保持链接的激活状态, 通过 sessionStorage
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      // 点击二级菜单, 重新赋值, 获得高亮效果
      this.activePath = activePath
    },
  },
}
</script>
<style lang="less" scoped>
// element-ui 中每一个 el-xxx 就是类名
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 10px;
    }
  }
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.el-container {
  height: 100%;
}
.el-menu {
  border-right: none;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  color: #fff;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
