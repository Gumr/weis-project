<template>
  <div class="container">
    <div style="margin-top: 20px">
      <ButtonTabs
        v-model="activeTab"
        :tabs="dishStatusTabs"
        @change="changes"
      />
    </div>

    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="6"
        :action="false"
        :label-width="80"
        semi
      >
        <template #buttons>
          <el-button type="primary" @click="searchClick">搜索</el-button>
        </template>
      </QueryComponents>
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
        @current-page-change="changeFn"
        @size-change="changeFn"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <span
              class="brand-color cursor-pointer"
              v-if="activeTab == 1"
              style="margin-right: 8px"
              @click="queryDetail(row)"
              >详情</span
            >
            <span
              class="brand-color cursor-pointer"
              v-if="row.skuState === '00'"
              @click="jumpQueue(row)"
              >插队</span
            >
            <!-- <span
              class="brand-color cursor-pointer"
              v-if="row.skuState == '02'"
              @click="goDetai(row)"
              >取消加热</span
            > -->
          </template>
        </el-table-column>
      </BasePageTable>
    </div>

    <!-- 编辑套餐 -->
    <ConfirmDialog
      v-model="dialogByDetail"
      title=""
      :close-on-click-modal="false"
      :comfirmVisible="false"
      :cancelVisible="false"
    >
      <BasePageTable
        ref="table"
        :visible="false"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableDataByDetail"
        border
      >
        <el-table-column
          v-for="col in tableColByDetail"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
      </BasePageTable>
    </ConfirmDialog>

    <ConfirmDialog
      v-model="box"
      title=""
      :close-on-click-modal="false"
      :async-confirm="true"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <el-table>
        <el-table-column
          v-for="(item, index) in confirmTableData"
          :key="index"
          :prop="item.prop"
          :label="item.label"
        >
        </el-table-column>
      </el-table>
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
      dialogByDetail: false,
      box: false,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      activeTab: 1,
      dishStatusTabs: [
        {
          label: '订单维度',
          value: 1,
        },
        {
          label: '菜品维度',
          value: 2,
        },
      ],
      tableColAll: {
        // 订单维度
        1: [
          {
            label: '供餐点',
            prop: 'heatingPointName',
          },
          {
            label: '配送单编码',
            prop: 'shipNum',
          },
          {
            label: '下单人手机号',
            prop: 'phone',
            width: 110,
          },
          {
            label: '取餐码',
            prop: 'takeFoodCode',
          },
          {
            label: '期望用餐时间T1',
            prop: 'mealTime',
            width: 150,
            formatter: (row) => {
              return row.mealTime
                ? this.$day(row.mealTime).format('YYYY-MM-DD HH:mm')
                : ''
            },
          },
          {
            label: '进入调度队列时间T2',
            prop: 'enterQueueTime',
            width: 150,
            formatter: (row) => {
              return row.enterQueueTime
                ? this.$day(row.enterQueueTime).format('YYYY-MM-DD HH:mm')
                : ''
            },
          },
          {
            label: '当前状态',
            prop: 'skuMessage',
            // formatter: (row) => {
            //   const status = {
            //     '01': '待加热',
            //     '02': '加热中',
            //     '03': '完成加热',
            //     '04': '异常',
            //   }
            //   return status[row.skuState]
            // },
          },
          {
            label: '开始加热时间',
            prop: 'heatingBeginTime',
            formatter: (row) => {
              return row.heatingBeginTime
                ? this.$day(row.heatingBeginTime).format('YYYY-MM-DD HH:mm')
                : ''
            },
          },
          {
            label: '加热结束时间',
            prop: 'heatingEndTime',
            formatter: (row) => {
              return row.heatingEndTime
                ? this.$day(row.heatingEndTime).format('YYYY-MM-DD HH:mm')
                : ''
            },
          },
        ],
        // 菜品维度
        2: [
          {
            label: '配送单编码',
            prop: 'shipNum',
          },
          {
            label: '下单人手机号',
            prop: 'phone',
            width: 110,
          },
          {
            label: '取餐码',
            prop: 'takeFoodCode',
          },
          {
            label: '菜品',
            prop: 'skuName',
          },
          {
            label: '机器编号',
            prop: 'machineId',
          },
          {
            label: '微波炉编号',
            prop: 'stoveId',
            width: 110,
          },
          {
            label: '期望用餐时间',
            prop: 'mealTime',
            width: 110,
            formatter: (row) => {
              return row.mealTime
                ? this.$day(row.mealTime).format('YYYY-MM-DD HH:mm')
                : ''
            },
          },
          {
            label: '进入调度队列时间',
            prop: 'enterQueueTime',
            width: 140,
            formatter: (row) => {
              return row.enterQueueTime
                ? this.$day(row.enterQueueTime).format('YYYY-MM-DD HH:mm')
                : ''
            },
          },
          {
            label: '当前状态',
            prop: 'skuMessage',
            // formatter: (row) => {
            //   const status = {
            //     '01': '待加热',
            //     '02': '加热中',
            //     '03': '完成加热',
            //     '04': '库存不足异常',
            //     '05': '机器异常',
            //   }
            //   return status[row.skuState]
            // },
          },
          {
            label: '开始加热时间',
            prop: 'heatingBeginTime',
            formatter: (row) => {
              return row.heatingBeginTime
                ? this.$day(row.heatingBeginTime).format('YYYY-MM-DD HH:mm')
                : ''
            },
          },
          {
            label: '加热结束时间',
            prop: 'heatingEndTime',
            formatter: (row) => {
              return row.heatingEndTime
                ? this.$day(row.heatingEndTime).format('YYYY-MM-DD HH:mm')
                : ''
            },
          },
        ],
      },
      tableData: [],
      tableDataTotal: 0,
      tableCol: [],
      // 详情
      tableDataByDetail: [],
      tableColByDetail: [
        {
          label: '菜品编码',
          prop: 'skuId',
        },
        {
          label: '菜品名称',
          prop: 'skuName',
        },
        {
          label: '当前状态',
          prop: 'skuMessage',
          // formatter: (row) => {
          //   const status = {
          //     '01': '待加热',
          //     '02': '加热中',
          //     '03': '完成加热',
          //     '04': '库存不足异常',
          //     '05': '机器异常',
          //   }
          //   return status[row.skuState]
          // },
        },
      ],

      confirmTableData: [
        {
          label: '菜品编码',
          prop: '',
        },
        {
          label: '菜品名称',
          prop: '',
        },
        {
          label: '当前状态',
          prop: '',
        },
      ],
      height: window.innerHeight - 330,
      queryParams: {
        phone: '',
        takeFoodCode: '',
        shipNum: '',
        heatingPointId: '',
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'phone',
          label: '下单人手机',
          placeholder: '请输入下单人手机号码',
          props: {
            clearable: true,
          },
        },
        {
          component: 'el-input',
          key: 'takeFoodCode',
          label: '取餐码',
          placeholder: '请输入取餐码',
          props: {
            clearable: true,
          },
        },
        {
          component: 'el-input',
          key: 'shipNum',
          label: '配送单编码',
          placeholder: '请输入配送单编码',
          props: {
            clearable: true,
          },
        },
        {
          component: 'BaseSelect',
          key: 'heatingPointId',
          label: '供餐点',
          props: {
            clearable: true,
            filterable: true,
            options: [],
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
  watch: {
    activeTab() {
      this.tableCol = this.tableColAll[this.activeTab]
    },
  },
  // 方法集合
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.tableCol = this.tableColAll[this.activeTab]
    this.queryHeatingOrder()
    this.queryWeisHeatpoints()
  },
  methods: {
    // 插队
    jumpQueue(row) {
      this.$request(
        '/cn.nezha.api.meituan.Order/jumpQueue',
        {
          shipNum: row.shipNum,
        },
        true
      ).then(this.$rw((err, res) => {}))
    },
    changes(target) {
      this.activeTab = target
      target == 1 ? this.queryHeatingOrder() : this.queryHeatingSku()
    },
    // 翻页重新请求
    changeFn() {
      this.activeTab == 1 ? this.queryHeatingOrder() : this.queryHeatingSku()
    },
    queryHeatingSku() {
      this.$store.state.vloading = true
      this.$request(
        '/cn.nezha.api.meituan.Order/queryHeatingSku',
        {
          ...this.page,
          ...this.genQueryParams(),
        },
        true
      ).then(
        this.$rw((err, res) => {
          this.$store.state.vloading = false
          if (!err) {
            const { pageCount, totalRecordCount, heatingSkuList } = res
            this.tableDataTotal = totalRecordCount
            this.tableData = heatingSkuList

            // let storeNames = []
            // storeNames = this.tableData.map((item) => {
            //   return {
            //     label: item.name,
            //     value: item.app_poi_code,
            //   }
            // })
            // this.queryComps[0].props.options = storeNames
          }
        })
      )
    },
    queryHeatingOrder() {
      this.$store.state.vloading = true
      this.$request(
        '/cn.nezha.api.meituan.Order/queryHeatingOrder',
        {
          ...this.page,
          ...this.genQueryParams(),
        },
        true
      ).then(
        this.$rw((err, res) => {
          this.$store.state.vloading = false
          if (!err) {
            const { pageCount, totalRecordCount, heatingOrderList } = res
            this.tableDataTotal = totalRecordCount
            this.tableData = heatingOrderList

            // let storeNames = []
            // storeNames = this.tableData.map((item) => {
            //   return {
            //     label: item.name,
            //     value: item.app_poi_code,
            //   }
            // })
            // this.queryComps[0].props.options = storeNames
          }
        })
      )
    },
    // 查询维士加热点
    queryWeisHeatpoints() {
      this.$request(
        '/cn.nezha.api.meituan.Store/queryWeisHeatpoints',
        {},
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            let optByStore = []
            optByStore = res.result.map((item) => {
              return {
                label: item.thpName,
                value: item.thpId,
              }
            })
            this.queryComps[3].props.options = optByStore
          }
        })
      )
    },
    // 查询详情
    queryDetail(row) {
      this.$request(
        '/cn.nezha.api.meituan.Order/queryHeatingOrderDetail',
        {
          shipNum: row.shipNum,
        },
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            this.dialogByDetail = true
            this.tableDataByDetail = res.heatingOrderDetails
          }
        })
      )
    },
    searchClick() {
      this.page.pageNo = 1
      this.activeTab == 1 ? this.queryHeatingOrder() : this.queryHeatingSku()
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      params.storeName = params.heatPointId
      delete params.heatPointId
      return params
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
  padding: 0 30px;
}
</style>