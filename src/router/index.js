import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  // 路由重定向, 对于 / 我们重定向到 /login
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Login.vue'),
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../components/Home.vue'),
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        name: 'Welcome',
        component: () => import('../components/Welcome.vue'),
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import('../components/user/Users.vue'),
      },
      {
        path: '/rights',
        name: 'Rights',
        component: () => import('../components/power/Rights.vue'),
      },
      {
        path: '/roles',
        name: 'Roles',
        component: () => import('../components/power/Roles.vue'),
      },
      {
        path: '/categories',
        name: 'Cate',
        component: () => import('../components/goods/Cate.vue'),
      },
      {
        path: '/params',
        name: 'Params',
        component: () => import('../components/goods/Params.vue'),
      },
      {
        path: '/goods',
        name: 'GoodsList',
        component: () => import('../components/goods/List.vue'),
      },
      {
        path: '/goods/add',
        name: 'Add',
        component: () => import('../components/goods/Add.vue'),
      },
      {
        path: '/orders',
        name: 'Order',
        component: () => import('../components/order/Order.vue'),
      },
    ],
  },
]

const router = new VueRouter({
  routes,
})

/*
  通过路由导航守卫, 控制页面的访问权限
*/
router.beforeEach((to, from, next) => {
  /*
    to 将要访问的路径
    from 从哪个路径跳转而来
    next 放行 函数
      next() 放行
      next('路径') 强制跳转
  */
  if (to.path === '/login') return next()
  // 获取 token
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有 token 说明无权访问, 强制跳转 login 页
  if (!tokenStr) return next('/login')
  // 有 token 放行
  next()
})
export default router
