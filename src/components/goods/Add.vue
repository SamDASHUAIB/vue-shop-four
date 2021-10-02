<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      ></el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        align-center
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab 栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane name="0" label="基本信息">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="cateList"
                v-model="addForm.goods_cat"
                @change="handleChange"
                :props="cateProps"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="1" label="商品参数">
            <!-- 渲染表单的 item 项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="itemy"
                  v-for="(itemy, index) in item.attr_vals"
                  :key="index"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="2" label="商品属性">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="3" label="商品图片">
            <!--
              action 上传图片后, 请求的 api 接口, 表示图片上传到后台 API 地址
              list-type
                当前图片列表的呈现方式
             -->
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane name="4" label="商品内容">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce" />
            <!-- 添加商品的按钮 -->
            <el-button type="primary" @click="add" class="btn-add">
              添加商品
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览的对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%"
    >
      <img class="preview-img" :src="previewPath" alt="" />
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'

export default {
  name: 'Add',
  components: {},
  data() {
    return {
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品分类级联选择器选中的项的 id 值构成的数组
        goods_cat: [],
        // 上传的图片列表
        pics: [],
        // 商品的详细描述
        goods_introduce: '',
        // 动态参数 & 静态属性 总集合对象
        attrs: [],
      },
      // 添加商品的表单验证规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选中商品分类', trigger: 'blur' },
        ],
      },
      // 商品分类列表
      cateList: [],
      // 级联选择器的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片方法请求头
      /* 需要配置 token 因为 el-upload 组件没有使用 axios 所以需要手动配置 Authorization 字段头 */
      headersObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      // 图片预览的图片真实路径
      previewPath: '',
      // 控制图片预览对话框的显示与隐藏
      previewDialogVisible: false,
    }
  },
  props: {},
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有的商品分类信息
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类信息失败!')
      }
      this.cateList = res.data
    },
    // 级联选择器选中项变化, 触发
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 级联选择器选中项变化, 触发
    /*
      activeName 即将离开的标签页名
      oldActiveName 即将进入的标签页名
    */
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类!')
        return false
      }
    },
    async tabClicked() {
      if (this.activeIndex === '1') {
        // 访问的是动态参数面板, id 是三级分类的 id 值
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many',
            },
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败!')
        }
        // string => array 非空检验
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        // 访问的是静态属性面板, id 是三级分类的 id 值
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only',
            },
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败!')
        }
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 图片预览事件
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 图片移除事件
    handleRemove(file) {
      // 1 获取将要删除的图片的 tem_path 临时路径
      const filePath = file.response.data.tmp_path
      // 2 根据临时路径, 从 pics 数组中, 找到这个图片的索引值
      const index = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3 调用数组的 splice 方法, 把图片信息对象, 从 pics 数组中移除
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm.pics)
    },
    // 图片上传成功后的回调
    handleSuccess(response) {
      this.addForm.pics.push({ pic: response.data.tmp_path })
      console.log(this.addForm.pics)
    },
    // 添加商品
    add() {
      // 表单预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项!')
        }
        // 发起请求, 添加商品
        // goods_cat array => string
        // 级联需要 array 形式, 发送请求需要 string 形式, 冲突!
        // 深拷贝一份出来改
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' '),
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // 发起请求, 商品的名称必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败!')
        }
        this.$message.success('添加商品成功!')
        // 添加成功, 跳转路由
        this.$router.push('/goods')
      })
    },
  },
  computed: {
    // 三级商品分类的 id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    },
  },
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.preview-img {
  width: 100%;
}
.btn-add {
  margin-top: 15px;
}
</style>
