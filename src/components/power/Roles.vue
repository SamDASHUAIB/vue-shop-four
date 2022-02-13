<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="{
                vcenter: true,
                bdbottom: true,
                bdtop: i1 === 0 ? true : false,
              }"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 第二层 for 循环 二级权限 -->
                <el-row
                  :class="{ vcenter: true }"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :class="{ bdtop: i2 === 0 ? false : true }" :span="6">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      type="success"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <!-- 第三层 for 循环 二级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

            <!-- 三层 for 循环 => 三级权限 -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <!--  -->
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">
              编辑
            </el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">
              删除
            </el-button>
            <el-button
              @click="showSetRightDialog(scope.row)"
              size="mini"
              type="warning"
              icon="el-icon-setting"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <!--
        :data 数据源
        :props 属性绑定对象
          children: 去哪个属性找子节点
          label: 去哪个属性找节点的文本
        node-key
          每个树节点用来作为唯一标识的属性 通常而言字段 id 可以代表此节点
        default-expand-all 是否展开所有子节点
        default-checked-keys
          默认勾选的节点的 key 的数组
          node-key 是 id 字段, 因此 默认勾选的节点的 key 的数组就是 id 值组成的数组
       -->
      <el-tree
        :default-checked-keys="defKeys"
        default-expand-all
        node-key="id"
        show-checkbox
        :data="rightsList"
        :props="treeProps"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'Roles',
  components: {},
  data() {
    return {
      // 所有角色列表数据
      roleList: [],
      // 控制设置权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限列表(tree)
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: { children: 'children', label: 'authName' },
      // 默认选中的节点 id 值数组(所有的三级权限放到数组里面)
      defKeys: [],
      roleId: '',
    }
  },
  props: {},
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有的角色列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败!')
      }
      this.roleList = res.data
    },
    // 根据 id 删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户, 是否确认删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作!')
      }
      /* 返回的 data 是当前角色下最新的权限数据(已经删除成功后的所有权限数据) */
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败!')
      }
      // 权限数据重新赋值, 不会自动合上, 防止整个列表刷新!!!
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 保存 role 的 id 值, 以供后续使用
      this.roleId = role.id
      // 获取所有权限的数据, 展示 tree
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败!')
      }
      this.rightsList = res.data
      // 递归获取三级节点的 id 值, 默认选中功能
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归, 获取角色下所有三级权限的 id 值, 并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // 如果没有 children 属性, 那就是三级节点, 将 id 值保存到数组中
      if (!node.children) {
        return arr.push(node.id)
      }
      // 递归, 找到三级节点
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限的对话框的关闭
    setRightDialogClosed() {
      // 对话框关闭时, 将 defKeys 置空, 防止累加
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      // 返回目前被选中的节点的 key 所组成的数组 + 返回目前半选中的节点的 key 所组成的数组
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      console.log(keys)
      // 拼接 [1, 2, 3] => '1,2,3'
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idStr,
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('为角色分配权限失败!')
      }
      this.$message.success('为角色分配权限成功!')
      // 刷新列表
      this.getRolesList()
      // 分配权限成功后, 关闭 dialog
      this.setRightDialogVisible = false
    },
  },
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
