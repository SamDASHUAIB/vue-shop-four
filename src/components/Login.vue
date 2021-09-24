<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <!-- 为 el-form 添加 :model 数据绑定对象(总) -->
      <!-- 为 el-form 添加 :rules 添加验证规则对象 -->
      <el-form
        ref="loginFormRef"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
      >
        <!-- 用户名 -->
        <!-- 每一个 el-input 添加 v-model="xxx.xxx" 绑定具体的数据项 -->
        <!-- 每一个 el-form-item 添加 prop 属性, 设置为需校验的字段名, 字段名预先在 loginRules 中定义(通常为对象数组), 单条验证规则就是一个对象 -->
        <!-- el-form-item 下的子元素(表单项)会应用于 prop 中字段的验证规则 -->
        <!-- 注意这里的 prop 没有使用 v-bind -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  name: 'login',
  components: {},
  data() {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      // 登录表单的验证规则对象
      loginFormRules: {
        // trigger: 'blur' 说明在鼠标失去焦点的时候, 触发验证行为。
        // 字段, 验证规则集
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  props: {},
  created() {},
  methods: {
    // 点击重置按钮, 重置登录表单
    resetLoginForm() {
      /*
        resetFields
        重置表单, 将所有字段设为初始值
        移除校验结果
        需要经由 表单实例对象(ref) 访问此方法
      */
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      /*
        validate
        对整个表单进行校验的方法
        接收一个回调, 校验结束后被调用, 传入有两个参数
        是否校验成功 Boolean valid
        校验失败的字段 Object rule
      */
      /*
        登录请求发起前, 需要进行预校验, 通过预校验才允许发送网络请求。
      */
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        // 预校验通过, 发起请求
        /*
          post
            第一个参数为 请求路径
            第二个参数为 数据
        */
        //  解构赋值 + 重命名
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败!')
        this.$message.success('登录成功!')

        /*
          token 相关逻辑
          将登录成功之后的 token 保存到客户端的 sessionStorage 中
            项目中出现了登录之外的其他 API 接口, 必须在登录之后才能访问
            token 只应在当前网站打开期间生效, 所以将 token 保存在 sessionStorage 中
          通过编程式导航跳转到后台主页, 路由地址是 /home
        */
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    },
  },
}
</script>
<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0px 7px 14px 0px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
