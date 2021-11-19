 <template>
  <div class="container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="4"
        :action="false"
        :label-width="60"
        semi
      >
        <template #buttons>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
            >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button
          >
        </template>
      </QueryComponents>
      <el-button type="primary" @click="beforeEditFn('create')"
        >新建套餐</el-button
      >
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="queryMuchFoodConfigByPage"
        @size-change="queryMuchFoodConfigByPage"
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col">
          <template
            #default="{ row }"
            class="action-cell"
            v-if="col.prop === 'tmfcImage'"
          >
            <img :src="row.tmfcImage" width="120" alt="" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <span
              class="brand-color cursor-pointer"
              style="margin-right: 8px"
              @click="beforeEditFn('edit', row)"
              >编辑</span
            >
            <span
              class="brand-color cursor-pointer"
              style="margin-right: 8px"
              @click="toggleOnline(row)"
              >{{ row.tmfcActivate == '00' ? '上线' : '下线' }}</span
            >
            <span
              class="brand-color cursor-pointer"
              style="margin-right: 8px"
              @click="detailFn(row)"
              >详情</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <!-- 编辑多餐优惠 -->
    <ConfirmDialog
      v-model="comboDialog"
      :title="dialogTitle"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="confirmFn"
      @close="resetData"
    >
      <el-form
        :disabled="formDisabled"
        :model="formData"
        :rules="formRules"
        ref="refForm"
      >
        <el-form-item prop="tmfcName" label="套餐名称" label-width="110px">
          <el-input
            v-model="formData.tmfcName"
            placeholder="请输入套餐名称"
            style="width: 150px"
          ></el-input>
        </el-form-item>
        <el-form-item prop="tmfcImage" label="套餐封面" label-width="110px">
          <ImageUpload v-model:file-list="formData.tmfcImage" :limit="1" />
        </el-form-item>
        <el-form-item
          prop="tmfcDayNum"
          label="售卖天数餐数"
          label-width="110px"
        >
          <el-col :span="11">
            <el-form-item prop="tmfcDayNum">
              <el-input
                @input="queryDiscountByDate"
                v-model="formData.tmfcDayNum"
                placeholder="请输入套餐名称"
                style="width: 150px"
              />&nbsp;天，每天
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item prop="tmfcMealNum">
              &nbsp;<BaseSelect
                v-model="formData.tmfcMealNum"
                :options="mealOptions"
                @change="queryDiscountByDate"
              />&nbsp;餐
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="套餐折扣" label-width="110px">
          <span>{{ formData.tmfcDiscount }}折</span>
        </el-form-item>
        <el-form-item prop="tmfcIntroduce" label="套餐说明" label-width="110px">
          <el-input
            clearable
            v-model="formData.tmfcIntroduce"
            class="medium-input"
            type="textarea"
            :rows="4"
            placeholder="描述"
          ></el-input>
        </el-form-item>
        <el-form-item prop="tmfcSort" label="排序" label-width="110px">
          <el-input v-model="formData.tmfcSort" style="width: 150px"></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
    <!-- 套餐详情 -->
    <ConfirmDialog
      v-model="detailDialog"
      title="套餐详情"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :cancelVisible="false"
      :comfirmVisible="false"
      @close="resetData"
    >
      <el-form :disabled="formDisabled">
        <el-form-item label="套餐名称" label-width="110px">
          <span>{{ formData.tmfcName }}</span>
        </el-form-item>
        <el-form-item label="套餐封面" label-width="110px">
          <img
            :src="formData.tmfcImage[0].url"
            width="120"
            height="120"
            alt=""
          />
        </el-form-item>
        <el-form-item label="售卖天数餐数" label-width="110px">
          <span>{{ formData.tmfcDayNum }}</span
          >&nbsp;天，每天&nbsp;<span>{{ formData.tmfcMealNum }}</span
          >餐
        </el-form-item>
        <el-form-item label="套餐折扣" label-width="110px">
          <span>{{ formData.tmfcDiscount }}折</span>
        </el-form-item>
        <el-form-item label="套餐说明" label-width="110px">
          <span>{{ formData.tmfcIntroduce }}</span>
        </el-form-item>
        <el-form-item label="排序" label-width="110px">
          <span>{{ formData.tmfcSort }}</span>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import ButtonTabs from '@/components/ButtonTabs.vue'
import exportExcel from '@/utils/export-excel'

export default {
  components: {
    QueryComponents,
    BasePageTable,
    BaseSelect,
    ConfirmDialog,
    ButtonTabs,
    ImageUpload,
  },
  // 定义属性
  data() {
    return {
      dialogTitle: '新建套餐',
      detailDialog: false,
      comboDialog: false,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      height: window.innerHeight - 330,
      mealOptions: [
        {
          value: 1,
          label: 1,
        },
        {
          value: 2,
          label: 2,
        },
      ],
      // 饿了么门店数据
      tableDataTotal: 0,
      tableData: [],
      tableCol: [
        {
          type: 'index',
        },
        {
          label: '套餐名称',
          prop: 'tmfcName',
        },
        {
          label: '套餐封面',
          prop: 'tmfcImage',
        },
        {
          label: '售卖天数餐数',
          prop: 'tmfcDayNum',
          formatter: (row) => `${row.tmfcDayNum}天，每天${row.tmfcMealNum}餐`,
        },
        {
          label: '套餐折扣',
          prop: 'tmfcDiscount',
          formatter: (row) => `${row.tmfcDiscount * 10}折`,
        },
        {
          label: '套餐说明',
          prop: 'tmfcIntroduce',
        },
        {
          label: '排序',
          prop: 'tmfcSort',
        },
        {
          label: '状态',
          prop: 'tmfcActivate',
          formatter: (row) => (row.tmfcActivate == '00' ? '下线' : '上线'),
        },
      ],
      formDisabled: false,
      formData: {
        tmfcName: '',
        tmfcImage: [],
        tmfcDayNum: '',
        tmfcDiscount: '-',
        tmfcIntroduce: '',
        tmfcSort: '',
        tmfcMealNum: '',
      },
      formRules: {
        tmfcName: [
          { required: true, message: '请输入套餐名称', trigger: 'blur' },
        ],
        tmfcImage: [
          { required: true, message: '请上传套餐封面', trigger: 'change' },
        ],
        tmfcDayNum: [
          { required: true, message: '售卖天数不能为空', trigger: 'blur' },
        ],
        tmfcMealNum: [
          { required: true, message: '售卖餐数不能为空', trigger: 'change' },
        ],
        tmfcIntroduce: [
          { required: true, message: '请输入套餐说明', trigger: 'blur' },
        ],
        tmfcSort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
      },
      queryParams: {
        tmfcName: '',
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'tmfcName',
          label: '套餐名称',
          props: {
            filterable: true,
            clearable: true,
            options: [],
          },
        },
        {
          component: 'BaseSelect',
          key: 'tmfcActivate',
          label: '状态',
          props: {
            filterable: true,
            clearable: true,
            options: [
              {
                label: '上线',
                value: '01',
              },
              {
                label: '下线',
                value: '00',
              },
            ],
          },
        },
        {
          slot: 'buttons',
        },
      ],
    }
  },
  // 计算属性，会监听依赖属性值随之变化
  computed: {},
  // 监控data中的数据变化
  watch: {},
  // 方法集合
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this._originData = this.$deepClone(this.formData)
    this.queryMuchFoodConfigByPage()
  },
  methods: {
    // 查询所有多餐列表
    queryAllMuchFoodConfig() {
      return this.$request(
        '/cn.nezha.api.discount.DiscountGroup/queryAllMuchFoodConfig',
        {
          ...this.genQueryParams(),
          channel: '01',
        },
        true
      )
    },
    // 查询多餐列表
    queryMuchFoodConfigByPage() {
      this.$request(
        '/cn.nezha.api.discount.DiscountGroup/queryMuchFoodConfigByPage',
        {
          ...this.page,
          ...this.genQueryParams(),
        },
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            this.tableData = res.muchFoodConfig.record
            this.tableDataTotal = res.muchFoodConfig.totalRecordCount
          } else {
            this.$message.warning('出错了~')
          }
        })
      )
    },
    // 上线下线套餐
    toggleOnline(row) {
      this.getComboData(row)
      const { tmfcActivate } = this.formData
      this.formData.tmfcActivate = tmfcActivate == '00' ? '01' : '00'
      const params = this.$deepClone(this.formData)
      this.resetData()
      // console.log(params.tmfcImage)
      params.tmfcImage = params.tmfcImage[0].response
        ? params.tmfcImage[0].response.obj.imageUrl
        : params.tmfcImage[0].url
      // if (this._tmfcId) params.tmfcId = this._tmfcId
      this.$request(
        '/cn.nezha.api.discount.DiscountGroup/addMuchFoodConfig',
        { ...params },
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            this.comboDialog = false
            this.$message.success(tmfcActivate == '00' ? '已上线~' : '已下线~')
            this.queryMuchFoodConfigByPage()
          } else {
            this.$message.warning('出错了，请重试~')
          }
        })
      )
    },
    // 新建或编辑多餐配置
    confirmFn() {
      this.$refs.refForm.validate((valid) => {
        if (valid) {
          const { tmfcActivate } = this.formData
          this.formData.tmfcActivate = tmfcActivate == '00' ? '01' : '00'
          const params = { ...this.formData }
          // console.log(params.tmfcImage)
          params.tmfcImage = params.tmfcImage[0].response
            ? params.tmfcImage[0].response.obj.imageUrl
            : params.tmfcImage[0].url
          delete params.tmfcDiscount
          this.$request(
            '/cn.nezha.api.discount.DiscountGroup/addMuchFoodConfig',
            { ...params },
            true
          ).then(
            this.$rw((err, res) => {
              if (!err) {
                this.comboDialog = false
                this.$message.warning('成功~')
                this.queryMuchFoodConfigByPage()
              } else {
                this.$message.warning('出错了~')
              }
            })
          )
        }
        return
      })
    },
    // type: edit编辑，create查看详情
    beforeEditFn(type, row) {
      this.comboDialog = true
      this.dialogTitle = type === 'create' ? '新建套餐' : '编辑套餐'
      if (type === 'create') return
      // this._tmfcId = row.tmfcId
      this.getComboData(row)
    },
    detailFn(row) {
      this.detailDialog = true
      this.getComboData(row)
    },
    getComboData(row) {
      const tmfcImage = row.tmfcImage
      this.formData = {
        ...row,
        tmfcDiscount: row.tmfcDiscount * 10,
        tmfcImage: [
          {
            url: tmfcImage,
          },
        ],
      }
    },
    searchClick() {
      this.page.pageNo = 1
      this.queryMuchFoodConfigByPage()
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      params.storeName = params.tesShopName
      delete params.tesShopName
      return params
    },
    // 导出
    handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      this.queryAllMuchFoodConfig().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false
          exportExcel({
            columns: this.tableCol,
            filename,
            data: res.muchFoodConfigBeans,
          })
        })
      )
    },
    queryAllMuchFood() {
      return this.$request(
        '/cn.nezha.api.discount.DiscountGroup/addMuchFoodConfig',
        {
          // pageNo: 1,
          // pageSize: this.tableDataTotal,
        },
        true
      )
    },
    // 根据天数餐数查询折扣
    queryDiscountByDate() {
      return this.$request(
        '/cn.nezha.api.discount.DiscountGroup/queryDiscountByDate',
        {
          tdgrTimes: this.formData.tmfcDayNum * this.formData.tmfcMealNum,
        },
        true
      ).then(
        this.$rw((err, res) => {
          this.formData.tmfcDiscount = parseFloat(
            res.discountInfo.tdgrDiscount * 10
          )
        })
      )
    },
    resetData() {
      this.formData = this.$deepClone(this._originData)
      this.$refs.refForm && this.$refs.refForm.resetFields()
    },
  },
  beforeCreate() {}, // 生命周期 - 创建之前
  beforeMount() {}, // 生命周期 - 挂载之前
  beforeUpdate() {}, // 生命周期 - 更新之前
  updated() {}, // 生命周期 - 更新之后
  beforeDestroy() {}, // 生命周期 - 销毁之前
  destroyed() {}, // 生命周期 - 销毁完成
  activated() {}, // 如果页面有keep-alive缓存功能，这个函数会触发
}
</script>

<style lang='less' scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.container {
  padding: 0 30px;
}
</style>