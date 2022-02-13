<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!--
        使用栅格系统, 规定 input 的长度
        span 规定每列占据的长度
        gutter 规定列之间的空隙
      -->
      <el-row :gutter="20">
        <el-col :span="7">
          <!-- 搜索与添加区域 -->
          <!-- clear 在点击由 clearable 属性生成的清空按钮时触发 -->
          <!-- 重新拉取数据 + 搜索条件为 '' 空字符串，就是清空功能 -->
          <el-input
            clearable
            @clear="getUserList"
            placeholder="请输入内容"
            v-model="queryInfo.query"
          >
            <!-- 搜索功能就是以新的查询条件，重新拉取数据 -->
            <el-button
              @click="getUserList"
              slot="append"
              icon="el-icon-search"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button @click="addDialogVisible = true" type="primary">
            添加用户
          </el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <!--
        data: 数据源
        prop: 每一列的数据源，键值，无需 v-bind
        label: 列名(列标题)
       -->
      <el-table border stripe :data="userList" style="width: 100%">
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <!-- 状态列, true OR false => 开关 -->
        <!-- 指定了作用域插槽, 删掉 prop 不删, prop 也不会起作用了 -->
        <!-- v-model 这里设置为 row.mg_state，双向数据绑定的不一定都是 data -->
        <el-table-column label="状态">
          <template v-slot="{ row }">
            <el-switch
              @change="userStateChange(row)"
              v-model="row.mg_state"
            ></el-switch>
          </template>
        </el-table-column>
        <!-- 操作列, 增删改查, 需要拿到用户的 id 所以要使用作用域插槽 -->
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色 -->
            <!-- enterable 鼠标离开, 自动隐藏  -->
            <el-tooltip
              :enterable="false"
              effect="dark"
              content="分配角色"
              placement="top"
            >
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-setting"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <!--
        @size-change 监听 pagesize 改变, 改变每页显示条数。
        @current-change 监听 页码值 改变
        :current-page 当前的页数, 一般为 1
        :page-size 当前情况下, 每页显示多少条。
        layout 分页功能组件
        :total 总数据条数
       -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <add-user
      :add-dialog-visible.sync="addDialogVisible"
      @getUserList="getUserList"
    ></add-user>
    <!-- <el-dialog
      title="添加用户"
      @close="addDialogClosed"
      :visible.sync="addDialogVisible"
      width="50%"
    >
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
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button @click="addUser" type="primary">
          确 定
        </el-button>
      </span>
    </el-dialog> -->
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体 表单 -->
      <span>
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名">
            <el-input disabled v-model="editForm.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">
          确 定
        </el-button>
      </span>
    </el-dialog>
    <!--  分配角色的对话框 -->
    <el-dialog
      @close="setRoleDialogClosed"
      title="提示"
      :visible.sync="setRoleDialogVisible"
      width="50%"
    >
      <div>
        <p>当前的用户: {{ userInfo.username }}</p>
        <p>当前的角色: {{ userInfo.role_name }}</p>
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <!--
              label 文本, 用户看到的
              value 真正选中的值, 一般可以为 id
             -->
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getUserList, setStateChange } from '../../api/users'
import AddUser from './components/add-user.vue'

export default {
  name: 'Users',
  components: {
    AddUser,
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
      // 获取用户列表的查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1, // 当前页码值
        pagesize: 2, // 当前每页显示条数
      },
      userList: [],
      total: 0, // 总数据条数
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
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
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息
      editForm: {},
      // 修改用户信息对话框验证规则对象
      editFormRules: {
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
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有的角色
      rolesList: [],
      // 当前被选中的 el-option 的 value 属性值, 这里是已选中的角色的 id 值
      selectedRoleId: '',
    }
  },
  props: {},
  created() {
    // 获取用户列表数据
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const res = await getUserList(this.queryInfo)
      this.userList = res.users
      this.total = res.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // pagesize 变化, 重新发起请求, 拉取数据
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      // pagenum 改变, 重新发起请求
      this.getUserList()
    },
    // 监听 switch 开关状态的改变
    async userStateChange(userInfo) {
      // 将用户的最新状态保存到数据库中
      // const { data: res } = await this.$http.put(
      //   `users/${userInfo.id}/state/${userInfo.mg_state}`
      // )
      // if (res.meta.status !== 200) {
      //   // 既然失败, 那就回滚操作
      //   userInfo.mg_state = !userInfo.mg_state
      //   return this.$message.error('更新用户状态失败!')
      // }
      // this.$message.success('更新用户状态成功!')
      try {
        await setStateChange(userInfo)
        this.$message.success('更新用户状态成功!')
      } catch (error) {
        // 更新失败, 回滚操作, 恢复点击之前的状态。
        userInfo.mg_state = !userInfo.mg_state
        this.$message.error('更新用户状态失败!')
        console.log(error)
      }
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 新增用户
    addUser() {
      // 表单预校验
      /*
        validate 对整个表单进行校验的方法，参数为一个回调函数
          valid 校验的结果
      */
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 校验通过, 发起网络请求
        const { data: res } = await this.$http.post('/users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('新增用户失败!')
        }
        this.$message.success('新增用户成功!')
        // 隐藏对话框
        this.addDialogVisible = false
        // 刷新
        this.getUserList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败!')
      }
      this.$message.success('查询用户信息成功!')
      // 数据回写
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.editForm = {}
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo() {
      // 预校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败!')
        }
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('更新用户信息成功!')
      })
    },
    // 根据 id 删除用户信息
    async removeUserById(id) {
      // 弹框询问用户是否确认删除
      /*
        cancel: 用户按下取消按钮
        confirm: 用户按下确认按钮
      */
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch(err => err) // 如果控制台报错, catch 抛出的错误即可
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消了删除操作!')
      }
      // 确认删除, 我们发起请求, 真正从数据库中删除数据
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败!')
      }
      this.$message.success('删除用户成功!')
      this.getUserList()
    },
    async setRole(userInfo) {
      // 为后续点击确定，分配角色，提供数据
      this.userInfo = userInfo
      // 获取所有角色的数据列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败!')
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮, 分配角色
    async saveRoleInfo() {
      // 非空检验, 用户需要先选一个值。
      if (!this.selectedRoleId) {
        return this.$message.error('请选择需要分配的角色!')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId,
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配用户角色失败!')
      }
      this.$message.success('分配用户角色成功!')
      // 刷新用户列表
      this.getUserList()
      // 隐藏分配角色对话框
      this.setRoleDialogVisible = false
    },
    // 监听分配角色的对话框的关闭，对话框的关闭，需要重置状态。
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    },
  },
}
</script>
<style lang="less" scoped>
.el-table {
  margin-top: 15px;
  font-size: 12px;
}
.el-pagination {
  margin-top: 20px;
}
</style>
