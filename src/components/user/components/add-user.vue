<template>
  <!-- 添加用户对话框 -->
  <el-dialog
    title="添加用户"
    @close="btnCancel"
    :visible.sync="addDialogVisible"
    width="50%"
  >
    <!-- 内容主体区域 表单 -->
    <el-form
      :model="addForm"
      :rules="addFormRules"
      ref="addFormRef"
      label-width="70px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="addForm.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="addForm.password"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="addForm.email"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="addForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <!-- 底部区域 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="btnCancel">取 消</el-button>
      <el-button @click="addUser" type="primary">
        确 定
      </el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addUser } from '../../../api/users'
export default {
  props: {
    // 控制 dialog 的显示与隐藏
    addDialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    // 自定义校验规则 邮箱 手机
    /*
      rule 验证规则
      value 等待验证的值
      callback 回调
        成功 直接调用 callback 不用传递参数
        失败 调用 callback 并且必须传递一个 Error 实例作为参数
    */
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法邮箱
        return callback()
      }
      // 非法邮箱
      callback(new Error('请输入合法的邮箱!'))
    }
    var checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法手机号
        return callback()
      }
      // 非法手机号
      callback(new Error('请输入合法的手机号!'))
    }
    return {
      // 添加用户表单数据对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      // 添加用户表单的验证规则对象
      addFormRules: {
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
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          // 是否输入
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          // 是否合法
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入用户手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    // 新增用户
    addUser() {
      // 表单预校验
      /*
        validate 对整个表单进行校验的方法，参数为一个回调函数
          valid 校验的结果
      */
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // // 校验通过, 发起网络请求
        // const { data: res } = await this.$http.post('/users', this.addForm)
        // if (res.meta.status !== 201) {
        //   return this.$message.error('新增用户失败!')
        // }
        // this.$message.success('新增用户成功!')
        // // 隐藏对话框
        // this.$emit('update:addDialogVisible', false)
        // // 刷新
        // // 通知父组件刷新用户列表。
        // this.$emit('getUserList')

        try {
          await addUser(this.addForm)
          this.$message.success('新增用户成功!')
        } catch (error) {
          this.$message.error('新增用户失败!')
          console.log(error)
        } finally {
          this.$emit('update:addDialogVisible', false)
          this.$emit('getUserList')
        }
      })
    },
    btnCancel() {
      this.addForm = {
        username: '',
        password: '',
        email: '',
        mobile: '',
      }
      // 与 .sync 相配合。
      this.$emit('update:addDialogVisible', false)
      this.$refs.addFormRef.resetFields()
    },
  },
}
</script>
<style scoped></style>
