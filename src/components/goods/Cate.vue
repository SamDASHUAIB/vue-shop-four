<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加分类按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">
            添加分类
          </el-button>
        </el-col>
      </el-row>
      <!-- 树形表格区域 -->
      <tree-table
        :selection-type="false"
        :expand-type="false"
        :data="cateList"
        :columns="columns"
        show-index
        index-text="#"
        boder
        class="tree-table"
      >
        <template slot="isok" slot-scope="scope">
          <!-- {{ scope.row.cat_deleted }} -->
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <!-- {{ scope.row.cat_deleted }} -->
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            type="success"
          >
            二级
          </el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <template slot="opt">
          <!-- slot-scope="scope" -->
          <el-button size="mini" type="primary" icon="el-icon-edit">
            编辑
          </el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">
            删除
          </el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->

    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        ref="addCateRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称: " prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类: ">
          <!--
            options: 数据源
            props: 用于指定配置对象
            v-model 必须绑定一个数组
            change-on-select 允许选择任意一级的选项
              级联选择框默认只能选择最后一级的选项
             -->
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            v-model="selectedKeys"
            @change="parentCateChanged"
            :props="cascaderProps"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'Cate',
  components: {},
  data() {
    return {
      // 商品分类的数据列表, 默认为空
      cateList: [],
      // 查询参数(条件)对象
      queryInfo: { type: 3, pagenum: 1, pagesize: 5 },
      // 总数据条数
      total: 0,
      // 表格各列的配置(对象数组)
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 具体使用哪一个模板? 模板名称
          template: 'isok',
        },
        {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 具体使用哪一个模板? 模板名称
          template: 'order',
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 具体使用哪一个模板? 模板名称
          template: 'opt',
        },
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的 id
        cat_pid: 0,
        // 分类的等级 默认是一级分类
        cat_level: 0,
      },
      // 添加分类的表单验证规则对象
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入商品分类名称', trigger: 'blur' },
        ],
      },
      // 父级分类的列表
      parentCateList: [],
      /*
        指定级联选择器的配置对象
        value: 真正的值, 具体选中的那个值的属性
        label: 看到的值, 用户看到的文字是哪个属性
        children: 实现嵌套关系的值
      */
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 选中的项的 id 组成的数组
      selectedKeys: [],
    }
  },
  props: {},
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败!')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听 pagesize 一页多少项 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 页码值 改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击显示添加分类对话框
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级(一二级)分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类的数据列表失败!')
      }
      this.parentCateList = res.data
    },
    // 选择项发生变化, 触发
    parentCateChanged() {
      // 通过 selectedKeys 数组的 length 的长度，来判断用户是否选中任何父分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的 id 永远是 selectedKeys 的最后一项
        // 更新查询参数对象
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 为当前分类的等级赋值
        return (this.addCateForm.cat_level = this.selectedKeys.length)
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 1
      }
    },
    // 点击添加按钮, 添加新的分类
    addCate() {
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品分类失败!')
        }
        this.$message.success('添加商品分类成功!')
        console.log(res.data)
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件, 重置表单数据, 清空 selectedKeys, 清空级联选择器
    addCateDialogClosed() {
      this.$refs.addCateRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
  },
}
</script>
<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 66%;
}
</style>
