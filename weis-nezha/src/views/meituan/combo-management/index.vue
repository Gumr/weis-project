<template>
  <div class="container">
    <div class="query-bar" style="padding-bottom: 30px">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="6"
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
      <el-button class="float-right" type="primary" @click="editFn('create')"
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
        :data="tableDataByCombo"
        :total="tableDataTotalByCombo"
        border
        empty-text="当前没有套餐"
        @current-page-change="queryFoodsetList"
        @size-change="queryFoodsetList"
      >
        <el-table-column
          v-for="col in tableColByCombo"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <span
              class="brand-color cursor-pointer"
              style="margin-right: 8px"
              @click="editFn('edit', row)"
              >编辑</span
            >
            <span
              class="brand-color cursor-pointer"
              @click="updateFoodsetInfo('remove', row)"
              >删除</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <!-- 编辑套餐 -->
    <ConfirmDialog
      v-model="dialogByEdit"
      title=""
      :close-on-click-modal="false"
      :async-confirm="true"
      :auto-confirm="false"
      :autoLoading="false"
      @on-confirm="confirmEdit"
      @on-cancel="cancelEdit"
    >
      <section>
        <div class="section-item">
          <span class="section-label">
            <span style="color: red">*</span>套餐名称：
          </span>
          <el-input
            v-model="comboName"
            placeholder="请输入套餐名称"
            style="width: 150px"
          ></el-input>
        </div>
        <div v-if="!tfsId" class="section-item">
          <span class="section-label">套餐菜品：</span>
          <el-button type="primary" @click="addGoods">选择菜品</el-button>
        </div>
        <div class="total" style="margin-bottom: 20px">
          <span>合计菜品量：{{ dishTotal }}</span>
          <span style="margin-left: 50px">合计价格：{{ priceTotal }}</span>
        </div>
      </section>
      <BasePageTable
        ref="table"
        :visible="false"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableDataByEdit"
        border
      >
        <el-table-column
          v-for="col in tableColByEdit"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <span
              class="brand-color cursor-pointer"
              style="margin-right: 8px"
              @click="remove(row)"
              >移除</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
    <!-- 选择菜品 -->
    <ConfirmDialog
      v-model="goodsDialog"
      title="选择菜品"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="confirmGood"
    >
      <BasePageTable
        height="600"
        empty-text="当前没有菜品"
        :visible="false"
        :data="tableDataByGoods"
        border
      >
        <el-table-column
          v-for="col in tableColByGoods"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="数量" align="center">
          <template #default="{ row }" class="action-cell">
            <el-input
              v-model="row.tfsNum"
              @keydown="catchNonNumberKeydown"
              @blur="checkText(row)"
            ></el-input>
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ButtonTabs from '@/components/ButtonTabs.vue'
import exportExcel from '@/utils/export-excel'
import {
  catchNonIntKeydown,
  catchNonNumberKeydown,
} from '@/utils/event-catcher'
function initFormData() {
  return {
    confKey: '',
    confValue: '',
    decipher: '',
  }
}

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    ButtonTabs,
  },
  // 定义属性
  data() {
    return {
      comboName: '',
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      dishTotal: 0,
      priceTotal: 0,
      dialogByEdit: false,
      tableDataByEdit: [],
      tableColByEdit: [
        {
          label: '序号',
          type: 'index',
        },
        {
          label: '菜品编码',
          prop: 'tfsCid',
        },
        {
          label: '菜品名称',
          prop: 'tfsSkuname',
        },
        {
          label: '菜品单价',
          prop: 'tfsPrice',
        },
        {
          label: '菜品热量',
          prop: 'tfsEnergy',
          formatter: (row) => `${row.tfsEnergy}kcal`,
        },
        {
          label: '数量',
          prop: 'tfsNum',
        },
      ],

      // 套餐表单
      tableDataByCombo: [],
      tableDataTotalByCombo: 0,
      tableColByCombo: [
        {
          label: '序号',
          type: 'index',
        },
        {
          label: '套餐ID',
          prop: 'tmfsCode',
        },
        {
          label: '套餐名称',
          prop: 'tmfsName',
        },
        {
          label: '套餐内容',
          prop: 'tmfsContent',
        },
        {
          label: '套餐热量',
          prop: 'tmfsEnergy',
          formatter: (row) => `${row.tmfsEnergy}kcal`,
        },
        {
          label: '合计菜品量',
          prop: 'tmfsNum',
        },
        {
          label: '套餐状态',
          prop: 'tmfsStatus',
          formatter: (row) => (row.tmfsStatus == 1 ? '有效' : '无效'),
        },
      ],

      // 选择菜品
      goodsDialog: false,
      tableDataByGoods: [],
      tableColByGoods: [
        {
          label: '序号',
          type: 'index',
        },
        {
          label: '菜品编码',
          prop: 'tfsCid',
        },
        {
          label: '菜品名称',
          prop: 'tfsSkuname',
        },
        {
          label: '菜品单价',
          prop: 'tfsPrice',
        },
        {
          label: '菜品热量',
          prop: 'tfsEnergy',
          formatter: (row) => `${row.tfsEnergy}kcal`,
        },
      ],

      height: window.innerHeight - 330,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          prop: 'app_poi_code',
        },
        {
          label: '套餐ID',
          prop: 'app_poi_code',
        },
        {
          label: '套餐名称',
          prop: 'app_poi_code',
        },
        {
          label: '套餐内容',
          prop: 'app_poi_code',
        },
        {
          label: '套餐热量',
          prop: 'app_poi_code',
        },
        {
          label: '合计菜品量',
          prop: 'app_poi_code',
        },
        {
          label: '套餐状态',
          prop: 'app_poi_code',
        },
      ],
      queryParams: {
        name: '',
        status: '',
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'name',
          label: '套餐名称',
          placeholder: '请输入菜品名称',
          prop: {
            clearable: true,
          },
        },
        {
          component: 'BaseSelect',
          key: 'status',
          label: '套餐状态',
          props: {
            clearable: true,
            options: [
              { label: '有效', value: 1 },
              { label: '无效', value: 0 },
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
    this.queryFoodsetList()
  },
  methods: {
    searchClick() {
      this.queryFoodsetList()
    },
    editFn(type, row) {
      // 编辑状态
      if (type == 'edit') {
        this.queryFoodsetDetail(row.tmfsId).then(
          this.$rw((err, res) => {
            if (!err) {
              this.comboName = row.tmfsName
              this.tableDataByEdit = res.result
              this._comboId = row.tmfsId
              this.computedPrice(this.tableDataByEdit)
            }
          })
        )
      } else {
        this.comboName = ''
        this.tableDataByEdit = []
      }
      this.dialogByEdit = true
    },
    // 编辑或新建套餐
    confirmEdit() {
      this.updateFoodsetInfo('create')
    },
    cancelEdit() {
      this.dishTotal = 0
      this.priceTotal = 0
    },
    confirmGood() {
      const data = this.tableDataByGoods.filter(
        (item) => item.tfsNum && item.tfsNum > 0
      )
      if (!data.length) {
        this.$msg('请输入菜品数量', 'error')
        return
      }
      this.tableDataByGoods = []
      this.tableDataByGoods = this.tableDataByEdit = data
      this.computedPrice(this.tableDataByGoods)
      this.goodsDialog = false
    },
    // 查询套餐
    queryFoodsetList() {
      this.$store.state.vloading = true
      this.$request(
        '/cn.nezha.api.meituan.Food/queryFoodsetList',
        {
          ...this.page,
          ...this.genQueryParams(),
        },
        true
      ).then(
        this.$rw((err, res) => {
          this.$store.state.vloading = false
          if (!err) {
            const { record, totalRecordCount } = res.result
            let storeNames = []
            this.tableDataByCombo = record
            this.tableDataTotalByCombo = totalRecordCount
            storeNames = this.tableDataByCombo.map((item) => {
              return {
                label: item.name,
                value: item.app_poi_code,
              }
            })
            this.queryComps[0].props.options = storeNames
          }
        })
      )
    },
    updateFoodsetInfo(type, row) {
      this._updateType = type
      if (type === 'create') {
        if (!this.comboName || this.tableDataByEdit.length === 0) {
          this.$message.warning('数值为空，请检查')
          return
        }
      }
      this.dialogByEdit = false
      this.$request(
        'cn.nezha.api.meituan.Food/updateFoodsetInfo',
        {
          name: this.comboName,
          status: this._status,
          skuInfos: this.tableDataByEdit,
          id: type === 'remove' ? row.tmfsId : this._comboId,
          dataStt: type === 'remove' ? '99' : '00',
        },
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$msg(
              this._updateType === 'remove' ? '已删除' : '创建成功',
              'success'
            )
            this.dishTotal = 0
            this.priceTotal = 0
            this.queryFoodsetList()
          }
        })
      )
    },
    // 选择菜品
    addGoods() {
      this.queryGoods().then(
        this.$rw((err, res) => {
          if (!err) {
            this.tableDataByGoods = res.result.filter(
              (item) => item.tfsType === '00'
            )
            this.tableDataByEdit.forEach((item) => {
              this.tableDataByGoods.forEach((each) => {
                if (item.tfsCid === each.tfsCid) {
                  each.tfsNum = item.tfsNum
                }
              })
            })
            this.goodsDialog = true
          }
        })
      )
    },
    remove(row) {
      this.tableDataByEdit = this.tableDataByEdit.filter(
        (item) => item.tfsCid != row.tfsCid
      )
      this.computedPrice()
    },
    checkText(row) {
      row.tfsNum = isNaN(row.tfsNum) ? 0 : row.tfsNum
      row.tfsNum = Number(Math.abs(row.tfsNum)).toFixed(0)
      row.tfsNum = row.tfsNum == 0 ? '' : row.tfsNum
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      params.name = params.name
      params.status = params.status
      return params
    },
    // 导出
    handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const col = [
        {
          label: '序号',
          type: 'index',
        },
        {
          label: '套餐ID',
          prop: 'tmfsCode',
        },
        {
          label: '套餐名称',
          prop: 'tmfsName',
        },
        {
          label: '套餐内容',
          prop: 'tmfsContent',
        },
        {
          label: '套餐热量',
          prop: 'tmfsEnergy',
        },
        {
          label: '合计菜品量',
          prop: 'tmfsNum',
        },
        {
          label: '套餐状态',
          prop: 'tmfsStatus',
          formatter: (row) => (row.tmfsStatus == 1 ? '有效' : '无效'),
        },
      ]
      this.reqAllCombo().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false
          exportExcel({
            columns: col,
            filename,
            data: res.result.record,
          })
        })
      )
    },
    reqAllCombo() {
      return this.$request(
        '/cn.nezha.api.meituan.Food/queryFoodsetList',
        {
          pageNo: 1,
          pageSize: this.tableDataTotal,
        },
        true
      )
    },
    queryGoods() {
      return this.$request(
        'cn.nezha.api.meituan.Food/queryWeisSkuList',
        {},
        true
      )
    },
    queryFoodsetDetail(id) {
      return this.$request(
        'cn.nezha.api.meituan.Food/queryFoodsetDetail',
        {
          foodsetId: id,
        },
        true
      )
    },
    computedPrice(target) {
      this.dishTotal = 0
      this.priceTotal = 0
      target.forEach((item) => {
        this.dishTotal += Number(item.tfsNum)
        this.priceTotal += Number(item.tfsNum) * Number(item.tfsPrice)
      })
      this.priceTotal = this.priceTotal.toFixed(2)
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
.container {
  padding: 30px;
}
</style>